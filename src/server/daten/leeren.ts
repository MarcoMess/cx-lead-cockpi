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
