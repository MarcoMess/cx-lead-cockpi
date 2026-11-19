// Reine Datumsrechnung auf Tagesbasis (JJJJ-MM-TT), ohne Systemzeit und ohne Zeitzone.

const MS_JE_TAG = 86_400_000;
const MUSTER = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Prüft, ob ein Text ein gültiges Kalenderdatum im Format JJJJ-MM-TT ist. */
export function istDatum(s: unknown): s is string {
  if (typeof s !== 'string') return false;
  const m = MUSTER.exec(s);
  if (!m) return false;
  return ausTagen(inTage(s)) === s && Number(m[2]) >= 1 && Number(m[2]) <= 12;
}

function inTage(s: string): number {
  const [j, m, t] = s.split('-').map(Number);
  return Date.UTC(j, m - 1, t) / MS_JE_TAG;
}

function ausTagen(tage: number): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'UTC' }).format(tage * MS_JE_TAG);
}

/** Wochentag: 0 = Sonntag … 6 = Samstag. */
export function wochentag(s: string): number {
  return (((inTage(s) + 4) % 7) + 7) % 7; // 01.01.1970 war ein Donnerstag
}

export function istWerktag(s: string): boolean {
  const w = wochentag(s);
  return w >= 1 && w <= 5;
}

export function plusTage(s: string, n: number): string {
  return ausTagen(inTage(s) + n);
}

/** Zählt n Werktage (Montag bis Freitag) ab dem Folgetag weiter. */
export function plusWerktage(s: string, n: number): string {
  let d = s;
  let rest = n;
  while (rest > 0) {
    d = plusTage(d, 1);
    if (istWerktag(d)) rest--;
  }
  return d;
}

/** TT.MM.JJJJ für die Anzeige. */
export function alsAnzeige(s: string): string {
  const [j, m, t] = s.slice(0, 10).split('-');
  return `${t}.${m}.${j}`;
}
