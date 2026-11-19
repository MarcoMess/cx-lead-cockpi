// Regeln zur Dublettenprüfung (Konzept, Abschnitt 9). Reine Funktionen ohne Datenbank.
import type { AnsprechpartnerStatus } from '../../gemeinsam/werte';

const RECHTSFORMEN = ['gmbh & co. kg', 'gmbh', 'ag', 'se', 'kg', 'ohg', 'gesmbh', 'sa', 'sàrl', 'ug', 'e.v.'];

/** Normalisiert einen Firmennamen: klein, ohne Rechtsform am Ende, ohne doppelte Leerzeichen. */
export function normalisiereFirmenname(name: string): string {
  let n = name.toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
  for (const rf of RECHTSFORMEN) {
    if (n.endsWith(' ' + rf)) {
      n = n.slice(0, -rf.length - 1).trim();
      break;
    }
  }
  return n;
}

/**
 * Wiederansprache gibt es nur für Kontakte, die ohne Antwort geschlossen wurden.
 * »Kein Interesse« sperrt dauerhaft, laufende Kontakte werden nicht zurückgesetzt.
 * Die Frist von 6 Monaten und den neuen Anlass prüft die Sperrliste (E10).
 */
export function darfWiederangesprochenWerden(status: AnsprechpartnerStatus): boolean {
  return status === 'ohne_antwort_geschlossen';
}
