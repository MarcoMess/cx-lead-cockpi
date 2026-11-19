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

// Echtbetrieb über den Befehl selbst (`scripts/echt.mjs`, Story E1-S4), mit eigener Datenbank und eigenen Ports.
const ECHT_API_PORT = process.env.TEST_ECHT_API_PORT ?? String(Number(API_PORT) + 2);
const ECHT_WEB_PORT = process.env.TEST_ECHT_WEB_PORT ?? String(Number(WEB_PORT) + 2);
export const ECHT_BASIS = `http://localhost:${ECHT_WEB_PORT}`;
const echtEnv = {
  ...testEnv,
  ECHT_DATABASE_PATH: './data/test-echt-ui.sqlite',
  PORT: ECHT_API_PORT,
  API_PORT: ECHT_API_PORT,
  WEB_PORT: ECHT_WEB_PORT,
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
      command: 'tsx src/server/reset.ts && tsx src/server/start.ts',
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
    {
      command:
        "node -e \"for (const e of ['', '-wal', '-shm']) require('fs').rmSync('./data/test-echt-ui.sqlite' + e, { force: true })\" && node scripts/echt.mjs",
      url: ECHT_BASIS,
      env: echtEnv,
      reuseExistingServer: false,
      timeout: 90_000,
    },
  ],
});
