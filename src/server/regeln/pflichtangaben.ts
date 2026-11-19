// Regel »Pflichtangaben für die Freigabe« (Konzept, Abschnitt 9; Story E3-S2). Reine Funktion ohne Datenbank.
import type { VorschlagDaten } from '../../gemeinsam/lauf';

const leer = (w: unknown) => w === null || w === undefined || (typeof w === 'string' && w.trim() === '');
const zahl = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

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
export function fehlendePflichtangaben(v: VorschlagDaten, mindestumsatzMioEur: number): string[] {
  const h: string[] = [];
  const { firma: f, person: p, anlass: a, nachricht: n } = v;

  if (leer(f.branche)) h.push('Branche fehlt');
  if (leer(f.land)) h.push('Land fehlt');
  if (f.umsatz_wert == null || leer(f.umsatz_waehrung)) h.push('Umsatz fehlt');
  if (leer(f.umsatz_quelle_url)) h.push('Umsatzquelle fehlt');
  if (f.umsatz_jahr == null) h.push('Bezugsjahr des Umsatzes fehlt');
  if (leer(f.umsatz_bezug)) h.push('Bezug des Umsatzes (Konzern oder Einzelgesellschaft) fehlt');
  if (f.umsatz_wert != null && f.umsatz_waehrung && f.umsatz_waehrung !== 'EUR') {
    if (f.wechselkurs == null || f.umsatz_eur == null) h.push('Gegenwert in EUR oder Wechselkurs fehlt');
  }
  const eur = umsatzInEur(f);
  if (eur != null && eur < mindestumsatzMioEur) {
    h.push(`unter Mindestumsatz (${zahl(eur)} Mio. EUR, mindestens ${zahl(mindestumsatzMioEur)} Mio. EUR)`);
  }

  if (leer(p.anrede)) h.push('Anrede fehlt');
  if (leer(p.funktion)) h.push('Funktion fehlt');
  if (leer(p.rolle)) h.push('Rolle fehlt');
  if (leer(p.quelle_url)) h.push('Beleg der Funktion fehlt');

  const ohneAnlass = a?.typ === 'kein_anlass';
  if (!a || (!ohneAnlass && leer(a.beschreibung))) {
    h.push('Anlass fehlt oder ist nicht als »Kein belastbarer aktueller Anlass« gekennzeichnet');
  }

  if (leer(n?.betreff)) h.push('Betreff fehlt');
  if (leer(n?.text)) h.push('Nachricht fehlt');
  return h;
}
