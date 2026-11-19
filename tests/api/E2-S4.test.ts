import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'node:fs';
import { AGENT, alsMarco, neueApp } from '../hilfen';
import type { Datenbank } from '../../src/server/daten/db';

const BEISPIEL = JSON.parse(readFileSync('src/simulator/beispiel-lauf.json', 'utf8'));
type V = (typeof BEISPIEL.vorschlaege)[number];
const kopie = (): V[] => JSON.parse(JSON.stringify(BEISPIEL.vorschlaege));
const nach = (vs: V[], n: string) => vs.find((v) => v.person.nachname === n)!;

let app: FastifyInstance | undefined;
let db: Datenbank;
afterEach(async () => app?.close());

/** Legt am 19.11.2026 einen Lauf mit den gegebenen Vorschlägen an und liefert die Karten. */
async function lauf(vorschlaege: V[], vorher?: (db: Datenbank) => void) {
  ({ app, db } = await neueApp());
  vorher?.(db);
  const kopf = await alsMarco(app);
  await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-19' } });
  const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: { vorschlaege } });
  expect(r.statusCode).toBe(201);
  const detail = (await app.inject({ method: 'GET', url: `/api/v1/laeufe/${r.json().lauf_id}`, headers: kopf })).json();
  const karte = (n: string) => detail.vorschlaege.find((v: V) => v.daten.person.nachname === n);
  const frei = (n: string) =>
    app!.inject({ method: 'POST', url: `/api/v1/vorschlaege/${karte(n).id}/freigabe`, headers: kopf });
  return { karte, frei };
}

