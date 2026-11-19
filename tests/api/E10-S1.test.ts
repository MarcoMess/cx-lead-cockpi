import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp } from '../hilfen';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

async function marco() {
  const r = await neueApp();
  app = r.app;
  const kopf = await alsMarco(r.app);
  const rufe = (method: 'GET' | 'POST' | 'DELETE', url: string, payload?: Record<string, unknown>) =>
    r.app.inject({ method, url: `/api/v1${url}`, headers: kopf, payload });
  return { db: r.db, rufe };
}

describe('E10-S1 Sperrliste verwalten', () => {
  it('E10-S1 #1 #5 Startbestand: fünf Firmen mit Grund »In früherer Ausgabe genannt«, Art und Datum', async () => {
    const { rufe } = await marco();
    const r = await rufe('GET', '/sperrliste');
    expect(r.statusCode).toBe(200);
    const l = r.json();
    expect(l.map((z: { name: string }) => z.name)).toEqual([
      'Windmöller & Hölscher',
      'BOBST',
      'Haberkorn',
      'HORNBACH',
      'Energie Steiermark',
    ]);
    for (const z of l) {
      expect(z).toMatchObject({ art: 'firma', grund: 'In früherer Ausgabe genannt', erstellt_am: '2026-11-18' });
    }
  });

  it('E10-S1 #2 neuer Eintrag steht mit dem heutigen Datum in der Liste', async () => {
    const { rufe } = await marco();
    const r = await rufe('POST', '/sperrliste', {
      art: 'person',
      name: 'Erika Beispiel',
      grund: 'Wird von Kollegen betreut',
    });
    expect(r.statusCode).toBe(201);
    expect(r.json().at(-1)).toMatchObject({
      art: 'person',
      name: 'Erika Beispiel',
      grund: 'Wird von Kollegen betreut',
      herkunft: 'von_marco',
      erstellt_am: '2026-11-18',
    });
  });

  it('E10-S1 #3 leerer Name: nichts angelegt, Name verlangt', async () => {
    const { db, rufe } = await marco();
    for (const name of ['', '   ']) {
      const r = await rufe('POST', '/sperrliste', { art: 'firma', name, grund: 'x' });
      expect(r.statusCode).toBe(422);
      expect(r.json().fehler).toMatchObject({ feld: 'name', meldung: 'Gib den Namen der Firma oder Person ein.' });
    }
    expect(db.prepare(`SELECT COUNT(*) n FROM sperreintrag`).get()).toEqual({ n: 5 });
  });

  it('E10-S1 #4 entfernter Eintrag fehlt in der Liste und im Bestand, aus dem die Ausschlussliste entsteht', async () => {
    const { db, rufe } = await marco();
    const bobst = (await rufe('GET', '/sperrliste')).json().find((z: { name: string }) => z.name === 'BOBST');
    const r = await rufe('DELETE', `/sperrliste/${bobst.id}`);
    expect(r.statusCode).toBe(200);
    expect(r.json().map((z: { name: string }) => z.name)).not.toContain('BOBST');
    expect(db.prepare(`SELECT COUNT(*) n FROM sperreintrag WHERE name = 'BOBST'`).get()).toEqual({ n: 0 });
    expect((await rufe('DELETE', `/sperrliste/${bobst.id}`)).statusCode).toBe(404);
  });

  it('ohne Sitzung 401, mit Agenten-Schlüssel 403', async () => {
    await marco();
    expect((await app!.inject({ method: 'GET', url: '/api/v1/sperrliste' })).statusCode).toBe(401);
    expect((await app!.inject({ method: 'GET', url: '/api/v1/sperrliste', headers: AGENT })).statusCode).toBe(403);
  });
});
