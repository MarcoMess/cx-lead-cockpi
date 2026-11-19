import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { AGENT, alsMarco, neueApp } from '../hilfen';
import { LINKEDIN_KANAELE } from '../../src/gemeinsam/werte';

let app: FastifyInstance | undefined;
afterEach(async () => app?.close());

const BETREFF = 'Kundenportal Netzanschlüsse 2027';

async function vorbereiten() {
  const r = await neueApp();
  app = r.app;
  const kopf = await alsMarco(r.app);
  await r.app.inject({ method: 'POST', url: '/api/v1/sim/datum', headers: kopf, payload: { heute: '2026-11-19' } });
  const agentText = (r.db.prepare(`SELECT text FROM nachricht WHERE ansprechpartner_id = 3`).get() as { text: string })
    .text;
  const sende = (payload: Record<string, unknown>, id = 3) =>
    r.app.inject({ method: 'POST', url: `/api/v1/kontakte/${id}/kontaktversuche`, headers: kopf, payload });
  return { db: r.db, kopf, agentText, sende };
}

describe('E5-S3 Versand protokollieren', () => {
  it('E5-S3 #1 #2 Gruber am 19.11.2026 per Vernetzungsanfrage: Kontaktversuch, »Angeschrieben«, Wiedervorlage 30.11.2026', async () => {
    const { db, agentText, sende } = await vorbereiten();
    const r = await sende({ kanal: 'vernetzungsanfrage', betreff: BETREFF, text: agentText });
    expect(r.statusCode).toBe(201);
    expect(r.json()).toMatchObject({
      status: 'angeschrieben',
      kontaktversuch: { kanal: 'vernetzungsanfrage', art: 'erstkontakt' },
      wiedervorlage: { faellig_am: '2026-11-30', grund: 'Nachfassen, keine Antwort' },
    });
    const kv = db
      .prepare(`SELECT kanal, art, zeitpunkt, betreff, text FROM kontaktversuch WHERE ansprechpartner_id = 3`)
      .all() as { zeitpunkt: string }[];
    expect(kv).toHaveLength(1);
    expect(kv[0]).toMatchObject({ kanal: 'vernetzungsanfrage', art: 'erstkontakt', betreff: BETREFF, text: agentText });
    expect(kv[0].zeitpunkt).toMatch(/^2026-11-19 \d{2}:\d{2}$/);
    expect(db.prepare(`SELECT status FROM ansprechpartner WHERE id = 3`).get()).toEqual({ status: 'angeschrieben' });
    expect(
      db.prepare(`SELECT faellig_am, grund, art, erledigt FROM wiedervorlage WHERE ansprechpartner_id = 3`).all(),
    ).toEqual([{ faellig_am: '2026-11-30', grund: 'Nachfassen, keine Antwort', art: 'nachfassen', erledigt: 0 }]);
  });

  it('E5-S1 #5 unverändert gesendet bleibt die Fassung »agent«', async () => {
    const { db, agentText, sende } = await vorbereiten();
    await sende({ kanal: 'inmail', betreff: BETREFF, text: agentText });
    expect(db.prepare(`SELECT fassung FROM nachricht WHERE ansprechpartner_id = 3`).get()).toEqual({
      fassung: 'agent',
    });
  });

  it('E5-S1 #5 geänderter Text wird als »von_marco_geaendert« mit dem gesendeten Wortlaut gespeichert', async () => {
    const { db, agentText, sende } = await vorbereiten();
    const neu = agentText.replace('Wäre ein kurzes Gespräch', 'Hätten Sie Zeit für ein kurzes Gespräch');
    await sende({ kanal: 'inmail', betreff: BETREFF, text: neu });
    expect(db.prepare(`SELECT text, fassung FROM nachricht WHERE ansprechpartner_id = 3`).get()).toEqual({
      text: neu,
      fassung: 'von_marco_geaendert',
    });
  });

  it('E5-S3 #3 die LinkedIn-Kanäle sind InMail, Vernetzungsanfrage mit Notiz und LinkedIn-Nachricht', async () => {
    expect([...LINKEDIN_KANAELE]).toEqual(['inmail', 'vernetzungsanfrage', 'linkedin_nachricht']);
    const { sende } = await vorbereiten();
    const r = await sende({ kanal: 'email', betreff: BETREFF, text: 'Hallo' });
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler.code).toBe('kanal_nicht_moeglich');
  });

  it('E5-S3 #6 leere Nachricht wird verweigert, nichts angelegt', async () => {
    const { db, sende } = await vorbereiten();
    const r = await sende({ kanal: 'inmail', betreff: BETREFF, text: '   \n ' });
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler).toMatchObject({ code: 'text_leer', feld: 'text' });
    expect(r.json().fehler.meldung).toMatch(/leer/);
    expect(db.prepare(`SELECT status FROM ansprechpartner WHERE id = 3`).get()).toEqual({ status: 'freigegeben' });
    expect(db.prepare(`SELECT COUNT(*) n FROM kontaktversuch WHERE ansprechpartner_id = 3`).get()).toEqual({ n: 0 });
  });

  it('E5-S3 #5 kein zweiter Erstkontakt; nur aus »Freigegeben«; unbekannt 404; Agent 403', async () => {
    const { agentText, sende } = await vorbereiten();
    expect((await sende({ kanal: 'inmail', betreff: BETREFF, text: agentText })).statusCode).toBe(201);
    const zweit = await sende({ kanal: 'inmail', betreff: BETREFF, text: agentText });
    expect(zweit.statusCode).toBe(409);
    expect((await sende({ kanal: 'inmail', text: 'x' }, 1)).statusCode).toBe(409);
    expect((await sende({ kanal: 'inmail', text: 'x' }, 999)).statusCode).toBe(404);
    const r = await app!.inject({
      method: 'POST',
      url: '/api/v1/kontakte/3/kontaktversuche',
      headers: AGENT,
      payload: { kanal: 'inmail', text: 'x' },
    });
    expect(r.statusCode).toBe(403);
  });

  it('ungültiger Kanal: 422 mit Hinweis', async () => {
    const { sende } = await vorbereiten();
    const r = await sende({ kanal: 'brieftaube', text: 'x' });
    expect(r.statusCode).toBe(422);
    expect(r.json().fehler.feld).toBe('kanal');
  });
});
