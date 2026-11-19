// Angezeigte deutsche Namen der erlaubten Werte (architektur.md, Abschnitt 9).
import type { AnsprechpartnerStatus, AntwortEinordnung, EmailGrundlage, KontaktArt, KontaktKanal } from './werte';
import { STATUS_SCHIENE } from './werte';

export const STATUS_TEXT: Record<AnsprechpartnerStatus, string> = {
  freigegeben: 'Freigegeben',
  angeschrieben: 'Angeschrieben',
  nachgefasst: 'Nachgefasst',
  antwort_erhalten: 'Antwort erhalten',
  gespraech_vereinbart: 'Gespräch vereinbart',
  an_sap_uebergeben: 'An SAP übergeben',
  kein_interesse: 'Kein Interesse',
  ohne_antwort_geschlossen: 'Ohne Antwort geschlossen',
  gesperrt: 'Gesperrt',
};

export const ANTWORT_ART_TEXT: Record<string, string> = {
  positiv: 'positiv',
  neutral_spaeter: 'neutral/später',
  kein_interesse: 'kein Interesse',
};

/** z. B. »Antwort erhalten (neutral/später)«. */
export function statusText(status: AnsprechpartnerStatus, antwortArt?: string | null): string {
  const basis = STATUS_TEXT[status];
  return status === 'antwort_erhalten' && antwortArt
    ? `${basis} (${ANTWORT_ART_TEXT[antwortArt] ?? antwortArt})`
    : basis;
}

export const ANLASS_TYP_TEXT: Record<string, string> = {
  eigener_beitrag: 'Eigener Beitrag',
  unternehmensanlass: 'Unternehmensanlass',
  kein_anlass: 'Kein belastbarer aktueller Anlass',
};

export const UMSATZ_BEZUG_TEXT: Record<string, string> = {
  konzern: 'Konzern',
  einzelgesellschaft: 'Einzelgesellschaft',
};

export const SCHIENE_TEXT: Record<(typeof STATUS_SCHIENE)[number], string> = {
  neu: 'Neu',
  freigegeben: 'Freigegeben',
  angeschrieben: 'Angeschrieben',
  nachgefasst: 'Nachgefasst',
  antwort_erhalten: 'Antwort erhalten',
  gespraech_vereinbart: 'Gespräch vereinbart',
  an_sap_uebergeben: 'An SAP übergeben',
};

export const KANAL_TEXT: Record<KontaktKanal, string> = {
  inmail: 'InMail',
  vernetzungsanfrage: 'Vernetzungsanfrage mit Notiz',
  linkedin_nachricht: 'LinkedIn-Nachricht',
  email: 'E-Mail',
};

export const KONTAKT_ART_TEXT: Record<KontaktArt, string> = {
  erstkontakt: 'Erstkontakt',
  nachfassen: 'Nachfassen',
};

export const EMAIL_GRUNDLAGE_TEXT: Record<EmailGrundlage, string> = {
  in_hubspot_bekannt: 'In HubSpot bekannt',
  hat_geantwortet: 'Hat bereits geantwortet',
  andere: 'Andere',
};

export const EINORDNUNG_TEXT: Record<AntwortEinordnung, string> = {
  positiv: 'Positiv',
  neutral_spaeter: 'Neutral/später',
  kein_interesse: 'Kein Interesse',
  nicht_mehr_kontaktieren: 'Bitte nicht mehr kontaktieren',
};

export const EMAIL_HERKUNFT_TEXT: Record<string, string> = {
  veroeffentlicht: 'veröffentlicht',
  von_marco: 'von Marco eingetragen',
};
