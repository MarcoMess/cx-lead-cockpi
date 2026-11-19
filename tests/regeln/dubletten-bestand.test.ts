import { describe, expect, it } from 'vitest';
import {
  bewerteBekanntePerson,
  normalisiereDomain,
  normalisiereFirmenname,
  hinweisZweiterAnsprechpartner,
  normalisiereLinkedinUrl,
} from '../../src/server/regeln/dubletten';
import { plusMonate } from '../../src/server/regeln/fristen';

describe('E2-S4 Regeln der Dublettenprüfung', () => {
  it('LinkedIn-Adressen werden vergleichbar gemacht', () => {
    for (const u of [
      'https://www.linkedin.com/in/a-b/',
      'http://linkedin.com/in/a-b?trk=x',
      'LinkedIn.com/in/A-B',
      ' linkedin.com/in/a-b ',
      'https://de.linkedin.com/in/a-b',
      'https://m.linkedin.com/in/a-b/',
      'https://www.linkedin.com/in/a-b/de/',
    ]) {
      expect(normalisiereLinkedinUrl(u)).toBe('linkedin.com/in/a-b');
    }
  });
  it('Wiederansprache nur nach Ablauf von 6 Monaten, mit neuem Anlass, aus »Ohne Antwort geschlossen«', () => {
    const g = (geschlossen_am: string) => ({ status: 'ohne_antwort_geschlossen' as const, geschlossen_am });
    expect(bewerteBekanntePerson(g('2026-05-19'), '2026-11-19', true)).toBe('wiederansprache');
    expect(bewerteBekanntePerson(g('2026-05-20'), '2026-11-19', true)).toBe('dublette');
    expect(bewerteBekanntePerson(g('2026-01-01'), '2026-11-19', false)).toBe('dublette');
    expect(bewerteBekanntePerson({ status: 'kein_interesse', geschlossen_am: '2026-01-01' }, '2026-11-19', true)).toBe(
      'dublette',
    );
  });
  it('Hinweis zweiter Ansprechpartner nur bei laufender Ansprache', () => {
    const k = (status: never) => ({ vorname: 'Tobias', nachname: 'Reinhardt', status });
    expect(hinweisZweiterAnsprechpartner([k('angeschrieben' as never)])).toBe(
      'Zweiter Ansprechpartner, dort läuft eine Ansprache (Tobias Reinhardt, Angeschrieben)',
    );
    expect(hinweisZweiterAnsprechpartner([k('freigegeben' as never)])).toBeNull();
    expect(hinweisZweiterAnsprechpartner([k('gespraech_vereinbart' as never)])).toBeNull();
    expect(hinweisZweiterAnsprechpartner([k('antwort_erhalten' as never)])).toBeNull();
    expect(hinweisZweiterAnsprechpartner([k('nachgefasst' as never)])).toContain('Nachgefasst');
    expect(hinweisZweiterAnsprechpartner([])).toBeNull();
  });
  it('plusMonate: Monatsende und Jahreswechsel', () => {
    expect(plusMonate('2026-11-19', 6)).toBe('2027-05-19');
    expect(plusMonate('2026-08-31', 6)).toBe('2027-02-28');
    expect(plusMonate('2026-11-19', -6)).toBe('2026-05-19');
  });
});

describe('Prüfung E2-S4 Sollte: Grenzfälle der Normalisierung', () => {
  it('Rechtsformen mit Punkten, Kommas, »& Co KG«, »mbH«, »S.E.« und zerlegte Umlaute', () => {
    const ziel = 'nordwerk fördertechnik';
    for (const n of [
      'Nordwerk Fördertechnik GmbH',
      'Nordwerk Fördertechnik GmbH.',
      'Nordwerk Fördertechnik G.m.b.H.',
      'Nordwerk Fördertechnik, GmbH',
      'Nordwerk Fördertechnik GmbH & Co KG',
      'Nordwerk Fördertechnik GmbH & Co. KG',
      'Nordwerk Fördertechnik mbH',
      'Nordwerk Fördertechnik S.E.',
      'Nordwerk Fo\u0308rdertechnik AG',
      'nordwerk  fördertechnik',
    ]) {
      expect(normalisiereFirmenname(n), n).toBe(ziel);
    }
  });
  it('Domain ohne Schema, www, Pfad', () => {
    expect(normalisiereDomain('https://www.Beispiel.example/kontakt')).toBe('beispiel.example');
  });
  it('Grenztag der 6-Monats-Frist: am Tag 6 Monate nach dem Schließen wieder frei', () => {
    const g = { status: 'ohne_antwort_geschlossen' as const, geschlossen_am: '2026-05-19' };
    expect(bewerteBekanntePerson(g, '2026-11-18', true)).toBe('dublette');
    expect(bewerteBekanntePerson(g, '2026-11-19', true)).toBe('wiederansprache');
  });
});

import { pruefeGegenBestand } from '../../src/server/regeln/dubletten';
describe('Firmenabgleich mit Land', () => {
  it('gleicher Stammname in anderem Land ist eine andere Firma', () => {
    const bestand = {
      firmen: [{ id: 4, name: 'Hansemarkt Handels SE', domain: null, land: 'DE' }],
      kontakte: [],
    };
    const v = (land: 'DE' | 'CH') =>
      ({ firma: { name: 'Hansemarkt Handels AG', land }, person: { vorname: 'A', nachname: 'B' } }) as never;
    expect(pruefeGegenBestand(v('CH'), bestand, '2026-11-19').firma_id).toBeNull();
    expect(pruefeGegenBestand(v('DE'), bestand, '2026-11-19').firma_id).toBe(4);
  });
});
