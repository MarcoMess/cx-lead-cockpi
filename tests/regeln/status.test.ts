import { describe, expect, it } from 'vitest';
import { ANSPRECHPARTNER_STATUS } from '../../src/gemeinsam/werte';
import { statusText } from '../../src/gemeinsam/texte';
import { darfWiederangesprochenWerden, istOffen } from '../../src/server/regeln/status';

describe('Regel Status', () => {
  it('E4-S2 Endzustände sind nicht offen, alle übrigen schon', () => {
    const geschlossen = ANSPRECHPARTNER_STATUS.filter((s) => !istOffen(s));
    expect(geschlossen.sort()).toEqual(['an_sap_uebergeben', 'gesperrt', 'kein_interesse', 'ohne_antwort_geschlossen']);
  });
  it('E4-S2 Antwort erhalten zeigt die Einordnung', () => {
    expect(statusText('antwort_erhalten', 'neutral_spaeter')).toBe('Antwort erhalten (neutral/später)');
    expect(statusText('angeschrieben', null)).toBe('Angeschrieben');
  });
  it('E3-S3 nur »Ohne Antwort geschlossen« darf wieder angesprochen werden', () => {
    expect(ANSPRECHPARTNER_STATUS.filter(darfWiederangesprochenWerden)).toEqual(['ohne_antwort_geschlossen']);
  });
});
