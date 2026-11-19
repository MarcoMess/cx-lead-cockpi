import { afterEach, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, rmSync, statSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { oeffneDatenbank } from '../../src/server/daten/db';
import { baueApp } from '../../src/server/app';
import { Uhr } from '../../src/server/anbindungen/uhr';

const PFAD = './data/test-echt.sqlite';
const SPERR_PFAD = './data/test-sperre/echt.sqlite';
const loesche = () => {
  for (const e of ['', '-wal', '-shm']) rmSync(PFAD + e, { force: true });
};
const echt = () =>
  execSync('npx tsx src/server/echt.ts', {
    env: { ...process.env, ECHT_DATABASE_PATH: PFAD, COCKPIT_AGENT_KEY: 'echt-test-schluessel' },
    encoding: 'utf8',
  });

afterEach(loesche);

describe('E1-S4 Echtbetrieb neben dem Vorführbestand', () => {
  it('E1-S4 #1 neue Echtdatenbank: Sperrliste-Startbestand und Profil, keine Firmen, Kontakte, Läufe', () => {
    loesche();
    expect(echt()).toContain('Echtbetrieb eingerichtet');
    const db = oeffneDatenbank(PFAD);
    const n = (t: string) => (db.prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n;
    expect([n('firma'), n('ansprechpartner'), n('recherchelauf'), n('vorschlag'), n('sperrzeit')]).toEqual([
      0, 0, 0, 0, 0,
    ]);
    expect(n('sperreintrag')).toBe(5);
    expect(n('rechercheprofil')).toBe(1);
    expect(db.prepare(`SELECT wert FROM einstellung WHERE schluessel = 'heute_override'`).get()).toBeUndefined();
    db.close();
  }, 30000);

  it('E1-S4 #4 zweiter Start behält die erfassten Daten', () => {
    loesche();
    echt();
    const db = oeffneDatenbank(PFAD);
    db.prepare(
      `INSERT INTO sperreintrag (art, name, grund, herkunft, erstellt_am) VALUES ('firma', 'Echt GmbH', 'x', 'von_marco', '2026-11-19')`,
    ).run();
    db.close();
    expect(echt()).toContain('Echtbetrieb mit');
    const db2 = oeffneDatenbank(PFAD);
    expect(db2.prepare(`SELECT COUNT(*) n FROM sperreintrag`).get()).toEqual({ n: 6 });
    expect(db2.prepare(`SELECT COUNT(*) n FROM rechercheprofil`).get()).toEqual({ n: 1 });
    db2.close();
  }, 30000);

  it('E1-S4 #3 `npm run reset` verweigert die Echtdatenbank', () => {
    loesche();
    echt();
    const vorher = statSync(PFAD).size;
    let fehler = '';
    try {
      execSync('npx tsx src/server/reset.ts', {
        // Nie die echte Datei: Ein Pfad, den die Sperre am Dateinamen erkennt (Prüfung E1-S4, Sollte 1).
        env: { ...process.env, DATABASE_PATH: SPERR_PFAD, ECHT_DATABASE_PATH: PFAD },
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (e) {
      fehler = String((e as { stderr?: string }).stderr);
    }
    expect(fehler).toContain('wird nicht zurückgesetzt');
    expect(existsSync(SPERR_PFAD)).toBe(false);
    expect(existsSync(PFAD) && statSync(PFAD).size).toBe(vorher);
  }, 30000);

  it('E1-S4 #3 die Sperre erkennt ECHT_DATABASE_PATH auch in anderer Schreibweise', () => {
    let fehler = '';
    try {
      execSync('npx tsx src/server/reset.ts', {
        env: {
          ...process.env,
          DATABASE_PATH: 'data/test-pruef-echt.sqlite',
          ECHT_DATABASE_PATH: './data/TEST-pruef-echt.sqlite',
        },
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (e) {
      fehler = String((e as { stderr?: string }).stderr);
    }
    expect(fehler).toContain('wird nicht zurückgesetzt');
    expect(existsSync('data/test-pruef-echt.sqlite')).toBe(false);
  }, 30000);

  it('E1-S4 #2 ohne Vorführmodus: keine Adressen unter /api/v1/sim, echtes Datum', async () => {
    const db = oeffneDatenbank(':memory:');
    const app = await baueApp({ db, demo: false, passwort: 'p', sitzungsSchluessel: randomBytes(32) });
    const anmeldung = await app.inject({ method: 'POST', url: '/api/v1/anmeldung', payload: { passwort: 'p' } });
    const cookie = String(anmeldung.headers['set-cookie']).split(';')[0];
    const r = await app.inject({ method: 'GET', url: '/api/v1/sim/zustand', headers: { cookie } });
    expect(r.statusCode).toBe(404);
    const heute = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
    expect(new Uhr().heute()).toBe(heute);
    await app.close();
  });
});
