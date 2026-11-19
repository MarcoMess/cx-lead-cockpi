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

/**
 * Wiederansprache gibt es nur für Kontakte, die ohne Antwort geschlossen wurden.
 * »Kein Interesse« sperrt dauerhaft, laufende Kontakte werden nicht zurückgesetzt.
 * Die Frist von 6 Monaten und den neuen Anlass prüft die Sperrliste (E10).
 */
export function darfWiederangesprochenWerden(status: AnsprechpartnerStatus): boolean {
  return status === 'ohne_antwort_geschlossen';
}
