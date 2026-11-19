// Angezeigte deutsche Namen der erlaubten Werte (architektur.md, Abschnitt 9).
import type { AnsprechpartnerStatus } from './werte';

export const STATUS_TEXT: Record<AnsprechpartnerStatus, string> = {
  freigegeben: 'Freigegeben',
  angeschrieben: 'Angeschrieben',
  nachgefasst: 'Nachgefasst',
  antwort_erhalten: 'Antwort erhalten',
  gespraech_vereinbart: 'Gespräch vereinbart',
  an_sap_uebergeben: 'An SAP übergeben',
  kein_interesse: 'Kein Interesse',
  ohne_antwort_geschlossen: 'Ohne Antwort geschlossen',
  gesperrt: 'Gesperrt',
};

export const ANTWORT_ART_TEXT: Record<string, string> = {
  positiv: 'positiv',
  neutral_spaeter: 'neutral/später',
  kein_interesse: 'kein Interesse',
};

/** z. B. »Antwort erhalten (neutral/später)«. */
export function statusText(status: AnsprechpartnerStatus, antwortArt?: string | null): string {
  const basis = STATUS_TEXT[status];
  return status === 'antwort_erhalten' && antwortArt
    ? `${basis} (${ANTWORT_ART_TEXT[antwortArt] ?? antwortArt})`
    : basis;
}
