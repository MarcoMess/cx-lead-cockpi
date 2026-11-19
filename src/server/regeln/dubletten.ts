// Regeln zur Dublettenprüfung (Konzept, Abschnitt 9). Reine Funktionen ohne Datenbank.

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
