import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fehlendePflichtangaben } from '../../src/server/regeln/pflichtangaben';

const BEISPIEL = JSON.parse(readFileSync('src/simulator/beispiel-lauf.json', 'utf8'));
const nach = (n: string) =>
  JSON.parse(
    JSON.stringify(BEISPIEL.vorschlaege.find((v: { person: { nachname: string } }) => v.person.nachname === n)),
  );

describe('E3-S2 Regel Pflichtangaben für die Freigabe', () => {
  it('Kortmann, Voss und Ammann sind vollständig', () => {
    for (const n of ['Kortmann', 'Voss', 'Ammann']) expect(fehlendePflichtangaben(nach(n), 50), n).toEqual([]);
  });
  it('E3-S2 #3 ohne Umsatzquelle oder ohne Bezugsjahr', () => {
    const a = nach('Kortmann');
    a.firma.umsatz_quelle_url = null;
    expect(fehlendePflichtangaben(a, 50)).toEqual(['Umsatzquelle fehlt']);
    const b = nach('Kortmann');
    delete b.firma.umsatz_jahr;
    expect(fehlendePflichtangaben(b, 50)).toEqual(['Bezugsjahr des Umsatzes fehlt']);
  });
  it('E3-S2 #4 unter Mindestumsatz', () => {
    const a = nach('Kortmann');
    a.firma.umsatz_wert = 40;
    expect(fehlendePflichtangaben(a, 50)).toEqual(['unter Mindestumsatz (40 Mio. EUR, mindestens 50 Mio. EUR)']);
    expect(fehlendePflichtangaben(a, 40)).toEqual([]);
  });
  it('E3-S2 #5 CHF: Prüfung am EUR-Gegenwert; ohne Kurs oder Gegenwert gesperrt', () => {
    const a = nach('Ammann');
    expect(fehlendePflichtangaben(a, 90)).toEqual([]); // 88 CHF, aber 93,3 Mio. EUR
    expect(fehlendePflichtangaben(a, 95)).toEqual(['unter Mindestumsatz (93,3 Mio. EUR, mindestens 95 Mio. EUR)']);
    const b = nach('Ammann');
    b.firma.wechselkurs = null;
    expect(fehlendePflichtangaben(b, 50)).toEqual(['Gegenwert in EUR oder Wechselkurs fehlt']);
    const c = nach('Ammann');
    delete c.firma.umsatz_eur;
    expect(fehlendePflichtangaben(c, 50)).toEqual(['Gegenwert in EUR oder Wechselkurs fehlt']);
  });
  it('E3-S2 #6 ohne Anlass und ohne Kennzeichnung gesperrt; mit Kennzeichnung freigebbar', () => {
    const a = nach('Kortmann');
    a.anlass = null;
    expect(fehlendePflichtangaben(a, 50)).toEqual([
      'Anlass fehlt oder ist nicht als »Kein belastbarer aktueller Anlass« gekennzeichnet',
    ]);
    a.anlass = { typ: 'kein_anlass' };
    expect(fehlendePflichtangaben(a, 50)).toEqual([]);
  });
  it('E3-S2 #7 ohne Betreff oder ohne Nachricht gesperrt', () => {
    const a = nach('Kortmann');
    a.nachricht.betreff = '  ';
    expect(fehlendePflichtangaben(a, 50)).toEqual(['Betreff fehlt']);
    const b = nach('Kortmann');
    b.nachricht = null;
    expect(fehlendePflichtangaben(b, 50)).toEqual(['Betreff fehlt', 'Nachricht fehlt']);
  });
});
