// Erlaubte Werte – der einzige Ort, an dem sie als Text stehen (architektur.md, Abschnitt 9).

export const ANSPRECHPARTNER_STATUS = [
  'freigegeben',
  'angeschrieben',
  'nachgefasst',
  'antwort_erhalten',
  'gespraech_vereinbart',
  'an_sap_uebergeben',
  'kein_interesse',
  'ohne_antwort_geschlossen',
  'gesperrt',
] as const;
export type AnsprechpartnerStatus = (typeof ANSPRECHPARTNER_STATUS)[number];

/** Die Statusschiene der Kontaktakte: der Weg vom Vorschlag bis zur Übergabe (Konzept, Abschnitt 9). */
export const STATUS_SCHIENE = [
  'neu',
  'freigegeben',
  'angeschrieben',
  'nachgefasst',
  'antwort_erhalten',
  'gespraech_vereinbart',
  'an_sap_uebergeben',
] as const;

/** Aktionen der Kontaktakte; welche erlaubt sind, entscheidet regeln/status.ts. */
export const KONTAKT_AKTIONEN = [
  'ansprechen',
  'nachfassen',
  'antwort_erfassen',
  'gespraech_eintragen',
  'wiedervorlage_setzen',
  'ohne_antwort_schliessen',
  'wieder_oeffnen',
  'an_sap_uebergeben',
  'sperren',
  'loeschen',
] as const;
export type KontaktAktion = (typeof KONTAKT_AKTIONEN)[number];

export const ANTWORT_ART = ['positiv', 'neutral_spaeter', 'kein_interesse'] as const;
export const ANTWORT_EINORDNUNG = ['positiv', 'neutral_spaeter', 'kein_interesse', 'nicht_mehr_kontaktieren'] as const;
export type AntwortEinordnung = (typeof ANTWORT_EINORDNUNG)[number];
export const KONTAKT_KANAL = ['inmail', 'vernetzungsanfrage', 'linkedin_nachricht', 'email'] as const;
export type KontaktKanal = (typeof KONTAKT_KANAL)[number];
/** Kanäle für den Versand per LinkedIn (A3 Schritt 6). */
export const LINKEDIN_KANAELE = ['inmail', 'vernetzungsanfrage', 'linkedin_nachricht'] as const;
export const KONTAKT_ART = ['erstkontakt', 'nachfassen'] as const;
export type KontaktArt = (typeof KONTAKT_ART)[number];
export const EMAIL_GRUNDLAGE = ['in_hubspot_bekannt', 'hat_geantwortet', 'andere'] as const;
export type EmailGrundlage = (typeof EMAIL_GRUNDLAGE)[number];
export const NACHRICHT_KANAL = ['linkedin', 'email'] as const;
export const NACHRICHT_FASSUNG = ['agent', 'von_marco_geaendert', 'vorlage'] as const;
export type NachrichtFassung = (typeof NACHRICHT_FASSUNG)[number];
export const ANSPRACHE_MODUS = ['erstkontakt', 'nachfassen', 'keine'] as const;
export type AnspracheModus = (typeof ANSPRACHE_MODUS)[number];
/** Zielkorridor der LinkedIn-Nachricht in Wörtern (Konzept, Abschnitt 9). */
export const LINKEDIN_WORTE = { von: 45, bis: 70 } as const;
export const ANLASS_TYP = ['eigener_beitrag', 'unternehmensanlass', 'kein_anlass'] as const;
export const WIEDERVORLAGE_ART = ['nachfassen', 'schliessen_vorschlag', 'frei'] as const;
export type WiedervorlageArt = (typeof WIEDERVORLAGE_ART)[number];
export const ANREDEN = ['Frau', 'Herr'] as const;
export const LAUF_HERKUNFT = ['api', 'upload'] as const;
export type LaufHerkunft = (typeof LAUF_HERKUNFT)[number];
export const LAUF_ERGEBNIS = ['ausgefuehrt', 'uebersprungen', 'uebertragung_fehlgeschlagen'] as const;
export type LaufErgebnis = (typeof LAUF_ERGEBNIS)[number];
export const VORSCHLAG_ZUSTAND = ['zu_pruefen', 'freigegeben', 'verworfen'] as const;
export type VorschlagZustand = (typeof VORSCHLAG_ZUSTAND)[number];
export const SPERRE_ART = ['firma', 'person'] as const;
export type SperreArt = (typeof SPERRE_ART)[number];
export const SPERRE_HERKUNFT = ['startbestand', 'verworfen', 'opt_out', 'von_marco', 'geloescht'] as const;
export type SperreHerkunft = (typeof SPERRE_HERKUNFT)[number];
export const LAENDER = ['DE', 'AT', 'CH'] as const;
export const WAEHRUNGEN = ['EUR', 'CHF'] as const;
export const UMSATZ_BEZUG = ['konzern', 'einzelgesellschaft'] as const;
export const LAUFTAGE = ['mo', 'di', 'mi', 'do', 'fr'] as const;

export const BRANCHEN = [
  'Maschinen-/Anlagenbau',
  'Retail',
  'Großhandel/technischer Handel',
  'Utilities',
  'Entsorgung',
  'Infrastruktur',
  'Technische Dienstleistungen',
  'Hospitality',
] as const;

export const ROLLEN = [
  'CIO/IT-Leitung',
  'Digitalisierung/CDO',
  'Customer Experience',
  'Service/After-Sales',
  'Vertrieb',
  'CRM',
  'E-Commerce',
  'Kundenbindung',
] as const;

export const VERWERF_GRUENDE = [
  'passt nicht ins Zielbild',
  'Kontakt nicht belegt',
  'bereits bekannt',
  'Anlass zu schwach',
  'wird von Kollegen betreut',
] as const;

/** Fristen aus Abschnitt 9 des Konzepts. In S8 nur angezeigt, nicht änderbar. */
export const FRISTEN = {
  wiedervorlageWerktage: 7,
  nachfassenHoechstens: 1,
  schliessenVorschlagTage: 21,
  sperreNachSchliessenMonate: 6,
} as const;

export const VORFUEHR_START_DATUM = '2026-11-18';
