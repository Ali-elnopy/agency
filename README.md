# ORVIA — Agency OS

Full-stack agency management workspace: authentication, account-manager dashboard,
brands, teams, users, profile, role/permission matrix, workflow settings, and security.

## Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 19, Vite 6, plain CSS, Vitest             |
| Backend  | Node.js 20+, Express 5, Prisma 6, JWT           |
| Database | PostgreSQL 16 (Docker, Supabase, Neon, Render…) |

## Get the code

```bash
git clone https://github.com/Ali-elnopy/agency.git
cd agency
```

## Repository layout

```
.
├── backend/          Express API + Prisma schema, migrations, seed
├── frontend/         React/Vite application
└── render.yaml       Optional Render deployment blueprint
```

## Prerequisites

- Node.js **20+**
- npm **10+**
- PostgreSQL 16, or a hosted PostgreSQL URL
- Docker Desktop (only if you want the bundled local database)

## Quick start (local, from scratch)

Use two terminals: one for the API and one for the web app.

### 1. Backend

```bash
cd backend
copy .env.example .env        # macOS/Linux: cp .env.example .env
npm install
docker compose up -d          # local PostgreSQL on port 5432
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The API starts on <http://localhost:5001>. Check it with:

```bash
curl http://localhost:5001/api/health
```

Before running the seed, open `backend/.env` and set at least:

- `JWT_SECRET` — use a long random value (`openssl rand -hex 48`).
- `SEED_ADMIN_PASSWORD` — the initial admin password.
- `DATABASE_URL` — leave the Docker default unless you use a hosted database.

### 2. Frontend

```bash
cd frontend
copy .env.example .env.local  # macOS/Linux: cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/api` to
`http://localhost:5001`, so the default `.env.local` works without CORS changes.

### 3. Sign in

The seed creates the first administrator using the values from `backend/.env`:

```text
Email:    admin@agency.local
Password: ChangeMe123!
```

Change the password after your first sign-in. The values above are only the
defaults from `.env.example`; your local `.env` may override them.

## Database configuration

### Local PostgreSQL (Docker)

`backend/docker-compose.yml` starts PostgreSQL 16 on `127.0.0.1:5432` with:

```text
database: agency_db
user:     agency
password: agency
```

That matches the default `DATABASE_URL` in `backend/.env.example`.

### Hosted PostgreSQL (Supabase, Neon, Render…)

Set `DATABASE_URL` in `backend/.env` to your provider's connection string.

For **Supabase**, use the **Session Pooler** string and append Prisma's pooler
flags. Without them, Prisma can fail with `P1001` or prepared-statement errors:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

If `prisma migrate deploy` fails through the pooler, temporarily use the direct
connection string for the migration, then switch back to the pooler URL.

## Environment variables

### Backend (`backend/.env`)

| Variable                  | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `NODE_ENV`                | `development` or `production`                          |
| `PORT`                    | API port (default `5001`)                              |
| `DATABASE_URL`            | PostgreSQL connection string                           |
| `JWT_SECRET`              | Signing secret for access/refresh tokens               |
| `JWT_ACCESS_EXPIRES_IN`   | Access-token lifetime (default `15m`)                  |
| `REFRESH_TOKEN_TTL_DAYS`  | Refresh-token lifetime (default `30`)                  |
| `CLIENT_URL`              | Comma-separated allowed frontend origins               |
| `FRONTEND_URL`            | Frontend URL used in password-reset links              |
| `SEED_ADMIN_EMAIL`        | Email for the seeded administrator                     |
| `SEED_ADMIN_PASSWORD`     | Password for the seeded administrator                  |

### Frontend (`frontend/.env.local`)

| Variable                   | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | API base (default `/api`, proxied by Vite in development)      |
| `VITE_USE_MOCK_API`        | `true` enables the offline mock in development only             |
| `VITE_DEV_BYPASS_LOGIN`    | `true` enables the development-only fake admin session          |
| `VITE_MOCK_*`              | Demo account values used by the mock login                      |

`VITE_USE_MOCK_API` and `VITE_DEV_BYPASS_LOGIN` are compiled out of production
builds. The mock is for local previews only; do not deploy the dev-static build.

## Useful scripts

### Backend

```bash
npm run dev          # nodemon
npm start            # plain node
npm test             # Vitest
npm run lint
npm run db:migrate   # prisma migrate dev (development)
npm run db:deploy    # prisma migrate deploy (existing migrations)
npm run db:seed
npm run db:studio    # Prisma Studio
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm test
npm run lint
npm run build:dev-static  # local-only demo build (no backend)
```

## Troubleshooting

### Login returns `HTTP 500` / `HTTP 502`

The browser is reaching Vite, but the API is unavailable or cannot reach
PostgreSQL.

1. Confirm the API is running: `curl http://localhost:5001/api/health`.
2. Confirm PostgreSQL is running and `DATABASE_URL` is correct.
3. If you use Supabase, add `?pgbouncer=true&connection_limit=1` to the pooler URL.
4. Restart the backend after changing `.env`.

### Prisma error `P1001: Can't reach database server`

- Check the host/port and whether the database accepts connections from your network.
- Supabase pooler URLs need the flags shown above.
- If the database is paused (free tier), resume it in the provider dashboard.

### CORS errors

The API allows the origins in `CLIENT_URL`. The bundled `.env.example` allows
`http://localhost:5173` and `http://localhost:5199`. Use `localhost` (not
`127.0.0.1`) or add your exact origin to `CLIENT_URL`.

### A fresh clone cannot sign in

This is expected until the backend is configured: `.env` files are intentionally
not committed, the database must exist, migrations must be applied, and the seed
must create the admin. Follow the quick start above.

## Current limitations

- New workspace records created in the Brands, Teams, Users, and Workflow screens
  are stored in the browser's `localStorage`; they are not shared between
  browsers or devices yet.
- The backend already covers authentication, users, teams, brands, and dashboard
  data, but not every workspace screen has full CRUD endpoints.
- The demo build (`frontend/dist-dev/index.html`) contains a development-only
  fake-admin bypass by design. Never deploy it publicly.
- `ORVIA-Agency-OS.html` is a local preview artifact and is ignored by git.
  Generate your own with `npm run build:dev-static` inside `frontend/`.

## Deployment

- Frontend: build with `npm run build` and deploy `frontend/dist`.
- Backend: see `backend/vercel.json` and the root `render.yaml`.
- Set every backend environment variable in the hosting provider. Never commit
  `backend/.env`.
- Set the frontend's `VITE_API_BASE_URL` to the deployed API URL and add the
  frontend origin to the backend's `CLIENT_URL`.
