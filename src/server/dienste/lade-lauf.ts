// Anwendungsfall »Einen Lauf mit seinen Vorschlägen laden« (A2 Schritt 1, Story E3-S1).
import type { LaufDetail } from '../../gemeinsam/eingangskorb';
import type { Datenbank } from '../daten/db';
import { liesAusgefuehrtenLauf, vorschlaegeVonLauf } from '../daten/laeufe';
import { FachFehler } from '../fehler';

export function ladeLauf(db: Datenbank, id: number): LaufDetail {
  const lauf = Number.isInteger(id) ? liesAusgefuehrtenLauf(db, id) : undefined;
  if (!lauf) throw new FachFehler(404, 'lauf_unbekannt', 'Diesen Recherchelauf gibt es nicht.');
  return { ...lauf, vorschlaege: vorschlaegeVonLauf(db, id) };
}
