import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'node:fs';
import { alsMarco, neueApp } from '../hilfen';
import type { Datenbank } from '../../src/server/daten/db';

const BEISPIEL = JSON.parse(readFileSync('src/simulator/beispiel-lauf.json', 'utf8'));

let app: FastifyInstance | undefined;
let db: Datenbank;
afterEach(async () => app?.close());

async function marco() {
  ({ app, db } = await neueApp());
  const kopf = await alsMarco(app);
  const rufe = (method: 'GET' | 'POST', url: string, payload?: unknown) =>
    app!.inject({ method, url: `/api/v1${url}`, headers: kopf, payload: payload as never });
  await rufe('POST', '/sim/datum', { heute: '2026-11-19' });
  return rufe;
}
const zahl = (sql: string) => (db.prepare(sql).get() as { n: number }).n;

describe('E2-S5 Ergebnisdatei hochladen', () => {
  it('E2-S5 #1 vier Beispielvorschläge: derselbe Lauf wie über die API, mit Dublettenprüfung, »Zu prüfen«', async () => {
    const rufe = await marco();
    const r = await rufe('POST', '/laeufe/upload', BEISPIEL);
    expect(r.statusCode).toBe(201);
    expect(r.json()).toMatchObject({ angelegt: 4, zurueckgewiesen: [] });
    expect(
      db.prepare(`SELECT datum, herkunft, anzahl_vorschlaege FROM recherchelauf WHERE id = ?`).get(r.json().lauf_id),
    ).toEqual({
      datum: '2026-11-19',
      herkunft: 'upload',
      anzahl_vorschlaege: 4,
    });
    const karten = (await rufe('GET', `/laeufe/${r.json().lauf_id}`)).json().vorschlaege;
    expect(karten.map((k: { zustand: string }) => k.zustand)).toEqual([
      'zu_pruefen',
      'zu_pruefen',
      'zu_pruefen',
      'zu_pruefen',
    ]);
    expect(
      karten.find((k: { daten: { person: { nachname: string } } }) => k.daten.person.nachname === 'Albers')
        .ist_dublette,
    ).toBe(true);
  });

  it('E2-S5 #2 unlesbare Datei: kein Lauf, Meldung mit Grund', async () => {
    const rufe = await marco();
    for (const inhalt of [[1, 2], 'nur ein Text', { lauf: 'ohne Vorschläge' }]) {
      const r = await rufe('POST', '/laeufe/upload', inhalt);
      expect(r.statusCode).toBeGreaterThanOrEqual(400);
      expect(r.statusCode).toBeLessThan(500);
      expect(r.json().fehler.meldung).toMatch(/Datei lässt sich nicht lesen|Liste »vorschlaege«|Erwartet wird JSON/);
    }
    const kaputt = await app!.inject({
      method: 'POST',
      url: '/api/v1/laeufe/upload',
      headers: { ...(await alsMarco(app!)), 'content-type': 'application/json' },
      payload: '{ kein json',
    });
    expect(kaputt.statusCode).toBe(400);
    expect(zahl(`SELECT COUNT(*) n FROM recherchelauf WHERE herkunft = 'upload'`)).toBe(0);
  });

  it('E2-S5 #3 dieselbe Datei ein zweites Mal: alle erkennbar, keine doppelten Firmen oder Kontakte', async () => {
    const rufe = await marco();
    const erst = (await rufe('POST', '/laeufe/upload', BEISPIEL)).json();
    const karten1 = (await rufe('GET', `/laeufe/${erst.lauf_id}`)).json().vorschlaege;
    for (const k of karten1) await rufe('POST', `/vorschlaege/${k.id}/freigabe`);
    const firmen = zahl(`SELECT COUNT(*) n FROM firma`);
    const kontakte = zahl(`SELECT COUNT(*) n FROM ansprechpartner`);

    await rufe('POST', '/sim/datum', { heute: '2026-11-20' });
    const zweit = (await rufe('POST', '/laeufe/upload', BEISPIEL)).json();
    const karten2 = (await rufe('GET', `/laeufe/${zweit.lauf_id}`)).json().vorschlaege;
    expect(karten2.every((k: { ist_dublette: boolean }) => k.ist_dublette)).toBe(true);
    for (const k of karten2) expect((await rufe('POST', `/vorschlaege/${k.id}/freigabe`)).statusCode).toBe(422);
    expect(zahl(`SELECT COUNT(*) n FROM firma`)).toBe(firmen);
    expect(zahl(`SELECT COUNT(*) n FROM ansprechpartner`)).toBe(kontakte);
  });

  it('E2-S5 #4 gesperrte Firma (Ammann) und gesperrte Person: »Gesperrt« mit Grund, nicht freigebbar', async () => {
    const rufe = await marco();
    await rufe('POST', '/sperrliste', {
      art: 'firma',
      name: 'Seehotel-Gruppe Bodan',
      grund: 'passt nicht ins Zielbild',
    });
    db.prepare(
      `INSERT INTO sperreintrag (art, name, firma_name, grund, herkunft, gesperrt_bis, erstellt_am)
       VALUES ('person', 'Sabine Kortmann', 'Kranbau Oberhavel GmbH', 'Anlass zu schwach', 'verworfen', '2026-11-19', '2026-05-19')`,
    ).run();
    const lauf = (await rufe('POST', '/laeufe/upload', BEISPIEL)).json();
    const karten = (await rufe('GET', `/laeufe/${lauf.lauf_id}`)).json().vorschlaege;
    const k = (n: string) =>
      karten.find((x: { daten: { person: { nachname: string } } }) => x.daten.person.nachname === n);
    expect(k('Ammann').gesperrt).toEqual({
      art: 'firma',
      name: 'Seehotel-Gruppe Bodan',
      grund: 'passt nicht ins Zielbild',
      gesperrt_bis: null,
    });
    expect(k('Kortmann').gesperrt).toMatchObject({ art: 'person', gesperrt_bis: '2026-11-19' });
    const r = await rufe('POST', `/vorschlaege/${k('Ammann').id}/freigabe`);
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler.code).toBe('gesperrt');
    expect(k('Voss').gesperrt).toBeNull();
    // Am Tag nach »gesperrt bis« ist die Person frei.
    await rufe('POST', '/sim/datum', { heute: '2026-11-20' });
    const spaeter = (await rufe('GET', `/laeufe/${lauf.lauf_id}`)).json().vorschlaege;
    expect(spaeter.find((x: { id: number }) => x.id === k('Kortmann').id).gesperrt).toBeNull();
  });
});
