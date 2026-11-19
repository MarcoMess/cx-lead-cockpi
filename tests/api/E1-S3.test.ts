import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';
import { alsMarco, neueApp, TEST_AGENT_SCHLUESSEL, zahl } from '../hilfen';
import { baueApp } from '../../src/server/app';
import { erstelleStartdatenbank } from '../../src/server/daten/db';
import { setzeAgentSchluessel } from '../../src/server/dienste/zugang';
import { setzeVorfuehrdatum } from '../../src/server/anbindungen/uhr';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

const neueLaeufe = (db: { prepare(s: string): { all(): unknown[] } }) =>
  db
    .prepare(
      `SELECT id, datum, anzahl_vorschlaege n, abdeckungsgrenzen a, herkunft FROM recherchelauf WHERE herkunft = 'api' AND datum >= '2026-11-18' ORDER BY id`,
    )
    .all();

describe('E1-S3 Agenten-Simulator liefert den Beispiel-Lauf', () => {
  it('E1-S3 #1 »Agent meldet sich« legt den Lauf mit den vier Vorschlägen und dem heutigen Datum an', async () => {
    let db;
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    const r = await app.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toMatchObject({
      ergebnis: 'lauf_angelegt',
      angelegt: 4,
      meldung: 'Der Agent hat 4 Vorschläge geliefert.',
    });
    expect(neueLaeufe(db)).toEqual([
      {
        id: r.json().lauf_id,
        datum: '2026-11-18',
        n: 4,
        a: 'Nur 4 belegte Treffer statt 10, Lücke benannt; 1 Profil ohne verifizierte URL',
        herkunft: 'api',
      },
    ]);
    const namen = (db.prepare(`SELECT daten FROM vorschlag ORDER BY id`).all() as { daten: string }[]).map((v) => {
      const p = JSON.parse(v.daten).person;
      return [p.titel, p.vorname, p.nachname].filter(Boolean).join(' ');
    });
    expect(namen).toEqual(['Sabine Kortmann', 'Miriam Voss', 'Dr. Katrin Albers', 'Reto Ammann']);
  });

  it('E1-S3 #2 der Simulator geht über die Agenten-API: mit falschem Schlüssel entsteht kein Lauf', async () => {
    const db = erstelleStartdatenbank(':memory:');
    setzeAgentSchluessel(db, TEST_AGENT_SCHLUESSEL);
    setzeVorfuehrdatum(db, '2026-11-18');
    app = await baueApp({
      db,
      demo: true,
      passwort: 'p',
      sitzungsSchluessel: randomBytes(32),
      agentSchluessel: 'falscher-schluessel',
    });
    const r = await app.inject({
      method: 'POST',
      url: '/api/v1/sim/agent/meldung',
      headers: await alsMarcoMit(app, 'p'),
    });
    expect(r.statusCode).toBe(502);
    expect(r.json().fehler.meldung).toContain('Agenten-Schlüssel');
    expect(zahl(db, 'SELECT COUNT(*) n FROM vorschlag')).toBe(0);
    expect(zahl(db, 'SELECT COUNT(*) n FROM recherchelauf')).toBe(4);
  });

  it('E1-S3 #3 an einem späteren Tag liefert der Agent einen Lauf ohne Vorschläge', async () => {
    let db;
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    await app.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf });
    const gleicherTag = await app.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf });
    expect(gleicherTag.statusCode).toBe(409);
    await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { plus_werktage: 1 } });
    const r = await app.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf });
    expect(r.json()).toMatchObject({
      ergebnis: 'lauf_angelegt',
      angelegt: 0,
      meldung: 'Der Agent hat 0 Vorschläge geliefert.',
    });
    expect(neueLaeufe(db).at(-1)).toMatchObject({ datum: '2026-11-19', n: 0, a: 'Keine weiteren belegten Treffer' });
    expect(zahl(db, 'SELECT COUNT(*) n FROM vorschlag')).toBe(4);
  });

  it('E1-S3 #4 bei gestörter API entsteht kein Lauf, die Ergebnisdatei liegt bereit', async () => {
    let db;
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    expect(
      (await app.inject({ method: 'GET', url: '/api/v1/sim/agent/ergebnisdatei', headers: kopf })).statusCode,
    ).toBe(404);
    const an = await app.inject({
      method: 'PUT',
      url: '/api/v1/sim/agent',
      headers: kopf,
      payload: { api_gestoert: true },
    });
    expect(an.json()).toEqual({ api_gestoert: true, ergebnisdatei_bereit: false });
    const r = await app.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf });
    expect(r.json().ergebnis).toBe('api_gestoert');
    expect(neueLaeufe(db)).toEqual([]);
    const datei = await app.inject({ method: 'GET', url: '/api/v1/sim/agent/ergebnisdatei', headers: kopf });
    expect(datei.statusCode).toBe(200);
    expect(datei.json().abdeckungsgrenzen).toBe(
      'Nur 4 belegte Treffer statt 10, Lücke benannt; 1 Profil ohne verifizierte URL',
    );
    expect(datei.json().vorschlaege).toHaveLength(4);
    expect((await app.inject({ method: 'GET', url: '/api/v1/sim/zustand', headers: kopf })).json().agent).toEqual({
      api_gestoert: true,
      ergebnisdatei_bereit: true,
    });
    // Zurücksetzen stellt auch den Simulator zurück.
    await app.inject({ method: 'POST', url: '/api/v1/sim/zuruecksetzen', headers: kopf });
    expect((await app.inject({ method: 'GET', url: '/api/v1/sim/zustand', headers: kopf })).json().agent).toEqual({
      api_gestoert: false,
      ergebnisdatei_bereit: false,
    });
  });

  it('E1-S3 #5 ohne COCKPIT_DEMO=1 gibt es den Simulator nicht', async () => {
    ({ app } = await neueApp({ demo: false }));
    const kopf = await alsMarco(app);
    expect((await app.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf })).statusCode).toBe(
      404,
    );
    expect(
      (await app.inject({ method: 'PUT', url: '/api/v1/sim/agent', headers: kopf, payload: { api_gestoert: true } }))
        .statusCode,
    ).toBe(404);
  });
});

async function alsMarcoMit(a: FastifyInstance, passwort: string) {
  const r = await a.inject({ method: 'POST', url: '/api/v1/anmeldung', payload: { passwort } });
  return { cookie: String(r.headers['set-cookie']).split(';')[0] };
}
