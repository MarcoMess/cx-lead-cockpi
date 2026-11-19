import { randomBytes } from 'node:crypto';
import { defineConfig } from '@playwright/test';

// Eigene Ports und eine eigene Datenbank, damit die Tests nie die Arbeitsdaten berühren.
// TEST_API_PORT und TEST_WEB_PORT erlauben parallele Testläufe in zwei Arbeitskopien.
const API_PORT = process.env.TEST_API_PORT ?? '3100';
const WEB_PORT = process.env.TEST_WEB_PORT ?? '5174';
const testEnv = {
  DATABASE_PATH: './data/test.sqlite',
  PORT: API_PORT,
  API_PORT,
  WEB_PORT,
  COCKPIT_DEMO: '1',
  COCKPIT_PASSWORD: 'test-passwort',
  COCKPIT_AGENT_KEY: 'test-agent-schluessel',
  COCKPIT_SESSION_SECRET: randomBytes(32).toString('hex'),
};

export default defineConfig({
  testDir: 'tests/oberflaeche',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  },
  webServer: [
    {
      command: 'tsx src/server/daten/reset.ts && tsx src/server/start.ts',
      url: `http://localhost:${API_PORT}/api/v1/gesundheit`,
      env: testEnv,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: 'vite',
      url: `http://localhost:${WEB_PORT}`,
      env: testEnv,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
