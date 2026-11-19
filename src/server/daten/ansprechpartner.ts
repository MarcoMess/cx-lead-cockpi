// Zugriff auf Ansprechpartner, ihre Anlässe und Nachrichten.
import type { AnsprechpartnerStatus } from '../../gemeinsam/werte';
import type { Datenbank } from './db';

export interface NeuerAnsprechpartner {
  firma_id: number;
  anrede: string;
  titel: string | null;
  vorname: string;
  nachname: string;
  funktion: string;
  rolle: string;
  quelle_url: string;
  linkedin_url: string | null;
  email: string | null;
  telefon: string | null;
  status: AnsprechpartnerStatus;
}

export function legeAnsprechpartnerAn(db: Datenbank, a: NeuerAnsprechpartner): number {
  const r = db
    .prepare(
      `INSERT INTO ansprechpartner (firma_id, anrede, titel, vorname, nachname, funktion, rolle, quelle_url, linkedin_url,
        email, email_herkunft, telefon, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      a.firma_id,
      a.anrede,
      a.titel,
      a.vorname,
      a.nachname,
      a.funktion,
      a.rolle,
      a.quelle_url,
      a.linkedin_url,
      a.email,
      a.email ? 'veroeffentlicht' : null,
      a.telefon,
      a.status,
    );
  return Number(r.lastInsertRowid);
}

/** Öffnet einen geschlossenen Kontakt für eine Wiederansprache wieder (Konzept 1.2, Regel Wiederansprache). */
export function oeffneZurWiederansprache(db: Datenbank, id: number, status: AnsprechpartnerStatus): void {
  db.prepare(`UPDATE ansprechpartner SET status = ?, antwort_art = NULL, geschlossen_am = NULL WHERE id = ?`).run(
    status,
    id,
  );
}

/** Status eines Ansprechpartners oder undefined, wenn es ihn nicht gibt. */
export function liesStatus(db: Datenbank, id: number): AnsprechpartnerStatus | undefined {
  const r = db.prepare(`SELECT status FROM ansprechpartner WHERE id = ?`).get(id) as
    { status: AnsprechpartnerStatus } | undefined;
  return r?.status;
}

/** Ansprechpartner mit diesem LinkedIn-Profil, falls vorhanden. */
export function findeNachLinkedin(db: Datenbank, url: string): { id: number } | undefined {
  return db.prepare(`SELECT id FROM ansprechpartner WHERE linkedin_url = ?`).get(url) as { id: number } | undefined;
}

export interface NeuerAnlass {
  typ: string;
  beschreibung: string | null;
  ereignis_datum: string | null;
  veroeffentlicht_am: string | null;
  quelle_url: string | null;
  hypothese: string | null;
  gespraechsziel: string | null;
}

export function fuegeAnlassHinzu(db: Datenbank, ansprechpartnerId: number, a: NeuerAnlass, erstelltAm: string): void {
  db.prepare(
    `INSERT INTO anlass (ansprechpartner_id, typ, beschreibung, ereignis_datum, veroeffentlicht_am, quelle_url, hypothese,
      gespraechsziel, erstellt_am) VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(
    ansprechpartnerId,
    a.typ,
    a.beschreibung,
    a.ereignis_datum,
    a.veroeffentlicht_am,
    a.quelle_url,
    a.hypothese,
    a.gespraechsziel,
    erstelltAm,
  );
}

/** Setzt die Erstkontakt-Nachricht für LinkedIn (ersetzt eine vorhandene, etwa bei einer Wiederansprache). */
export function setzeErstnachricht(
  db: Datenbank,
  ansprechpartnerId: number,
  n: { betreff: string | null; text: string; sprache: string },
): void {
  db.prepare(
    `INSERT INTO nachricht (ansprechpartner_id, kanal, art, betreff, text, sprache, fassung) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (ansprechpartner_id, kanal, art) DO UPDATE SET betreff = excluded.betreff, text = excluded.text,
       sprache = excluded.sprache, fassung = excluded.fassung`,
  ).run(ansprechpartnerId, 'linkedin', 'erstkontakt', n.betreff, n.text, n.sprache, 'agent');
}
