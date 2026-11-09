import 'dotenv/config';

import app from './app.js';
import { prisma } from './config/prisma.js';
import { env } from './config/env.js';

const PORT = env.PORT;

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
