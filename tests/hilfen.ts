// Gemeinsame Hilfen für Schnittstellentests: frische App mit Startdaten im Speicher.
import { baueApp } from '../src/server/app';
import { erstelleStartdatenbank } from '../src/server/daten/db';

export async function neueApp(opt: { demo?: boolean } = {}) {
  const db = erstelleStartdatenbank(':memory:');
  const app = await baueApp({ db, demo: opt.demo ?? true });
  return { app, db };
}

export const zahl = (db: { prepare(s: string): { get(): unknown } }, sql: string) =>
  (db.prepare(sql).get() as { n: number }).n;
