import { describe, expect, it } from 'vitest';
import { anspracheModus, fassungNachVersand } from '../../src/server/regeln/ansprache';
import { wortzahlText, zaehleWoerter } from '../../src/web/screens/S5Ansprache';

describe('E5-S1 Regeln der Ansprache', () => {
  it('Modus: Erstkontakt aus »Freigegeben«, Nachfassen aus »Angeschrieben«, sonst keine', () => {
    expect(anspracheModus('freigegeben')).toBe('erstkontakt');
    expect(anspracheModus('angeschrieben')).toBe('nachfassen');
    expect(anspracheModus('nachgefasst')).toBe('keine');
    expect(anspracheModus('ohne_antwort_geschlossen')).toBe('keine');
  });
  it('E5-S1 #5 Fassung: unverändert »agent«, geänderter Betreff oder Text »von_marco_geaendert«', () => {
    const agent = { betreff: 'B', text: 'Hallo Welt' };
    expect(fassungNachVersand(agent, { betreff: 'B', text: 'Hallo Welt' })).toBe('agent');
    expect(fassungNachVersand(agent, { betreff: 'B', text: '  Hallo Welt \n' })).toBe('agent');
    expect(fassungNachVersand(agent, { betreff: 'B2', text: 'Hallo Welt' })).toBe('von_marco_geaendert');
    expect(fassungNachVersand(agent, { betreff: 'B', text: 'Hallo' })).toBe('von_marco_geaendert');
  });
  it('E5-S1 #3 #4 Wortzähler mit Zielkorridor 45–70', () => {
    expect(zaehleWoerter('  eins zwei\n drei ')).toBe(3);
    expect(wortzahlText(50)).toBe('50 Wörter, im Zielkorridor 45–70');
    expect(wortzahlText(44)).toBe('44 Wörter, Zielkorridor für LinkedIn ist 45–70');
    expect(wortzahlText(71)).toBe('71 Wörter, Zielkorridor für LinkedIn ist 45–70');
  });
});
