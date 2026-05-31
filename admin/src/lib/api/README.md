# Backend API Audit Notes

This document catalogues the Express backend API endpoints, authentication strategy, request/response shapes, and validation rules. It serves as a guide for integrating the Next.js Super Admin frontend.

---

## 1. Base URL & CORS Config
- **Base URL**: `/api` (proxied in Next.js development to `http://localhost:4000/api`)
- **CORS Config**: Configured in `server/src/app.js` using `cors()` allowing credentials support (`withCredentials: true`).

---

## 2. Authentication & Authorization
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "superadmin@example.com",
    "password": "password123",
    "isClinicUser": false
  }
  ```
- **Response Shape (Super Admin)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "cuid_string",
        "email": "superadmin@example.com",
        "name": "Super Admin Name"
      },
      "accessToken": "jwt_token",
      "refreshToken": "jwt_token",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  }
  ```
- **Token Handling**:
  - JWT is returned in the response body. Token refresh is performed via `POST /api/auth/refresh-token` sending `refreshToken` in the request body.
  - JWT role assignment fix: The backend `authenticate` middleware in `server/src/middlewares/auth.middleware.js` maps `payload.userType === "superAdmin"` to `req.user.role = "superAdmin"` and `req.user.superAdminId = payload.userId`.

---

## 3. Error Response Shapes
- **Validation Errors (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Validation Error",
    "errors": {
      "field_name": ["Error message details"]
    }
  }
  ```
- **Generic Errors (401, 403, 404, 500)**:
  ```json
  {
    "success": false,
    "error": "Error message explanation"
  }
  ```

---

## 4. Super Admin Endpoints Catalogue

### 4.1 Clinics Module (`/api/admin/clinics`)
- **`GET /`**: Lists clinics (paginated).
  - Query Params: `page` (default 1), `limit` (default 10), `search`, `isDeleted` ("true" / "false").
- **`POST /`**: Creates a clinic and registers a default trial subscription.
  - Body: `{ code, name, subdomain, email, phone, address, logoUrl, termsAndConditions }`.
- **`GET /:id`**: Fetches a single clinic (including its subscription and platform payment history).
- **`PATCH /:id`**: Updates clinic details.
  - Body: `{ name, email, phone, address, logoUrl, termsAndConditions }`.
- **`DELETE /:id`**: Soft-deletes a clinic (marks `isDeleted: true`).
- **`POST /:id/restore`**: Restores a soft-deleted clinic.

### 4.2 Clinic Owner Management
- **`GET /:id/owner`**: Retrieves the clinic owner user account details for the clinic.
- **`PATCH /:id/owner`**: Updates owner's personal details (`firstName`, `lastName`, `email`, `phone`, `cnic`).
- **`POST /api/auth/register`**: Registers the owner (public endpoint).
  - Body: `{ email, password, firstName, lastName, phone, role: "clinic_owner", clinicId, cnic }`.

### 4.3 Subscription Management
- **`PATCH /api/admin/clinics/:id/subscription`**: Updates/upserts clinic subscription details.
  - Body: `{ status, planType, amount, startDate, endDate, autoRenew }`.

### 4.4 Financials Module (`/api/admin/financials`)
- **`GET /dashboard/summary`**: Fetches KPI dashboard stats.
- **`GET /revenue/monthly`**: Fetches monthly revenue grouped by month.
  - Query Params: `year` (e.g. 2026).
- **`GET /revenue/yearly`**: Compares current year total revenue to last year (includes growth percentage).
- **`GET /subscriptions/analytics`**: Subscriptions breakdown (active, trial, ended, expiring soon, overdue).
- **`GET /payments`**: Lists all platform payments (paginated).
  - Query Params: `page`, `limit`, `clinicId`, `paymentMethod`, `startDate`, `endDate`.
- **`POST /payments`**: Records a new payment renewal.
  - Body: `{ clinicId, amount, paymentMethod, description }`.

### 4.5 Patients Module (`/api/admin/patients`)
- **`GET /`**: Lists patients across all clinics globally (paginated).
  - Query Params: `page`, `limit`, `search`, `clinicId`, `cnic`.
