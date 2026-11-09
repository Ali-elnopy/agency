import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_ACCESS_SECRET: 'test-secret-test-secret-test-secret-123',
    },
  },
});