# MadoReception API Routes - Complete Implementation Summary

All 18 API route handlers have been successfully created for the MadoReception Next.js 14 App Router project. The implementation includes proper error handling, database resilience (mock data in demo mode), and integration with all helper libraries.

## Route Overview

### Reception Routes (Visitor Check-in/Check-out)

#### 1. POST `/api/reception/checkin`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/reception/checkin/route.ts`

Create walk-in appointments without pre-registration.
- **Body Parameters:**
  - `visitorName` (required): Visitor's name
  - `visitorCompany` (optional): Visitor's company
  - `visitorEmail` (optional): Visitor's email
  - `purpose` (required): Visit purpose (MEETING, INTERVIEW, DELIVERY, OTHER)
  - `employeeId` (required): Target employee ID
  - `organizationId` (required): Organization ID

- **Response:** Returns `{ success: true, appointmentId, qrToken }`
- **Features:**
  - Generates QR token automatically
  - Creates appointment with CHECKED_IN status immediately
  - Logs CHECK_IN action to VisitLog
  - Attempts Google Chat notification (gracefully handles failures)
  - Creates Notification record
  - Falls back to demo mode if database unavailable

#### 2. POST `/api/reception/qr-checkin`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/reception/qr-checkin/route.ts`

Check in pre-registered visitors via QR code scan.
- **Body Parameters:**
  - `qrToken` (required): QR token from appointment invitation

- **Response:** Returns appointment details including visitor info, employee, and status
- **Error:** Returns `{ success: false, error: 'QRコードが無効です' }` if not found
- **Features:**
  - Updates appointment status from SCHEDULED to CHECKED_IN
  - Sets checkedInAt timestamp
  - Creates VisitLog with CHECK_IN action
  - Attempts to send notification

#### 3. GET `/api/reception/status/[id]`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/reception/status/[id]/route.ts`

Get appointment status for waiting area display screen.
- **URL Parameters:**
  - `id`: Appointment ID

- **Response:** Returns appointment details with latest notification response
- **Includes:** visitorName, visitorCompany, employeeName, meetingRoom, status, response, purpose
- **Purpose:** Used by reception waiting area tablet/screen to show visitor status

#### 4. POST `/api/reception/checkout`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/reception/checkout/route.ts`

Check out visitor when leaving.
- **Body Parameters:** Either:
  - `visitorName`: Find latest CHECKED_IN appointment by name
  - `appointmentId`: Specific appointment ID

- **Response:** Returns `{ success: true, appointmentId, checkedOutAt }`
- **Features:**
  - Updates status to COMPLETED
  - Sets checkedOutAt timestamp
  - Creates CHECK_OUT VisitLog entry
  - Finds latest matching appointment if using name-based lookup

---

### Admin Routes - Employees

#### 5. GET `/api/admin/employees`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/employees/route.ts`

List employees with filtering and search.
- **Query Parameters:**
  - `organizationId` (required)
  - `departmentId` (optional)
  - `search` (optional): Search by name, email, or phone
  - `isActive` (optional): Filter by active status

- **Response:** Array of employees with department and location relations
- **Includes:** department, location details for each employee

#### 6. POST `/api/admin/employees`
Create new employee.
- **Body Parameters:**
  - `name` (required)
  - `email` (required)
  - `phone` (optional)
  - `departmentId` (required)
  - `organizationId` (required)
  - `locationId` (optional)
  - `position` (optional)
  - `googleChatSpaceId` (optional)

- **Response:** Created employee with relations (status: 201)
- **Error:** Returns 409 if email already exists for organization

#### 7. GET `/api/admin/employees/[id]`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/employees/[id]/route.ts`

Get single employee details.
- **Response:** Employee with department, location, and appointments

#### 8. PUT `/api/admin/employees/[id]`
Update employee information.
- **Body:** Any employee field to update
- **Response:** Updated employee object

#### 9. DELETE `/api/admin/employees/[id]`
Soft delete employee (sets isActive = false).
- **Response:** Confirmation with employee object

---

### Admin Routes - Appointments

#### 10. GET `/api/admin/appointments`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/appointments/route.ts`

List all appointments with filtering.
- **Query Parameters:**
  - `organizationId` (required)
  - `status` (optional): Filter by status (SCHEDULED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW)
  - `dateFrom` (optional): ISO date string
  - `dateTo` (optional): ISO date string
  - `search` (optional): Search visitor name, email, or company

- **Response:** Array of appointments with employee, meetingRoom, and location relations
- **Order:** By scheduledAt descending

#### 11. POST `/api/admin/appointments`
Pre-register visitor appointment.
- **Body Parameters:**
  - `visitorName` (required)
  - `visitorCompany` (optional)
  - `visitorEmail` (optional): If provided, sends invitation email with QR code
  - `visitorPhone` (optional)
  - `purpose` (required)
  - `employeeId` (required)
  - `organizationId` (required)
  - `locationId` (required)
  - `meetingRoomId` (optional)
  - `scheduledAt` (required): ISO datetime
  - `notes` (optional)

