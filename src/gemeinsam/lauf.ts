// Format eines Recherchelaufs, wie ihn der Agent über POST /api/v1/agent/laeufe liefert.
// Dasselbe Format hat die Ergebnisdatei für den Upload (architektur.md, Abschnitt 5 und 12).
import { z } from 'zod';
import { ANLASS_TYP, ANREDEN, LAENDER, UMSATZ_BEZUG, WAEHRUNGEN } from './werte';

const text = z.string().nullish();
const zahl = z.number().finite().nullish();

export const VorschlagFirma = z.object({
  name: z.string().trim().min(1, 'Der Firmenname fehlt.'),
  domain: text,
  branche: text,
  land: z.enum(LAENDER).nullish(),
  umsatz_wert: zahl,
  umsatz_waehrung: z.enum(WAEHRUNGEN).nullish(),
  umsatz_jahr: z.number().int().nullish(),
  umsatz_bezug: z.enum(UMSATZ_BEZUG).nullish(),
  umsatz_quelle_url: text,
  wechselkurs: zahl,
  wechselkurs_quelle_url: text,
  umsatz_eur: zahl,
});

export const VorschlagPerson = z.object({
  anrede: z.enum(ANREDEN).nullish(),
  titel: text,
  vorname: z.string().trim().min(1, 'Der Vorname der Person fehlt.'),
  nachname: z.string().trim().min(1, 'Der Nachname der Person fehlt.'),
  funktion: text,
  rolle: text,
  quelle_url: text,
  linkedin_url: text,
  email: text,
  telefon: text,
});

export const VorschlagAnlass = z.object({
  typ: z.enum(ANLASS_TYP).nullish(),
  beschreibung: text,
  ereignis_datum: text,
  veroeffentlicht_am: text,
  quelle_url: text,
  hypothese: text,
  gespraechsziel: text,
});

export const VorschlagNachricht = z.object({ betreff: text, text, sprache: text });

/** Ein Vorschlag. Unbekannte Felder (etwa ein mitgeschickter Zustand) werden verworfen. */
export const VorschlagEingabe = z.object({
  firma: VorschlagFirma,
  person: VorschlagPerson,
  anlass: VorschlagAnlass.nullish(),
  nachricht: VorschlagNachricht.nullish(),
});
export type VorschlagDaten = z.infer<typeof VorschlagEingabe>;

/** Der Lauf als Ganzes. Die Vorschläge werden einzeln geprüft, damit ein fehlerhafter die übrigen nicht verhindert. */
export const LaufEingabe = z.object({
  abdeckungsgrenzen: z.string().nullish(),
  vorschlaege: z.array(z.unknown()),
});

export interface Zurueckgewiesen {
  index: number;
  feld: string;
  meldung: string;
}

export interface LaufAngelegt {
  lauf_id: number;
  angelegt: number;
  zurueckgewiesen: Zurueckgewiesen[];
}
