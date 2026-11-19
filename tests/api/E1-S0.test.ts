import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { neueApp, zahl } from '../hilfen';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

describe('E1-S0 Grundgerüst mit Startdaten', () => {
  it('E1-S0 #2 GET /api/v1/gesundheit antwortet mit ok', async () => {
    ({ app } = await neueApp());
    const r = await app.inject({ method: 'GET', url: '/api/v1/gesundheit' });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual({ ok: true });
  });

  it('E1-S0 #4 Startdaten: Anzahl je Objekt wie in Abschnitt 8 des Konzepts', async () => {
    const { db } = await neueApp();
    expect(zahl(db, 'SELECT COUNT(*) n FROM firma')).toBe(7);
    expect(zahl(db, 'SELECT COUNT(*) n FROM ansprechpartner')).toBe(7);
    expect(zahl(db, 'SELECT COUNT(*) n FROM kontaktversuch')).toBe(7);
    expect(zahl(db, 'SELECT COUNT(*) n FROM antwort')).toBe(3);
    expect(zahl(db, 'SELECT COUNT(*) n FROM wiedervorlage WHERE erledigt = 0')).toBe(4);
    expect(zahl(db, 'SELECT COUNT(*) n FROM rechercheprofil')).toBe(1);
    expect(zahl(db, 'SELECT COUNT(*) n FROM sperrzeit')).toBe(3);
    expect(zahl(db, 'SELECT COUNT(*) n FROM recherchelauf')).toBe(4);
    expect(zahl(db, 'SELECT COUNT(*) n FROM sperreintrag')).toBe(5);
  });

  it('E1-S0 #4 Startdaten: Werte aus Abschnitt 8 des Konzepts', async () => {
    const { db } = await neueApp();
    const firmen = db
      .prepare(
        'SELECT name, branche, land, umsatz_wert, umsatz_waehrung, umsatz_jahr, umsatz_bezug FROM firma ORDER BY id',
      )
      .all();
    expect(firmen[2]).toEqual({
      name: 'Rheintal Technikhandel AG',
      branche: 'Technischer Handel',
      land: 'CH',
      umsatz_wert: 96,
      umsatz_waehrung: 'CHF',
      umsatz_jahr: 2025,
      umsatz_bezug: 'einzelgesellschaft',
    });
    expect(firmen.map((f) => (f as { name: string }).name)).toEqual([
      'Nordwerk Fördertechnik GmbH',
      'Alpenstrom Netze AG',
      'Rheintal Technikhandel AG',
      'Hansemarkt Handels SE',
      'Weserland Entsorgung GmbH',
      'Bergland Sport Handels AG',
      'Stadtwerke Lindental GmbH',
    ]);
    const ap = db
      .prepare(`SELECT titel, vorname, nachname, status, antwort_art FROM ansprechpartner ORDER BY id`)
      .all();
    expect(
      ap.map((a) => {
        const x = a as Record<string, string>;
        return [x.vorname, x.nachname, x.status];
      }),
    ).toEqual([
      ['Katrin', 'Albers', 'gespraech_vereinbart'],
      ['Tobias', 'Reinhardt', 'angeschrieben'],
      ['Simone', 'Gruber', 'freigegeben'],
      ['Luca', 'Bernasconi', 'nachgefasst'],
      ['Markus', 'Ostermann', 'ohne_antwort_geschlossen'],
      ['Jana', 'Wiesner', 'kein_interesse'],
      ['Peter', 'Hollenstein', 'antwort_erhalten'],
    ]);
    expect(db.prepare(`SELECT antwort_art a FROM ansprechpartner WHERE nachname = 'Hollenstein'`).get()).toEqual({
      a: 'neutral_spaeter',
    });
    expect(
      db.prepare(`SELECT kanal, zeitpunkt, email_grundlage FROM kontaktversuch WHERE ansprechpartner_id = 2`).get(),
    ).toEqual({ kanal: 'email', zeitpunkt: '2026-11-12 09:15', email_grundlage: 'in_hubspot_bekannt' });
    expect(db.prepare(`SELECT faellig_am, grund FROM wiedervorlage ORDER BY faellig_am, id`).all()).toEqual([
      { faellig_am: '2026-11-23', grund: 'Nachfassen, keine Antwort' },
      { faellig_am: '2026-11-24', grund: 'Ohne Antwort schließen?' },
      { faellig_am: '2026-11-24', grund: 'Gespräch vorbereiten' },
      { faellig_am: '2027-01-15', grund: 'Nach Jahreswechsel erneut melden' },
    ]);
    const profil = db
      .prepare(
        'SELECT name, status, lauftage, anzahl, laender, mindestumsatz_mio_eur, obergrenze, branchen, rollen FROM rechercheprofil',
      )
      .get() as Record<string, string | number>;
    expect(profil).toMatchObject({
      name: 'DACH Kernbranchen',
      status: 'aktiv',
      lauftage: '["mo","do"]',
      anzahl: 10,
      laender: '["DE","AT","CH"]',
      mindestumsatz_mio_eur: 50,
      obergrenze: 20,
    });
    expect(JSON.parse(String(profil.branchen))).toHaveLength(8);
    expect(JSON.parse(String(profil.rollen))).toHaveLength(8);
    expect(
      db
        .prepare(
          'SELECT datum, ergebnis, anzahl_vorschlaege v, anzahl_freigegeben f FROM recherchelauf ORDER BY datum DESC',
        )
        .all(),
    ).toEqual([
      { datum: '2026-11-16', ergebnis: 'ausgefuehrt', v: 10, f: 7 },
      { datum: '2026-11-12', ergebnis: 'ausgefuehrt', v: 8, f: 6 },
      { datum: '2026-11-09', ergebnis: 'ausgefuehrt', v: 10, f: 8 },
      { datum: '2026-11-05', ergebnis: 'uebersprungen', v: 0, f: 0 },
    ]);
    expect(
      db
        .prepare('SELECT bezeichnung FROM sperrzeit ORDER BY von')
        .all()
        .map((z) => (z as { bezeichnung: string }).bezeichnung),
    ).toEqual(['Webinartag', 'Weihnachtsurlaub', 'Skiurlaub']);
    expect(
      db
        .prepare('SELECT name FROM sperreintrag ORDER BY id')
        .all()
        .map((z) => (z as { name: string }).name),
    ).toEqual(['Windmöller & Hölscher', 'BOBST', 'Haberkorn', 'HORNBACH', 'Energie Steiermark']);
  });

  it('E1-S0 #6 unbekannte Adresse liefert 404 im Fehlerformat', async () => {
    ({ app } = await neueApp());
    const r = await app.inject({ method: 'GET', url: '/api/v1/gibt-es-nicht' });
    expect(r.statusCode).toBe(404);
    expect(r.json().fehler.code).toBe('nicht_gefunden');
    expect(typeof r.json().fehler.meldung).toBe('string');
  });
});
