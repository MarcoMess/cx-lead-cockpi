// Anwendungsfall »Kontaktakte laden« (A4 Schritt 1, Story E4-S3).
import type { KontaktAkte } from '../../gemeinsam/kontakte';
import { liesAkteStamm, liesAnlaesse, liesVerlauf } from '../daten/ansprechpartner';
import type { Datenbank } from '../daten/db';
import { FachFehler } from '../fehler';
import { erlaubteAktionen, istEndzustand } from '../regeln/status';
import { ordneVerlauf } from '../regeln/verlauf';

export function ladeKontaktakte(db: Datenbank, id: number): KontaktAkte {
  const stamm = Number.isInteger(id) && id > 0 ? liesAkteStamm(db, id) : undefined;
  if (!stamm) throw new FachFehler(404, 'kontakt_unbekannt', 'Diesen Kontakt gibt es nicht.');
  return {
    ...stamm,
    endzustand: istEndzustand(stamm.status),
    anlaesse: liesAnlaesse(db, id),
    verlauf: ordneVerlauf(liesVerlauf(db, id)),
    erlaubte_aktionen: erlaubteAktionen(stamm.status, stamm.antwort_art),
  };
}
