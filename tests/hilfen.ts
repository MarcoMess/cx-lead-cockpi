// Gemeinsame Hilfen für Schnittstellentests: frische App mit Startdaten im Speicher.
import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { baueApp } from '../src/server/app';
import { erstelleStartdatenbank } from '../src/server/daten/db';
import { setzeAgentSchluessel } from '../src/server/dienste/zugang';

export const TEST_PASSWORT = 'test-passwort';
export const TEST_AGENT_SCHLUESSEL = 'test-agent-schluessel';
export const AGENT = { authorization: `Bearer ${TEST_AGENT_SCHLUESSEL}` };

export async function neueApp(opt: { demo?: boolean } = {}) {
  const db = erstelleStartdatenbank(':memory:');
  setzeAgentSchluessel(db, TEST_AGENT_SCHLUESSEL);
  const app = await baueApp({
    db,
    demo: opt.demo ?? true,
    passwort: TEST_PASSWORT,
    sitzungsSchluessel: randomBytes(32),
  });
  return { app, db };
}

/** Meldet Marco an und liefert die Kopfzeilen mit dem Sitzungs-Cookie. */
export async function alsMarco(app: FastifyInstance): Promise<{ cookie: string }> {
  const r = await app.inject({ method: 'POST', url: '/api/v1/anmeldung', payload: { passwort: TEST_PASSWORT } });
  if (r.statusCode !== 200) throw new Error('Anmeldung im Test fehlgeschlagen: ' + r.body);
  return { cookie: rohesCookie(r.headers['set-cookie']) };
}

export const zahl = (db: { prepare(s: string): { get(): unknown } }, sql: string) =>
  (db.prepare(sql).get() as { n: number }).n;

/** Cookie so zurückgeben, wie der Server es gesetzt hat (URL-kodiert); der dekodierte Wert enthält ein Semikolon. */
export function rohesCookie(setCookie: string | string[] | undefined): string {
  const zeilen = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const zeile = zeilen.find((z) => z.startsWith('cockpit_sitzung='));
  return zeile ? zeile.split(';')[0] : '';
}
