// Liest den Bestand an Firmen und Kontakten für die Dublettenprüfung (regeln/dubletten.ts).
import type { Bestand } from '../../gemeinsam/bestand';
import { listeBekannteKontakte } from './ansprechpartner';
import type { Datenbank } from './db';
import { listeFirmenNormnamen } from './firmen';

export function liesBestand(db: Datenbank): Bestand {
  return { firmen: listeFirmenNormnamen(db), kontakte: listeBekannteKontakte(db) };
}
