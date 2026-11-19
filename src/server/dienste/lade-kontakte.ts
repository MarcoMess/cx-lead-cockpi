// Kontaktliste mit Statusfilter (Story E4-S2).
import { KONTAKT_FILTER, type KontaktFilter, type KontaktZeile } from '../../gemeinsam/kontakte';
import type { Datenbank } from '../daten/db';
import { listeAnsprechpartner } from '../daten/ansprechpartner';
import { FachFehler } from '../fehler';
import { istOffen } from '../regeln/status';

export function ladeKontakte(db: Datenbank, filter: string | undefined): KontaktZeile[] {
  const f = (filter ?? 'offene') as KontaktFilter;
  if (!KONTAKT_FILTER.includes(f)) {
    throw new FachFehler(400, 'filter_ungueltig', `Den Statusfilter »${filter}« gibt es nicht.`, 'status');
  }
  const alle = listeAnsprechpartner(db);
  if (f === 'alle') return alle;
  if (f === 'offene') return alle.filter((k) => istOffen(k.status));
  return alle.filter((k) => k.status === f);
}
