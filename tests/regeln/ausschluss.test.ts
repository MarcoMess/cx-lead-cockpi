import { describe, expect, it } from 'vitest';
import { VERWERF_GRUENDE } from '../../src/gemeinsam/werte';
import {
  findeGueltigeSperre,
  sperreNachVerwerfen,
  sperrfolgeVerwerfen,
  sperrSchluessel,
} from '../../src/server/regeln/ausschluss';

const ammann = { firma: 'Seehotel-Gruppe Bodan AG', vorname: 'Reto', nachname: 'Ammann' };

describe('E3-S4 Regel Sperrfolge beim Verwerfen', () => {
  it('Firma bei »passt nicht ins Zielbild« und »wird von Kollegen betreut«, sonst Person für 6 Monate', () => {
    const folgen = Object.fromEntries(VERWERF_GRUENDE.map((g) => [g, sperrfolgeVerwerfen(g, ammann, '2026-11-19')]));
    expect(folgen['passt nicht ins Zielbild']).toEqual({
      art: 'firma',
      name: 'Seehotel-Gruppe Bodan AG',
      gesperrt_bis: null,
    });
    expect(folgen['wird von Kollegen betreut']).toEqual({
      art: 'firma',
      name: 'Seehotel-Gruppe Bodan AG',
      gesperrt_bis: null,
    });
    for (const g of ['Kontakt nicht belegt', 'bereits bekannt', 'Anlass zu schwach']) {
      expect(folgen[g]).toEqual({
        art: 'person',
        name: 'Reto Ammann',
        firma_name: 'Seehotel-Gruppe Bodan AG',
        gesperrt_bis: '2027-05-19',
      });
    }
  });
  it('Prüfung E10-S1 Runde 2 Sollte 1: Umlaute und Leerraum zählen nicht als Unterschied', () => {
    expect(sperrSchluessel('WINDMÖLLER  &  HÖLSCHER ')).toBe(sperrSchluessel('Windmöller & Hölscher'));
  });
});

describe('Vorhandene Sperre beim Verwerfen (Prüfung E3-S4 Runde 2)', () => {
  const person = sperrfolgeVerwerfen(
    'Anlass zu schwach',
    { firma: 'Kranbau Oberhavel GmbH', vorname: 'Sabine', nachname: 'Kortmann' },
    '2026-11-19',
  );
  it('kürzere Personensperre wird bis zur neuen Frist verlängert', () => {
    expect(sperreNachVerwerfen({ gesperrt_bis: '2026-12-03' }, person)).toEqual({
      gesperrt_bis: '2027-05-19',
      verlaengern: true,
    });
  });
  it('längere, gleich lange und dauerhafte Sperren bleiben', () => {
    expect(sperreNachVerwerfen({ gesperrt_bis: '2027-08-01' }, person).verlaengern).toBe(false);
    expect(sperreNachVerwerfen({ gesperrt_bis: '2027-05-19' }, person).verlaengern).toBe(false);
    expect(sperreNachVerwerfen({ gesperrt_bis: null }, person)).toEqual({ gesperrt_bis: null, verlaengern: false });
  });
  it('findeGueltigeSperre liefert den Eintrag selbst, abgelaufene nicht', () => {
    const e = [
      { id: 1, art: 'person' as const, name: 'Sabine Kortmann', firma_name: null, gesperrt_bis: '2026-11-18' },
      { id: 2, art: 'person' as const, name: 'Sabine Kortmann', firma_name: null, gesperrt_bis: '2026-12-03' },
    ];
    expect(findeGueltigeSperre(e, { art: 'person', name: 'Sabine Kortmann' }, '2026-11-19')?.id).toBe(2);
    expect(findeGueltigeSperre(e, { art: 'person', name: 'Sabine Kortmann' }, '2026-12-04')).toBeNull();
  });
});
