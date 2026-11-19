import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'node:fs';
import { AGENT, alsMarco, neueApp, zahl } from '../hilfen';

const BEISPIEL = JSON.parse(readFileSync('src/simulator/beispiel-lauf.json', 'utf8'));
const kopie = () => JSON.parse(JSON.stringify(BEISPIEL));

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

async function aufDen19(a: FastifyInstance) {
  await a.inject({
    method: 'POST',
    url: '/api/v1/sim/datum',
    headers: await alsMarco(a),
    payload: { heute: '2026-11-19' },
  });
}

describe('E2-S3 Recherchelauf anlegen', () => {
  it('E2-S3 #1 Lauf vom 19.11.2026 mit vier Vorschlägen im Zustand »Zu prüfen«', async () => {
    let db;
    ({ app, db } = await neueApp());
    await aufDen19(app);
    const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: BEISPIEL });
    expect(r.statusCode).toBe(201);
    expect(r.json()).toMatchObject({ angelegt: 4, zurueckgewiesen: [] });
    const lauf = db.prepare(`SELECT * FROM recherchelauf WHERE id = ?`).get(r.json().lauf_id) as Record<
      string,
      unknown
    >;
    expect(lauf).toMatchObject({
      datum: '2026-11-19',
      ergebnis: 'ausgefuehrt',
      anzahl_vorschlaege: 4,
      anzahl_freigegeben: 0,
      herkunft: 'api',
    });
    const v = db
      .prepare(`SELECT zustand, daten FROM vorschlag WHERE recherchelauf_id = ? ORDER BY id`)
      .all(r.json().lauf_id) as { zustand: string; daten: string }[];
    expect(v.map((x) => x.zustand)).toEqual(['zu_pruefen', 'zu_pruefen', 'zu_pruefen', 'zu_pruefen']);
    expect(v.map((x) => JSON.parse(x.daten).person.nachname)).toEqual(['Kortmann', 'Voss', 'Albers', 'Ammann']);
  });

  it('E2-S3 #2 je Vorschlag sind Firma, Ansprechpartner, Anlass und Nachricht gespeichert', async () => {
    let db;
    ({ app, db } = await neueApp());
    await aufDen19(app);
    const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: BEISPIEL });
    const daten = (
      db.prepare(`SELECT daten FROM vorschlag WHERE recherchelauf_id = ? ORDER BY id`).all(r.json().lauf_id) as {
        daten: string;
      }[]
    ).map((x) => JSON.parse(x.daten));
    expect(daten[0].firma).toMatchObject({
      name: 'Kranbau Oberhavel GmbH',
      branche: 'Maschinenbau',
      land: 'DE',
      umsatz_wert: 121,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'konzern',
      umsatz_quelle_url: 'https://example.com/geschaeftsbericht-kranbau-oberhavel',
    });
    expect(daten[0].person).toMatchObject({
      anrede: 'Frau',
      vorname: 'Sabine',
      nachname: 'Kortmann',
      funktion: 'Leiterin After-Sales Service',
      quelle_url: 'https://example.com/team-sabine-kortmann',
      linkedin_url: 'linkedin.com/in/sabine-kortmann-beispiel',
    });
    expect(daten[0].anlass).toMatchObject({
      typ: 'unternehmensanlass',
      beschreibung: 'Pressemitteilung: Kundenportal für Ersatzteile angekündigt',
      ereignis_datum: '2026-11-12',
      quelle_url: 'https://example.com/quelle-kranbau-ersatzteilportal',
      hypothese: 'Ein Ersatzteilportal verändert vermutlich Anfrage- und Serviceabläufe im After-Sales.',
      gespraechsziel: 'Einordnen, welche Serviceabläufe mitwachsen sollten.',
    });
    expect(daten[0].nachricht.betreff).toBe('Ersatzteilportal und Serviceprozesse');
    expect(daten[0].nachricht.text).toMatch(/^Hallo Frau Kortmann, Kranbau Oberhavel/);
    // Fremdwährung: Kurs mit Quelle und Gegenwert in EUR; LinkedIn-URL leer.
    expect(daten[3].firma).toMatchObject({
      umsatz_wert: 88,
      umsatz_waehrung: 'CHF',
      wechselkurs: 1.06,
      wechselkurs_quelle_url: 'https://example.com/wechselkurs-chf-eur',
      umsatz_eur: 93.3,
    });
    expect(daten[3].person.linkedin_url).toBeNull();
  });

  it('E2-S3 #3 die Abdeckungsgrenze des Agenten steht am Lauf', async () => {
    let db;
    ({ app, db } = await neueApp());
    await aufDen19(app);
    const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: BEISPIEL });
    expect(db.prepare(`SELECT abdeckungsgrenzen a FROM recherchelauf WHERE id = ?`).get(r.json().lauf_id)).toEqual({
      a: 'Nur 4 belegte Treffer statt 10, Lücke benannt; 1 Profil ohne verifizierte URL',
    });
  });

  it('E2-S3 #4 Vorschlag ohne Personenname oder Firmenname wird mit dem fehlenden Feld zurückgewiesen, die übrigen angelegt', async () => {
    let db;
    ({ app, db } = await neueApp());
    await aufDen19(app);
    const lauf = kopie();
    delete lauf.vorschlaege[1].person.nachname;
    lauf.vorschlaege[3].firma.name = '';
    const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: lauf });
    expect(r.statusCode).toBe(201);
    expect(r.json().angelegt).toBe(2);
    expect(r.json().zurueckgewiesen).toEqual([
      { index: 1, feld: 'person.nachname', meldung: 'Das Feld »person.nachname« fehlt.' },
      { index: 3, feld: 'firma.name', meldung: 'Der Firmenname fehlt.' },
    ]);
    const namen = (
      db.prepare(`SELECT daten FROM vorschlag WHERE recherchelauf_id = ? ORDER BY id`).all(r.json().lauf_id) as {
        daten: string;
      }[]
    ).map((x) => JSON.parse(x.daten).person.nachname);
    expect(namen).toEqual(['Kortmann', 'Albers']);
    expect(db.prepare(`SELECT anzahl_vorschlaege n FROM recherchelauf WHERE id = ?`).get(r.json().lauf_id)).toEqual({
      n: 2,
    });
  });

  it('E2-S3 #5 der Agent kann über diesen Weg weder freigeben noch Bestand ändern', async () => {
    let db;
    ({ app, db } = await neueApp());
    await aufDen19(app);
    const lauf = kopie();
    lauf.vorschlaege[2].zustand = 'freigegeben';
    lauf.vorschlaege[2].id = 1;
    lauf.vorschlaege[2].firma.umsatz_wert = 1;
    lauf.vorschlaege[2].ansprechpartner_id = 1;
    const vorher = db.prepare(`SELECT * FROM firma WHERE id = 1`).get();
    const r = await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: lauf });
    expect(r.statusCode).toBe(201);
    expect(zahl(db, `SELECT COUNT(*) n FROM vorschlag WHERE zustand <> 'zu_pruefen'`)).toBe(0);
    expect(zahl(db, `SELECT COUNT(*) n FROM vorschlag WHERE ansprechpartner_id IS NOT NULL`)).toBe(0);
    expect(db.prepare(`SELECT * FROM firma WHERE id = 1`).get()).toEqual(vorher);
    expect(zahl(db, 'SELECT COUNT(*) n FROM firma')).toBe(7);
    expect(zahl(db, 'SELECT COUNT(*) n FROM ansprechpartner')).toBe(7);
    const gespeichert = JSON.parse(
      (
        db.prepare(`SELECT daten FROM vorschlag WHERE recherchelauf_id = ? ORDER BY id`).all(r.json().lauf_id)[2] as {
          daten: string;
        }
      ).daten,
    );
    expect(gespeichert.zustand).toBeUndefined();
    expect(gespeichert.id).toBeUndefined();
  });

  it('E2-S3 ein zweiter Lauf am selben Tag wird abgelehnt, ein Lauf ohne Liste ist ungültig', async () => {
    ({ app } = await neueApp());
    await aufDen19(app);
    expect(
      (await app.inject({ method: 'POST', url: '/api/v1/agent/laeufe', headers: AGENT, payload: BEISPIEL })).statusCode,
    ).toBe(201);
    const zweiter = await app.inject({
      method: 'POST',
      url: '/api/v1/agent/laeufe',
      headers: AGENT,
      payload: BEISPIEL,
    });
    expect(zweiter.statusCode).toBe(409);
    expect(zweiter.json().fehler.code).toBe('bereits_gelaufen');
    const ohne = await app.inject({
      method: 'POST',
      url: '/api/v1/agent/laeufe',
      headers: AGENT,
      payload: { abdeckungsgrenzen: 'x' },
    });
    expect(ohne.statusCode).toBe(400);
    const mitSitzung = await app.inject({
      method: 'POST',
      url: '/api/v1/agent/laeufe',
      headers: await alsMarco(app),
      payload: BEISPIEL,
    });
    expect(mitSitzung.statusCode).toBe(401);
  });
});
