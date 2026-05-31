# Quick Start Guide - CMS Backend

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (optional for development)

## 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Generate secure secrets
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Update .env.local

```env
BACKEND_PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/clinicms"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET=<generated_secret>
JWT_REFRESH_SECRET=<generated_secret>
ENCRYPTION_KEY=<generated_key>
CORS_ORIGIN="http://localhost:3000"
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Setup Database

```bash
# Run migrations
npm run migrate

# Open Prisma Studio (optional)
npm run prisma:studio
```

## 5. Create Super Admin

```bash
npm run init:admin

# Follow prompts to create admin user
```

## 6. Start Development Server

```bash
npm run dev

# Server will run on http://localhost:4000
# Health check: http://localhost:4000/health
```

## Using Docker

```bash
# Start all services (PostgreSQL, Redis, app)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## API Testing

### 1. Super Admin Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "isClinicUser": false
  }'
```

Response includes `accessToken` and `refreshToken`

### 2. Create Clinic

```bash
curl -X POST http://localhost:4000/api/admin/clinics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "code": "TMJ",
    "name": "Tommy Medical Clinic",
    "subdomain": "tommy-clinic",
    "email": "clinic@example.com",
    "phone": "+92-123-456-7890",
    "address": "123 Health Street"
  }'
```

### 3. Register Patient

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "patient123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+92-123-456-7890",
    "role": "patient",
    "clinicId": "<clinic_id>",
    "cnic": "12345-1234567-1"
  }'
```

### 4. Register Doctor

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "doctor123",
    "firstName": "Dr.",
    "lastName": "Ahmed",
    "phone": "+92-123-456-7890",
    "role": "doctor",
    "clinicId": "<clinic_id>"
  }'
```

### 5. Create Appointment

```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "<patient_id>",
    "clinicId": "<clinic_id>",
    "requestedDate": "2024-12-25T10:00:00Z",
    "preferredTime": "10:00",
    "chiefComplaint": "Headache and fever"
  }'
```

### 6. Create Session

```bash
curl -X POST http://localhost:4000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <doctor_token>" \
  -d '{
    "patientId": "<patient_id>",
    "doctorId": "<doctor_id>",
    "sessionDate": "2024-12-25T10:00:00Z",
    "sessionTime": "10:00",
    "treatmentTypes": ["consultation"],
    "durationMinutes": 30,
    "clinicalNotes": "Patient has flu symptoms",
    "amountPaid": 50,
    "paymentMethod": "Cash"
  }'
```

## Common Issues

### PostgreSQL Connection Error

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Verify database exists

### Prisma Migration Errors

```bash
# Reset database (development only!)
npx prisma migrate reset
```

### Permission Denied Errors

- Check RBAC middleware roles
- Verify authentication token is valid
- Ensure user has required role

### Port Already in Use

```bash
# Change port in .env.local
BACKEND_PORT=5000
```

## File Structure

```
server/
├── src/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   ├── db.config.js          # Prisma client
│   │   ├── env.config.js         # Environment validation
│   │   └── redis.config.js       # Redis setup
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── tenantIsolation.middleware.js
│   │   ├── validateRequest.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── modules/
│   │   ├── auth/                 # Authentication
│   │   ├── sessions/             # Clinical sessions
│   │   ├── appointments/         # Appointments
│   │   ├── patients/             # Patient management
│   │   ├── owner/                # Clinic management
│   │   └── reports/              # Financials
│   ├── services/
│   │   ├── staffCode.service.js
│   │   ├── cache.service.js
│   │   ├── email.service.js
│   │   └── logger.service.js
│   └── utils/
│       ├── asyncHandler.js
│       ├── encryption.util.js
│       └── errors.js
├── prisma/
│   └── schema.prisma             # Database schema
├── scripts/
│   └── init-admin.js             # Admin initialization
├── package.json
├── .env.example
└── API_DOCUMENTATION.md
```

## Next Steps

1. ✅ Backend is ready
2. Connect frontend client to backend API
3. Configure environment variables for production
4. Set up token blacklisting in Redis
5. Add rate limiting
6. Configure monitoring and logging
7. Deploy to production

## Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)  
For implementation details, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
