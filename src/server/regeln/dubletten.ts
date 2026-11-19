// Regeln zur Dublettenprüfung (Konzept, Abschnitt 9). Reine Funktionen ohne Datenbank.
import type { Bestand } from '../../gemeinsam/bestand';
import type { VorschlagDaten } from '../../gemeinsam/lauf';
import type { AnsprechpartnerStatus } from '../../gemeinsam/werte';
import { STATUS_TEXT } from '../../gemeinsam/texte';
import { sperreNachSchliessenBis } from './fristen';

const RECHTSFORMEN = ['gmbh & co. kg', 'gmbh', 'ag', 'se', 'kg', 'ohg', 'gesmbh', 'sa', 'sàrl', 'ug', 'e.v.'];

/** Normalisiert einen Firmennamen: klein, ohne Rechtsform am Ende, ohne doppelte Leerzeichen. */
export function normalisiereFirmenname(name: string): string {
  let n = name.toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
  for (const rf of RECHTSFORMEN) {
    if (n.endsWith(' ' + rf)) {
      n = n.slice(0, -rf.length - 1).trim();
      break;
    }
  }
  return n;
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
    .toLocaleLowerCase('de-DE')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');
}

/** Vergleichbare Form eines Personennamens. */
export function normalisierePersonenname(vorname: string, nachname: string): string {
  return `${vorname} ${nachname}`.toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
}

/**
 * Eine bekannte Person ist eine Dublette – außer sie wurde ohne Antwort geschlossen, die Sperre von 6 Monaten
 * ist abgelaufen und der Vorschlag bringt einen neuen Anlass: dann ist es eine Wiederansprache (Konzept, Abschnitt 9).
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
export const LAUFENDE_ANSPRACHE: readonly AnsprechpartnerStatus[] = [
  'angeschrieben',
  'nachgefasst',
  'antwort_erhalten',
];

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
  firma_id: number | null;
  ist_dublette: boolean;
  ist_wiederansprache: boolean;
  bezug_ansprechpartner_id: number | null;
  hinweis_zweiter_ansprechpartner: string | null;
}

/**
 * Prüft einen Vorschlag gegen den Bestand (A1 Schritt 5, Regel Dublettenprüfung):
 * Firma über den normalisierten Namen; Person über die LinkedIn-Adresse oder über den Namen bei derselben Firma.
 */
export function pruefeGegenBestand(v: VorschlagDaten, bestand: Bestand, heute: string): Bestandspruefung {
  const norm = normalisiereFirmenname(v.firma.name);
  const firma = bestand.firmen.find((f) => f.name_norm === norm) ?? null;
  const url = v.person.linkedin_url ? normalisiereLinkedinUrl(v.person.linkedin_url) : null;
  const name = normalisierePersonenname(v.person.vorname, v.person.nachname);
  const person =
    (url && bestand.kontakte.find((k) => k.linkedin_url && normalisiereLinkedinUrl(k.linkedin_url) === url)) ||
    (firma &&
      bestand.kontakte.find(
        (k) => k.firma_id === firma.id && normalisierePersonenname(k.vorname, k.nachname) === name,
      )) ||
    null;
  const anlass = v.anlass;
  const hatNeuenAnlass = !!anlass && anlass.typ !== 'kein_anlass' && !!anlass.beschreibung?.trim();
  const art = person ? bewerteBekanntePerson(person, heute, hatNeuenAnlass) : null;
  const firmaId = person ? person.firma_id : (firma?.id ?? null);
  const andere = firmaId ? bestand.kontakte.filter((k) => k.firma_id === firmaId && k.id !== person?.id) : [];
  return {
    firma_id: firmaId,
    ist_dublette: art === 'dublette',
    ist_wiederansprache: art === 'wiederansprache',
    bezug_ansprechpartner_id: person?.id ?? null,
    hinweis_zweiter_ansprechpartner: person ? null : hinweisZweiterAnsprechpartner(andere),
  };
}
