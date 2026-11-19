// Regel »Pflichtangaben für die Freigabe« (Konzept, Abschnitt 9; Story E3-S2). Reine Funktion ohne Datenbank.
import type { VorschlagDaten } from '../../gemeinsam/lauf';

const leer = (w: unknown) => w === null || w === undefined || (typeof w === 'string' && w.trim() === '');
const zahl = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
/** Eine Quelle muss eine Webadresse sein (mit oder ohne http/https), kein freier Text. */
const istAdresse = (w: string | null | undefined) =>
  !!w && /^(https?:\/\/)?[a-z0-9äöüß-]+(\.[a-z0-9äöüß-]+)+(:\d+)?(\/\S*)?$/i.test(w.trim());

/** Umsatz in Mio. EUR: bei EUR der Wert selbst, sonst der vom Agenten gelieferte Gegenwert. */
export function umsatzInEur(f: VorschlagDaten['firma']): number | null {
  if (f.umsatz_wert == null) return null;
  if (!f.umsatz_waehrung || f.umsatz_waehrung === 'EUR') return f.umsatz_wert;
  return f.umsatz_eur ?? null;
}

/**
 * Liefert für jede fehlende oder unzulässige Angabe einen Hinweis. Leer heißt: Der Vorschlag ist freigebbar.
 * Geprüft werden Umsatz (Wert, Quelle, Bezugsjahr, Gegenwert in EUR, Mindestumsatz), Belege der Person,
 * Anlass oder dessen Kennzeichnung sowie Betreff und Nachricht.
 */
export function fehlendePflichtangaben(v: VorschlagDaten, mindestumsatzMioEur: number, heute: string): string[] {
  const h: string[] = [];
  const { firma: f, person: p, anlass: a, nachricht: n } = v;

  if (leer(f.branche)) h.push('Branche fehlt');
  if (leer(f.land)) h.push('Land fehlt');
  if (f.umsatz_wert == null) h.push('Umsatz fehlt');
  else if (f.umsatz_wert <= 0) h.push('Umsatz muss größer als 0 sein');
  if (f.umsatz_wert != null && leer(f.umsatz_waehrung)) h.push('Währung des Umsatzes fehlt');
  if (leer(f.umsatz_quelle_url)) h.push('Umsatzquelle fehlt');
  else if (!istAdresse(f.umsatz_quelle_url)) h.push('Umsatzquelle ist keine Webadresse');
  const jahr = Number(heute.slice(0, 4));
  if (f.umsatz_jahr == null) h.push('Bezugsjahr des Umsatzes fehlt');
  else if (f.umsatz_jahr > jahr || f.umsatz_jahr < jahr - 3) {
    h.push(`Bezugsjahr ${f.umsatz_jahr} ist nicht plausibel (erlaubt ${jahr - 3} bis ${jahr})`);
  }
  if (leer(f.umsatz_bezug)) h.push('Bezug des Umsatzes (Konzern oder Einzelgesellschaft) fehlt');
  if (f.umsatz_wert != null && f.umsatz_waehrung && f.umsatz_waehrung !== 'EUR') {
    if (f.wechselkurs == null || f.umsatz_eur == null) h.push('Gegenwert in EUR oder Wechselkurs fehlt');
    else if (f.wechselkurs <= 0 || f.umsatz_eur <= 0) h.push('Wechselkurs und Gegenwert müssen größer als 0 sein');
    if (!istAdresse(f.wechselkurs_quelle_url)) h.push('Quelle des Wechselkurses fehlt');
  }
  const eur = umsatzInEur(f);
  if (eur != null && eur < mindestumsatzMioEur) {
    h.push(`unter Mindestumsatz (${zahl(eur)} Mio. EUR, mindestens ${zahl(mindestumsatzMioEur)} Mio. EUR)`);
  }

  if (leer(p.anrede)) h.push('Anrede fehlt');
  if (leer(p.funktion)) h.push('Funktion fehlt');
  if (leer(p.rolle)) h.push('Rolle fehlt');
  if (leer(p.quelle_url)) h.push('Beleg der Funktion fehlt');
  else if (!istAdresse(p.quelle_url)) h.push('Beleg der Funktion ist keine Webadresse');

  const ohneAnlass = a?.typ === 'kein_anlass';
  if (!a || (!ohneAnlass && leer(a.beschreibung))) {
    h.push('Anlass fehlt oder ist nicht als »Kein belastbarer aktueller Anlass« gekennzeichnet');
  } else if (!a.typ) {
    h.push('Art des Anlasses fehlt (eigener Beitrag oder Unternehmensanlass)');
  }

  if (leer(n?.betreff)) h.push('Betreff fehlt');
  if (leer(n?.text)) h.push('Nachricht fehlt');
  return h;
}
