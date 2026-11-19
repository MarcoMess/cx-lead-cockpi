// Simulierter Teil der Uhr: das Vorführdatum (`heute_override`) aus den Einstellungen.
// Als Simulator darf diese Datei die Datenhaltung kennen (architektur.md, Abschnitt 3).
import type { Datenbank } from '../daten/db';
import { liesEinstellung, schreibeEinstellung } from '../daten/einstellungen';

export function liesVorfuehrdatum(db: Datenbank): string | null {
  return liesEinstellung(db, 'heute_override');
}

export function setzeVorfuehrdatum(db: Datenbank, datum: string | null): void {
  schreibeEinstellung(db, 'heute_override', datum);
}
