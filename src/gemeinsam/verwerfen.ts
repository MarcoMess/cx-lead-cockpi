// Eingabe von POST /vorschlaege/:id/verwerfung (Story E3-S4).
import { z } from 'zod';
import { VERWERF_GRUENDE } from './werte';

export const VerwerfEingabe = z.object(
  { grund: z.enum(VERWERF_GRUENDE, { message: `Wähle einen Grund: ${VERWERF_GRUENDE.join(', ')}.` }) },
  { message: `Wähle einen Grund: ${VERWERF_GRUENDE.join(', ')}.` },
);

export interface Verworfen {
  sperreintrag: {
    art: 'firma' | 'person';
    /** Name im Eintrag; war die Firma oder Person schon gesperrt, der des vorhandenen Eintrags. */
    name: string;
    /** Tatsächliches Ende der Sperre laut Sperrliste; null bei Firmensperren und dauerhaften Einträgen. */
    gesperrt_bis: string | null;
    neu: boolean;
    /** Eine vorhandene Personensperre wurde bis zur neuen Frist verlängert. */
    verlaengert: boolean;
  };
}
