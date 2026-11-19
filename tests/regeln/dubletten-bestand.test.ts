import { describe, expect, it } from 'vitest';
import {
  bewerteBekanntePerson,
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
    expect(hinweisZweiterAnsprechpartner([])).toBeNull();
  });
  it('plusMonate: Monatsende und Jahreswechsel', () => {
    expect(plusMonate('2026-11-19', 6)).toBe('2027-05-19');
    expect(plusMonate('2026-08-31', 6)).toBe('2027-02-28');
    expect(plusMonate('2026-11-19', -6)).toBe('2026-05-19');
  });
});
