import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://agency:agency@localhost:5432/agency_test?schema=public',
      JWT_ACCESS_SECRET: 'test-secret-test-secret-test-secret-123',
    },
  },
});
