import { describe, expect, it } from 'vitest';
import { istDatum, plusTage, plusWerktage, wochentag } from '../../src/server/regeln/fristen';

describe('E1-S2 Datumsrechnung für das Vorführdatum', () => {
  it('E1-S2 #2 nächster Werktag: Mittwoch → Donnerstag, Freitag → Montag', () => {
    expect(wochentag('2026-11-18')).toBe(3);
    expect(plusWerktage('2026-11-18', 1)).toBe('2026-11-19');
    expect(plusWerktage('2026-11-20', 1)).toBe('2026-11-23');
    expect(plusWerktage('2026-11-21', 1)).toBe('2026-11-23');
    expect(plusTage('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('E1-S2 #3 nur gültige Kalenderdaten im Format JJJJ-MM-TT', () => {
    expect(istDatum('2026-11-24')).toBe(true);
    expect(istDatum('2026-02-30')).toBe(false);
    expect(istDatum('24.11.2026')).toBe(false);
    expect(istDatum('2026-13-01')).toBe(false);
    expect(istDatum(20261124)).toBe(false);
  });
});
