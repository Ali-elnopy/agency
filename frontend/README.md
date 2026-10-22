# ORVIA — Agency OS (React)

Front-end for the ORVIA agency operating system: login, account-manager dashboard,
workspace profile, role/permission matrix, and user & role access management.

The UI is a faithful implementation of the approved design (light + dark themes).
No visual changes are expected when working on this codebase without a design sign-off.

## Stack

- React 19 + Vite 6
- Plain CSS split by screen (`src/styles/*.css`), loaded in cascade order from `src/index.css`
- Vitest + React Testing Library
- ESLint (flat config) + Prettier

## Requirements

- Node.js 20+
- npm 10+

## Getting started

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Open <http://127.0.0.1:5173>. In local demo mode the login screen offers demo
accounts (Studio Lead / Admin) that fill the credentials configured in `.env.local`.

## Preview as a single file

Both builds use `vite-plugin-singlefile`, so the whole app (JS + CSS) is inlined into
one `index.html` that can be opened directly from disk — no server required.

```bash
npm run build              # → dist/index.html   (production, real API, no demo bypass)
npm run build:dev-static   # → dist-dev/index.html (local demo build: demo login enabled)
```

- `dist/index.html` is the production entry point. Sign-in talks to `VITE_API_BASE_URL`.
- `dist-dev/index.html` is for local preview only: it keeps the demo/mock auth so every
  screen can be opened without a backend. **Do not deploy it publicly.**

A ready-to-open copy of the demo build is included as `ORVIA-Agency-OS.html` in the
parent folder.

### Environment variables

| Variable                   | Purpose                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | Backend base URL (default `/api/v1`, proxied by Vite in dev)                        |
| `VITE_USE_MOCK_API`        | `true` enables the offline mock **in development only**                             |
| `VITE_MOCK_NAME`           | Display name for the demo Studio Lead account                                       |
| `VITE_MOCK_EMAIL`          | Demo Studio Lead email                                                              |
| `VITE_MOCK_PASSWORD`       | Demo Studio Lead password                                                           |
| `VITE_MOCK_ADMIN_EMAIL`    | Demo admin email                                                                    |
| `VITE_MOCK_ADMIN_PASSWORD` | Demo admin password                                                                 |
| `VITE_DEV_BYPASS_LOGIN`    | `true` lets an empty sign-in form open a fake admin session **in development only** |

Rules enforced by the code:

- The mock is compiled out of production builds (`import.meta.env.DEV`), even if
  `VITE_USE_MOCK_API=true` is present at build time.
- If the API is unreachable (network error or 5xx) and mock mode is off, login
  returns a clear error. It never fabricates a session.
- Mock login only accepts the credentials configured through the variables above.
- `VITE_DEV_BYPASS_LOGIN` is compiled out of production builds, and its fake
  session never sends a request to a backend: directory and profile screens are
  served from local fixtures while the bypass session is active.

## Scripts

| Command                    | Description                            |
| -------------------------- | -------------------------------------- |
| `npm run dev`              | Start the dev server                   |
| `npm run build`            | Production build to `dist/`            |
| `npm run build:dev-static` | Local-only static build to `dist-dev/` |
| `npm run preview`          | Preview the production build           |
| `npm test`                 | Run the test suite once                |
| `npm run test:watch`       | Run tests in watch mode                |
| `npm run lint`             | ESLint (zero warnings expected)        |
| `npm run format`           | Format the repository with Prettier    |
| `npm run format:check`     | Verify formatting without writing      |

`npm run build` produces a single self-contained `dist/index.html`
(`vite-plugin-singlefile`) that can be opened directly from disk. Because the
mock is disabled in production, that file needs a reachable backend to sign in.

### Local static demo build

`npm run build:dev-static` produces `dist-dev/index.html` with the development
login bypass and local fixtures kept in the bundle, so it can be double-clicked
and used without a server or backend. It requires
`VITE_DEV_BYPASS_LOGIN=true` in `.env.local`.

Never deploy `dist-dev`: it contains a fake-admin backdoor by design. The normal
production build (`dist/`) stays clean and is the only artifact to ship.

## Backend contract

All requests go through `src/services/http.js`, which adds the bearer token,
retries once after a 401 using the refresh token, and normalizes failures into
`ApiError` (`status` 0 means the network was unreachable).

Expected response envelope:

```json
{ "success": true, "data": {}, "message": "optional" }
```

Endpoints used:

| Method | Path                    | Body                               | Returns                                 |
| ------ | ----------------------- | ---------------------------------- | --------------------------------------- |
| POST   | `/auth/login`           | `{ email, password }`              | `{ user, accessToken, refreshToken }`   |
| POST   | `/auth/refresh`         | `{ refreshToken }`                 | `{ accessToken, refreshToken?, user? }` |
| POST   | `/auth/logout`          | `{ refreshToken }`                 | – (best effort)                         |
| POST   | `/auth/forgot-password` | `{ email }`                        | `{ message }`                           |
| GET    | `/users`                | –                                  | `{ users, stats }`                      |
| PATCH  | `/users/:id`            | profile/role/status patch          | updated user                            |
| POST   | `/users/:id/deactivate` | `{ reason, reassignTo }`           | updated user                            |
| POST   | `/users/me/password`    | `{ currentPassword, newPassword }` | `{ success }`                           |

`src/services/users.js` falls back to local fixtures **only** while
`VITE_USE_MOCK_API=true` in development. In production the same errors surface
to the UI.

## Authentication & security

- `src/services/tokenStorage.js` is the only module that reads or writes
  credentials, which keeps the storage strategy swappable.
- Tokens are currently persisted in `localStorage` so the demo works without a
  backend.
- **Production recommendation:** have the backend set short-lived access and
  refresh tokens as `HttpOnly`, `Secure`, `SameSite=Strict` cookies, then remove
  the token getters/setters from `tokenStorage.js` (the HTTP layer already keeps
  the rest of the app storage-agnostic). Add CSRF protection if cookies are used.
- Passwords are never prefilled in the UI; the login form starts empty.
- Protected routes are guarded in `src/App.jsx`; a `#dashboard` URL without a
  stored session redirects to `#login`.
- A failed refresh clears the session and emits `orvia:session-expired`, which
  `AuthProvider` turns into a logout.

## Project structure

```
src/
  App.jsx                 # hash routing, route guard, theme/sidebar state
  main.jsx                # providers + ErrorBoundary
  auth/                   # AuthContext, AuthProvider
  hooks/                  # useAuth, useToast
  components/
    common/               # Modal (+ Modal.css)
    layout/               # Sidebar, Topbar
    modals/               # New brief, new role, info dialogs
    sections/             # Dashboard sections (stats, roles, activity)
    ui/                   # Switch, Toast, ViewTabs
  data/                   # RBAC matrix + directory fixtures
  pages/                  # Login, Forgot, Dashboard, Settings, Roles, User Access
  services/               # http, api (auth), users, tokenStorage
  styles/                 # tokens, base, auth, showcase, dashboard, settings,
                          # shared, rbac, users, responsive
  utils/                  # validation, permission helpers
  test/                   # Vitest setup
```

Tests live next to the code (`src/**/__tests__`). They cover login
success/failure/unreachable backend, the dashboard route guard, directory
search/selection, and the permission-matrix logic.

## Notes / current limitations

- No real backend is connected yet; the users directory and profile saves use
  the local mock in development.
- Audit activity, avatar upload, and the brand-assignment picker are still
  placeholders (they show informational toasts).
- The copy in the UI intentionally mixes English and a few Arabic labels from
  the approved design.
