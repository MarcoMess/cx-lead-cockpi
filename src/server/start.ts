// `npm run dev`: startet den Server mit der Datenbank aus DATABASE_PATH.
import { ladeUmgebung, konfiguration } from './umgebung';
import { oeffneDatenbank } from './daten/db';
import { baueApp } from './app';

ladeUmgebung();
const k = konfiguration();
const app = await baueApp({ db: oeffneDatenbank(k.datenbankPfad), demo: k.demo });
await app.listen({ port: k.port, host: '127.0.0.1' });
console.log(`CX Lead Cockpit – Server läuft auf http://localhost:${k.port} (Datenbank ${k.datenbankPfad})`);
