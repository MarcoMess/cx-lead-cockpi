import { describe, expect, it } from 'vitest';
import { ANSPRECHPARTNER_STATUS } from '../../src/gemeinsam/werte';
import { statusText } from '../../src/gemeinsam/texte';
import { darfWiederangesprochenWerden } from '../../src/server/regeln/dubletten';
import { erlaubteAktionen, istEndzustand, istOffen } from '../../src/server/regeln/status';

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
  it('Prüfung E4-S3 Sollte 1: Endzustände nach Konzept ohne »An SAP übergeben«', () => {
    expect(ANSPRECHPARTNER_STATUS.filter(istEndzustand)).toEqual([
      'kein_interesse',
      'ohne_antwort_geschlossen',
      'gesperrt',
    ]);
  });
  it('Prüfung E4-S3 Sollte 3: erlaubte Aktionen je Status vollständig', () => {
    const erwartet: Record<string, string[]> = {
      freigegeben: ['ansprechen', 'wiedervorlage_setzen', 'sperren', 'loeschen'],
      angeschrieben: [
        'nachfassen',
        'antwort_erfassen',
        'wiedervorlage_setzen',
        'ohne_antwort_schliessen',
        'sperren',
        'loeschen',
      ],
      nachgefasst: ['antwort_erfassen', 'wiedervorlage_setzen', 'ohne_antwort_schliessen', 'sperren', 'loeschen'],
      gespraech_vereinbart: ['wiedervorlage_setzen', 'an_sap_uebergeben', 'sperren', 'loeschen'],
      an_sap_uebergeben: ['loeschen'],
      kein_interesse: ['wieder_oeffnen', 'sperren', 'loeschen'],
      ohne_antwort_geschlossen: ['wieder_oeffnen', 'sperren', 'loeschen'],
      gesperrt: ['loeschen'],
    };
    for (const [status, aktionen] of Object.entries(erwartet)) {
      expect(erlaubteAktionen(status as never, null), status).toEqual(aktionen);
    }
    expect(erlaubteAktionen('antwort_erhalten', 'positiv')).toEqual([
      'gespraech_eintragen',
      'wiedervorlage_setzen',
      'an_sap_uebergeben',
      'sperren',
      'loeschen',
    ]);
    expect(erlaubteAktionen('antwort_erhalten', 'neutral_spaeter')).toEqual([
      'antwort_erfassen',
      'wiedervorlage_setzen',
      'sperren',
      'loeschen',
    ]);
  });
});
