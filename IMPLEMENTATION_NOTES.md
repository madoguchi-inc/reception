# Implementation Notes - API Routes

## Architecture Overview

All API routes follow the Next.js 14 App Router pattern with consistent error handling and database resilience patterns.

### Technology Stack
- **Framework:** Next.js 14 App Router
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with Google OAuth
- **QR Codes:** qrcode library
- **Email:** Nodemailer
- **Google Integration:** googleapis library
- **Chat:** Google Chat webhook

---

## Implementation Patterns

### 1. Standard Route Handler Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validate input
    if (!required_field) {
      return NextResponse.json(
        { success: false, error: 'Error message' },
        { status: 400 }
      )
    }

    try {
      // Database operation
      const result = await prisma.model.create({ ... })
      return NextResponse.json({ success: true, result })
    } catch (dbError) {
      // Demo mode fallback
      console.error('Database error:', dbError)
      return NextResponse.json({ success: true, result: mockData })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2. Error Handling Strategy

All routes implement **two-level error handling**:

1. **Outer try-catch:** Catches JSON parsing and unexpected errors
2. **Inner try-catch:** Wraps database operations with demo mode fallback

```typescript
try {
  // Outer: Catches JSON parse errors, unexpected issues
  const body = await request.json()

  try {
    // Inner: Database operations with demo mode fallback
    const data = await prisma.model.findUnique(...)
  } catch (dbError) {
    // Return mock data in demo mode
    return NextResponse.json({ success: true, data: mockData })
  }
} catch (error) {
  // Outer error - bad request
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
```

### 3. Database Resilience

Routes are designed to work without a database by returning sensible defaults:

```typescript
// Example: Employee list
try {
  const employees = await prisma.employee.findMany(...)
  return NextResponse.json({ success: true, employees })
} catch (dbError) {
  console.error('Database error:', dbError)
  // Demo mode: Return empty list
  return NextResponse.json({ success: true, employees: [] })
}
```

This allows:
- Development without database setup
- Testing and demos
- Graceful degradation in production

---

## Key Implementation Details

### A. Appointment Check-in Flow

**Walk-in Check-in** (`/api/reception/checkin`):
1. Create appointment with `status: 'CHECKED_IN'` immediately
2. Generate unique `qrToken`
3. Create `VisitLog` with `CHECK_IN` action
4. Attempt Google Chat notification (non-blocking)
5. Create `Notification` record
6. Return appointment ID and token

**QR Code Check-in** (`/api/reception/qr-checkin`):
1. Find appointment by `qrToken`
2. Validate status is `SCHEDULED`
3. Update to `CHECKED_IN` and set `checkedInAt`
4. Create `VisitLog` entry
5. Attempt notification (non-blocking)
6. Return appointment details

### B. Appointment Creation with Email

**Pre-registration** (`/api/admin/appointments` POST):
1. Generate unique `qrToken`
2. Create appointment with `status: 'SCHEDULED'`
3. If `visitorEmail` provided:
   - Generate QR code as DataURL
   - Get organization's SMTP settings
   - Send invitation email with QR code attached
4. Attempt Google Calendar event creation (non-blocking)
5. Return appointment with token

### C. Visit History Export

**CSV Export** (`/api/admin/visitors/export`):
1. Query completed appointments
2. Calculate stay duration: `(checkedOutAt - checkedInAt) / 60000`
3. Build CSV with headers in Japanese
4. Prepend UTF-8 BOM: `'\uFEFF'`
5. Return as `text/csv` with attachment header

UTF-8 BOM is critical for Excel's Japanese character handling.

### D. Statistics Aggregation

**Dashboard Stats** (`/api/admin/stats`):
1. Calculate date ranges (today, week, month)
2. Query appointments grouped by status
3. Count by department (requires join to employee)
4. Get upcoming appointments (next 7 days)
5. Aggregate and format response

### E. Google Chat Integration

**Notification Sending**:
1. Get organization settings (webhook URL)
2. Get employee details (name, department)
3. Build notification card with `createVisitorNotificationCard()`
4. Send via `sendWebhookMessage()`
5. Create `Notification` record
6. Catch and log errors (don't fail request)

**Response Handling**:
1. Receive POST from Google Chat with button click
2. Update `Notification` status to `RESPONDED`
3. Create `VisitLog` with `RESPONSE_RECEIVED`
4. Set `respondedAt` timestamp

### F. Soft Deletes

Implemented for:
- Employees (`isActive = false`)
- Meeting Rooms (`isActive = false`)
- Appointments (status: `CANCELLED`)

Benefits:
- Preserve audit trail
- Recover accidentally deleted records
- Maintain referential integrity

---

## Database Optimization

### Indexes
All frequently queried fields have indexes:
- `organizationId` - Everywhere
- `status` - On appointments
- `scheduledAt` - On appointments
- `createdAt` - For sorting/filtering
- `isActive` - For soft delete filtering

### Relations
All routes use `include` to fetch related data in single query:
```typescript
include: {
  employee: { include: { department: true } },
  meetingRoom: true,
  location: true,
}
```

### Pagination
List endpoints support pagination:
```typescript
const pageNum = parseInt(page, 10)
const limitNum = parseInt(limit, 10)
const skip = (pageNum - 1) * limitNum

const [items, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limitNum }),
  prisma.model.count({ where })
])
```

---

## Search and Filtering

### Full-Text Search
Uses Prisma's `contains` with `mode: 'insensitive'`:
```typescript
...(search && {
  OR: [
    { field1: { contains: search, mode: 'insensitive' } },
    { field2: { contains: search, mode: 'insensitive' } },
  ]
})
```

### Date Range Filtering
```typescript
...(dateFrom && {
  fieldDate: { gte: new Date(dateFrom) }
}),
...(dateTo && {
  fieldDate: { lte: new Date(dateTo) }
})
```

### Status Filtering
```typescript
...(status && { status: status as AppointmentStatus })
```

---

## Validation Patterns

### Required Field Validation
```typescript
if (!visitorName || !purpose || !employeeId) {
  return NextResponse.json(
    { success: false, error: 'Missing required fields' },
    { status: 400 }
  )
}
```

### Enum Validation
```typescript
if (!['on_my_way', 'please_wait'].includes(response)) {
  return NextResponse.json(
    { success: false, error: 'Invalid response value' },
    { status: 400 }
  )
}
```

### Existence Validation
```typescript
const appointment = await prisma.appointment.findUnique(...)
if (!appointment) {
  return NextResponse.json(
    { success: false, error: 'Not found' },
    { status: 404 }
  )
}
```

### Constraint Validation
```typescript
if (dbError.code === 'P2002') {
  return NextResponse.json(
    { success: false, error: 'Duplicate field' },
    { status: 409 }
  )
}
```

---

## Response Status Codes

| Scenario | Code | Body |
|----------|------|------|
| GET successful | 200 | `{ success: true, data }` |
| POST successful | 201 | `{ success: true, data }` |
| PUT successful | 200 | `{ success: true, data }` |
| DELETE successful | 200 | `{ success: true, message }` |
| Bad input | 400 | `{ success: false, error }` |
| Not found | 404 | `{ success: false, error }` |
| Duplicate/conflict | 409 | `{ success: false, error }` |
| Server error | 500 | `{ success: false, error }` |

---

## CSV Export Implementation

### BOM Addition
```typescript
const BOM = '\uFEFF'  // UTF-8 BOM
const csv = BOM + csvContent
```

### Excel-Safe String Escaping
```typescript
cell.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
```

### Response Headers
```typescript
return new NextResponse(csv, {
  status: 200,
  headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="export.csv"',
  },
})
```

---

## Notification System

### Flow
1. Appointment created or checked in
2. Google Chat notification sent to employee
3. Card shows visitor info with buttons
4. Employee clicks "On my way" or "Please wait"
5. Google Chat posts to callback endpoint
6. `/api/notification/respond` updates notification
7. Waiting screen receives update via polling or WebSocket

### Data Model
```
Notification
├── appointmentId (FK)
├── employeeId (FK)
├── channel (GOOGLE_CHAT, EMAIL, WEBHOOK)
├── status (PENDING, SENT, DELIVERED, READ, RESPONDED, FAILED)
├── response (on_my_way | please_wait)
├── sentAt (when sent)
└── respondedAt (when response received)

VisitLog (audit trail)
├── appointmentId (FK)
├── action (CHECK_IN, CHECK_OUT, NOTIFICATION_SENT, RESPONSE_RECEIVED, CANCELLED)
├── performedBy (user/system)
├── details
└── createdAt
```

---

## Google Calendar Integration Notes

### Not Yet Implemented (Ready for Implementation)
The Google Calendar integration is partially implemented:
- Helper functions exist in `/src/lib/google-calendar.ts`
- Routes have placeholder comments
- Requires access token from OAuth flow (not implemented)

### To Implement:
1. Store Google Calendar access token in User/Organization
2. Get access token from NextAuth session
3. Calculate meeting duration (default 1 hour)
4. Call `createCalendarEvent()` when appointment created
5. Store `googleEventId` in appointment for later updates

---

## Email Integration Notes

### SMTP Configuration
Organization settings store:
- `smtpHost`
- `smtpPort`
- `smtpUser`
- `smtpPass`
- `smtpFrom`

### Email Sending Flow
1. Create invitation HTML with QR code
2. Use organization's SMTP settings
3. Send from configured email address
4. Catch errors gracefully (don't fail appointment creation)

---

## Testing Recommendations

### Unit Testing
- Test validation logic
- Test error responses
- Test demo mode fallbacks
- Test pagination calculation
- Test CSV generation

### Integration Testing
- Test with real Prisma database
- Test email sending (mock Nodemailer)
- Test Google Chat webhook
- Test QR code generation
- Test CSV file format

### E2E Testing
- Walk-in check-in flow
- Pre-register → Email → QR scan → Check-in
- Notification → Response → Status update
- Export visitor CSV
- Dashboard statistics

---

## Security Considerations

### Currently Implemented
- Soft deletes preserve audit trail
- VisitLog tracks all actions
- No sensitive data in QR codes (just token)
- Graceful error messages (no stack traces to client)

### Recommended Additions
- Add authentication middleware to admin routes
- Validate organization ownership of resources
- Rate limiting on public endpoints
- CORS configuration
- Input sanitization (not critical with strong types)
- Audit logging to external system

### NextAuth Security
- Uses JWT for sessions
- Google OAuth for authentication
- Session expiration handled by NextAuth
- Credentials stored securely by Prisma adapter

---

## Logging Strategy

### Console Logs
All routes log errors to console for debugging:
```typescript
console.error('Database error:', dbError)
console.error('Route name error:', error)
```

### Recommended Production Logging
- Use structured logging library (Winston, Pino)
- Log to external service (Loggly, Datadog)
- Include request ID for tracing
- Track performance metrics
- Alert on critical errors

---

## Performance Optimization

### Current Optimizations
- Database relationships fetched in single query
- Pagination for large result sets
- Indexes on frequently queried fields

### Recommended Future Optimizations
- Implement caching for settings (rarely change)
- Cache employee list (changes infrequently)
- Implement WebSocket for real-time status updates
- Use streaming for CSV export (if large datasets)
- Add database query monitoring/alerts

---

## Deployment Checklist

- [ ] All environment variables set
  - `DATABASE_URL`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
- [ ] Database migrations run
- [ ] Prisma client generated
- [ ] NextAuth callback URLs configured
- [ ] SMTP credentials configured (if using email)
- [ ] Google Chat webhook URL configured
- [ ] CORS configured for appropriate origins
- [ ] Rate limiting configured
- [ ] Error logging service connected
- [ ] Backup/restore procedures tested
- [ ] Database indexes verified

---

## Troubleshooting Guide

### Database Not Connected
- Check `DATABASE_URL` environment variable
- Verify database server is running
- Check connection string format
- Run `npx prisma db push` to create schema

### Google OAuth Not Working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check OAuth redirect URLs in Google Console
- Verify `NEXTAUTH_URL` matches deployment URL
- Check `NEXTAUTH_SECRET` is set

### Email Not Sending
- Verify SMTP settings in organization settings
- Check email isn't being filtered as spam
- Verify port (usually 465 for TLS, 587 for STARTTLS)
- Check firewall allows outbound SMTP

### QR Code Not Generating
- Verify `qrcode` library installed
- Check QR data is valid (URL or string)
- Verify image format supported (PNG, DataURL)

### Google Chat Integration Not Working
- Verify webhook URL is correct
- Check webhook is still valid (Google invalidates old ones)
- Verify card JSON format is valid
- Check for rate limiting from Google

---

## File Locations Reference

### API Routes
- `/src/app/api/reception/*` - Public reception endpoints
- `/src/app/api/admin/*` - Admin management endpoints
- `/src/app/api/auth/*` - Authentication endpoints
- `/src/app/api/notification/*` - Notification handling

### Supporting Libraries
- `/src/lib/prisma.ts` - Database client
- `/src/lib/qrcode.ts` - QR code generation
- `/src/lib/email.ts` - Email sending
- `/src/lib/google-chat.ts` - Google Chat integration
- `/src/lib/google-calendar.ts` - Google Calendar integration
- `/src/lib/utils.ts` - Utility functions

### Database
- `/prisma/schema.prisma` - Data model definition
- `/prisma/migrations/` - Database migrations

---

## Development Workflow

### Adding a New Endpoint
1. Create route file: `/src/app/api/path/route.ts`
2. Import dependencies: `NextRequest`, `NextResponse`, `prisma`
3. Implement handler with error handling pattern
4. Test with curl or API client
5. Update documentation

### Debugging
```bash
# View Prisma logs
echo "log = ['query']" >> prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# View database state
npx prisma studio
```

### Testing Locally
```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/admin/stats?organizationId=test-org
```
