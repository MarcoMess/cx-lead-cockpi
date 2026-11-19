// Bestand an Firmen und Kontakten, wie ihn die Dublettenprüfung braucht (Story E2-S4).
import type { AnsprechpartnerStatus } from './werte';

export interface Bestand {
  firmen: { id: number; name: string; name_norm: string }[];
  kontakte: {
    id: number;
    firma_id: number;
    vorname: string;
    nachname: string;
    titel: string | null;
    linkedin_url: string | null;
    status: AnsprechpartnerStatus;
    geschlossen_am: string | null;
  }[];
}
