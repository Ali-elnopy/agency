# Agency Management System — Backend

Node.js + Express + PostgreSQL + Prisma (الـ P-E-N من PERN؛ الـ React في ريبو الفرونت).

## خطوات الـ Setup

```bash
# 1) تنزيل المكتبات
npm install express @prisma/client@6 zod bcryptjs jsonwebtoken cors helmet morgan \
  express-rate-limit dotenv multer
npm install -D prisma@6 nodemon vitest supertest eslint @eslint/js globals prettier

# 2) ملف البيئة
cp .env.example .env        # وغيّر JWT_ACCESS_SECRET (openssl rand -hex 48)

# 3) قاعدة البيانات (Docker)
docker compose up -d

# 4) Migration + seed لأول Admin
npx prisma migrate dev --name init
npm run db:seed

# 5) تشغيل
npm run dev                 # http://localhost:5000/api/v1/health
```

## الهيكل

```
prisma/            schema + seed
src/
  config/          env (zod-validated) + prisma client
  middlewares/     auth (authenticate/authorize), validate, error
  modules/         كل Feature فولدر: routes → controller → service (+ validation)
    auth/          login, refresh, logout, forgot/reset/change password, me
    users/         Admin: CRUD + activate/deactivate
  routes/index.js  تجميع الـ routes تحت /api/v1
  utils/           ApiError, asyncHandler, tokens, audit, mailer (stub)
tests/             vitest + supertest
```

القاعدة: الـ controller رفيع، والـ business logic والـ authorization checks للبيانات في الـ service.

## Endpoints (Sprint 1)

| Method | Path | Access |
|---|---|---|
| POST | /api/v1/auth/login | public |
| POST | /api/v1/auth/refresh | public (refresh token) |
| POST | /api/v1/auth/logout | public (refresh token) |
| POST | /api/v1/auth/forgot-password | public |
| POST | /api/v1/auth/reset-password | public |
| POST | /api/v1/auth/change-password | authenticated |
| GET | /api/v1/auth/me | authenticated |
| GET/POST | /api/v1/users | ADMIN |
| GET/PATCH | /api/v1/users/:id | ADMIN |

Auth: Bearer access token (15m) + refresh token rotation (متخزن hash في الـ DB)، يشتغل مع الويب وFlutter.

## إضافة Module جديد (مثلًا brands)
1. أضف الـ models في `prisma/schema.prisma` ثم `npm run db:migrate`.
2. اعمل `src/modules/brands/` بنفس تقسيم users.
3. سجّله في `src/routes/index.js`.
4. أي query لازم يفلتر بالـ ownership/assignment (Account Manager = brands المسندة له، Client = brand بتاعه بس).

## قرارات مؤقتة (لازم الفريق يأكدها — Open Decisions في الـ brief)
- JavaScript (ESM) بدل TypeScript.
- Prisma كـ ORM، Postgres 16.
- الإيميل stub بيطبع في الكونسول لحد ما نحدد قناة الإشعارات.
- مفيش رفع ملفات لسه (multer منزّل بس لـ Sprint 4) — storage provider لسه مش محدد.
