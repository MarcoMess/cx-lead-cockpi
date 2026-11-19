import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'node:fs';
import { AGENT, alsMarco, neueApp } from '../hilfen';
import type { Datenbank } from '../../src/server/daten/db';

const BEISPIEL = JSON.parse(readFileSync('src/simulator/beispiel-lauf.json', 'utf8'));
const kortmann = () =>
  JSON.parse(
    JSON.stringify(
      BEISPIEL.vorschlaege.find((v: { person: { nachname: string } }) => v.person.nachname === 'Kortmann'),
    ),
  );

let app: FastifyInstance | undefined;
let db: Datenbank;
afterEach(async () => app?.close());

async function lauf(vorschlaege: unknown[]) {
  ({ app, db } = await neueApp());
  const kopf = await alsMarco(app);
  await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-19' } });
  const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: { vorschlaege } });
  const detail = (await app.inject({ method: 'GET', url: `/api/v1/laeufe/${r.json().lauf_id}`, headers: kopf })).json();
  const frei = (id: number) =>
    app!.inject({ method: 'POST', url: `/api/v1/vorschlaege/${id}/freigabe`, headers: kopf });
  return { karten: detail.vorschlaege, frei };
}

describe('E3-S2 Pflichtangaben vor der Freigabe', () => {
  it('E3-S2 #3 #7 fehlende Angaben: Hinweis in der Karte und 422 bei der Freigabe, nichts angelegt', async () => {
    const a = kortmann();
    a.firma.umsatz_quelle_url = null;
    a.nachricht.text = '';
    const { karten, frei } = await lauf([a]);
    expect(karten[0].fehlende_pflichtangaben).toEqual(['Umsatzquelle fehlt', 'Nachricht fehlt']);
    const r = await frei(karten[0].id);
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler).toMatchObject({
      code: 'pflichtangabe_fehlt',
      meldung: 'Freigeben geht noch nicht: Umsatzquelle fehlt; Nachricht fehlt.',
    });
    expect(db.prepare(`SELECT COUNT(*) n FROM ansprechpartner`).get()).toEqual({ n: 7 });
  });

  it('E3-S2 #4 Mindestumsatz kommt aus dem Profil', async () => {
    const a = kortmann();
    a.firma.umsatz_wert = 40;
    const { karten, frei } = await lauf([a]);
    expect(karten[0].fehlende_pflichtangaben).toEqual(['unter Mindestumsatz (40 Mio. EUR, mindestens 50 Mio. EUR)']);
    expect((await frei(karten[0].id)).statusCode).toBe(422);
    db.prepare(`UPDATE rechercheprofil SET mindestumsatz_mio_eur = 30`).run();
    expect((await frei(karten[0].id)).statusCode).toBe(200);
  });

  it('E3-S2 #5 Ammann in CHF ist mit Gegenwert freigebbar', async () => {
    const { karten, frei } = await lauf(BEISPIEL.vorschlaege);
    const ammann = karten.find(
      (k: { daten: { person: { nachname: string } } }) => k.daten.person.nachname === 'Ammann',
    );
    expect(ammann.fehlende_pflichtangaben).toEqual([]);
    expect((await frei(ammann.id)).statusCode).toBe(200);
  });
});
