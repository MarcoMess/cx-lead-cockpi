// Format eines Recherchelaufs, wie ihn der Agent über POST /api/v1/agent/laeufe liefert.
// Dasselbe Format hat die Ergebnisdatei für den Upload (architektur.md, Abschnitt 5 und 12).
import { z } from 'zod';
import { ANLASS_TYP, ANREDEN, LAENDER, UMSATZ_BEZUG, WAEHRUNGEN } from './werte';

// Kleine Abweichungen, wie eine KI sie oft liefert, werden beim Einlesen geglättet statt den ganzen Vorschlag
// zurückzuweisen (Prüfung E2-S5, Befund 4): leerer Text gilt als fehlend, Zahlen als Text werden Zahlen,
// Listenwerte sind unabhängig von Groß- und Kleinschreibung und kennen gängige Schreibweisen.
const klein = (w: string) =>
  w
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/[\s_-]+/g, ' ');

/** Leerer Text gilt als fehlend; sonst unverändert. */
const ohneLeer = (w: unknown) => (typeof w === 'string' && w.trim() === '' ? null : w);

/** »121«, »121,5« oder »1.234,5« wird zur Zahl; anderes bleibt, wie es ist, und fällt bei der Prüfung auf. */
export function zahlAusText(w: unknown): unknown {
  const v = ohneLeer(w);
  if (typeof v !== 'string') return v;
  const t = v.trim().replace(/\s/g, '');
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'));
  if (/^-?\d+([.,]\d+)?$/.test(t)) return Number(t.replace(',', '.'));
  return v;
}

/** Ordnet Text einem Listenwert zu: exakt, ohne Groß-/Kleinschreibung oder über eine gängige Schreibweise. */
export function listenwert<T extends string>(werte: readonly T[], andere: Record<string, T> = {}) {
  return (w: unknown): unknown => {
    const v = ohneLeer(w);
    if (typeof v !== 'string') return v;
    const k = klein(v);
    return werte.find((x) => klein(x) === k) ?? andere[k] ?? v;
  };
}

const LAND_ANDERS: Record<string, (typeof LAENDER)[number]> = {
  deutschland: 'DE',
  germany: 'DE',
  d: 'DE',
  deu: 'DE',
  österreich: 'AT',
  oesterreich: 'AT',
  austria: 'AT',
  a: 'AT',
  aut: 'AT',
  schweiz: 'CH',
  switzerland: 'CH',
  suisse: 'CH',
  svizzera: 'CH',
  che: 'CH',
};
const WAEHRUNG_ANDERS: Record<string, (typeof WAEHRUNGEN)[number]> = {
  euro: 'EUR',
  '€': 'EUR',
  franken: 'CHF',
  'schweizer franken': 'CHF',
  'fr.': 'CHF',
  sfr: 'CHF',
};
const BEZUG_ANDERS: Record<string, (typeof UMSATZ_BEZUG)[number]> = {
  gruppe: 'konzern',
  group: 'konzern',
  konzernumsatz: 'konzern',
  einzel: 'einzelgesellschaft',
  gesellschaft: 'einzelgesellschaft',
};
const ANLASS_ANDERS: Record<string, (typeof ANLASS_TYP)[number]> = {
  'kein belastbarer aktueller anlass': 'kein_anlass',
  keiner: 'kein_anlass',
  'eigener post': 'eigener_beitrag',
};

const text = z.preprocess(ohneLeer, z.string().nullish());
const zahl = z.preprocess(zahlAusText, z.number().finite().nullish());
const auswahl = <T extends string>(werte: readonly [T, ...T[]], andere?: Record<string, T>) =>
  z.preprocess(listenwert(werte, andere), z.enum(werte).nullish());

export const VorschlagFirma = z.object({
  name: z.string().trim().min(1, 'Der Firmenname fehlt.'),
  domain: text,
  branche: text,
  land: auswahl(LAENDER, LAND_ANDERS),
  umsatz_wert: zahl,
  umsatz_waehrung: auswahl(WAEHRUNGEN, WAEHRUNG_ANDERS),
  umsatz_jahr: z.preprocess(zahlAusText, z.number().int().nullish()),
  umsatz_bezug: auswahl(UMSATZ_BEZUG, BEZUG_ANDERS),
  umsatz_quelle_url: text,
  wechselkurs: zahl,
  wechselkurs_quelle_url: text,
  umsatz_eur: zahl,
});

export const VorschlagPerson = z.object({
  anrede: auswahl(ANREDEN),
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
  typ: auswahl(ANLASS_TYP, ANLASS_ANDERS),
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
  /** Firma und Person, soweit lesbar, damit Marco den Vorschlag wiederfindet. */
  bezeichnung: string;
}

/** Ein Vorschlag, der schon ungeprüft im Eingangskorb liegt oder doppelt in der Datei steht (E2-S5, Kriterium 3). */
export interface BereitsVorhanden {
  index: number;
  bezeichnung: string;
  /** Datum des Laufs, in dem er offen liegt; null, wenn er weiter oben in derselben Datei steht. */
  lauf_datum: string | null;
}

export interface LaufAngelegt {
  lauf_id: number;
  angelegt: number;
  zurueckgewiesen: Zurueckgewiesen[];
  bereits_vorhanden: BereitsVorhanden[];
}
