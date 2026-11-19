// Öffnet die SQLite-Datenbank über das in Node.js eingebaute `node:sqlite` (keine Kompilierung bei der Installation).
// Schemaänderungen nur in schema.sql (architektur.md, Abschnitt 9).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ladeStartdaten } from './startdaten';

export type Datenbank = DatabaseSync;

const SCHEMA = readFileSync(fileURLToPath(new URL('./schema.sql', import.meta.url)), 'utf8');

export function oeffneDatenbank(pfad: string): Datenbank {
  if (pfad !== ':memory:') mkdirSync(dirname(pfad), { recursive: true });
  const db = new DatabaseSync(pfad);
  if (pfad !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  const hatSchema = db.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'firma'`).get();
  if (!hatSchema) db.exec(SCHEMA);
  return db;
}

/** Führt fn in einer Transaktion aus; bei einem Fehler wird alles zurückgerollt. */
export function transaktion<T>(db: Datenbank, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const ergebnis = fn();
    db.exec('COMMIT');
    return ergebnis;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

/** Leere Datenbank mit Schema und Startdaten – für Tests im Speicher und für `npm run reset`. */
export function erstelleStartdatenbank(pfad = ':memory:'): Datenbank {
  const db = oeffneDatenbank(pfad);
  ladeStartdaten(db);
  return db;
}
