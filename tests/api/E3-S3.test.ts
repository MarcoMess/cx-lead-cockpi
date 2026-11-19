import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp, zahl } from '../hilfen';
import type { Datenbank } from '../../src/server/daten/db';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

async function laufVom19(a: FastifyInstance) {
  const kopf = await alsMarco(a);
  await a.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-19' } });
  const r = await a.inject({ method: 'POST', url: '/api/v1/sim/agent/meldung', headers: kopf });
  const lauf = (await a.inject({ method: 'GET', url: `/api/v1/laeufe/${r.json().lauf_id}`, headers: kopf })).json();
  const id = (nachname: string) =>
    lauf.vorschlaege.find((v: { daten: { person: { nachname: string } } }) => v.daten.person.nachname === nachname)
      .id as number;
  return { kopf, laufId: r.json().lauf_id as number, id };
}

const frei = (a: FastifyInstance, kopf: { cookie: string }, id: number) =>
  a.inject({ method: 'POST', url: `/api/v1/vorschlaege/${id}/freigabe`, headers: kopf });

describe('E3-S3 Vorschlag freigeben', () => {
  it('E3-S3 #1 Kortmann: Firma Kranbau Oberhavel und Ansprechpartnerin im Status »Freigegeben«', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const { kopf, id } = await laufVom19(app);
    const r = await frei(app, kopf, id('Kortmann'));
    expect(r.statusCode).toBe(200);
    expect(
      db
        .prepare(
          `SELECT name, branche, land, umsatz_wert, umsatz_waehrung, umsatz_jahr, umsatz_bezug FROM firma WHERE id = ?`,
        )
        .get(r.json().firma_id),
    ).toEqual({
      name: 'Kranbau Oberhavel GmbH',
      branche: 'Maschinenbau',
      land: 'DE',
      umsatz_wert: 121,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'konzern',
    });
    expect(
      db
        .prepare(`SELECT vorname, nachname, funktion, status, firma_id FROM ansprechpartner WHERE id = ?`)
        .get(r.json().ansprechpartner_id),
    ).toEqual({
      vorname: 'Sabine',
      nachname: 'Kortmann',
      funktion: 'Leiterin After-Sales Service',
      status: 'freigegeben',
      firma_id: r.json().firma_id,
    });
  });

  it('E3-S3 #2 Anlass, Hypothese, Gesprächsziel, Betreff und Nachricht hängen am neuen Kontakt', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const { kopf, id } = await laufVom19(app);
    const ap = (await frei(app, kopf, id('Kortmann'))).json().ansprechpartner_id;
    expect(
      db
        .prepare(
          `SELECT typ, beschreibung, ereignis_datum, hypothese, gespraechsziel FROM anlass WHERE ansprechpartner_id = ?`,
        )
        .get(ap),
    ).toEqual({
      typ: 'unternehmensanlass',
      beschreibung: 'Pressemitteilung: Kundenportal für Ersatzteile angekündigt',
      ereignis_datum: '2026-11-12',
      hypothese: 'Ein Ersatzteilportal verändert vermutlich Anfrage- und Serviceabläufe im After-Sales.',
      gespraechsziel: 'Einordnen, welche Serviceabläufe mitwachsen sollten.',
    });
    const n = db
      .prepare(`SELECT kanal, art, betreff, text, fassung FROM nachricht WHERE ansprechpartner_id = ?`)
      .get(ap) as Record<string, string>;
    expect(n).toMatchObject({
      kanal: 'linkedin',
      art: 'erstkontakt',
      betreff: 'Ersatzteilportal und Serviceprozesse',
      fassung: 'agent',
    });
    expect(n.text).toMatch(/^Hallo Frau Kortmann, Kranbau Oberhavel/);
  });

  it('E3-S3 #3 Voss wird der bestehenden Firma Hansemarkt Handels SE zugeordnet, keine zweite Firma', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const { kopf, id } = await laufVom19(app);
    const r = await frei(app, kopf, id('Voss'));
    expect(r.json().firma_id).toBe(4);
    expect(zahl(db, `SELECT COUNT(*) n FROM firma WHERE name_norm = 'hansemarkt handels'`)).toBe(1);
    expect(zahl(db, 'SELECT COUNT(*) n FROM firma')).toBe(7);
    expect(db.prepare(`SELECT firma_id FROM ansprechpartner WHERE nachname = 'Voss'`).get()).toEqual({ firma_id: 4 });
  });

  it('E3-S3 #4 nach der Freigabe: Zustand »freigegeben«, Freigaben des Laufs +1, keine zweite Freigabe', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const { kopf, id, laufId } = await laufVom19(app);
    await frei(app, kopf, id('Kortmann'));
    const lauf = (await app.inject({ method: 'GET', url: `/api/v1/laeufe/${laufId}`, headers: kopf })).json();
    expect(lauf).toMatchObject({ anzahl_freigegeben: 1, offen: 3 });
    expect(lauf.vorschlaege.find((v: { id: number }) => v.id === id('Kortmann')).zustand).toBe('freigegeben');
    const zweite = await frei(app, kopf, id('Kortmann'));
    expect(zweite.statusCode).toBe(409);
    expect(zweite.json().fehler.code).toBe('schon_geprueft');
    expect(zahl(db, `SELECT COUNT(*) n FROM ansprechpartner WHERE nachname = 'Kortmann'`)).toBe(1);
    expect((await frei(app, kopf, 9999)).statusCode).toBe(404);
  });

  it('E3-S3 #5 Wiederansprache Ostermann öffnet den bestehenden Kontakt mit Verlauf, ohne zweiten Kontakt', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    await app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2027-06-01' } });
    const lauf = await app.inject({
      method: 'POST',
      url: '/api/v1/agent/laeufe',
      headers: AGENT,
      payload: {
        abdeckungsgrenzen: null,
        vorschlaege: [
          {
            firma: {
              name: 'Weserland Entsorgung GmbH',
              branche: 'Entsorgung',
              land: 'DE',
              umsatz_wert: 74,
              umsatz_waehrung: 'EUR',
              umsatz_jahr: 2026,
              umsatz_bezug: 'einzelgesellschaft',
              umsatz_quelle_url: 'https://example.com/gb-weserland',
            },
            person: {
              anrede: 'Herr',
              vorname: 'Markus',
              nachname: 'Ostermann',
              funktion: 'Leiter Service',
              rolle: 'Service/After-Sales',
              quelle_url: 'https://example.com/team-markus-ostermann',
            },
            anlass: {
              typ: 'unternehmensanlass',
              beschreibung: 'Pressemitteilung: neue Serviceapp für Entsorgungsaufträge',
              ereignis_datum: '2027-05-20',
              quelle_url: 'https://example.com/quelle-weserland',
              hypothese: 'H',
              gespraechsziel: 'Z',
            },
            nachricht: {
              betreff: 'Serviceapp und Aufträge',
              text: 'Hallo Herr Ostermann, neue Nachricht.',
              sprache: 'de',
            },
          },
        ],
      },
    });
    const vid = (
      db.prepare(`SELECT id FROM vorschlag WHERE recherchelauf_id = ?`).get(lauf.json().lauf_id) as { id: number }
    ).id;
    // Die Kennzeichnung als Wiederansprache setzt die Dublettenprüfung (E2-S4); hier wird sie vorgegeben.
    db.prepare(`UPDATE vorschlag SET ist_wiederansprache = 1, bezug_ansprechpartner_id = 5 WHERE id = ?`).run(vid);

    const r = await frei(app, kopf, vid);
    expect(r.json()).toEqual({ ansprechpartner_id: 5, firma_id: null, wiederansprache: true });
    expect(db.prepare(`SELECT status, geschlossen_am FROM ansprechpartner WHERE id = 5`).get()).toEqual({
      status: 'freigegeben',
      geschlossen_am: null,
    });
    expect(db.prepare(`SELECT kanal, zeitpunkt FROM kontaktversuch WHERE ansprechpartner_id = 5`).all()).toEqual([
      { kanal: 'inmail', zeitpunkt: '2026-10-19 08:10' },
    ]);
    expect(db.prepare(`SELECT beschreibung, erstellt_am FROM anlass WHERE ansprechpartner_id = 5`).all()).toEqual([
      { beschreibung: 'Pressemitteilung: neue Serviceapp für Entsorgungsaufträge', erstellt_am: '2027-06-01' },
    ]);
    expect(db.prepare(`SELECT betreff FROM nachricht WHERE ansprechpartner_id = 5`).get()).toEqual({
      betreff: 'Serviceapp und Aufträge',
    });
    expect(zahl(db, `SELECT COUNT(*) n FROM ansprechpartner WHERE nachname = 'Ostermann'`)).toBe(1);
    expect(zahl(db, 'SELECT COUNT(*) n FROM firma')).toBe(7);
  });

  it('E3-S3 fehlt eine Pflichtangabe der Firma, wird nichts angelegt (422)', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const kopf = await alsMarco(app);
    await app.inject({
      method: 'POST',
      url: '/api/v1/agent/laeufe',
      headers: AGENT,
      payload: {
        vorschlaege: [
          {
            firma: { name: 'Ohne Branche GmbH' },
            person: {
              anrede: 'Frau',
              vorname: 'Ida',
              nachname: 'Test',
              funktion: 'CIO',
              rolle: 'CIO/IT-Leitung',
              quelle_url: 'https://example.com',
            },
          },
        ],
      },
    });
    const vid = (db.prepare(`SELECT id FROM vorschlag ORDER BY id DESC`).get() as { id: number }).id;
    const r = await frei(app, kopf, vid);
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler.code).toBe('pflichtangabe_fehlt');
    expect(zahl(db, 'SELECT COUNT(*) n FROM firma')).toBe(7);
    expect(zahl(db, `SELECT COUNT(*) n FROM vorschlag WHERE id = ${vid} AND zustand = 'zu_pruefen'`)).toBe(1);
  });

  it('Prüfung E3-S3 Befund 1: Albers mit bekanntem LinkedIn-Profil → 409 person_bekannt, nichts angelegt', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const { kopf, id } = await laufVom19(app);
    const vorher = zahl(db, 'SELECT COUNT(*) n FROM ansprechpartner');
    // Seit E2-S4 ist Albers schon beim Anlegen als Dublette markiert.
    const r = await frei(app, kopf, id('Albers'));
    expect(r.statusCode).toBe(409);
    expect(r.json().fehler.code).toBe('dublette');
    // Der Schutz über das LinkedIn-Profil greift weiter, falls ein Vorschlag ohne Kennzeichnung angelegt wurde.
    // Albers kommt ohne Nachricht; für diese Probe bekommt sie eine, damit die Pflichtangaben (E3-S2) nicht vorher greifen.
    db.prepare(
      `UPDATE vorschlag SET ist_dublette = 0,
         daten = json_set(daten, '$.nachricht', json_object('betreff', 'B', 'text', 'T')) WHERE id = ?`,
    ).run(id('Albers'));
    const r2 = await frei(app, kopf, id('Albers'));
    expect(r2.json().fehler.code).toBe('person_bekannt');
    expect(r2.json().fehler.meldung).toContain('Katrin Albers');
    expect(zahl(db, 'SELECT COUNT(*) n FROM ansprechpartner')).toBe(vorher);
    expect(zahl(db, `SELECT COUNT(*) n FROM vorschlag WHERE id = ${id('Albers')} AND zustand = 'zu_pruefen'`)).toBe(1);
  });

  it('Prüfung E3-S3 Befund 2: Wiederansprache von Wiesner (Kein Interesse) → 409, Status bleibt', async () => {
    let db: Datenbank;
    ({ app, db } = await neueApp());
    const { kopf, id } = await laufVom19(app);
    db.prepare(`UPDATE vorschlag SET ist_wiederansprache = 1, bezug_ansprechpartner_id = 6 WHERE id = ?`).run(
      id('Kortmann'),
    );
    const r = await frei(app, kopf, id('Kortmann'));
    expect(r.statusCode).toBe(409);
    expect(r.json().fehler.code).toBe('wiederansprache_nicht_erlaubt');
    expect(db.prepare(`SELECT nachname, status FROM ansprechpartner WHERE id = 6`).get()).toEqual({
      nachname: 'Wiesner',
      status: 'kein_interesse',
    });
    db.prepare(`UPDATE vorschlag SET bezug_ansprechpartner_id = NULL WHERE id = ?`).run(id('Kortmann'));
    expect((await frei(app, kopf, id('Kortmann'))).statusCode).toBe(409);
  });
});
