import { describe, expect, it } from 'vitest';
import { zugangsart } from '../../src/server/regeln/zugang';

describe('E1-S1 Zuordnung der Adressen zu Zugangsarten', () => {
  it('E1-S1 #1 öffentlich sind nur Lebenszeichen, Anmeldung, Abmeldung und Wer-bin-ich', () => {
    expect(zugangsart('GET', '/api/v1/gesundheit')).toBe('oeffentlich');
    expect(zugangsart('POST', '/api/v1/anmeldung')).toBe('oeffentlich');
    expect(zugangsart('GET', '/api/v1/ich')).toBe('oeffentlich');
    expect(zugangsart('GET', '/api/v1/firmen?suche=hanse')).toBe('sitzung');
    expect(zugangsart('GET', '/api/v1/anmeldung')).toBe('sitzung');
  });
  it('E1-S1 #3 Adressen unter /api/v1/agent verlangen den Agenten-Schlüssel', () => {
    expect(zugangsart('GET', '/api/v1/agent/laufauftrag')).toBe('agent');
    expect(zugangsart('POST', '/api/v1/agent/laeufe')).toBe('agent');
    expect(zugangsart('GET', '/api/v1/agent-steuerung')).toBe('sitzung');
  });
});
