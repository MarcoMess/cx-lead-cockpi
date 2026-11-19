// Regeln zum Status eines Ansprechpartners (Konzept, Abschnitt 9).
import type { AnsprechpartnerStatus, KontaktAktion } from '../../gemeinsam/werte';

/** Abgeschlossen: Der Kontakt erscheint nicht in der Liste »Offene« (wie im Clickdummy). */
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
 * Endzustände im Sinne des Konzepts (Abschnitt 9): Kein Interesse, Ohne Antwort geschlossen, Gesperrt.
 * »An SAP übergeben« ist das Ziel der Statusschiene, kein Endzustand – erscheint aber nicht mehr unter »Offene«.
 */
export function istEndzustand(status: AnsprechpartnerStatus): boolean {
  return status === 'kein_interesse' || status === 'ohne_antwort_geschlossen' || status === 'gesperrt';
}

/**
 * Welche Aktionen die Kontaktakte anbietet (Konzept, Abschnitt 9; Abläufe A3 bis A5).
 * Die Oberfläche zeigt Schaltflächen nur danach und prüft selbst nichts.
 */
export function erlaubteAktionen(status: AnsprechpartnerStatus, antwortArt: string | null): KontaktAktion[] {
  const a: KontaktAktion[] = [];
  const positiv = status === 'antwort_erhalten' && antwortArt === 'positiv';
  if (status === 'freigegeben') a.push('ansprechen');
  if (status === 'angeschrieben') a.push('nachfassen');
  if (status === 'angeschrieben' || status === 'nachgefasst' || (status === 'antwort_erhalten' && !positiv)) {
    a.push('antwort_erfassen');
  }
  if (positiv) a.push('gespraech_eintragen');
  if (istOffen(status)) a.push('wiedervorlage_setzen');
  if (status === 'angeschrieben' || status === 'nachgefasst') a.push('ohne_antwort_schliessen');
  if (status === 'ohne_antwort_geschlossen' || status === 'kein_interesse') a.push('wieder_oeffnen');
  if (positiv || status === 'gespraech_vereinbart') a.push('an_sap_uebergeben');
  if (status !== 'gesperrt' && status !== 'an_sap_uebergeben') a.push('sperren');
  a.push('loeschen');
  return a;
}
