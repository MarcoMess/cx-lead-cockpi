import { describe, expect, it } from 'vitest';
import { VERWERF_GRUENDE } from '../../src/gemeinsam/werte';
import { sperrfolgeVerwerfen, sperrSchluessel } from '../../src/server/regeln/ausschluss';

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
