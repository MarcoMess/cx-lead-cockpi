import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp } from '../hilfen';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

async function akte(a: FastifyInstance, id: number | string) {
  const kopf = await alsMarco(a);
  return a.inject({ method: 'GET', url: `/api/v1/kontakte/${id}`, headers: kopf });
}

describe('E4-S3 Kontaktakte', () => {
  it('E4-S3 #1 Albers: Funktion, Firma, LinkedIn, Anlass vom 04.11.2026 mit Quelle und Hypothese', async () => {
    ({ app } = await neueApp());
    const r = await akte(app, 1);
    expect(r.statusCode).toBe(200);
    const a = r.json();
    expect([a.titel, a.vorname, a.nachname, a.funktion]).toEqual([
      'Dr.',
      'Katrin',
      'Albers',
      'Leiterin Customer Service & After-Sales',
    ]);
    expect(a.firma).toMatchObject({ id: 1, name: 'Nordwerk Fördertechnik GmbH' });
    expect(a.linkedin_url).toBe('linkedin.com/in/katrin-albers-beispiel');
    expect(a.anlaesse).toHaveLength(1);
    expect(a.anlaesse[0]).toMatchObject({
      beschreibung: 'Pressemitteilung: neues Servicezentrum für Ersatzteile in Bremen',
      ereignis_datum: '2026-11-04',
      quelle_url: 'https://example.com/quelle-1',
    });
    expect(a.anlaesse[0].hypothese).toMatch(/^Mit dem neuen Servicezentrum/);
  });

  it('E4-S3 #2 #3 Albers: Status »Gespräch vereinbart«, Verlauf zeitlich geordnet mit nächstem Schritt', async () => {
    ({ app } = await neueApp());
    const a = (await akte(app, 1)).json();
    expect(a.status).toBe('gespraech_vereinbart');
    expect(a.endzustand).toBe(false);
    expect(a.verlauf.map((e: { art: string }) => e.art)).toEqual(['kontaktversuch', 'antwort']);
    expect(a.verlauf[0]).toMatchObject({ kanal: 'inmail', kontakt_art: 'erstkontakt', zeitpunkt: '2026-11-06 08:40' });
    expect(a.verlauf[1]).toMatchObject({
      einordnung: 'positiv',
      datum: '2026-11-09',
      naechster_schritt: 'Kurzes Gespräch am 24.11.2026, 14:00 Uhr',
    });
    expect(a.erlaubte_aktionen).toContain('an_sap_uebergeben');
    expect(a.erlaubte_aktionen).not.toContain('antwort_erfassen');
  });

  it('E4-S3 #4 Reinhardt: Erstkontakt per E-Mail mit Grundlage »in_hubspot_bekannt«', async () => {
    ({ app } = await neueApp());
    const a = (await akte(app, 2)).json();
    expect(a.verlauf[0]).toMatchObject({
      kanal: 'email',
      kontakt_art: 'erstkontakt',
      email_grundlage: 'in_hubspot_bekannt',
    });
    expect(a.verlauf[0].text).toMatch(/^Guten Tag Herr Reinhardt,/);
  });

  it('E4-S3 #5 Direktkontakt und Firmenkontakt kommen getrennt', async () => {
    ({ app } = await neueApp());
    const a = (await akte(app, 2)).json();
    expect([a.email, a.email_herkunft, a.telefon]).toEqual(['t.reinhardt@hansemarkt.example', 'von_marco', null]);
    expect(a.firma).toHaveProperty('firmenkontakt');
  });

  it('E4-S3 #6 Ostermann: Endzustand, vollständiger Verlauf', async () => {
    ({ app } = await neueApp());
    const a = (await akte(app, 5)).json();
    expect([a.status, a.endzustand]).toEqual(['ohne_antwort_geschlossen', true]);
    expect(a.verlauf).toHaveLength(1);
    expect(a.verlauf[0]).toMatchObject({ kanal: 'inmail', zeitpunkt: '2026-10-19 08:10' });
    expect(a.erlaubte_aktionen).toContain('wieder_oeffnen');
  });

  it('E4-S3 #7 Ostermann ohne LinkedIn-URL: Feld leer, Firma für den Suchhinweis vorhanden', async () => {
    ({ app } = await neueApp());
    const a = (await akte(app, 5)).json();
    expect(a.linkedin_url).toBeNull();
    expect(a.firma.name).toBeTruthy();
  });

  it('unbekannter Kontakt 404, Agenten-Schlüssel 403', async () => {
    ({ app } = await neueApp());
    for (const id of [999, 0, 'abc', '1.5']) {
      const r = await akte(app, id);
      expect(r.statusCode).toBe(404);
    }
    expect((await akte(app, 999)).json().fehler.code).toBe('kontakt_unbekannt');
    expect((await app.inject({ method: 'GET', url: '/api/v1/kontakte/1', headers: AGENT })).statusCode).toBe(403);
  });
});
