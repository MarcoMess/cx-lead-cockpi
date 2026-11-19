import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { alsMarco, neueApp, zahl } from '../hilfen';
import { setzeZurueck } from '../../src/server/daten/zuruecksetzen';
import { erstelleStartdatenbank } from '../../src/server/daten/db';
import { Uhr } from '../../src/server/anbindungen/uhr';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

describe('E1-S2 Vorführdatum und Zurücksetzen', () => {
  it('E1-S2 #1 Zurücksetzen stellt Startdaten und das Datum 18.11.2026 wieder her', async () => {
    let db;
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-12-01' } });
    db.prepare(`UPDATE firma SET name = 'Geändert' WHERE id = 1`).run();
    db.prepare(`DELETE FROM sperreintrag`).run();
    db.prepare(`UPDATE ansprechpartner SET status = 'gesperrt' WHERE id = 3`).run();

    const r = await app.inject({ method: 'POST', url: '/api/v1/sim/zuruecksetzen', headers: kopf });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual({ heute: '2026-11-18' });
    expect(db.prepare(`SELECT name FROM firma WHERE id = 1`).get()).toEqual({ name: 'Nordwerk Fördertechnik GmbH' });
    expect(zahl(db, 'SELECT COUNT(*) n FROM sperreintrag')).toBe(5);
    expect(db.prepare(`SELECT status FROM ansprechpartner WHERE id = 3`).get()).toEqual({ status: 'freigegeben' });
    expect(zahl(db, 'SELECT COUNT(*) n FROM firma')).toBe(7);
    // Die Sitzung und der Agenten-Schlüssel bleiben gültig.
    expect((await app.inject({ method: 'GET', url: '/api/v1/sim/zustand', headers: kopf })).json()).toEqual({
      heute: '2026-11-18',
    });
    expect(zahl(db, `SELECT COUNT(*) n FROM einstellung WHERE schluessel = 'agent_schluessel_hash'`)).toBe(1);
  });

  it('E1-S2 #1 der Ablauf von npm run reset setzt das Datum auf den 18.11.2026', () => {
    const db = erstelleStartdatenbank(':memory:');
    setzeZurueck(db);
    expect(new Uhr(db).heute()).toBe('2026-11-18');
  });

  it('E1-S2 #2 plus_werktage: Mittwoch 18.11. → Donnerstag 19.11., Freitag 20.11. → Montag 23.11.2026', async () => {
    ({ app } = await neueApp());
    const kopf = await alsMarco(app);
    const r1 = await app.inject({
      method: 'POST',
      url: '/api/v1/sim/datum',
      headers: kopf,
      payload: { plus_werktage: 1 },
    });
    expect(r1.json()).toEqual({ heute: '2026-11-19' });
    await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-20' } });
    const r2 = await app.inject({
      method: 'POST',
      url: '/api/v1/sim/datum',
      headers: kopf,
      payload: { plus_werktage: 1 },
    });
    expect(r2.json()).toEqual({ heute: '2026-11-23' });
    expect(app.uhr.heute()).toBe('2026-11-23');
  });

  it('E1-S2 #3 Datum direkt setzen, ungültiges Datum mit 400 abgelehnt', async () => {
    ({ app } = await neueApp());
    const kopf = await alsMarco(app);
    const ok = await app.inject({
      method: 'POST',
      url: '/api/v1/sim/datum',
      headers: kopf,
      payload: { heute: '2026-11-24' },
    });
    expect(ok.json()).toEqual({ heute: '2026-11-24' });
    for (const payload of [{ heute: '2026-02-30' }, { heute: '24.11.2026' }, {}, { plus_werktage: 0 }]) {
      const r = await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload });
      expect(r.statusCode, JSON.stringify(payload)).toBe(400);
      expect(r.json().fehler.code).toBe('datum_ungueltig');
    }
    expect(app.uhr.heute()).toBe('2026-11-24');
  });

  it('E1-S2 #5 ohne COCKPIT_DEMO=1 gibt es die Vorführ-Adressen nicht', async () => {
    ({ app } = await neueApp({ demo: false }));
    const kopf = await alsMarco(app);
    for (const [method, url] of [
      ['GET', '/api/v1/sim/zustand'],
      ['POST', '/api/v1/sim/zuruecksetzen'],
      ['POST', '/api/v1/sim/datum'],
    ] as const) {
      const r = await app.inject({ method, url, headers: kopf, payload: method === 'POST' ? {} : undefined });
      expect(r.statusCode, url).toBe(404);
    }
  });

  it('E1-S2 #6 die Vorführ-Adressen verlangen eine Anmeldung', async () => {
    ({ app } = await neueApp());
    for (const [method, url] of [
      ['GET', '/api/v1/sim/zustand'],
      ['POST', '/api/v1/sim/zuruecksetzen'],
      ['POST', '/api/v1/sim/datum'],
    ] as const) {
      const r = await app.inject({ method, url });
      expect(r.statusCode, url).toBe(401);
    }
  });
});
