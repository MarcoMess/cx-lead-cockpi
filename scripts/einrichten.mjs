// Einmalige Einrichtung nach `npm install`: .env anlegen, Browser für die Oberflächentests, Startdaten laden.
import { copyFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env');
  console.log('.env aus .env.example angelegt.');
} else {
  console.log('.env ist schon vorhanden und bleibt unverändert.');
}

if (process.env.PLAYWRIGHT_CHANNEL) {
  console.log(`Oberflächentests nutzen den installierten Browser »${process.env.PLAYWRIGHT_CHANNEL}«.`);
} else {
  execSync('npx playwright install chromium', { stdio: 'inherit' });
}

execSync('npm run reset', { stdio: 'inherit' });
console.log('Fertig. Starten mit: npm run dev');
