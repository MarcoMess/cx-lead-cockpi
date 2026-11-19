// Antworten der Schnittstelle für die Kontaktliste S4 (Story E4-S2).
import type {
  AnsprechpartnerStatus,
  AntwortEinordnung,
  EmailGrundlage,
  KontaktAktion,
  KontaktArt,
  KontaktKanal,
} from './werte';
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

export interface AkteAnlass {
  typ: string;
  beschreibung: string | null;
  ereignis_datum: string | null;
  quelle_url: string | null;
  hypothese: string | null;
  gespraechsziel: string | null;
}

export type VerlaufEintrag =
  | {
      art: 'kontaktversuch';
      zeitpunkt: string;
      kanal: KontaktKanal;
      kontakt_art: KontaktArt;
      betreff: string | null;
      text: string;
      email_grundlage: EmailGrundlage | null;
      email_grundlage_notiz: string | null;
    }
  | {
      art: 'antwort';
      datum: string;
      einordnung: AntwortEinordnung;
      wortlaut: string | null;
      naechster_schritt: string | null;
    };

/** Antwort von GET /kontakte/:id (Story E4-S3). */
export interface KontaktAkte {
  id: number;
  anrede: string;
  titel: string | null;
  vorname: string;
  nachname: string;
  funktion: string;
  rolle: string;
  status: AnsprechpartnerStatus;
  antwort_art: string | null;
  endzustand: boolean;
  gespraech_termin: string | null;
  linkedin_url: string | null;
  email: string | null;
  email_herkunft: string | null;
  telefon: string | null;
  sap_kontakt_id: string | null;
  sap_lead_id: string | null;
  firma: { id: number; name: string; firmenkontakt: string | null; sap_account_id: string | null };
  anlaesse: AkteAnlass[];
  verlauf: VerlaufEintrag[];
  erlaubte_aktionen: KontaktAktion[];
}
