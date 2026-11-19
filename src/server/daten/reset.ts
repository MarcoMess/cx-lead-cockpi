// `npm run reset`: Datenbank löschen, Schema anlegen, Startdaten laden.
import { rmSync } from 'node:fs';
import { ladeUmgebung } from '../umgebung';
import { randomBytes } from 'node:crypto';
import { erstelleStartdatenbank } from './db';
import { setzeAgentSchluessel } from '../dienste/zugang';

ladeUmgebung();
const datenbankPfad = process.env.DATABASE_PATH ?? './data/cockpit.sqlite';
for (const endung of ['', '-wal', '-shm']) rmSync(datenbankPfad + endung, { force: true });
const db = erstelleStartdatenbank(datenbankPfad);
const agentSchluessel = process.env.COCKPIT_AGENT_KEY || randomBytes(24).toString('hex');
setzeAgentSchluessel(db, agentSchluessel);
if (!process.env.COCKPIT_AGENT_KEY)
  console.log(`Kein COCKPIT_AGENT_KEY gesetzt. Neuer Agenten-Schlüssel (nur jetzt sichtbar): ${agentSchluessel}`);
const zahl = (t: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
console.log(
  `Startdaten geladen in ${datenbankPfad}: ${zahl('firma')} Firmen, ${zahl('ansprechpartner')} Ansprechpartner, ` +
    `${zahl('recherchelauf')} Rechercheläufe, ${zahl('sperreintrag')} Sperreinträge.`,
);
db.close();