- **Response:** Created appointment with qrToken (status: 201)
- **Features:**
  - Auto-generates QR token
  - Sends invitation email if visitorEmail provided
  - Generates QR code and attaches to email
  - Attempts Google Calendar event creation
  - Integrates with organization settings for SMTP config

#### 12. GET `/api/admin/appointments/[id]`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/appointments/[id]/route.ts`

Get single appointment with full relations.
- **Response:** Appointment with employee, meetingRoom, location, visitLogs, notifications

#### 13. PUT `/api/admin/appointments/[id]`
Update appointment details.
- **Body:** Any appointment field
- **Response:** Updated appointment

#### 14. DELETE `/api/admin/appointments/[id]`
Cancel appointment (sets status = CANCELLED).
- **Response:** Cancelled appointment with visit log

---

### Admin Routes - Departments

#### 15. GET `/api/admin/departments`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/departments/route.ts`

List departments.
- **Query Parameters:**
  - `organizationId` (required)
  - `locationId` (optional)

- **Response:** Departments with location and employees

#### 16. POST `/api/admin/departments`
Create department.
- **Body:** `name`, `organizationId`, `locationId` (optional)
- **Response:** Created department (status: 201)
- **Error:** 409 if name exists for organization

#### 17. PUT `/api/admin/departments/[id]`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/departments/[id]/route.ts`

Update department.
- **Response:** Updated department

#### 18. DELETE `/api/admin/departments/[id]`
Delete department (checks for active employees).
- **Error:** 409 if department has employees
- **Response:** Confirmation message

---

### Admin Routes - Meeting Rooms

#### 19. GET `/api/admin/rooms`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/rooms/route.ts`

List meeting rooms.
- **Query Parameters:**
  - `organizationId` (required)
  - `locationId` (optional)
  - `isActive` (optional)

- **Response:** Rooms with location details

#### 20. POST `/api/admin/rooms`
Create meeting room.
- **Body:** `name`, `locationId`, `organizationId` (required); `capacity`, `floor`, `googleCalendarId`, `facilities` (optional)
- **Response:** Created room (status: 201)
- **Error:** 409 if name exists in location

#### 21. PUT `/api/admin/rooms/[id]`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/rooms/[id]/route.ts`

Update room.
- **Response:** Updated room

#### 22. DELETE `/api/admin/rooms/[id]`
Soft delete room (sets isActive = false).
- **Response:** Confirmation with room

---

### Admin Routes - Visitor History & Analytics

#### 23. GET `/api/admin/visitors`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/visitors/route.ts`

List completed visits with pagination and export options.
- **Query Parameters:**
  - `organizationId` (required)
  - `dateFrom` (optional)
  - `dateTo` (optional)
  - `search` (optional): Search visitor name or company
  - `page` (optional, default: 1)
  - `limit` (optional, default: 50)
  - `format` (optional: 'json' or 'csv')

- **Response (JSON):** Paginated list of completed appointments with stay duration calculation
  - `stayDurationMinutes`: Calculated from checkedInAt and checkedOutAt
  - Includes employee with department, meetingRoom info

- **Response (CSV):** CSV file with BOM for Excel Japanese compatibility
  - Headers in Japanese: 訪問者名, 会社名, 訪問日時, 退社日時, 滞在時間（分）, 目的, 担当者, 部門, 会議室, メールアドレス, 電話番号
  - Content-Disposition: attachment

- **Pagination Response:**
  ```json
  {
    "success": true,
    "visitors": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
  ```

#### 24. GET `/api/admin/visitors/export`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/visitors/export/route.ts`

Export visitor history as CSV.
- **Query Parameters:**
  - `organizationId` (required)
  - `dateFrom` (optional)
  - `dateTo` (optional)

- **Response:** CSV file (text/csv) with UTF-8 BOM
- **Filename:** `visitors-export-YYYY-MM-DD.csv`
- **Features:**
  - UTF-8 BOM for proper Excel Japanese character display
  - All visit fields included
  - Ready for download and analysis

#### 25. GET `/api/admin/stats`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/stats/route.ts`

Dashboard statistics.
- **Query Parameters:**
  - `organizationId` (required)

- **Response:**
  ```json
  {
    "success": true,
    "stats": {
      "today": {
        "total": 10,
        "byStatus": {
          "CHECKED_IN": 3,
          "COMPLETED": 5,
          "SCHEDULED": 2
        }
      },
      "week": {
        "total": 45,
        "byStatus": {...}
      },
      "month": {
        "total": 180,
        "byStatus": {...}
      },
      "byDepartment": {
        "Engineering": 25,
        "Sales": 18,
        "HR": 12
      },
      "upcomingAppointments": [...]
    }
  }
  ```

- **Features:**
  - Today's count by status
  - This week's total and breakdown
  - This month's total and breakdown
  - Department-wise visitor count for month
  - Next 7 days' scheduled appointments

#### 26. GET `/api/admin/settings`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/admin/settings/route.ts`

Get organization settings.
- **Query Parameters:**
  - `organizationId` (required)

- **Response:** OrganizationSettings object
- **Features:**
  - Creates default settings if not found
  - Includes: language, allowed purposes, notification channels, webhook URLs, SMTP config
  - Returns demo defaults if database unavailable

