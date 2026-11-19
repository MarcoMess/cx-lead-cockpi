import { describe, expect, it } from 'vitest';
import { normalisiereFirmenname } from '../../src/server/regeln/dubletten';

describe('E1-S0 Namensnormalisierung für die Startdaten', () => {
  it('E1-S0 #4 entfernt Rechtsform und Großschreibung', () => {
    expect(normalisiereFirmenname('Nordwerk Fördertechnik GmbH')).toBe('nordwerk fördertechnik');
    expect(normalisiereFirmenname('Hansemarkt Handels SE')).toBe('hansemarkt handels');
    expect(normalisiereFirmenname('  Alpenstrom   Netze AG ')).toBe('alpenstrom netze');
  });
});
