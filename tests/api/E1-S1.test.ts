import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp, rohesCookie, TEST_PASSWORT } from '../hilfen';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

describe('E1-S1 Zugang für Marco und den Agenten', () => {
  it('E1-S1 #1 ohne Anmeldung liefert keine Adresse Daten', async () => {
    ({ app } = await neueApp());
    for (const url of ['/api/v1/ich', '/api/v1/firmen', '/api/v1/kontakte/1', '/api/v1/gibt-es-nicht']) {
      const r = await app.inject({ method: 'GET', url });
      expect(r.statusCode, url).toBe(401);
      expect(r.json().fehler.code, url).toBe('nicht_angemeldet');
    }
    expect((await app.inject({ method: 'GET', url: '/api/v1/gesundheit' })).statusCode).toBe(200);
  });

  it('E1-S1 #2 Anmeldung mit dem richtigen Passwort, Abmeldung beendet die Sitzung', async () => {
    ({ app } = await neueApp());
    const falsch = await app.inject({ method: 'POST', url: '/api/v1/anmeldung', payload: { passwort: 'falsch' } });
    expect(falsch.statusCode).toBe(401);
    expect(falsch.json().fehler).toMatchObject({ code: 'passwort_falsch', meldung: 'Das Passwort stimmt nicht.' });
    const leer = await app.inject({ method: 'POST', url: '/api/v1/anmeldung', payload: {} });
    expect(leer.statusCode).toBe(401);

    const kopf = await alsMarco(app);
    const ich = await app.inject({ method: 'GET', url: '/api/v1/ich', headers: kopf });
    expect(ich.statusCode).toBe(200);
    expect(ich.json()).toEqual({ nutzer: 'marco' });

    const ab = await app.inject({ method: 'POST', url: '/api/v1/abmeldung', headers: kopf });
    expect(ab.statusCode).toBe(204);
    const danach = await app.inject({
      method: 'GET',
      url: '/api/v1/ich',
      headers: { cookie: rohesCookie(ab.headers['set-cookie']) },
    });
    expect(danach.statusCode).toBe(401);
    expect(TEST_PASSWORT).toBe('test-passwort');
  });

  it('E1-S1 #3 Agenten-Adressen ohne oder mit falschem Schlüssel werden abgelehnt', async () => {
    ({ app } = await neueApp());
    const ohne = await app.inject({ method: 'GET', url: '/api/v1/agent/laufauftrag' });
    expect(ohne.statusCode).toBe(401);
    expect(ohne.json().fehler.code).toBe('schluessel_ungueltig');
    const falsch = await app.inject({
      method: 'GET',
      url: '/api/v1/agent/laufauftrag',
      headers: { authorization: 'Bearer falsch' },
    });
    expect(falsch.statusCode).toBe(401);
    const nurSitzung = await app.inject({
      method: 'GET',
      url: '/api/v1/agent/laufauftrag',
      headers: await alsMarco(app),
    });
    expect(nurSitzung.statusCode).toBe(401);
    // Mit gültigem Schlüssel kommt die Anfrage durch die Zugangsprüfung; die Adresse selbst baut E2-S1.
    const richtig = await app.inject({ method: 'GET', url: '/api/v1/agent/laufauftrag', headers: AGENT });
    expect(richtig.statusCode).not.toBe(401);
    expect(richtig.statusCode).not.toBe(403);
  });

  it('E1-S1 #4 mit Agenten-Schlüssel sind Freigeben, Kontaktversuch und Löschen verboten', async () => {
    ({ app } = await neueApp());
    const versuche = [
      { method: 'POST' as const, url: '/api/v1/vorschlaege/1/freigabe' },
      { method: 'POST' as const, url: '/api/v1/kontakte/1/kontaktversuche' },
      { method: 'DELETE' as const, url: '/api/v1/kontakte/1' },
      { method: 'DELETE' as const, url: '/api/v1/firmen/1' },
    ];
    for (const v of versuche) {
      const r = await app.inject({ ...v, headers: AGENT });
      expect(r.statusCode, v.url).toBe(403);
      expect(r.json().fehler.code).toBe('rolle_nicht_erlaubt');
    }
  });

  it('E1-S1 #5 jeder neu angelegte Datensatz trägt Marco als Besitzer', async () => {
    const { db } = await neueApp();
    db.prepare(
      `INSERT INTO firma (name, name_norm, branche, land, umsatz_wert, umsatz_waehrung, umsatz_jahr, umsatz_bezug, umsatz_quelle_url)
       VALUES ('Testfirma GmbH', 'testfirma', 'Retail', 'DE', 60, 'EUR', 2025, 'konzern', 'https://example.com')`,
    ).run();
    const id = (db.prepare(`SELECT id FROM firma WHERE name_norm = 'testfirma'`).get() as { id: number }).id;
    db.prepare(
      `INSERT INTO ansprechpartner (firma_id, anrede, vorname, nachname, funktion, rolle, quelle_url, status)
       VALUES (?, 'Frau', 'Test', 'Person', 'Leitung', 'CRM', 'https://example.com', 'freigegeben')`,
    ).run(id);
    expect(db.prepare(`SELECT DISTINCT besitzer FROM firma`).all()).toEqual([{ besitzer: 'marco' }]);
    expect(db.prepare(`SELECT DISTINCT besitzer FROM ansprechpartner`).all()).toEqual([{ besitzer: 'marco' }]);
  });
});
