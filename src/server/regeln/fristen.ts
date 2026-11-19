// Reine Datumsrechnung auf Tagesbasis (JJJJ-MM-TT), ohne Systemzeit und ohne Zeitzone.
import { FRISTEN } from '../../gemeinsam/werte';

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

/** Wiedervorlage zum Nachfassen: 7 Werktage nach dem Erstkontakt (Konzept, Abschnitt 9). */
export function fristWiedervorlage(erstkontakt: string): string {
  return plusWerktage(erstkontakt, FRISTEN.wiedervorlageWerktage);
}

/** Verschiebt ein Datum um n Kalendermonate; gibt es den Tag im Zielmonat nicht, gilt dessen letzter Tag. */
export function plusMonate(s: string, n: number): string {
  const [j, m, t] = s.slice(0, 10).split('-').map(Number);
  const ziel = j * 12 + (m - 1) + n;
  const jahr = Math.floor(ziel / 12);
  const monat = ziel - jahr * 12 + 1;
  const letzter = new Date(Date.UTC(jahr, monat, 0)).getUTCDate();
  const tag = Math.min(t, letzter);
  return `${String(jahr).padStart(4, '0')}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`;
}

/** Ende der Sperre nach dem Schließen ohne Antwort: 6 Monate (Konzept, Abschnitt 9). */
export function sperreNachSchliessenBis(geschlossenAm: string): string {
  return plusMonate(geschlossenAm, FRISTEN.sperreNachSchliessenMonate);
}
