// Zugriff auf Kontaktversuche und Wiedervorlagen beim Protokollieren des Versands.
import type { KontaktKanal, NachrichtFassung, WiedervorlageArt } from '../../gemeinsam/werte';
import type { Datenbank } from './db';

export function legeKontaktversuchAn(
  db: Datenbank,
  k: {
    ansprechpartner_id: number;
    kanal: KontaktKanal;
    art: 'erstkontakt' | 'nachfassen';
    zeitpunkt: string;
    betreff: string | null;
    text: string;
  },
): number {
  const r = db
    .prepare(
      `INSERT INTO kontaktversuch (ansprechpartner_id, kanal, art, zeitpunkt, betreff, text) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(k.ansprechpartner_id, k.kanal, k.art, k.zeitpunkt, k.betreff, k.text);
  return Number(r.lastInsertRowid);
}

export function legeWiedervorlageAn(
  db: Datenbank,
  w: { ansprechpartner_id: number; faellig_am: string; grund: string; art: WiedervorlageArt },
): void {
  db.prepare(`INSERT INTO wiedervorlage (ansprechpartner_id, faellig_am, grund, art) VALUES (?, ?, ?, ?)`).run(
    w.ansprechpartner_id,
    w.faellig_am,
    w.grund,
    w.art,
  );
}

/** Speichert die gesendete LinkedIn-Fassung des Erstkontakts mit ihrer Herkunft. */
export function speichereGesendeteFassung(
  db: Datenbank,
  id: number,
  n: { betreff: string | null; text: string; fassung: NachrichtFassung },
): void {
  db.prepare(
    `INSERT INTO nachricht (ansprechpartner_id, kanal, art, betreff, text, fassung) VALUES (?, 'linkedin', 'erstkontakt', ?, ?, ?)
     ON CONFLICT (ansprechpartner_id, kanal, art) DO UPDATE SET betreff = excluded.betreff, text = excluded.text,
       fassung = excluded.fassung`,
  ).run(id, n.betreff, n.text, n.fassung);
}
