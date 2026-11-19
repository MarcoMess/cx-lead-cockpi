// Sperrliste (Story E10-S1): Eingabe und Zeilen von GET/POST/DELETE /sperrliste.
import { z } from 'zod';
import { SPERRE_ART, type SperreArt, type SperreHerkunft } from './werte';

export const SperreEingabe = z.object(
  {
    art: z.enum(SPERRE_ART, { message: 'Wähle, ob eine Firma oder eine Person gesperrt wird.' }),
    name: z
      .string({ message: 'Gib den Namen der Firma oder Person ein.' })
      .trim()
      .min(1, 'Gib den Namen der Firma oder Person ein.'),
    grund: z.string().trim().nullish(),
  },
  { message: 'Gib Name, Art und Grund des Eintrags an.' },
);
export type SperreEingabe = z.infer<typeof SperreEingabe>;

export interface SperrZeile {
  id: number;
  art: SperreArt;
  name: string;
  firma_name: string | null;
  grund: string;
  herkunft: SperreHerkunft;
  gesperrt_bis: string | null;
  erstellt_am: string;
}
