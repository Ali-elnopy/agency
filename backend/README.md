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
  utils/           ApiError, asyncHandler, tokens, audit, mailer (stub)
tests/             vitest + supertest
```

Rule: the controller stays thin; business logic and data authorization checks live in the service.

## Endpoints (Sprint 1)

| Method | Path | Access |
|---|---|---|
| POST | /api/auth/login | public |
| POST | /api/auth/refresh | public (refresh token) |
| POST | /api/auth/logout | public (refresh token) |
| POST | /api/auth/forgot-password | public |
| POST | /api/auth/reset-password | public |
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
- The email sender is a stub that prints to the console until a notification channel is chosen.
- No file uploads yet (multer is installed for Sprint 4) — the storage provider is still undecided.
