// `npm run reset`: Datenbank löschen, Schema anlegen, Startdaten laden.
import { rmSync } from 'node:fs';
import { ladeUmgebung, konfiguration } from '../umgebung';
import { erstelleStartdatenbank } from './db';

ladeUmgebung();
const { datenbankPfad } = konfiguration();
for (const endung of ['', '-wal', '-shm']) rmSync(datenbankPfad + endung, { force: true });
const db = erstelleStartdatenbank(datenbankPfad);
const zahl = (t: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
console.log(
  `Startdaten geladen in ${datenbankPfad}: ${zahl('firma')} Firmen, ${zahl('ansprechpartner')} Ansprechpartner, ` +
    `${zahl('recherchelauf')} Rechercheläufe, ${zahl('sperreintrag')} Sperreinträge.`,
);
db.close();
