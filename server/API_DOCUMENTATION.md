# Clinic Management System (CMS) - Backend API Documentation

## Overview

This is a highly scalable, secure, multi-tenant Clinic Management System backend built with:

- **Framework**: Node.js + Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Caching**: Redis
- **Validation**: Zod
- **Authentication**: JWT (Access + Refresh tokens)
- **Security**: bcrypt (passwords), Node crypto (PII encryption)

## Architecture

### Multi-Tenant Design

- **Super Admin Panel**: Global platform admin managing clinics and financials
- **Clinic Panels**: Isolated tenant data with strict `clinicId` query-level isolation

### Core Entities

1. **SuperAdmin**: Platform owners
2. **Clinic**: Tenant with soft delete support
3. **Subscription**: Clinic subscription management
4. **User**: Staff (clinic_owner, reception, doctor) and patients with role-based access
5. **Appointment**: Appointment requests and approvals
6. **Session**: Clinical sessions with patient done/remaining count tracking
7. **SessionPayment**: Payment tracking for sessions
8. **PlatformPayment**: Super admin revenue ledger

## Authentication

### JWT Tokens

- **Access Token**: 15 minutes validity, used for API requests
- **Refresh Token**: 7 days validity, used to issue new access tokens
- **Payload**: Contains `userId`, `clinicId`, `role`, `userType`

### Login Endpoint

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "isClinicUser": true  // false for super admin
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

### Refresh Token

```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "..."
}
```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /login` - User login
- `POST /register` - User registration (clinic users only)
- `POST /refresh-token` - Refresh access token
- `POST /logout` - Logout (optional)

### Sessions Routes (`/api/sessions`)

**Requires**: Authentication + clinic_owner or doctor role

- `POST /` - Create session
  - Increments patient's "Done" session count
  - Tracks payment (amount, method)
- `GET /` - List sessions (paginated, filterable)
  - Filters: patientId, doctorId, status, date range
- `GET /:id` - Get session details

- `PATCH /:id` - Update session
  - Clinical notes, status, duration

- `POST /:id/cancel` - Cancel session
  - Decrements patient's "Done" count if was completed

### Appointments Routes (`/api/appointments`)

**Requires**: Authentication (patient can create, staff can approve/reject)

- `POST /` - Create appointment request
  - Public endpoint or authenticated patient
- `GET /` - List appointments
  - Requires: clinic_owner or reception
- `GET /:id` - Get appointment details

- `POST /:id/approve` - Approve appointment
  - Requires: clinic_owner or reception
  - Tracks who approved
- `POST /:id/reject` - Reject appointment
  - Requires: rejection reason
- `POST /:id/cancel` - Cancel appointment
  - Patient can cancel own, clinic_owner can cancel any

### Patients Routes (`/api/patients`)

**Requires**: Authentication + clinic_owner or reception role (except own profile)

- `GET /` - List patients (paginated, searchable)
  - Search: firstName, lastName, email, phone

- `GET /:id` - Get patient profile with session history and stats

- `GET /:patientId/sessions` - Patient session history

- `GET /:patientId/stats` - Patient statistics
  - Completed sessions, remaining sessions, payments made

- `PATCH /:id` - Update patient profile
  - CNIC is encrypted at rest

### Clinic Management Routes (`/api/admin/clinics`)

**Requires**: Super Admin authentication

- `POST /` - Create clinic
  - Auto-generates trial subscription

- `GET /` - List all clinics (filterable)
  - Filters: search, isDeleted

- `GET /:id` - Get clinic details with stats

- `PATCH /:id` - Update clinic details

- `DELETE /:id` - Soft delete clinic

- `POST /:id/restore` - Restore deleted clinic

### Financials Routes (`/api/admin/financials`)

**Requires**: Super Admin authentication

- `GET /dashboard/summary` - Dashboard overview
  - Total clinics, active/trial subscriptions, expiring soon, revenue

- `GET /revenue/monthly?year=2024` - Monthly revenue breakdown

- `GET /revenue/yearly` - Yearly revenue with growth comparison

- `GET /subscriptions/analytics` - Subscription status breakdown
  - Active, trial, ended, expiring soon, overdue

- `GET /clinics/:clinicId/payments` - Clinic payment history (paginated)

- `POST /payments` - Record platform payment

## Data Isolation & Security

### Tenant Isolation

- All queries automatically filtered by `clinicId`
- Middleware ensures users can only access their clinic data
- Super admins have cross-clinic access

### Encryption

- **CNIC (Passwords)**: Encrypted with AES-256-CBC at rest
- **Passwords**: Hashed with bcrypt (10 salt rounds)
- **PII**: Decrypted on-the-fly for response

### Staff Codes

- Format: `{CLINIC_CODE}-{ROLE_CODE}-{SEQUENCE}`
- Example: `TMJ-OWN-001`, `TMJ-DTR-002`, `TMJ-RCP-001`
- Roles: OWN (owner), DTR (doctor), RCP (reception)
- Immutable once assigned

## Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "errors": [...]  // For validation errors
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate unique values)
- `422` - Validation Error
- `500` - Server Error

## Validation Schemas

All endpoints use Zod for strict type validation on:

- Request body
- Query parameters
- Path parameters

Example error response:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "path": "body.email",
      "message": "Invalid email address"
    }
  ]
}
```

## Setup & Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate JWT secrets and encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Migration

```bash
npx prisma migrate dev --name init
```

### Development

```bash
npm run dev
```

### Docker

```bash
npm run docker:up
npm run docker:down
npm run docker:logs
```

## Transaction Safety

### Session Creation

- Wrapped in transaction
- Atomically creates session, updates stats, records payment
- Ensures consistency under concurrent requests

### Staff Code Generation

- Searches last sequence and increments
- Handles concurrent registrations safely

## Monitoring & Logging

- **Morgan**: Request logging
- **Helmet**: Security headers
- **Prisma Logs**: Query logging in development
- **Error Handler**: Centralized error logging

## Production Considerations

1. **Token Blacklisting**: Use Redis to blacklist tokens on logout
2. **Rate Limiting**: Implement rate limiting on auth endpoints
3. **Audit Logging**: Log all sensitive operations (soft deletes, payments, approvals)
4. **Monitoring**: Set up alerts for errors, slow queries
5. **Backups**: Regular database backups
6. **CORS**: Restrict CORS origins in production
7. **HTTPS**: Enforce HTTPS in production
8. **Database Connection Pooling**: Configured with max 10 connections

## Testing

Common test scenarios:

1. Multi-tenant isolation (queries from clinic A shouldn't see clinic B data)
2. RBAC enforcement (reception can't create sessions)
3. CNIC encryption/decryption
4. Transaction atomicity (session + payment + stats)
5. Soft delete with restore
6. Staff code uniqueness per clinic+role
7. Token refresh and expiration

---

**Version**: 1.0.0  
**Last Updated**: 2024
