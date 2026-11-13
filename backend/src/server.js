import { env } from './config/env.js';
import app from './app.js';
import { prisma } from './config/prisma.js';

const PORT = env.PORT;

let server;

async function startServer() {
  try {
    // Verify database connection before starting Express
    await prisma.$connect();

    // Execute a lightweight database query
    await prisma.$queryRaw`SELECT 1`;

    console.log('Connected to Supabase PostgreSQL successfully');

    server = app.listen(PORT, () => {
      console.log(`Orvia API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:');
    console.error(error);

    await prisma.$disconnect();
    process.exit(1);
  }
}

async function shutdown() {
  console.log('Shutting down ORVIA API...');

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await prisma.$disconnect();

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
