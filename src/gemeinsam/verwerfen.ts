// Eingabe von POST /vorschlaege/:id/verwerfung (Story E3-S4).
import { z } from 'zod';
import { VERWERF_GRUENDE } from './werte';

export const VerwerfEingabe = z.object(
  { grund: z.enum(VERWERF_GRUENDE, { message: `Wähle einen Grund: ${VERWERF_GRUENDE.join(', ')}.` }) },
  { message: `Wähle einen Grund: ${VERWERF_GRUENDE.join(', ')}.` },
);

export interface Verworfen {
  sperreintrag: { art: 'firma' | 'person'; name: string; gesperrt_bis: string | null; neu: boolean };
}
