// Regeln zum Status eines Ansprechpartners (Konzept, Abschnitt 9).
import type { AnsprechpartnerStatus } from '../../gemeinsam/werte';

/** Endzustände: Der Kontakt ist abgeschlossen und erscheint nicht in der Liste »Offene«. */
export const ENDZUSTAENDE: readonly AnsprechpartnerStatus[] = [
  'kein_interesse',
  'ohne_antwort_geschlossen',
  'gesperrt',
  'an_sap_uebergeben',
];

export function istOffen(status: AnsprechpartnerStatus): boolean {
  return !ENDZUSTAENDE.includes(status);
}
