import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://agency:agency@localhost:5432/agency_db?schema=public',
      JWT_SECRET: 'test-secret-test-secret-test-secret-123-at-least-32-chars',
      JWT_ACCESS_SECRET: 'test-secret-test-secret-test-secret-123',
    },
  },
});