describe('E2-S4 Dubletten und Wiederansprache erkennen', () => {
  it('E2-S4 #1 Albers ist im Bestand: Vorschlag als Dublette markiert, Freigabe verweigert', async () => {
    const { karte, frei } = await lauf(kopie());
    expect(karte('Albers')).toMatchObject({
      ist_dublette: true,
      ist_wiederansprache: false,
      bezug: { id: 1, name: 'Dr. Katrin Albers', status: 'gespraech_vereinbart' },
    });
    const r = await frei('Albers');
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler.code).toBe('dublette');
    expect(karte('Kortmann').ist_dublette).toBe(false);
  });

  it('E2-S4 #2 »nordwerk fördertechnik« ohne Rechtsform wird der bestehenden Firma zugeordnet', async () => {
    const vs = kopie();
    const v = nach(vs, 'Kortmann');
    v.firma.name = 'nordwerk fördertechnik';
    const { karte, frei } = await lauf([v]);
    expect(karte('Kortmann').bestehende_firma).toEqual({ id: 1, name: 'Nordwerk Fördertechnik GmbH' });
    const r = await frei('Kortmann');
    expect(r.statusCode).toBe(200);
    expect(r.json().firma_id).toBe(1);
    expect(db.prepare(`SELECT COUNT(*) n FROM firma`).get()).toEqual({ n: 7 });
  });

  it('E2-S4 #3 anderer Name, aber dieselbe LinkedIn-URL: Dublette', async () => {
    const v = nach(kopie(), 'Kortmann');
    v.person.vorname = 'Anna';
    v.person.nachname = 'Andersname';
    v.person.linkedin_url = 'https://www.linkedin.com/in/simone-gruber-beispiel/';
    const { karte } = await lauf([v]);
    expect(karte('Andersname')).toMatchObject({ ist_dublette: true, bezug: { name: 'Simone Gruber' } });
  });

  it('E2-S4 #4 Voss bei Hansemarkt (Reinhardt »Angeschrieben«): freigebbar mit Hinweis', async () => {
    const { karte, frei } = await lauf(kopie());
    expect(karte('Voss')).toMatchObject({
      ist_dublette: false,
      hinweis_zweiter_ansprechpartner:
        'Zweiter Ansprechpartner, dort läuft eine Ansprache (Tobias Reinhardt, Angeschrieben)',
      bestehende_firma: { name: 'Hansemarkt Handels SE' },
    });
    expect((await frei('Voss')).statusCode).toBe(200);
  });

  it('E2-S4 #5 einziger Kontakt »Freigegeben« oder »Gespräch vereinbart«: kein Hinweis', async () => {
    const vs = kopie();
    const a = nach(vs, 'Kortmann');
    a.firma.name = 'Alpenstrom Netze AG'; // Gruber: Freigegeben
    const b = nach(vs, 'Voss');
    b.firma.name = 'Nordwerk Fördertechnik GmbH'; // Albers: Gespräch vereinbart
    const { karte } = await lauf([a, b]);
    expect(karte('Kortmann')).toMatchObject({
      hinweis_zweiter_ansprechpartner: null,
      bestehende_firma: { name: 'Alpenstrom Netze AG' },
    });
    expect(karte('Voss')).toMatchObject({ hinweis_zweiter_ansprechpartner: null, bestehende_firma: { id: 1 } });
  });

  it('E2-S4 #6 Ostermann vor mehr als 6 Monaten geschlossen, neuer Anlass: Wiederansprache, keine Dublette', async () => {
    const v = nach(kopie(), 'Kortmann');
    v.firma.name = 'Weserland Entsorgung GmbH';
    v.person.vorname = 'Markus';
    v.person.nachname = 'Ostermann';
    v.person.linkedin_url = null;
    const { karte, frei } = await lauf([v], (d) =>
      d.prepare(`UPDATE ansprechpartner SET geschlossen_am = '2026-05-18' WHERE id = 5`).run(),
    );
    expect(karte('Ostermann')).toMatchObject({
      ist_dublette: false,
      ist_wiederansprache: true,
      bezug: { id: 5, status: 'ohne_antwort_geschlossen', geschlossen_am: '2026-05-18' },
    });
    const r = await frei('Ostermann');
    expect(r.statusCode).toBe(200);
    expect(r.json()).toMatchObject({ ansprechpartner_id: 5, wiederansprache: true });
  });

  it('E2-S4 #6 Gegenprobe: innerhalb der 6 Monate oder ohne neuen Anlass bleibt es eine Dublette', async () => {
    const basis = () => {
      const v = nach(kopie(), 'Kortmann');
      v.firma.name = 'Weserland Entsorgung GmbH';
      v.person.vorname = 'Markus';
      v.person.nachname = 'Ostermann';
      v.person.linkedin_url = null;
      return v;
    };
    // Geschlossen am 09.11.2026 laut Startdaten: Sperre bis 09.05.2027.
    const a = await lauf([basis()]);
    expect(a.karte('Ostermann')).toMatchObject({ ist_dublette: true, ist_wiederansprache: false });
    await app!.close();
    const ohneAnlass = basis();
    ohneAnlass.anlass = { typ: 'kein_anlass', beschreibung: null };
    const b = await lauf([ohneAnlass], (d) =>
      d.prepare(`UPDATE ansprechpartner SET geschlossen_am = '2026-01-10' WHERE id = 5`).run(),
    );
    expect(b.karte('Ostermann')).toMatchObject({ ist_dublette: true, ist_wiederansprache: false });
  });

  it('Prüfung E2-S4 Befund 1: dieselbe Person in zwei offenen Läufen wird nur einmal angelegt', async () => {
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    const v = nach(kopie(), 'Kortmann');
    v.person.linkedin_url = null;
    const laeufe: number[] = [];
    for (const heute of ['2026-11-19', '2026-11-20']) {
      await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute } });
      const r = await app.inject({
        method: 'POST',
        url: '/api/v1/agent/laeufe',
        headers: AGENT,
        payload: { vorschlaege: [v] },
      });
      laeufe.push(r.json().lauf_id);
    }
    const karte = async (lauf: number) =>
      (await app!.inject({ method: 'GET', url: `/api/v1/laeufe/${lauf}`, headers: kopf })).json().vorschlaege[0];
    const k1 = await karte(laeufe[0]);
    expect(
      (await app.inject({ method: 'POST', url: `/api/v1/vorschlaege/${k1.id}/freigabe`, headers: kopf })).statusCode,
    ).toBe(200);
    const k2 = await karte(laeufe[1]);
    expect(k2).toMatchObject({ ist_dublette: true, bezug: { name: 'Sabine Kortmann' } });
    const r = await app.inject({ method: 'POST', url: `/api/v1/vorschlaege/${k2.id}/freigabe`, headers: kopf });
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler.code).toBe('dublette');
    expect(db.prepare(`SELECT COUNT(*) n FROM ansprechpartner WHERE nachname = 'Kortmann'`).get()).toEqual({ n: 1 });
  });

  it('Prüfung E2-S4 Befund 1: dieselbe Person zweimal im selben Lauf, LinkedIn mit www. und Schrägstrich', async () => {
    const a = nach(kopie(), 'Voss');
    const b = nach(kopie(), 'Voss');
    b.person.linkedin_url = 'https://www.linkedin.com/in/miriam-voss-beispiel/';
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-19' } });
    const lauf = (
      await app.inject({
        method: 'POST',
        url: '/api/v1/agent/laeufe',
        headers: AGENT,
        payload: { vorschlaege: [a, b] },
      })
    ).json();
    const karten = async () =>
      (await app!.inject({ method: 'GET', url: `/api/v1/laeufe/${lauf.lauf_id}`, headers: kopf })).json().vorschlaege;
    const [k1, k2] = await karten();
    expect(
      (await app.inject({ method: 'POST', url: `/api/v1/vorschlaege/${k1.id}/freigabe`, headers: kopf })).statusCode,
    ).toBe(200);
    expect((await karten())[1].ist_dublette).toBe(true);
    expect(
      (await app.inject({ method: 'POST', url: `/api/v1/vorschlaege/${k2.id}/freigabe`, headers: kopf })).statusCode,
    ).toBe(422);
    expect(db.prepare(`SELECT COUNT(*) n FROM ansprechpartner WHERE nachname = 'Voss'`).get()).toEqual({ n: 1 });
  });

  it('Prüfung E2-S4 Sollte: Firma über die Domain; gleicher alter Anlass ist keine Wiederansprache', async () => {
    const v = nach(kopie(), 'Kortmann');
    v.firma.name = 'Nordwerk Gruppe';
    v.firma.domain = 'https://www.nordwerk-foerdertechnik.example/';
    const { karte } = await lauf([v], (d) =>
      d.prepare(`UPDATE firma SET domain = 'nordwerk-foerdertechnik.example' WHERE id = 1`).run(),
    );
    expect(karte('Kortmann').bestehende_firma).toEqual({ id: 1, name: 'Nordwerk Fördertechnik GmbH' });
    await app!.close();

    const o = nach(kopie(), 'Kortmann');
    o.firma.name = 'Weserland Entsorgung GmbH';
    o.person.vorname = 'Markus';
    o.person.nachname = 'Ostermann';
    o.person.linkedin_url = null;
    const alt = await lauf([o], (d) => {
      d.prepare(`UPDATE ansprechpartner SET geschlossen_am = '2026-05-18' WHERE id = 5`).run();
      const b = 'Neue Sortieranlage in Bremen angekündigt';
      d.prepare(
        `INSERT INTO anlass (ansprechpartner_id, typ, beschreibung, erstellt_am) VALUES (5, 'unternehmensanlass', ?, '2026-04-01')`,
      ).run(b);
      o.anlass = { ...o.anlass, typ: 'unternehmensanlass', beschreibung: `  ${b.toUpperCase()} ` };
    });
    expect(alt.karte('Ostermann')).toMatchObject({ ist_dublette: true, ist_wiederansprache: false });
  });
});
