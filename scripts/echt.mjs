// `npm run echt`: Cockpit im Echtbetrieb starten – eigene Datenbank data/echt.sqlite, echtes Datum, keine Vorführleiste.
import { spawnSync, spawn } from 'node:child_process';

const env = {
  ...process.env,
  DATABASE_PATH: process.env.ECHT_DATABASE_PATH ?? './data/echt.sqlite',
  COCKPIT_DEMO: '0',
};
const einrichten = spawnSync('npx tsx src/server/echt.ts', { stdio: 'inherit', shell: true, env });
if (einrichten.status !== 0) process.exit(einrichten.status ?? 1);
console.log('Starte das Cockpit im Echtbetrieb: http://localhost:5173');
const dev = spawn('npm run dev', { stdio: 'inherit', shell: true, env });
dev.on('exit', (code) => process.exit(code ?? 0));
