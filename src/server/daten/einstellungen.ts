// Zugriff auf die Tabelle `einstellung` (Schlüssel und Wert). Einziger Ort für dieses SQL.
import type { Datenbank } from './db';

export function liesEinstellung(db: Datenbank, schluessel: string): string | null {
  const z = db.prepare(`SELECT wert FROM einstellung WHERE schluessel = ?`).get(schluessel) as
    { wert: string | null } | undefined;
  return z?.wert ?? null;
}

export function schreibeEinstellung(db: Datenbank, schluessel: string, wert: string | null): void {
  db.prepare(
    `INSERT INTO einstellung (schluessel, wert) VALUES (?, ?) ON CONFLICT (schluessel) DO UPDATE SET wert = excluded.wert`,
  ).run(schluessel, wert);
}
