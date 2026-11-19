// Anzeigeformate der Oberfläche (deutsche Schreibweise wie im Clickdummy).
import type { VorschlagDaten } from '../gemeinsam/lauf';

export function datum(d: string | null | undefined): string {
  if (!d) return '–';
  const [j, m, t] = d.slice(0, 10).split('-');
  const zeit = d.length > 10 ? `, ${d.slice(11, 16)} Uhr` : '';
  return `${t}.${m}.${j}${zeit}`;
}

const zahl = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

/** z. B. »121 Mio. EUR, 2025, Konzern« oder »1,4 Mrd. EUR, 2025, Konzern«. */
export function umsatz(f: VorschlagDaten['firma']): string {
  if (f.umsatz_wert == null) return 'Umsatz nicht belegt';
  const betrag = f.umsatz_wert >= 1000 ? `${zahl(f.umsatz_wert / 1000)} Mrd.` : `${zahl(f.umsatz_wert)} Mio.`;
  const bezug =
    f.umsatz_bezug === 'konzern' ? 'Konzern' : f.umsatz_bezug === 'einzelgesellschaft' ? 'Einzelgesellschaft' : null;
  return [`${betrag} ${f.umsatz_waehrung ?? ''}`.trim(), f.umsatz_jahr, bezug].filter(Boolean).join(', ');
}

export function personName(p: { titel?: string | null; vorname: string; nachname: string }): string {
  return [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ');
}

export const ANLASS_TYP_TEXT: Record<string, string> = {
  eigener_beitrag: 'Eigener Beitrag',
  unternehmensanlass: 'Unternehmensanlass',
  kein_anlass: 'Kein belastbarer aktueller Anlass',
};
