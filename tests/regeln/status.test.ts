import { describe, expect, it } from 'vitest';
import { ANSPRECHPARTNER_STATUS } from '../../src/gemeinsam/werte';
import { statusText } from '../../src/gemeinsam/texte';
import { istOffen } from '../../src/server/regeln/status';

describe('E4-S2 Regel Status', () => {
  it('Endzustände sind nicht offen, alle übrigen schon', () => {
    const geschlossen = ANSPRECHPARTNER_STATUS.filter((s) => !istOffen(s));
    expect(geschlossen.sort()).toEqual(['an_sap_uebergeben', 'gesperrt', 'kein_interesse', 'ohne_antwort_geschlossen']);
  });
  it('Antwort erhalten zeigt die Einordnung', () => {
    expect(statusText('antwort_erhalten', 'neutral_spaeter')).toBe('Antwort erhalten (neutral/später)');
    expect(statusText('angeschrieben', null)).toBe('Angeschrieben');
  });
});
