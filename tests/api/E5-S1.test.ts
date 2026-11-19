import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp } from '../hilfen';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

async function ansprache(a: FastifyInstance, id: number | string) {
  const kopf = await alsMarco(a);
  return a.inject({ method: 'GET', url: `/api/v1/kontakte/${id}/ansprache`, headers: kopf });
}

describe('E5-S1 Ansprache', () => {
  it('E5-S1 #1 Gruber: Aufhänger mit Datum und Quelle, Hypothese, Ziel; Betreff und LinkedIn-Nachricht des Agenten', async () => {
    ({ app } = await neueApp());
    const r = await ansprache(app, 3);
    expect(r.statusCode).toBe(200);
    const a = r.json();
    expect(a.modus).toBe('erstkontakt');
    expect(a.kontakt).toMatchObject({ vorname: 'Simone', nachname: 'Gruber', firma_name: 'Alpenstrom Netze AG' });
    expect(a.aufhaenger).toMatchObject({
      beschreibung: 'Geschäftsbericht: Kundenportal für Netzanschlüsse als Schwerpunkt 2027',
      ereignis_datum: '2026-09-15',
      quelle_url: 'https://example.com/quelle-3',
    });
    expect(a.aufhaenger.hypothese).toBeTruthy();
    expect(a.aufhaenger.gespraechsziel).toBeTruthy();
    expect(a.nachricht).toMatchObject({ betreff: 'Kundenportal Netzanschlüsse 2027', fassung: 'agent' });
    expect(a.nachricht.text).toMatch(/^Hallo Frau Gruber, im Geschäftsbericht/);
    expect(a.nachricht.text.trim().match(/\S+/g)).toHaveLength(50);
  });

  it('E5-S1 #7 Bernasconi: Anlass ist als »kein_anlass« gekennzeichnet', async () => {
    ({ app } = await neueApp());
    const a = (await ansprache(app, 4)).json();
    expect(a.aufhaenger.typ).toBe('kein_anlass');
  });

  it('Modus je Status: Reinhardt nachfassen, Albers keine; unbekannt 404; Agent 403', async () => {
    ({ app } = await neueApp());
    expect((await ansprache(app, 2)).json().modus).toBe('nachfassen');
    expect((await ansprache(app, 1)).json().modus).toBe('keine');
    expect((await ansprache(app, 999)).statusCode).toBe(404);
    expect((await ansprache(app, 'x')).statusCode).toBe(404);
    const r = await app.inject({ method: 'GET', url: '/api/v1/kontakte/3/ansprache', headers: AGENT });
    expect(r.statusCode).toBe(403);
  });
});
