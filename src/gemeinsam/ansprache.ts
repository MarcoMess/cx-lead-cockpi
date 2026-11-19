// Antwort von GET /kontakte/:id/ansprache (Story E5-S1).
import type { AkteAnlass } from './kontakte';
import type { AnsprechpartnerStatus, AnspracheModus, NachrichtFassung } from './werte';

export interface Ansprache {
  kontakt: {
    id: number;
    anrede: string;
    titel: string | null;
    vorname: string;
    nachname: string;
    funktion: string;
    firma_name: string;
    linkedin_url: string | null;
    status: AnsprechpartnerStatus;
    antwort_art: string | null;
  };
  modus: AnspracheModus;
  /** Der neueste Anlass, sonst null. */
  aufhaenger: AkteAnlass | null;
  /** Die LinkedIn-Fassung des Agenten (Erstkontakt). */
  nachricht: { betreff: string | null; text: string; fassung: NachrichtFassung } | null;
  /** Kommt mit dem Nachfassen (E6-S4). */
  erste_nachricht: null;
}
