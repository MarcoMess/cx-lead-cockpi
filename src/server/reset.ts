// `npm run reset`: Datenbankdatei neu anlegen und über setzeZurueck() in den Ausgangszustand bringen.
import { randomBytes } from 'node:crypto';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { ladeUmgebung } from './umgebung';
import { oeffneDatenbank } from './daten/db';
import { zaehleBestand } from './daten/leeren';
import { setzeZurueck } from './dienste/zuruecksetzen';
import { VORFUEHR_START_DATUM } from '../gemeinsam/werte';

ladeUmgebung();
const datenbankPfad = process.env.DATABASE_PATH ?? './data/cockpit.sqlite';
// Der Echtbestand wird nie zurückgesetzt (Story E1-S4, Kriterium 3).
// Verglichen werden aufgelöste Pfade ohne Groß-/Kleinschreibung (Prüfung E1-S4, Hinweis zu ECHT_DATABASE_PATH).
const gleicherPfad = (a: string, b: string | undefined) => !!b && resolve(a).toLowerCase() === resolve(b).toLowerCase();
if (/(^|[\\/])echt\.sqlite$/i.test(datenbankPfad) || gleicherPfad(datenbankPfad, process.env.ECHT_DATABASE_PATH)) {
  console.error(`Abgebrochen: ${datenbankPfad} ist die Datenbank des Echtbetriebs und wird nicht zurückgesetzt.`);
  process.exit(1);
}
for (const endung of ['', '-wal', '-shm']) rmSync(datenbankPfad + endung, { force: true });
const db = oeffneDatenbank(datenbankPfad);
const agentSchluessel = process.env.COCKPIT_AGENT_KEY || randomBytes(24).toString('hex');
setzeZurueck(db, agentSchluessel);
if (!process.env.COCKPIT_AGENT_KEY) {
  console.log(`Kein COCKPIT_AGENT_KEY gesetzt. Neuer Agenten-Schlüssel (nur jetzt sichtbar): ${agentSchluessel}`);
}
const n = zaehleBestand(db);
console.log(
  `Startdaten geladen in ${datenbankPfad}: ${n.firma} Firmen, ${n.ansprechpartner} Ansprechpartner, ` +
    `${n.recherchelauf} Rechercheläufe, ${n.sperreintrag} Sperreinträge. Vorführdatum: ${VORFUEHR_START_DATUM}.`,
);
console.log('Läuft der Server schon, starte ihn neu – oder nutze »Zurücksetzen« in der Vorführleiste.');
db.close();
