# Agency Management System — Backend

Node.js + Express + PostgreSQL + Prisma (the P-E-N of PERN; React lives in the frontend repo).

## Setup steps

```bash
# 1) Install dependencies
npm install

# 2) Environment file
cp .env.example .env        # Windows: copy .env.example .env
# then change JWT_SECRET (openssl rand -hex 48)

# 3) Database (Docker; matches .env.example)
docker compose up -d

# 4) Apply migrations + seed the first Admin
npx prisma migrate deploy
npm run db:seed

# 5) Run
npm run dev                 # http://localhost:5001/api/health
```

### Hosted database (Supabase, Neon, Render…)

Set `DATABASE_URL` in `.env` to your provider's connection string. For
**Supabase**, use the Session Pooler URL and append the Prisma pooler flags:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

Without `pgbouncer=true&connection_limit=1`, Prisma can fail with `P1001` or
prepared-statement errors. If a migration fails through the pooler, run the
migration with the direct connection string, then switch back to the pooler URL.

The seed reads `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and the other values
from `.env`. For a fresh database it creates the first administrator; see the
root `README.md` for the default local credentials.

### Frontend

The React app lives in `../frontend`. Start it separately with `npm install` and
`npm run dev`, and open <http://localhost:5173>.

### Demo workspace data

`npm run seed:demo` fills an empty workspace with a realistic agency setup:
7 teams, 3 brands and 8 users (2 account managers + 6 employees), each user with
its own temporary password. It calls the public API instead of the database, so
every record goes through the same validation the screens use.

The script is safe to re-run: teams, users and brands are looked up by
name/email and reused, memberships are not duplicated, and existing passwords
are never changed.

```powershell
$env:API_BASE_URL='https://orvia-agency-api.vercel.app/api'
$env:SEED_ADMIN_EMAIL='admin@agency.local'
$env:SEED_ADMIN_PASSWORD='<admin password>'
npm run seed:demo
```

The command prints the email and password of every account it created. Copy
them before closing the terminal: passwords are stored hashed and cannot be
read back.

## Password reset email (Resend / SMTP)

The forgot-password flow emails a 6-digit verification code, verifies it, then
issues a short-lived single-use reset authorization. Only SHA-256 hashes of the
code and reset token are stored.

### Option A — Resend (recommended)

1. Create an account and follow <https://resend.com/onboarding>.
2. Create an API key at <https://resend.com/api-keys> with sending permission.
3. During onboarding you may use the testing sender `onboarding@resend.dev`:
   it only delivers to the email address on your own Resend account.
4. For real users, add and verify a domain at <https://resend.com/domains>,
   then set `MAIL_FROM` to an address on that domain.
5. Put the values in `backend/.env` (never commit them):

```env
RESEND_API_KEY=re_your_key
MAIL_FROM="ORVIA <no-reply@your-verified-domain.com>"
APP_NAME=ORVIA
```

### Option B — SMTP / Nodemailer

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`.
For Gmail, enable 2-Step Verification and create a 16-character App Password;
use that instead of the account password.

When no transport is configured in development, the mailer falls back to an
Ethereal test inbox and prints its preview URL, so the UI can still be tested
without pretending an email reached a real inbox.

```bash
# Send a real test message through the configured provider
npm run mail:test -- you@example.com
```

```bash
# Apply the password-reset migration
npx prisma migrate deploy
```

## Structure

```
prisma/            schema + seed
src/
  config/          env (zod-validated) + prisma client
  middlewares/     auth (authenticate/authorize), validate, error
  modules/         one folder per feature: routes → controller → service (+ validation)
    auth/          login, refresh, logout, forgot/reset/change password, me
    users/         Admin: CRUD + activate/deactivate
  routes/index.js  mounts the routes under /api
  utils/           ApiError, asyncHandler, tokens, audit, mailer (Resend SDK / SMTP)
tests/             vitest + supertest
```

Rule: the controller stays thin; business logic and data authorization checks live in the service.

## Endpoints (Sprint 1)

| Method | Path | Access |
|---|---|---|
| POST | /api/auth/login | public |
| POST | /api/auth/refresh | public (refresh token) |
| POST | /api/auth/logout | public (refresh token) |
| POST | /api/auth/forgot-password | public — emails a 6-digit OTP |
| POST | /api/auth/verify-otp | public — OTP → reset authorization token |
| POST | /api/auth/resend-otp | public — 60-second cooldown |
| POST | /api/auth/reset-password | public — consumes the reset authorization |
| GET | /api/auth/mail-status | development helper |
| POST | /api/auth/mail-config | development only (403 in production) |
| POST | /api/auth/change-password | authenticated |
| GET | /api/auth/me | authenticated |
| GET/POST | /api/users | ADMIN |
| GET/PATCH | /api/users/:id | ADMIN |

Auth: Bearer access token (15m) + refresh token rotation (hash stored in the DB), works with the web app and Flutter.

## Adding a new module (for example brands)

1. Add the models to `prisma/schema.prisma`, then run `npm run db:migrate`.
2. Create `src/modules/brands/` following the same split as users.
3. Register it in `src/routes/index.js`.
4. Every query must filter by ownership/assignment (Account Manager = the brands assigned to them, Client = only their own brand).

## Open decisions (the team must confirm — see the brief)

- JavaScript (ESM) instead of TypeScript.
- Prisma as the ORM, Postgres 16.
- No file uploads yet (multer is installed for Sprint 4) — the storage provider is still undecided.
