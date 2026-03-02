# MadoReception API Quick Reference

## Reception APIs (Public)

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/reception/checkin` | POST | Walk-in check-in without pre-registration | Public |
| `/api/reception/qr-checkin` | POST | Check-in via QR code scan | Public |
| `/api/reception/status/[id]` | GET | Get appointment status for waiting screen | Public |
| `/api/reception/checkout` | POST | Check out visitor | Public |

## Admin APIs (Authentication Required)

### Employees
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/employees` | GET | List employees (supports search/filter) |
| `/api/admin/employees` | POST | Create employee |
| `/api/admin/employees/[id]` | GET | Get single employee |
| `/api/admin/employees/[id]` | PUT | Update employee |
| `/api/admin/employees/[id]` | DELETE | Soft delete employee |

### Appointments
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/appointments` | GET | List appointments (with filters) |
| `/api/admin/appointments` | POST | Pre-register appointment (sends email) |
| `/api/admin/appointments/[id]` | GET | Get appointment details |
| `/api/admin/appointments/[id]` | PUT | Update appointment |
| `/api/admin/appointments/[id]` | DELETE | Cancel appointment |

### Departments
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/departments` | GET | List departments |
| `/api/admin/departments` | POST | Create department |
| `/api/admin/departments/[id]` | PUT | Update department |
| `/api/admin/departments/[id]` | DELETE | Delete department |

### Meeting Rooms
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/rooms` | GET | List meeting rooms |
| `/api/admin/rooms` | POST | Create room |
| `/api/admin/rooms/[id]` | PUT | Update room |
| `/api/admin/rooms/[id]` | DELETE | Soft delete room |

### Visitors & Analytics
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/visitors` | GET | List completed visits (supports CSV export) |
| `/api/admin/visitors/export` | GET | Export visitor history as CSV |
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/settings` | GET | Get organization settings |
| `/api/admin/settings` | PUT | Update organization settings |

## Notification APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notification/respond` | POST | Handle Google Chat button response |

## Auth APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js OAuth handlers |
| `/api/auth/callback/google` | Automatic | Google OAuth callback |
| `/api/auth/signin` | GET | Sign-in page |
| `/api/auth/signout` | GET/POST | Sign-out handler |

---

## Common Request Patterns

### List with Filters
```bash
GET /api/admin/appointments?organizationId=org-123&status=SCHEDULED&dateFrom=2024-01-01
```

### Create Resource
```bash
POST /api/admin/employees
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "departmentId": "dept-123",
  "organizationId": "org-123"
}
```

### Update Resource
```bash
PUT /api/admin/employees/emp-123
Content-Type: application/json

{
  "position": "Manager",
  "phone": "090-1234-5678"
}
```

### Delete Resource (Soft Delete)
```bash
DELETE /api/admin/employees/emp-123
```

### Export CSV
```bash
GET /api/admin/visitors/export?organizationId=org-123&dateFrom=2024-01-01
```

---

## Response Patterns

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### List Response (Paginated)
```json
{
  "success": true,
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description"
}
```

### CSV Export
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="visitors.csv"

[UTF-8 BOM]
訪問者名,会社名,訪問日時,...
```

---

## Required Query Parameters by Endpoint

### Organization Context
Most endpoints require:
- `organizationId` - Always required for organization-scoped queries

### Filtering
- `search` - Text search (varies by endpoint)
- `isActive` - Boolean filter for soft-deleted records
- `status` - Filter appointments by status
- `dateFrom`, `dateTo` - Date range filters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 50)
- `format` - Response format: 'json' or 'csv'

---

## Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT) |
| 201 | Resource created (POST) |
| 400 | Bad request (missing/invalid parameters) |
| 404 | Not found |
| 409 | Conflict (duplicate unique field) |
| 500 | Server error |

---

## Common Query Examples

### Get today's appointments
```bash
GET /api/admin/appointments?organizationId=org-123&dateFrom=2024-12-15&dateTo=2024-12-15&status=SCHEDULED
```

### Search visitors
```bash
GET /api/admin/visitors?organizationId=org-123&search=山田
```

### Get employee by department
```bash
GET /api/admin/employees?organizationId=org-123&departmentId=dept-456&isActive=true
```

### Export monthly visitor report
```bash
GET /api/admin/visitors/export?organizationId=org-123&dateFrom=2024-12-01&dateTo=2024-12-31
```

### Get dashboard stats
```bash
GET /api/admin/stats?organizationId=org-123
```

---

## Feature Highlights

### Reception System
- Walk-in check-ins without pre-registration
- QR code-based check-ins for pre-registered visitors
- Real-time status tracking for reception area display
- Automatic check-out or manual check-out

### Appointment Management
- Pre-register appointments with email invitations
- Auto-generate QR codes and send via email
- Optional Google Calendar integration
- Appointment cancellation and status tracking

### Analytics & Reporting
- Visitor history with stay duration calculation
- CSV export with Japanese Excel compatibility (UTF-8 BOM)
- Dashboard statistics (today, week, month, by department)
- Upcoming appointments list

### Notifications
- Google Chat integration for employee notifications
- Interactive response buttons (on_my_way, please_wait)
- Notification status tracking
- Visit log audit trail

### Security
- NextAuth.js with Google OAuth
- JWT-based sessions
- Soft deletes for data preservation
- Audit logs via VisitLog

---

## Integration Notes

### Database Resilience
All routes gracefully handle database unavailability by returning mock/empty data. This allows the app to run in demo mode without a database.

### Email Invitations
Requires SMTP configuration in organization settings. QR code automatically generated and attached.

### Google Chat Integration
Requires webhook URL in organization settings. Failures don't block main operations.

### Google Calendar
Requires access token (not implemented yet due to OAuth flow complexity).

### CSV Export
- UTF-8 BOM for Excel Japanese character support
- Automatic filename with date
- All user data included

---

## File Locations

All routes are located in: `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/`

Supporting libraries:
- Prisma: `/src/lib/prisma.ts`
- QR Codes: `/src/lib/qrcode.ts`
- Email: `/src/lib/email.ts`
- Google Chat: `/src/lib/google-chat.ts`
- Google Calendar: `/src/lib/google-calendar.ts`
- Utilities: `/src/lib/utils.ts`
