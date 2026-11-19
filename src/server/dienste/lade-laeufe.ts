// Anwendungsfall »Läufe im Eingangskorb laden« (A2 Schritt 1, Story E3-S1).
import type { LaufZeile } from '../../gemeinsam/eingangskorb';
import type { Datenbank } from '../daten/db';
import { listeAusgefuehrteLaeufe } from '../daten/laeufe';

export function ladeLaeufe(db: Datenbank): LaufZeile[] {
  return listeAusgefuehrteLaeufe(db);
}
