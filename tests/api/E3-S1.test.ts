import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { alsMarco, neueApp } from '../hilfen';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

async function mitLaufVom19(a: FastifyInstance) {
  const kopf = await alsMarco(a);
  await a.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-19' } });
  const r = await a.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf });
  return { kopf, laufId: r.json().lauf_id as number };
}

describe('E3-S1 Eingangskorb zeigt Läufe und Vorschläge', () => {
  it('E3-S1 #1 die drei Beispielläufe mit Zahlen und Abdeckungsgrenzen, der neueste zuerst', async () => {
    ({ app } = await neueApp());
    const r = await app.inject({ method: 'GET', url: '/api/v1/laeufe', headers: await alsMarco(app) });
    expect(r.statusCode).toBe(200);
    expect(r.json().map((l: Record<string, unknown>) => ({ ...l, id: undefined }))).toEqual([
      {
        datum: '2026-11-16',
        anzahl_vorschlaege: 10,
        anzahl_freigegeben: 7,
        abdeckungsgrenzen: '2 Profile ohne verifizierte URL',
        offen: 0,
      },
      {
        datum: '2026-11-12',
        anzahl_vorschlaege: 8,
        anzahl_freigegeben: 6,
        abdeckungsgrenzen: 'Nur 8 belegte Treffer, Lücke benannt',
        offen: 0,
      },
      {
        id: undefined,
        datum: '2026-11-09',
        anzahl_vorschlaege: 10,
        anzahl_freigegeben: 8,
        abdeckungsgrenzen: null,
        offen: 0,
      },
    ]);
  });

  it('E3-S1 #2 und #4 der Lauf vom 19.11.2026 steht oben mit 4 offenen Vorschlägen und allen Kartenangaben', async () => {
    ({ app } = await neueApp());
    const { kopf, laufId } = await mitLaufVom19(app);
    const liste = (await app.inject({ method: 'GET', url: '/api/v1/laeufe', headers: kopf })).json();
    expect(liste[0]).toMatchObject({ id: laufId, datum: '2026-11-19', anzahl_vorschlaege: 4, offen: 4 });
    const lauf = (await app.inject({ method: 'GET', url: `/api/v1/laeufe/${laufId}`, headers: kopf })).json();
    expect(lauf.vorschlaege).toHaveLength(4);
    const k = lauf.vorschlaege[0];
    expect(k.zustand).toBe('zu_pruefen');
    expect(k.daten.person).toMatchObject({
      vorname: 'Sabine',
      nachname: 'Kortmann',
      funktion: 'Leiterin After-Sales Service',
    });
    expect(k.daten.firma).toMatchObject({
      name: 'Kranbau Oberhavel GmbH',
      branche: 'Maschinenbau',
      land: 'DE',
      umsatz_wert: 121,
    });
    expect(k.daten.anlass).toMatchObject({
      ereignis_datum: '2026-11-12',
      quelle_url: 'https://example.com/quelle-kranbau-ersatzteilportal',
    });
  });

  it('E3-S1 unbekannter Lauf liefert 404, ohne Anmeldung 401', async () => {
    ({ app } = await neueApp());
    const kopf = await alsMarco(app);
    expect((await app.inject({ method: 'GET', url: '/api/v1/laeufe/999', headers: kopf })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: '/api/v1/laeufe/abc', headers: kopf })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: '/api/v1/laeufe' })).statusCode).toBe(401);
  });
});
