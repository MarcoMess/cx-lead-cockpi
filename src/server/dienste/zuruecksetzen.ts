// Stellt den Ausgangszustand her: alle Fachdaten löschen, Startdaten laden, Uhr auf das Vorführdatum.
// Einziger Weg dafür – genutzt von `npm run reset` (src/server/reset.ts) und von POST /api/v1/sim/zuruecksetzen.
// Der Agenten-Schlüssel bleibt erhalten, sofern keiner übergeben wird.
import { VORFUEHR_START_DATUM } from '../../gemeinsam/werte';
import { setzeVorfuehrdatum } from '../anbindungen/uhr';
import { transaktion, type Datenbank } from '../daten/db';
import { leereAlleTabellen } from '../daten/leeren';
import { ladeStartdaten } from '../daten/startdaten';
import { liesAgentSchluesselHash, schreibeAgentSchluesselHash, setzeAgentSchluessel } from './zugang';

export function setzeZurueck(db: Datenbank, neuerAgentSchluessel?: string): void {
  const bisher = liesAgentSchluesselHash(db);
  transaktion(db, () => {
    leereAlleTabellen(db);
    ladeStartdaten(db);
    if (neuerAgentSchluessel) setzeAgentSchluessel(db, neuerAgentSchluessel);
    else schreibeAgentSchluesselHash(db, bisher);
    setzeVorfuehrdatum(db, VORFUEHR_START_DATUM);
  });
}
