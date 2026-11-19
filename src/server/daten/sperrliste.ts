// Zugriff auf die Sperrliste.
import type { SperrZeile } from '../../gemeinsam/sperrliste';
import type { SperreArt, SperreHerkunft } from '../../gemeinsam/werte';
import type { Datenbank } from './db';

export function listeSperren(db: Datenbank): SperrZeile[] {
  return db
    .prepare(
      `SELECT id, art, name, firma_name, grund, herkunft, gesperrt_bis, erstellt_am FROM sperreintrag ORDER BY id`,
    )
    .all() as unknown as SperrZeile[];
}

export function legeSperreAn(
  db: Datenbank,
  e: {
    art: SperreArt;
    name: string;
    firma_name?: string | null;
    grund: string;
    herkunft: SperreHerkunft;
    gesperrt_bis?: string | null;
    erstellt_am: string;
  },
): number {
  const r = db
    .prepare(
      `INSERT INTO sperreintrag (art, name, firma_name, grund, herkunft, gesperrt_bis, erstellt_am) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(e.art, e.name, e.firma_name ?? null, e.grund, e.herkunft, e.gesperrt_bis ?? null, e.erstellt_am);
  return Number(r.lastInsertRowid);
}

/** true, wenn ein Eintrag entfernt wurde. */
export function entferneSperre(db: Datenbank, id: number): boolean {
  return db.prepare(`DELETE FROM sperreintrag WHERE id = ?`).run(id).changes > 0;
}

/** Eintrag gleicher Art mit demselben Namen (ohne Groß- und Kleinschreibung), falls vorhanden. */
export function findeSperre(db: Datenbank, art: SperreArt, name: string): { id: number } | undefined {
  return db
    .prepare(`SELECT id FROM sperreintrag WHERE art = ? AND lower(trim(name)) = lower(trim(?))`)
    .get(art, name) as { id: number } | undefined;
}
