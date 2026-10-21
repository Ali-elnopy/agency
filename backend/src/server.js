import 'dotenv/config';

import app from './app.js';
import { prisma } from './config/prisma.js';

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}

let server;

async function startServer() {
  await prisma.$connect();

  server = app.listen(PORT, () => {
    console.log(`Orvia API running on port ${PORT}`);
  });
}

async function shutdown() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer().catch(async (error) => {
  console.error('Failed to start server:', error);
  await prisma.$disconnect();
  process.exit(1);
});
