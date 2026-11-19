// Eingangskorb lesen (A2 Schritt 1, Story E3-S1).
import type { LaufDetail, LaufZeile } from '../../gemeinsam/eingangskorb';
import type { Datenbank } from '../daten/db';
import { liesAusgefuehrtenLauf, listeAusgefuehrteLaeufe, vorschlaegeVonLauf } from '../daten/laeufe';
import { FachFehler } from '../fehler';

export function ladeLaeufe(db: Datenbank): LaufZeile[] {
  return listeAusgefuehrteLaeufe(db);
}

export function ladeLauf(db: Datenbank, id: number): LaufDetail {
  const lauf = Number.isInteger(id) ? liesAusgefuehrtenLauf(db, id) : undefined;
  if (!lauf) throw new FachFehler(404, 'lauf_unbekannt', 'Diesen Recherchelauf gibt es nicht.');
  return { ...lauf, vorschlaege: vorschlaegeVonLauf(db, id) };
}
