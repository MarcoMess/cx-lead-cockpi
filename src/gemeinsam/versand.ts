// Eingabe und Antwort von POST /kontakte/:id/kontaktversuche (Story E5-S3).
import { z } from 'zod';
import { KONTAKT_KANAL, type AnsprechpartnerStatus } from './werte';

export const VersandEingabe = z.object({
  kanal: z.enum(KONTAKT_KANAL, { message: 'Wähle den Kanal, über den du gesendet hast.' }),
  betreff: z.string().nullish(),
  text: z.string({ message: 'Die Nachricht fehlt.' }),
});
export type VersandEingabe = z.infer<typeof VersandEingabe>;

export interface VersandProtokolliert {
  kontaktversuch: { id: number; zeitpunkt: string; kanal: string; art: 'erstkontakt' };
  status: AnsprechpartnerStatus;
  wiedervorlage: { faellig_am: string; grund: string };
}
