import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { AGENT, alsMarco, neueApp } from '../hilfen';
import { oeffneDatenbank } from '../../src/server/daten/db';
import { Uhr } from '../../src/server/anbindungen/uhr';
import { istAgentSchluessel } from '../../src/server/dienste/zugang';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

describe('Pflege nach den Prüfungen E1-S0 bis E2-S3', () => {
  it('Pflege #5 `npm run reset` (src/server/reset.ts) legt Startdaten, Vorführdatum und Agenten-Schlüssel an', () => {
    const pfad = join(mkdtempSync(join(tmpdir(), 'cockpit-')), 'reset.sqlite');
    const ausgabe = execFileSync('npx', ['tsx', 'src/server/reset.ts'], {
      env: { ...process.env, DATABASE_PATH: pfad, COCKPIT_AGENT_KEY: 'reset-test-schluessel' },
      encoding: 'utf8',
    });
    expect(ausgabe).toContain('Vorführdatum: 2026-11-18');
    expect(ausgabe).toContain('starte ihn neu');
    const db = oeffneDatenbank(pfad);
    expect(new Uhr(db).heute()).toBe('2026-11-18');
    expect(db.prepare('SELECT COUNT(*) n FROM firma').get()).toEqual({ n: 7 });
    expect(db.prepare('SELECT COUNT(*) n FROM sperreintrag').get()).toEqual({ n: 5 });
    expect(istAgentSchluessel(db, 'reset-test-schluessel')).toBe(true);
    db.close();
  });

  it('Pflege #6 plus_werktage ist auf 1 bis 30 begrenzt (Prüfung E1-S2, Befund 3)', async () => {
    ({ app } = await neueApp());
    const kopf = await alsMarco(app);
    for (const plus_werktage of [31, 100000, -1, 1.5]) {
      const r = await app.inject({
        method: 'POST',
        url: '/api/v1/sim/datum',
        headers: kopf,
        payload: { plus_werktage },
      });
      expect(r.statusCode, String(plus_werktage)).toBe(400);
    }
    const ok = await app.inject({
      method: 'POST',
      url: '/api/v1/sim/datum',
      headers: kopf,
      payload: { plus_werktage: 30 },
    });
    expect(ok.json()).toEqual({ heute: '2026-12-30' });
  });

  it('Pflege #7 verständliche Rückweisungen beim Lauf anlegen (Prüfung E2-S3, Befunde 1 und 2)', async () => {
    ({ app } = await neueApp());
    const lauf = JSON.parse(readFileSync('src/simulator/beispiel-lauf.json', 'utf8'));
    lauf.vorschlaege[0].firma.land = 'XX';
    lauf.vorschlaege[1].firma.umsatz_wert = '88';
    lauf.vorschlaege[2] = null;
    const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: lauf });
    expect(r.json().zurueckgewiesen).toEqual([
      {
        index: 0,
        feld: 'firma.land',
        meldung: 'Das Feld »firma.land« hat einen unzulässigen Wert. Erlaubt: DE, AT, CH.',
      },
      {
        index: 1,
        feld: 'firma.umsatz_wert',
        meldung: 'Das Feld »firma.umsatz_wert« hat den falschen Typ (erwartet: number).',
      },
      { index: 2, feld: 'vorschlag', meldung: 'Der Vorschlag muss ein Objekt mit »firma« und »person« sein.' },
    ]);
    const zahl = await app.inject({
      method: 'POST',
      url: '/api/v1/agent/laeufe',
      headers: AGENT,
      payload: { abdeckungsgrenzen: 4, vorschlaege: [] },
    });
    expect(zahl.statusCode).toBe(400);
    expect(zahl.json().fehler).toMatchObject({
      feld: 'abdeckungsgrenzen',
      meldung: 'Die Abdeckungsgrenzen müssen Text sein.',
    });
  });

  it('Pflege #8 kaputtes JSON bekommt eine deutsche Meldung (Prüfung E1-S0, Befund 3)', async () => {
    ({ app } = await neueApp());
    const r = await app.inject({
      method: 'POST',
      url: '/api/v1/agent/laeufe',
      headers: { ...AGENT, 'content-type': 'application/json' },
      payload: '{kaputt',
    });
    expect(r.statusCode).toBe(400);
    expect(r.json().fehler).toEqual({ code: 'eingabe_ungueltig', meldung: 'Die Anfrage enthält kein gültiges JSON.' });
  });
});
