// Liest den Bestand an Firmen und Kontakten für die Dublettenprüfung (regeln/dubletten.ts).
import type { Bestand } from '../../gemeinsam/bestand';
import { anlassBeschreibungen, listeBekannteKontakte } from './ansprechpartner';
import type { Datenbank } from './db';
import { listeFirmenFuerAbgleich } from './firmen';

export function liesBestand(db: Datenbank): Bestand {
  const anlaesse = anlassBeschreibungen(db);
  return {
    firmen: listeFirmenFuerAbgleich(db),
    kontakte: listeBekannteKontakte(db).map((k) => ({ ...k, anlaesse: anlaesse.get(k.id) ?? [] })),
  };
}
