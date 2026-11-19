import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp } from '../hilfen';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

async function liste(a: FastifyInstance, status?: string) {
  const kopf = await alsMarco(a);
  const url = '/api/v1/kontakte' + (status ? `?status=${status}` : '');
  return a.inject({ method: 'GET', url, headers: kopf });
}
const namen = (rows: { nachname: string }[]) => rows.map((r) => r.nachname);

describe('E4-S2 Kontaktliste mit Statusfilter', () => {
  it('E4-S2 #1 ohne Filter gilt »Offene«: fünf Kontakte mit Funktion, Firma und Status, ohne Ostermann und Wiesner', async () => {
    ({ app } = await neueApp());
    const r = await liste(app);
    expect(r.statusCode).toBe(200);
    expect(namen(r.json()).sort()).toEqual(['Albers', 'Bernasconi', 'Gruber', 'Hollenstein', 'Reinhardt']);
    const zeile = (n: string) => r.json().find((k: { nachname: string }) => k.nachname === n);
    expect(zeile('Albers')).toMatchObject({
      funktion: 'Leiterin Customer Service & After-Sales',
      firma_name: 'Nordwerk Fördertechnik GmbH',
      status: 'gespraech_vereinbart',
    });
    expect(zeile('Reinhardt')).toMatchObject({ firma_name: 'Hansemarkt Handels SE', status: 'angeschrieben' });
    expect(zeile('Gruber')).toMatchObject({ funktion: 'Chief Digital Officer', status: 'freigegeben' });
    expect(zeile('Bernasconi')).toMatchObject({ status: 'nachgefasst' });
    expect(namen((await liste(app, 'offene')).json()).sort()).toEqual(namen(r.json()).sort());
  });

  it('E4-S2 #2 Filter »Ohne Antwort geschlossen« zeigt Markus Ostermann', async () => {
    ({ app } = await neueApp());
    const r = (await liste(app, 'ohne_antwort_geschlossen')).json();
    expect(r).toHaveLength(1);
    expect([r[0].vorname, r[0].nachname]).toEqual(['Markus', 'Ostermann']);
  });

  it('E4-S2 #3 Filter »Alle« zeigt alle sieben Kontakte', async () => {
    ({ app } = await neueApp());
    expect((await liste(app, 'alle')).json()).toHaveLength(7);
  });

  it('E4-S2 #4 Hollenstein hat Status antwort_erhalten mit Einordnung neutral_spaeter', async () => {
    ({ app } = await neueApp());
    const h = (await liste(app, 'alle')).json().find((k: { nachname: string }) => k.nachname === 'Hollenstein');
    expect([h.status, h.antwort_art]).toEqual(['antwort_erhalten', 'neutral_spaeter']);
  });

  it('E4-S2 #5 ein Filter ohne Treffer liefert eine leere Liste', async () => {
    ({ app } = await neueApp());
    const r = await liste(app, 'gesperrt');
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual([]);
  });

  it('unbekannter Filter: 400 filter_ungueltig; Agenten-Schlüssel: 403', async () => {
    ({ app } = await neueApp());
    const r = await liste(app, 'irgendwas');
    expect(r.statusCode).toBe(400);
    expect(r.json().fehler.code).toBe('filter_ungueltig');
    const a = await app.inject({ method: 'GET', url: '/api/v1/kontakte', headers: AGENT });
    expect(a.statusCode).toBe(403);
  });
});
