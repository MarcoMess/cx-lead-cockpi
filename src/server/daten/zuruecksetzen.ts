// Stellt den Ausgangszustand her: alle Fachdaten löschen, Startdaten laden, Uhr auf das Vorführdatum.
// Genutzt von `npm run reset` und von POST /api/v1/sim/zuruecksetzen. Der Agenten-Schlüssel bleibt erhalten.
import { VORFUEHR_START_DATUM } from '../../gemeinsam/werte';
import { setzeVorfuehrdatum } from '../anbindungen/uhr';
import { setzeAgentSchluesselHash } from '../dienste/zugang';
import { transaktion, type Datenbank } from './db';
import { ladeStartdaten } from './startdaten';

const TABELLEN_KINDER_ZUERST = [
  'sap_uebergabe',
  'vorschlag',
  'wiedervorlage',
  'antwort',
  'kontaktversuch',
  'nachricht',
  'anlass',
  'ansprechpartner',
  'firma',
  'recherchelauf',
  'sperrzeit',
  'rechercheprofil',
  'sperreintrag',
  'einstellung',
];

export function setzeZurueck(db: Datenbank): void {
  const schluessel = db
    .prepare(
      `SELECT schluessel, wert FROM einstellung WHERE schluessel IN ('agent_schluessel_hash', 'agent_schluessel_endung')`,
    )
    .all() as { schluessel: string; wert: string }[];
  transaktion(db, () => {
    for (const t of TABELLEN_KINDER_ZUERST) db.exec(`DELETE FROM ${t}`);
  });
  ladeStartdaten(db);
  setzeAgentSchluesselHash(db, schluessel);
  setzeVorfuehrdatum(db, VORFUEHR_START_DATUM);
}
