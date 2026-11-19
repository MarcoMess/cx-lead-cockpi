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

/** Alle Einträge einer Art (Name und ID), für den Abgleich auf doppelte Einträge. */
export function namenDerArt(db: Datenbank, art: SperreArt): { id: number; name: string }[] {
  return db.prepare(`SELECT id, name FROM sperreintrag WHERE art = ?`).all(art) as unknown as {
    id: number;
    name: string;
  }[];
}
