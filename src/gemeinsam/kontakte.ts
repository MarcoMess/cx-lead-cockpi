// Antworten der Schnittstelle für die Kontaktliste S4 (Story E4-S2).
import type { AnsprechpartnerStatus } from './werte';
import { ANSPRECHPARTNER_STATUS } from './werte';

export const KONTAKT_FILTER = ['offene', 'alle', ...ANSPRECHPARTNER_STATUS] as const;
export type KontaktFilter = (typeof KONTAKT_FILTER)[number];

export interface KontaktZeile {
  id: number;
  anrede: string;
  titel: string | null;
  vorname: string;
  nachname: string;
  funktion: string;
  firma_id: number;
  firma_name: string;
  status: AnsprechpartnerStatus;
  antwort_art: string | null;
}
