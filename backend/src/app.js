import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { notFound, errorHandler } from './middlewares/error.js';
import { teamsRouter } from './modules/teams/teams.routes.js';
import { brandsRouter } from './modules/brands/brands.routes.js';
import { metaRouter } from './modules/meta/meta.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { platformAccountsRouter } from './modules/platform-accounts/platform-accounts.routes.js';
import { contentPlansRouter } from './modules/content-plans/content-plans.routes.js';
import { filesRouter } from './modules/files/files.routes.js';
const app = express();

app.disable('x-powered-by');

// Vercel terminates TLS in front of the function; without this the rate
// limiter would see every visitor as the same proxy address.
app.set('trust proxy', 1);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
      : 'http://localhost:3000',
  }),
);

app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orvia Agency OS API is running',
  });
});

const apiIndex = (_req, res) => {
  res.status(200).json({
    success: true,
    name: 'ORVIA Agency OS API',
    status: 'operational',
    docs: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      users: 'GET /api/users',
      teams: 'GET /api/teams',
      brands: 'GET /api/brands',
      dashboard: 'GET /api/dashboard',
      roles: 'GET /api/meta/roles',
      jobTitles: 'GET /api/meta/job-titles',
    },
  });
};

app.get('/', apiIndex);
app.get('/api', apiIndex);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/meta', metaRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/platform-accounts', platformAccountsRouter);
app.use('/api/content-plans', contentPlansRouter);
app.use('/api/files', filesRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/teams', teamsRouter);
app.use('/api/v1/brands', brandsRouter);
app.use('/api/v1/meta', metaRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/platform-accounts', platformAccountsRouter);
app.use('/api/v1/content-plans', contentPlansRouter);
app.use('/api/v1/files', filesRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
