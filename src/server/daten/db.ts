// Öffnet die SQLite-Datenbank über das in Node.js eingebaute `node:sqlite` (keine Kompilierung bei der Installation).
// Schemaänderungen nur in schema.sql (architektur.md, Abschnitt 9).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Datenbank = DatabaseSync;

const SCHEMA = readFileSync(fileURLToPath(new URL('./schema.sql', import.meta.url)), 'utf8');

export function oeffneDatenbank(pfad: string): Datenbank {
  if (pfad !== ':memory:') mkdirSync(dirname(pfad), { recursive: true });
  const db = new DatabaseSync(pfad);
  if (pfad !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  const hatSchema = db.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'firma'`).get();
  if (!hatSchema) db.exec(SCHEMA);
  else zieheSpaltenNach(db);
  return db;
}

/**
 * Neue, nur hinzugefügte Spalten in einer schon bestehenden Datei nachziehen, damit `data/echt.sqlite` nach einem
 * Update weiterläuft (Prüfung E1-S4, Hinweis »Keine Migrationen«). Nur Spalten mit NULL als Vorgabe; alles andere
 * bleibt bei `npm run reset` (architektur.md, Abschnitt 9).
 */
const NACHZUZIEHEN: { tabelle: string; spalte: string; typ: string }[] = [
  { tabelle: 'recherchelauf', spalte: 'einlese_hinweise', typ: 'TEXT' },
];

function zieheSpaltenNach(db: Datenbank): void {
  for (const n of NACHZUZIEHEN) {
    const spalten = db.prepare(`PRAGMA table_info(${n.tabelle})`).all() as { name: string }[];
    if (!spalten.some((s) => s.name === n.spalte)) db.exec(`ALTER TABLE ${n.tabelle} ADD COLUMN ${n.spalte} ${n.typ}`);
  }
}

let sicherungspunkt = 0;

/**
 * Führt fn in einer Transaktion aus; bei einem Fehler wird alles zurückgerollt.
 * Läuft schon eine Transaktion, wird ein Sicherungspunkt verwendet, sodass Dienste einander aufrufen können.
 * fn muss synchron sein: SQLite-Zugriffe hier sind synchron, ein Promise würde vor seinem Ende gespeichert.
 */
export function transaktion<T>(db: Datenbank, fn: () => T): T {
  const verschachtelt = db.isTransaction;
  const punkt = `sp_${++sicherungspunkt}`;
  db.exec(verschachtelt ? `SAVEPOINT ${punkt}` : 'BEGIN');
  try {
    const ergebnis = fn();
    if (ergebnis instanceof Promise) throw new Error('transaktion() verlangt eine synchrone Funktion.');
    db.exec(verschachtelt ? `RELEASE ${punkt}` : 'COMMIT');
    return ergebnis;
  } catch (e) {
    db.exec(verschachtelt ? `ROLLBACK TO ${punkt}; RELEASE ${punkt}` : 'ROLLBACK');
    throw e;
  }
}
