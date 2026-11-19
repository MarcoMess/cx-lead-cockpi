// Löscht alle Zeilen aller Tabellen (Kinder zuerst). Nur für das Zurücksetzen der Vorführdaten.
import type { Datenbank } from './db';

const TABELLEN_KINDER_ZUERST = [
  'sap_uebergabe',
  'vorschlag',
  'wiedervorlage',
  'antwort',
  'kontaktversuch',
  'nachricht',
  'anlass',
  'ansprechpartner',
  'firma',
  'recherchelauf',
  'sperrzeit',
  'rechercheprofil',
  'sperreintrag',
  'einstellung',
];

export function leereAlleTabellen(db: Datenbank): void {
  for (const t of TABELLEN_KINDER_ZUERST) db.exec(`DELETE FROM ${t}`);
}

/** Anzahl der Zeilen je Tabelle, für die Meldung von `npm run reset`. */
export function zaehleBestand(
  db: Datenbank,
): Record<'firma' | 'ansprechpartner' | 'recherchelauf' | 'sperreintrag', number> {
  const zahl = (t: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
  return {
    firma: zahl('firma'),
    ansprechpartner: zahl('ansprechpartner'),
    recherchelauf: zahl('recherchelauf'),
    sperreintrag: zahl('sperreintrag'),
  };
}
