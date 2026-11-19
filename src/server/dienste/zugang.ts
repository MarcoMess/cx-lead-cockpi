// Prüfung von Passwort und Agenten-Schlüssel. Schlüssel werden nur als Hash gespeichert.
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Datenbank } from '../daten/db';

const hash = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

export function gleich(a: string, b: string): boolean {
  const x = Buffer.from(hash(a), 'hex');
  const y = Buffer.from(hash(b), 'hex');
  return timingSafeEqual(x, y);
}

export function setzeAgentSchluessel(db: Datenbank, schluessel: string): void {
  const schreibe = db.prepare(`INSERT INTO einstellung (schluessel, wert) VALUES (?, ?)
    ON CONFLICT (schluessel) DO UPDATE SET wert = excluded.wert`);
  schreibe.run('agent_schluessel_hash', hash(schluessel));
  schreibe.run('agent_schluessel_endung', schluessel.slice(-4));
}

export function istAgentSchluessel(db: Datenbank, schluessel: string): boolean {
  const zeile = db.prepare(`SELECT wert FROM einstellung WHERE schluessel = 'agent_schluessel_hash'`).get() as
    { wert: string } | undefined;
  if (!zeile?.wert || !schluessel) return false;
  return timingSafeEqual(Buffer.from(hash(schluessel), 'hex'), Buffer.from(zeile.wert, 'hex'));
}

/** Schreibt einen zuvor gelesenen Schlüssel-Hash zurück (beim Zurücksetzen der Vorführdaten). */
export function setzeAgentSchluesselHash(db: Datenbank, zeilen: { schluessel: string; wert: string }[]): void {
  const schreibe = db.prepare(`INSERT INTO einstellung (schluessel, wert) VALUES (?, ?)
    ON CONFLICT (schluessel) DO UPDATE SET wert = excluded.wert`);
  for (const z of zeilen) schreibe.run(z.schluessel, z.wert);
}
