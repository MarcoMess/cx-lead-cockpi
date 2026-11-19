// Öffnet die SQLite-Datenbank. Schemaänderungen nur in schema.sql (architektur.md, Abschnitt 9).
import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ladeStartdaten } from './startdaten';

export type Datenbank = Database.Database;

const SCHEMA = readFileSync(fileURLToPath(new URL('./schema.sql', import.meta.url)), 'utf8');

export function oeffneDatenbank(pfad: string): Datenbank {
  if (pfad !== ':memory:') mkdirSync(dirname(pfad), { recursive: true });
  const db = new Database(pfad);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const hatSchema = db.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'firma'`).get();
  if (!hatSchema) db.exec(SCHEMA);
  return db;
}

/** Leere Datenbank mit Schema und Startdaten – für Tests im Speicher und für `npm run reset`. */
export function erstelleStartdatenbank(pfad = ':memory:'): Datenbank {
  const db = oeffneDatenbank(pfad);
  ladeStartdaten(db);
  return db;
}
