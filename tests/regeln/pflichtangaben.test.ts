import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fehlendePflichtangaben } from '../../src/server/regeln/pflichtangaben';

const H = '2026-11-19';
const BEISPIEL = JSON.parse(readFileSync('src/simulator/beispiel-lauf.json', 'utf8'));
const nach = (n: string) =>
  JSON.parse(
    JSON.stringify(BEISPIEL.vorschlaege.find((v: { person: { nachname: string } }) => v.person.nachname === n)),
  );

describe('E3-S2 Regel Pflichtangaben für die Freigabe', () => {
  it('Kortmann, Voss und Ammann sind vollständig', () => {
    for (const n of ['Kortmann', 'Voss', 'Ammann']) expect(fehlendePflichtangaben(nach(n), 50, H), n).toEqual([]);
  });
  it('E3-S2 #3 ohne Umsatzquelle oder ohne Bezugsjahr', () => {
    const a = nach('Kortmann');
    a.firma.umsatz_quelle_url = null;
    expect(fehlendePflichtangaben(a, 50, H)).toEqual(['Umsatzquelle fehlt']);
    const b = nach('Kortmann');
    delete b.firma.umsatz_jahr;
    expect(fehlendePflichtangaben(b, 50, H)).toEqual(['Bezugsjahr des Umsatzes fehlt']);
  });
  it('E3-S2 #4 unter Mindestumsatz', () => {
    const a = nach('Kortmann');
    a.firma.umsatz_wert = 40;
    expect(fehlendePflichtangaben(a, 50, H)).toEqual(['unter Mindestumsatz (40 Mio. EUR, mindestens 50 Mio. EUR)']);
    expect(fehlendePflichtangaben(a, 40, H)).toEqual([]);
  });
  it('E3-S2 #5 CHF: Prüfung am EUR-Gegenwert; ohne Kurs oder Gegenwert gesperrt', () => {
    const a = nach('Ammann');
    expect(fehlendePflichtangaben(a, 90, H)).toEqual([]); // 88 CHF, aber 93,3 Mio. EUR
    expect(fehlendePflichtangaben(a, 95, H)).toEqual(['unter Mindestumsatz (93,3 Mio. EUR, mindestens 95 Mio. EUR)']);
    const b = nach('Ammann');
    b.firma.wechselkurs = null;
    expect(fehlendePflichtangaben(b, 50, H)).toEqual(['Gegenwert in EUR oder Wechselkurs fehlt']);
    const c = nach('Ammann');
    delete c.firma.umsatz_eur;
    expect(fehlendePflichtangaben(c, 50, H)).toEqual(['Gegenwert in EUR oder Wechselkurs fehlt']);
  });
  it('E3-S2 #6 ohne Anlass und ohne Kennzeichnung gesperrt; mit Kennzeichnung freigebbar', () => {
    const a = nach('Kortmann');
    a.anlass = null;
    expect(fehlendePflichtangaben(a, 50, H)).toEqual([
      'Anlass fehlt oder ist nicht als »Kein belastbarer aktueller Anlass« gekennzeichnet',
    ]);
    a.anlass = { typ: 'kein_anlass' };
    expect(fehlendePflichtangaben(a, 50, H)).toEqual([]);
  });
  it('E3-S2 #7 ohne Betreff oder ohne Nachricht gesperrt', () => {
    const a = nach('Kortmann');
    a.nachricht.betreff = '  ';
    expect(fehlendePflichtangaben(a, 50, H)).toEqual(['Betreff fehlt']);
    const b = nach('Kortmann');
    b.nachricht = null;
    expect(fehlendePflichtangaben(b, 50, H)).toEqual(['Betreff fehlt', 'Nachricht fehlt']);
  });
  it('Prüfung E3-S2: unplausible Angaben eines echten Agenten sperren die Freigabe', () => {
    const fall = (f: (v: ReturnType<typeof nach>) => void) => {
      const v = nach('Ammann');
      f(v);
      return fehlendePflichtangaben(v, 50, H);
    };
    expect(fall((v) => (v.firma.umsatz_quelle_url = 'n/a'))).toEqual(['Umsatzquelle ist keine Webadresse']);
    expect(fall((v) => (v.firma.umsatz_quelle_url = 'example.com/bericht'))).toEqual([]);
    expect(fall((v) => (v.person.quelle_url = 'Geschäftsbericht 2025'))).toEqual([
      'Beleg der Funktion ist keine Webadresse',
    ]);
    expect(fall((v) => (v.firma.umsatz_jahr = 2031))).toEqual([
      'Bezugsjahr 2031 ist nicht plausibel (erlaubt 2023 bis 2026)',
    ]);
    expect(fall((v) => (v.firma.umsatz_jahr = 2022))).toEqual([
      'Bezugsjahr 2022 ist nicht plausibel (erlaubt 2023 bis 2026)',
    ]);
    expect(fall((v) => (v.firma.umsatz_wert = -120))).toContain('Umsatz muss größer als 0 sein');
    expect(fall((v) => (v.firma.wechselkurs = 0))).toEqual(['Wechselkurs und Gegenwert müssen größer als 0 sein']);
    expect(fall((v) => (v.firma.wechselkurs_quelle_url = null))).toEqual(['Quelle des Wechselkurses fehlt']);
    expect(fall((v) => (v.firma.umsatz_waehrung = null))).toEqual(['Währung des Umsatzes fehlt']);
    expect(fall((v) => (v.anlass = { beschreibung: 'Neues Hotel eröffnet' }))).toEqual([
      'Art des Anlasses fehlt (eigener Beitrag oder Unternehmensanlass)',
    ]);
  });
});
