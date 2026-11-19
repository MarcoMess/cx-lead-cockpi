// Einmalige Einrichtung nach `npm install`: .env anlegen, Browser für die Oberflächentests, Startdaten laden.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';

if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env');
  console.log('.env aus .env.example angelegt.');
} else {
  console.log('.env ist schon vorhanden und bleibt unverändert.');
}

const env = readFileSync('.env', 'utf8');
if (/^COCKPIT_SESSION_SECRET=\s*$/m.test(env)) {
  writeFileSync(
    '.env',
    env.replace(/^COCKPIT_SESSION_SECRET=\s*$/m, `COCKPIT_SESSION_SECRET=${randomBytes(32).toString('hex')}`),
  );
  console.log('Schlüssel für das Sitzungs-Cookie erzeugt.');
}

if (process.env.PLAYWRIGHT_CHANNEL) {
  console.log(`Oberflächentests nutzen den installierten Browser »${process.env.PLAYWRIGHT_CHANNEL}«.`);
} else {
  execSync('npx playwright install chromium', { stdio: 'inherit' });
}

execSync('npm run reset', { stdio: 'inherit' });
console.log('Fertig. Starten mit: npm run dev');