#### 27. PUT `/api/admin/settings`
Update organization settings.
- **Body:** Settings object with `organizationId`
- **Response:** Updated settings
- **Features:**
  - Uses upsert to create if not exists
  - All settings fields updatable

---

### Notification Routes

#### 28. POST `/api/notification/respond`
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/notification/respond/route.ts`

Handle Google Chat button responses.
- **Body Parameters:**
  - `appointmentId` (required)
  - `response` (required): 'on_my_way' or 'please_wait'

- **Response:** Updated notification object
- **Features:**
  - Updates notification status to RESPONDED
  - Sets respondedAt timestamp
  - Creates RESPONSE_RECEIVED VisitLog
  - Validates response value

---

### Authentication Route

#### 29. NextAuth Configuration
**File:** `/sessions/vibrant-festive-sagan/mado-reception/src/app/api/auth/[...nextauth]/route.ts`

NextAuth.js integration for Google OAuth authentication.
- **Providers:** Google OAuth
- **Adapter:** Prisma adapter for session/user management
- **Session Strategy:** JWT
- **Sign-in Page:** `/auth/signin`
- **Environment Variables Required:**
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

- **Features:**
  - Automatic user creation on first Google sign-in
  - JWT-based sessions
  - User ID included in session token
  - Support for callback customization

---

## Key Features Across All Routes

### Error Handling
- Try-catch blocks on all routes
- Specific error messages for different failure types
- Appropriate HTTP status codes (400, 404, 409, 500)
- Database unavailable fallback (demo mode)

### Database Resilience
- All database operations wrapped in try-catch
- Falls back to mock/empty data when DB unavailable
- Allows app to run in demo mode without database
- Console logging for debugging

### Request Validation
- Required field validation before database operations
- Query parameter validation for list endpoints
- Request body validation for POST/PUT operations

### Response Consistency
- All responses follow pattern: `{ success: boolean, data... }`
- Error responses include descriptive messages
- Pagination included where applicable
- Proper HTTP status codes (201 for creation, etc.)

### Integration with Helpers
- **QR Codes:** generateQRCodeDataUrl() for email invitations
- **Email:** sendInvitationEmail() with SMTP configuration
- **Google Chat:** createVisitorNotificationCard() and sendWebhookMessage()
- **Prisma:** Database access with proper type safety
- **Utilities:** generateQrToken() for unique identifiers

### Japanese Support
- Japanese messages in error responses
- CSV export with Japanese headers and UTF-8 BOM
- Date/time formatting for Japanese locale

---

## File Structure

```
src/app/api/
├── reception/
│   ├── checkin/route.ts
│   ├── qr-checkin/route.ts
│   ├── status/[id]/route.ts
│   └── checkout/route.ts
├── admin/
│   ├── employees/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── appointments/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── departments/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── rooms/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── visitors/
│   │   ├── route.ts
│   │   └── export/route.ts
│   ├── settings/route.ts
│   └── stats/route.ts
├── notification/
│   └── respond/route.ts
└── auth/
    └── [...nextauth]/route.ts
```

---

## Integration Checklist

- [x] All 18 API routes implemented
- [x] Proper error handling with try-catch blocks
- [x] Database resilience for demo mode
- [x] QR code generation and validation
- [x] Email invitations with QR codes
- [x] Google Chat notifications
- [x] CSV export with Japanese support and UTF-8 BOM
- [x] Pagination support for list endpoints
- [x] NextAuth.js Google OAuth integration
- [x] Proper HTTP status codes
- [x] Request validation
- [x] Response consistency
- [x] Visit log tracking
- [x] Notification management
- [x] Dashboard statistics
- [x] Department/employee/room management
- [x] Settings management
- [x] Soft deletes where appropriate

---

## Usage Examples

### Create Walk-in Appointment
```bash
curl -X POST http://localhost:3000/api/reception/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "visitorName": "山田太郎",
    "visitorCompany": "ABC株式会社",
    "purpose": "MEETING",
    "employeeId": "emp-123",
    "organizationId": "org-456"
  }'
```

### QR Code Check-in
```bash
curl -X POST http://localhost:3000/api/reception/qr-checkin \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  }'
```

### Export Visitor History (CSV)
```bash
curl http://localhost:3000/api/admin/visitors/export?organizationId=org-456&dateFrom=2024-01-01&dateTo=2024-12-31 \
  -H "Accept: text/csv" \
  -o visitors.csv
```

### Get Dashboard Stats
```bash
curl http://localhost:3000/api/admin/stats?organizationId=org-456
```

---

## Environment Variables Required

```env
# NextAuth.js
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=postgresql://...

# Optional - for email invitations
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

---

## Notes

- All routes use Next.js 14 App Router format
- Prisma client accessed via `/lib/prisma.ts`
- QR tokens are unique per appointment
- Demo mode allows testing without database
- Google Chat integration is graceful (failures don't block main flow)
- CSV export includes UTF-8 BOM for Excel Japanese compatibility
- All timestamps stored in UTC, formatting handled client-side
