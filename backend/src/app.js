import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { authRouter } from './modules/auth/auth.routes.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();

app.disable('x-powered-by');

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

app.use('/api/auth', authRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
