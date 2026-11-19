import { describe, expect, it } from 'vitest';
import type { VerlaufEintrag } from '../../src/gemeinsam/kontakte';
import { erlaubteAktionen } from '../../src/server/regeln/status';
import { ordneVerlauf } from '../../src/server/regeln/verlauf';

const kv = (zeitpunkt: string): VerlaufEintrag => ({
  art: 'kontaktversuch',
  zeitpunkt,
  kanal: 'inmail',
  kontakt_art: 'erstkontakt',
  betreff: null,
  text: 't',
  email_grundlage: null,
  email_grundlage_notiz: null,
});
const an = (datum: string): VerlaufEintrag => ({
  art: 'antwort',
  datum,
  einordnung: 'positiv',
  wortlaut: null,
  naechster_schritt: null,
});

describe('E4-S3 Verlauf und erlaubte Aktionen', () => {
  it('ordnet zeitlich; eine Antwort steht nach einem Kontaktversuch desselben Tages', () => {
    const r = ordneVerlauf([an('2026-11-09'), kv('2026-11-12 08:20'), kv('2026-11-09 17:00'), kv('2026-11-06 08:40')]);
    expect(r.map((e) => (e.art === 'antwort' ? 'A ' + e.datum : e.zeitpunkt))).toEqual([
      '2026-11-06 08:40',
      '2026-11-09 17:00',
      'A 2026-11-09',
      '2026-11-12 08:20',
    ]);
  });
  it('An SAP übergeben nur aus positiver Antwort oder vereinbartem Gespräch', () => {
    expect(erlaubteAktionen('gespraech_vereinbart', 'positiv')).toContain('an_sap_uebergeben');
    expect(erlaubteAktionen('antwort_erhalten', 'positiv')).toContain('an_sap_uebergeben');
    expect(erlaubteAktionen('antwort_erhalten', 'neutral_spaeter')).not.toContain('an_sap_uebergeben');
    expect(erlaubteAktionen('angeschrieben', null)).not.toContain('an_sap_uebergeben');
  });
  it('Wieder öffnen nur aus geschlossenen Zuständen; Ansprechen nur aus »Freigegeben«', () => {
    expect(erlaubteAktionen('kein_interesse', 'kein_interesse')).toContain('wieder_oeffnen');
    expect(erlaubteAktionen('angeschrieben', null)).not.toContain('wieder_oeffnen');
    expect(erlaubteAktionen('freigegeben', null)).toContain('ansprechen');
    expect(erlaubteAktionen('angeschrieben', null)).toEqual(
      expect.arrayContaining(['nachfassen', 'antwort_erfassen', 'ohne_antwort_schliessen']),
    );
  });
});
