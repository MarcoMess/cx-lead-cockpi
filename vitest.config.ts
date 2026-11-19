import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/regeln/**/*.test.ts', 'tests/api/**/*.test.ts'],
    environment: 'node',
  },
});
