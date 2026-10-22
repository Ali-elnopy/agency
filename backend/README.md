# Agency Management System — Backend

Node.js + Express + PostgreSQL + Prisma (the P-E-N of PERN; React lives in the frontend repo).

## Setup steps

```bash
# 1) Install dependencies
npm install express @prisma/client@6 zod bcryptjs jsonwebtoken cors helmet morgan \
  express-rate-limit dotenv multer
npm install -D prisma@6 nodemon vitest supertest eslint @eslint/js globals prettier

# 2) Environment file
cp .env.example .env        # then change JWT_SECRET (openssl rand -hex 48)

# 3) Database (Docker)
docker compose up -d

# 4) Migration + seed for the first Admin
npx prisma migrate dev --name init
npm run db:seed

# 5) Run
npm run dev                 # http://localhost:5001/api/health
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
