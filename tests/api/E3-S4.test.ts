import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp } from '../hilfen';
import type { Datenbank } from '../../src/server/daten/db';

let app: FastifyInstance | undefined;
let db: Datenbank;
afterEach(async () => app?.close());

async function laufVom19() {
  ({ app, db } = await neueApp());
  const kopf = await alsMarco(app);
  await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-19' } });
  const lauf = (await app.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf })).json();
  const detail = (await app.inject({ method: 'GET', url: `/api/v1/laeufe/${lauf.lauf_id}`, headers: kopf })).json();
  const id = (n: string) =>
    detail.vorschlaege.find((v: { daten: { person: { nachname: string } } }) => v.daten.person.nachname === n).id;
  const verwirf = (n: string, grund?: string) =>
    app!.inject({ method: 'POST', url: `/api/v1/vorschlaege/${id(n)}/verwerfung`, headers: kopf, payload: { grund } });
  const sperren = () =>
    db
      .prepare(
        `SELECT art, name, firma_name, grund, herkunft, gesperrt_bis, erstellt_am FROM sperreintrag WHERE herkunft = 'verworfen'`,
      )
      .all();
  const karte = async (n: string) =>
    (await app!.inject({ method: 'GET', url: `/api/v1/laeufe/${lauf.lauf_id}`, headers: kopf }))
      .json()
      .vorschlaege.find((v: { id: number }) => v.id === id(n));
  return { kopf, id, verwirf, sperren, karte };
}

describe('E3-S4 Vorschlag verwerfen', () => {
  it('E3-S4 #1 ohne oder mit unbekanntem Grund: 400, die fünf Gründe werden genannt', async () => {
    const { verwirf, sperren } = await laufVom19();
    for (const g of [undefined, 'gefällt mir nicht']) {
      const r = await verwirf('Ammann', g);
      expect(r.statusCode).toBe(400);
      expect(r.json().fehler.meldung).toBe(
        'Wähle einen Grund: passt nicht ins Zielbild, Kontakt nicht belegt, bereits bekannt, Anlass zu schwach, wird von Kollegen betreut.',
      );
    }
    expect(sperren()).toEqual([]);
  });

  it('E3-S4 #2 #5 Ammann »passt nicht ins Zielbild«: Firma gesperrt, Karte »Verworfen« mit Grund, kein Kontakt', async () => {
    const { verwirf, sperren, karte } = await laufVom19();
    const r = await verwirf('Ammann', 'passt nicht ins Zielbild');
    expect(r.statusCode).toBe(200);
    expect(r.json().sperreintrag).toEqual({
      art: 'firma',
      name: 'Seehotel-Gruppe Bodan AG',
      gesperrt_bis: null,
      neu: true,
    });
    expect(sperren()).toEqual([
      {
        art: 'firma',
        name: 'Seehotel-Gruppe Bodan AG',
        firma_name: null,
        grund: 'passt nicht ins Zielbild',
        herkunft: 'verworfen',
        gesperrt_bis: null,
        erstellt_am: '2026-11-19',
      },
    ]);
    expect(await karte('Ammann')).toMatchObject({ zustand: 'verworfen', verwerf_grund: 'passt nicht ins Zielbild' });
    expect(db.prepare(`SELECT COUNT(*) n FROM firma WHERE name LIKE 'Seehotel%'`).get()).toEqual({ n: 0 });
    expect(db.prepare(`SELECT COUNT(*) n FROM ansprechpartner WHERE nachname = 'Ammann'`).get()).toEqual({ n: 0 });
  });

  it('E3-S4 #3 »wird von Kollegen betreut« sperrt ebenfalls die Firma', async () => {
    const { verwirf, sperren } = await laufVom19();
    await verwirf('Ammann', 'wird von Kollegen betreut');
    expect(sperren()).toMatchObject([{ art: 'firma', name: 'Seehotel-Gruppe Bodan AG', gesperrt_bis: null }]);
  });

  it('E3-S4 #4 Kortmann am 19.11.2026 »Anlass zu schwach«: nur die Person bis 19.05.2027, Firma frei', async () => {
    const { verwirf, sperren } = await laufVom19();
    await verwirf('Kortmann', 'Anlass zu schwach');
    expect(sperren()).toEqual([
      {
        art: 'person',
        name: 'Sabine Kortmann',
        firma_name: 'Kranbau Oberhavel GmbH',
        grund: 'Anlass zu schwach',
        herkunft: 'verworfen',
        gesperrt_bis: '2027-05-19',
        erstellt_am: '2026-11-19',
      },
    ]);
    expect(db.prepare(`SELECT COUNT(*) n FROM sperreintrag WHERE name = 'Kranbau Oberhavel GmbH'`).get()).toEqual({
      n: 0,
    });
  });

  it('schon geprüft 409; Dublette lässt sich mit »bereits bekannt« verwerfen; Agent 403', async () => {
    const { verwirf, id } = await laufVom19();
    expect((await verwirf('Ammann', 'Anlass zu schwach')).statusCode).toBe(200);
    expect((await verwirf('Ammann', 'Anlass zu schwach')).statusCode).toBe(409);
    expect((await verwirf('Albers', 'bereits bekannt')).statusCode).toBe(200);
    const fremd = await app!.inject({
      method: 'POST',
      url: `/api/v1/vorschlaege/${id('Voss')}/verwerfung`,
      headers: AGENT,
      payload: { grund: 'bereits bekannt' },
    });
    expect(fremd.statusCode).toBe(403);
  });
  it('Prüfung E3-S4 Befund 1: nach Ablauf der Personensperre entsteht beim erneuten Verwerfen ein neuer Eintrag', async () => {
    const { verwirf, sperren } = await laufVom19();
    db.prepare(
      `INSERT INTO sperreintrag (art, name, firma_name, grund, herkunft, gesperrt_bis, erstellt_am)
       VALUES ('person', 'Sabine Kortmann', 'Kranbau Oberhavel GmbH', 'Anlass zu schwach', 'verworfen', '2026-11-18', '2026-05-18')`,
    ).run();
    const r = await verwirf('Kortmann', 'Kontakt nicht belegt');
    expect(r.json().sperreintrag).toMatchObject({ neu: true, gesperrt_bis: '2027-05-19' });
    expect(sperren()).toHaveLength(2);
  });

  it('gültiger Eintrag vorhanden: kein zweiter (neu: false), auch bei Rechtsform und zerlegtem Umlaut', async () => {
    const { verwirf, sperren } = await laufVom19();
    db.prepare(
      `INSERT INTO sperreintrag (art, name, grund, herkunft, erstellt_am) VALUES ('firma', 'Seehotel-Gruppe Bodan', 'x', 'von_marco', '2026-11-01')`,
    ).run();
    const r = await verwirf('Ammann', 'passt nicht ins Zielbild');
    expect(r.json().sperreintrag).toMatchObject({ art: 'firma', neu: false });
    expect(sperren()).toEqual([]);
  });
});
