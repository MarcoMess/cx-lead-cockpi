// Zugriff auf Ansprechpartner, ihre Anlässe und Nachrichten.
import type { AkteAnlass, KontaktAkte, KontaktZeile, VerlaufEintrag } from '../../gemeinsam/kontakte';
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

/** Alle Ansprechpartner mit Firmenname, in der Reihenfolge ihres Anlegens. */
export function listeAnsprechpartner(db: Datenbank): KontaktZeile[] {
  return db
    .prepare(
      `SELECT a.id, a.anrede, a.titel, a.vorname, a.nachname, a.funktion, a.firma_id, f.name AS firma_name, a.status, a.antwort_art
       FROM ansprechpartner a JOIN firma f ON f.id = a.firma_id ORDER BY a.id`,
    )
    .all() as unknown as KontaktZeile[];
}

export type AkteStamm = Omit<KontaktAkte, 'anlaesse' | 'verlauf' | 'erlaubte_aktionen' | 'endzustand'>;

/** Stammdaten eines Ansprechpartners mit seiner Firma oder undefined. */
export function liesAkteStamm(db: Datenbank, id: number): AkteStamm | undefined {
  const r = db
    .prepare(
      `SELECT a.id, a.anrede, a.titel, a.vorname, a.nachname, a.funktion, a.rolle, a.status, a.antwort_art,
              a.gespraech_termin, a.linkedin_url, a.email, a.email_herkunft, a.telefon, a.sap_kontakt_id, a.sap_lead_id,
              f.id AS firma_id, f.name AS firma_name, f.firmenkontakt, f.sap_account_id
       FROM ansprechpartner a JOIN firma f ON f.id = a.firma_id WHERE a.id = ?`,
    )
    .get(id) as (Record<string, unknown> & { firma_id: number; firma_name: string }) | undefined;
  if (!r) return undefined;
  const { firma_id, firma_name, firmenkontakt, sap_account_id, ...rest } = r;
  return {
    ...(rest as unknown as Omit<AkteStamm, 'firma'>),
    firma: {
      id: firma_id,
      name: firma_name,
      firmenkontakt: firmenkontakt as string | null,
      sap_account_id: sap_account_id as string | null,
    },
  };
}

export function liesAnlaesse(db: Datenbank, id: number): AkteAnlass[] {
  return db
    .prepare(
      `SELECT typ, beschreibung, ereignis_datum, quelle_url, hypothese, gespraechsziel
       FROM anlass WHERE ansprechpartner_id = ? ORDER BY id DESC`,
    )
    .all(id) as unknown as AkteAnlass[];
}

/** Kontaktversuche und Antworten eines Ansprechpartners, ungeordnet. */
export function liesVerlauf(db: Datenbank, id: number): VerlaufEintrag[] {
  const versuche = db
    .prepare(
      `SELECT 'kontaktversuch' AS art, zeitpunkt, kanal, art AS kontakt_art, betreff, text, email_grundlage,
              email_grundlage_notiz
       FROM kontaktversuch WHERE ansprechpartner_id = ?`,
    )
    .all(id) as unknown as VerlaufEintrag[];
  const antworten = db
    .prepare(
      `SELECT 'antwort' AS art, datum, einordnung, wortlaut, naechster_schritt FROM antwort WHERE ansprechpartner_id = ?`,
    )
    .all(id) as unknown as VerlaufEintrag[];
  return [...versuche, ...antworten];
}
