import { describe, expect, it } from 'vitest';
import { ANSPRECHPARTNER_STATUS } from '../../src/gemeinsam/werte';
import { darfWiederangesprochenWerden } from '../../src/server/regeln/status';

describe('Regel Status: Wiederansprache', () => {
  it('nur »Ohne Antwort geschlossen« darf wieder angesprochen werden', () => {
    expect(ANSPRECHPARTNER_STATUS.filter(darfWiederangesprochenWerden)).toEqual(['ohne_antwort_geschlossen']);
  });
});
