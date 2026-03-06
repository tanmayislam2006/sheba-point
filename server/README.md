# Sheba Point Backend

Backend API for a healthcare appointment platform where patients can register, book appointments with doctors, pay online, receive prescriptions, and get real-time notifications.

## 1) Project Overview

This backend is built with TypeScript + Express and uses Prisma with PostgreSQL.  
It supports:

- Patient registration/login with email OTP verification
- Role-based access control (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT`)
- User/admin/doctor/patient management
- Doctor schedule management and appointment booking
- Online payment via Stripe Checkout + webhook processing
- Auto-cancel unpaid appointments via cron job
- Prescription generation (PDF), Cloudinary upload, and email delivery
- In-app notification system with Socket.IO real-time events
- Dashboard stats and KPI endpoints

Base API prefix: `/api/v1`  
Stripe webhook endpoint: `/webhook`

## 2) Tech Stack

- Runtime: Node.js
- Language: TypeScript
- HTTP Framework: Express 5
- Database ORM: Prisma (`@prisma/client`, `@prisma/adapter-pg`)
- Database: PostgreSQL
- Auth: `better-auth` + custom JWT access/refresh flow
- Validation: Zod
- Payment: Stripe
- Realtime: Socket.IO
- File Storage: Cloudinary + Multer
- Email: Nodemailer + EJS templates
- PDF: PDFKit
- Scheduler/Cron: node-cron
- Testing: Node test runner via `tsx --test` (Query Builder test included)

## 3) High-Level Architecture

- `src/server.ts`:
  - Connects Prisma
  - Creates HTTP server
  - Initializes Socket.IO
  - Handles graceful shutdown/error signals
- `src/app.ts`:
  - Registers middleware and routes
  - Defines `/webhook` raw-body Stripe handler
  - Schedules cron (`*/25 * * * *`) to cancel unpaid appointments
- Route composition:
  - `/api/v1/*` from `src/app/routes/index.ts`
- Pattern per module:
  - `routes -> controller -> service -> prisma`

## 4) Core Backend Modules

- `auth`
  - Register patient, login, session refresh, change password, logout
  - Email verification OTP and password reset OTP
- `user`
  - Create doctor/admin, role and status management, soft delete/restore, bulk actions
- `admin`, `doctor`, `patient`
  - Profile and management operations by role
- `specialty`
  - Medical specialty CRUD and doctor-specialty mapping
- `schedule`, `doctorSchedule`
  - Time-slot setup and doctor schedule assignment/booking state
- `appointment`
  - Book now/pay now, pay later, status transitions, payment initiation
- `payment`
  - Stripe webhook events and payment status synchronization
- `prescription`
  - Doctor creates/updates prescriptions, generates PDF, emails patient, stores PDF URL
- `review`
  - Patient review flow
- `notification`
  - Persisted notifications + real-time push through sockets
- `stats`
  - Dashboard KPIs/charts/recent activity endpoints

## 5) Auth & Security Model

The backend combines:

- Better Auth session cookie: `better-auth.session_token`
- JWT cookies: `accessToken`, `refreshToken`

`authGaud` middleware checks:

1. Session token exists and is valid in DB
2. User status is active and not deleted
3. Role authorization for endpoint
4. Access token validity and role claim

This creates layered authorization (session + token + role).

## 6) Real-Time Notification Flow

- Notifications are stored in DB (`notifications` table).
- Service emits events to Socket.IO room: `user:<userId>`.
- Event name: `notification:new`.
- Socket auth uses JWT token from handshake `auth.token` or Bearer header.

## 7) Payment & Appointment Flow

Typical online booking flow:

1. Patient books appointment (`/appointments/book`)
2. Backend creates:
   - `appointment`
   - `payment` (UNPAID)
   - Stripe Checkout session URL
3. Frontend redirects patient to Stripe Checkout
4. Stripe webhook `/webhook` updates DB on `checkout.session.completed`
5. Notifications are sent to patient and doctor

Pay-later flow is also supported, with later payment initiation endpoint:

- `POST /api/v1/appointments/:id/initiate-payment`

Auto-cancel flow:

- Cron runs every 25 minutes
- Cancels old unpaid appointments (older than 30 minutes)
- Deletes related payment and frees doctor schedule slot
- Sends notifications to doctor and patient

## 8) Prescription Flow

Doctors can create prescriptions for appointments that are `INPROGRESS` or `COMPLETED`.

When a prescription is created/updated:

- PDF is generated with PDFKit
- PDF uploaded to Cloudinary
- Patient gets email with template + attachment
- Notification is emitted in real time

## 9) Data Model Summary (Prisma)

Important entities:

- Auth: `User`, `Session`, `Account`, `Verification`
- Profiles: `Admin`, `Doctor`, `Patient`
- Scheduling: `Schedule`, `DoctorSchedules`
- Clinical: `Appointment`, `Prescription`, `Review`, `MedicalReport`, `PatientHealthData`
- Ops: `Payment`, `Notification`, `Specialty`, `DoctorSpecialty`

Key enums:

- `Role`: `SUPER_ADMIN | ADMIN | DOCTOR | PATIENT`
- `UserStatus`: `ACTIVE | BLOCKED | DELETED`
- `AppointmentStatus`: `SCHEDULED | INPROGRESS | COMPLETED | CANCELED`
- `PaymentStatus`: `PAID | UNPAID`

Prisma schema location: `prisma/schema/*.prisma`  
Generated Prisma client output: `src/generated/prisma`

## 10) API Routes (by Prefix)

All prefixed by `/api/v1` unless noted.

- `/auth`
  - `POST /register`, `POST /login`, `GET /me`
  - `POST /refresh-token`, `POST /change-password`, `POST /logout`
  - `POST /verify-email`, `POST /forgot-password`, `POST /reset-password`
- `/user`
  - create doctor/admin, list/get users, status/role updates, delete/restore, bulk actions
- `/admin`, `/doctor`
  - management endpoints for admin and doctor resources
- `/patient`
  - update own profile (multipart, profile image + medical reports)
- `/specialty`
  - specialty CRUD with file upload support
- `/schedules`, `/doctor-schedules`
  - schedule and doctor schedule operations
- `/appointments`
  - booking, list my appointments, status changes, initiate payment
- `/reviews`
  - create/update/delete reviews, list all/my reviews
- `/prescriptions`
  - doctor prescription CRUD + my prescriptions + admin list
- `/notification`
  - my notifications, mark read, mark all read
- `/stats`
  - dashboard metrics and chart endpoints
- `/webhook` (not under `/api/v1`)
  - Stripe webhook receiver

## 11) Environment Variables

Required (validated at startup in `src/app/config/env.ts`):

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NODE_ENV`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN`
- `BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE`
- `EMAIL_SENDER_SMTP_USER`
- `EMAIL_SENDER_SMTP_PASS`
- `EMAIL_SENDER_SMTP_HOST`
- `EMAIL_SENDER_SMTP_PORT`
- `EMAIL_SENDER_SMTP_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 12) Local Development Setup

```bash
cd server
npm install
```

Create `.env` with required variables.

Run Prisma migration + client generation:

```bash
npm run migrate
npm run generate
```

Start dev server:

```bash
npm run start
```

Server default: `http://localhost:5000`

## 13) NPM Scripts

- `npm run start` - start dev server with watch mode
- `npm run build` - compile TypeScript
- `npm run start:prod` - run compiled build
- `npm run migrate` - run Prisma migration
- `npm run generate` - generate Prisma client
- `npm run studio` - open Prisma Studio
- `npm run seed:doctor` - seed doctors data
- `npm run test` - run tests
- `npm run stripe:webhook` - forward Stripe events locally

## 14) Docker

Root `docker-compose.yml` runs backend service on port `5000`:

```bash
docker compose up --build
```

## 15) Skills Demonstrated by This Backend

If someone studies this backend, they can learn:

- Building modular Express APIs with TypeScript
- Designing relational schemas with Prisma
- Role-based authorization and session/token hybrid auth
- Building secure middleware and centralized error handling
- Implementing Stripe payments and webhook idempotency checks
- Real-time product features with Socket.IO
- Multipart uploads and cloud file storage patterns
- Email template rendering and transactional messaging
- PDF generation workflow for healthcare documents
- Query builder abstraction for reusable filtering/search/pagination/sorting
- Cron-based operational automation
- Soft delete/restore and bulk admin operations

## 16) Suggested Improvements (Next Iteration)

- Add OpenAPI/Swagger documentation for all endpoints
- Add integration tests for auth, appointment, payment, and prescription flows
- Add rate limiting and request logging middleware
- Add API versioning and deprecation notes in docs
- Add CI pipeline for lint/test/build/migration checks

## 17) Postman Collection

A ready collection exists at:

- `postman/Sheba-Point.clean.postman_collection.json`

