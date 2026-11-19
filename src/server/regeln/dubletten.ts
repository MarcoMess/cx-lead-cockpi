// Regeln zur Dublettenprüfung (Konzept, Abschnitt 9). Reine Funktionen ohne Datenbank.
import type { Bestand } from '../../gemeinsam/bestand';
import type { VorschlagDaten } from '../../gemeinsam/lauf';
import type { AnsprechpartnerStatus } from '../../gemeinsam/werte';
import { STATUS_TEXT } from '../../gemeinsam/texte';
import { sperreNachSchliessenBis } from './fristen';

// Rechtsformen am Ende des Namens, nach dem Entfernen von Punkten und Kommas; längere zuerst.
const RECHTSFORMEN = [
  'gmbh & co kgaa',
  'gmbh & co kg',
  'gmbh co kg',
  'ag & co kg',
  'gesellschaft mbh',
  'gesmbh',
  'gmbh',
  'mbh',
  'kgaa',
  'ag',
  'se',
  'kg',
  'ohg',
  'gbr',
  'sa',
  'sàrl',
  'sarl',
  'ug',
  'ev',
  'nv',
  'bv',
];

/** Normalisiert einen Firmennamen: Unicode NFC, klein, ohne Punkte und Kommas, ohne Rechtsform am Ende. */
export function normalisiereFirmenname(name: string): string {
  let n = name
    .normalize('NFC')
    .toLocaleLowerCase('de-DE')
    .replace(/\./g, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  for (let i = 0; i < 2; i++) {
    const rf = RECHTSFORMEN.find((r) => n.endsWith(' ' + r));
    if (!rf) break;
    n = n.slice(0, -rf.length - 1).trim();
  }
  return n;
}

/** Vergleichbare Form einer Domain: ohne Schema, »www.«, Pfad und Port, klein. */
export function normalisiereDomain(d: string): string {
  return d
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/:?#].*$/, '');
}

/**
 * Wiederansprache gibt es nur für Kontakte, die ohne Antwort geschlossen wurden.
 * »Kein Interesse« sperrt dauerhaft, laufende Kontakte werden nicht zurückgesetzt.
 * Die Frist von 6 Monaten und den neuen Anlass prüft die Sperrliste (E10).
 */
export function darfWiederangesprochenWerden(status: AnsprechpartnerStatus): boolean {
  return status === 'ohne_antwort_geschlossen';
}

/** Vergleichbare Form einer LinkedIn-Adresse: ohne Schema, »www.«, Abfrageteil und Schrägstrich am Ende, klein. */
export function normalisiereLinkedinUrl(url: string): string {
  return url
    .trim()
    .normalize('NFC')
    .toLocaleLowerCase('de-DE')
    .replace(/^https?:\/\//, '')
    .replace(/^(www|m|[a-z]{2})\.linkedin\./, 'linkedin.')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
    .replace(/^(linkedin\.com\/in\/[^/]+)\/[a-z]{2}$/, '$1');
}

/** Vergleichbare Form eines Personennamens. */
export function normalisierePersonenname(vorname: string, nachname: string): string {
  return `${vorname} ${nachname}`.normalize('NFC').toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
}

/** Vergleichbare Form einer Anlass-Beschreibung. */
const anlassSchluessel = (t: string) => t.normalize('NFC').toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();

/**
 * Eine bekannte Person ist eine Dublette – außer sie wurde ohne Antwort geschlossen, die Sperre von 6 Monaten
 * ist abgelaufen und der Vorschlag bringt einen neuen Anlass: dann ist es eine Wiederansprache (Konzept, Abschnitt 9).
 * Grenztag: Die Sperre endet mit dem Tag vor `sperreNachSchliessenBis`; an diesem Tag ist die Person wieder frei
 * (geschlossen am 19.05., frei ab 19.11.).
 */
export function bewerteBekanntePerson(
  p: { status: AnsprechpartnerStatus; geschlossen_am: string | null },
  heute: string,
  hatNeuenAnlass: boolean,
): 'dublette' | 'wiederansprache' {
  const fristAbgelaufen = !!p.geschlossen_am && sperreNachSchliessenBis(p.geschlossen_am) <= heute;
  return darfWiederangesprochenWerden(p.status) && fristAbgelaufen && hatNeuenAnlass ? 'wiederansprache' : 'dublette';
}

/** Status, in denen bei einer Firma eine Ansprache läuft (Regel »Zweiter Ansprechpartner«). */
export const LAUFENDE_ANSPRACHE: readonly AnsprechpartnerStatus[] = ['angeschrieben', 'nachgefasst'];

/** Hinweis für einen zweiten Ansprechpartner, wenn bei der Firma schon eine Ansprache läuft, sonst null. */
export function hinweisZweiterAnsprechpartner(
  kontakte: { vorname: string; nachname: string; status: AnsprechpartnerStatus }[],
): string | null {
  const laufend = kontakte.filter((k) => LAUFENDE_ANSPRACHE.includes(k.status));
  if (laufend.length === 0) return null;
  const wer = laufend.map((k) => `${k.vorname} ${k.nachname}, ${STATUS_TEXT[k.status]}`).join('; ');
  return `Zweiter Ansprechpartner, dort läuft eine Ansprache (${wer})`;
}

export interface Bestandspruefung {
  /** Bestehende Firma, über den normalisierten Namen oder die Domain gefunden. */
  firma_id: number | null;
  ist_dublette: boolean;
  ist_wiederansprache: boolean;
  bezug_ansprechpartner_id: number | null;
  hinweis_zweiter_ansprechpartner: string | null;
}

/**
 * Prüft einen Vorschlag gegen den Bestand (A1 Schritt 5, Regel Dublettenprüfung):
 * Firma über den normalisierten Namen oder die Domain; Person über die LinkedIn-Adresse oder über den Namen
 * bei derselben Firma. Gilt beim Anlegen, beim Öffnen und beim Freigeben – jeweils gegen den heutigen Bestand.
 */
export function pruefeGegenBestand(v: VorschlagDaten, bestand: Bestand, heute: string): Bestandspruefung {
  const norm = normalisiereFirmenname(v.firma.name);
  const domain = v.firma.domain ? normalisiereDomain(v.firma.domain) : null;
  const firma =
    bestand.firmen.find((f) => normalisiereFirmenname(f.name) === norm) ??
    (domain ? bestand.firmen.find((f) => f.domain && normalisiereDomain(f.domain) === domain) : undefined) ??
    null;
  const url = v.person.linkedin_url ? normalisiereLinkedinUrl(v.person.linkedin_url) : null;
  const name = normalisierePersonenname(v.person.vorname, v.person.nachname);
  const person =
    (url && bestand.kontakte.find((k) => k.linkedin_url && normalisiereLinkedinUrl(k.linkedin_url) === url)) ||
    (firma &&
      bestand.kontakte.find(
        (k) => k.firma_id === firma.id && normalisierePersonenname(k.vorname, k.nachname) === name,
      )) ||
    null;
  const a = v.anlass;
  const beschreibung = a && a.typ !== 'kein_anlass' ? (a.beschreibung?.trim() ?? '') : '';
  const hatNeuenAnlass =
    !!beschreibung && !(person?.anlaesse ?? []).some((x) => anlassSchluessel(x) === anlassSchluessel(beschreibung));
  const art = person ? bewerteBekanntePerson(person, heute, hatNeuenAnlass) : null;
  const andere = firma ? bestand.kontakte.filter((k) => k.firma_id === firma.id && k.id !== person?.id) : [];
  return {
    firma_id: firma?.id ?? null,
    ist_dublette: art === 'dublette',
    ist_wiederansprache: art === 'wiederansprache',
    bezug_ansprechpartner_id: person?.id ?? null,
    hinweis_zweiter_ansprechpartner: person ? null : hinweisZweiterAnsprechpartner(andere),
  };
}

/**
 * Sind zwei Vorschläge dieselbe Person? Über die LinkedIn-Adresse oder über den Namen bei derselben Firma
 * (gleicher normalisierter Name oder gleiche Domain). Gilt für den Abgleich mit offenen Vorschlägen beim Anlegen
 * eines Laufs, auch innerhalb derselben Datei (Prüfung E2-S5, Befund 1).
 */
export function gleichePerson(a: VorschlagDaten, b: VorschlagDaten): boolean {
  const ua = a.person.linkedin_url ? normalisiereLinkedinUrl(a.person.linkedin_url) : null;
  const ub = b.person.linkedin_url ? normalisiereLinkedinUrl(b.person.linkedin_url) : null;
  if (ua && ub && ua === ub) return true;
  const gleicherName =
    normalisierePersonenname(a.person.vorname, a.person.nachname) ===
    normalisierePersonenname(b.person.vorname, b.person.nachname);
  if (!gleicherName) return false;
  const gleicheDomain =
    !!a.firma.domain && !!b.firma.domain && normalisiereDomain(a.firma.domain) === normalisiereDomain(b.firma.domain);
  return gleicheDomain || normalisiereFirmenname(a.firma.name) === normalisiereFirmenname(b.firma.name);
}
