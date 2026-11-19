// Anzeigeformate der Oberfläche (deutsche Schreibweise wie im Clickdummy).
import type { VorschlagDaten } from '../gemeinsam/lauf';
import { UMSATZ_BEZUG_TEXT } from '../gemeinsam/texte';

export function datum(d: string | null | undefined): string {
  if (!d) return '–';
  const [j, m, t] = d.slice(0, 10).split('-');
  const zeit = d.length > 10 ? `, ${d.slice(11, 16)} Uhr` : '';
  return `${t}.${m}.${j}${zeit}`;
}

const zahl = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

const betragText = (mio: number) => (mio >= 1000 ? `${zahl(mio / 1000)} Mrd.` : `${zahl(mio)} Mio.`);

/** z. B. »121 Mio. EUR, 2025, Konzern« oder »88 Mio. CHF, 2025, Konzern (rund 93 Mio. EUR, Beispielkurs 1,06)«. */
export function umsatz(f: VorschlagDaten['firma']): string {
  if (f.umsatz_wert == null) return 'Umsatz nicht belegt';
  const bezug = f.umsatz_bezug ? (UMSATZ_BEZUG_TEXT[f.umsatz_bezug] ?? null) : null;
  const text = [`${betragText(f.umsatz_wert)} ${f.umsatz_waehrung ?? ''}`.trim(), f.umsatz_jahr, bezug]
    .filter(Boolean)
    .join(', ');
  if (!f.umsatz_waehrung || f.umsatz_waehrung === 'EUR' || f.umsatz_eur == null) return text;
  const kurs =
    f.wechselkurs != null
      ? `, Beispielkurs ${f.wechselkurs.toLocaleString('de-DE', { maximumFractionDigits: 4 })}`
      : '';
  return `${text} (rund ${zahl(Math.round(f.umsatz_eur))} Mio. EUR${kurs})`;
}

export function personName(p: { titel?: string | null; vorname: string; nachname: string }): string {
  return [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ');
}
