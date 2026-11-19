// Zugriff auf Rechercheläufe und Vorschläge (nur Lesen und Schreiben, keine Entscheidungen).
import type { LaufZeile, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import type { LaufErgebnis, LaufHerkunft, VorschlagZustand } from '../../gemeinsam/werte';
import type { Datenbank } from './db';

export interface NeuerLauf {
  datum: string;
  abdeckungsgrenzen: string | null;
  herkunft: LaufHerkunft;
  anzahl_vorschlaege: number;
  /** Was beim Einlesen nicht übernommen wurde, je Zeile ein Satz (Prüfung E2-S5, Befund 4). */
  einlese_hinweise?: string[];
}

export function gibtAusgefuehrtenLaufAm(db: Datenbank, datum: string): boolean {
  return !!db
    .prepare(`SELECT 1 FROM recherchelauf WHERE datum = ? AND ergebnis = ?`)
    .get(datum, 'ausgefuehrt' satisfies LaufErgebnis);
}

export function fuegeLaufEin(db: Datenbank, l: NeuerLauf): number {
  const r = db
    .prepare(
      `INSERT INTO recherchelauf (datum, ergebnis, anzahl_vorschlaege, anzahl_freigegeben, abdeckungsgrenzen, herkunft,
         einlese_hinweise)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
    )
    .run(
      l.datum,
      'ausgefuehrt' satisfies LaufErgebnis,
      l.anzahl_vorschlaege,
      l.abdeckungsgrenzen,
      l.herkunft,
      l.einlese_hinweise?.length ? JSON.stringify(l.einlese_hinweise) : null,
    );
  return Number(r.lastInsertRowid);
}

export function fuegeVorschlagEin(
  db: Datenbank,
  laufId: number,
  daten: unknown,
  bestand: { ist_dublette: boolean; ist_wiederansprache: boolean; bezug_ansprechpartner_id: number | null } = {
    ist_dublette: false,
    ist_wiederansprache: false,
    bezug_ansprechpartner_id: null,
  },
): number {
  const r = db
    .prepare(
      `INSERT INTO vorschlag (recherchelauf_id, zustand, daten, ist_dublette, ist_wiederansprache, bezug_ansprechpartner_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      laufId,
      'zu_pruefen' satisfies VorschlagZustand,
      JSON.stringify(daten),
      bestand.ist_dublette ? 1 : 0,
      bestand.ist_wiederansprache ? 1 : 0,
      bestand.bezug_ansprechpartner_id,
    );
  return Number(r.lastInsertRowid);
}

const LAUF_SPALTEN = `l.id, l.datum, l.anzahl_vorschlaege, l.anzahl_freigegeben, l.abdeckungsgrenzen, l.einlese_hinweise,
  (SELECT COUNT(*) FROM vorschlag v WHERE v.recherchelauf_id = l.id AND v.zustand = ?) AS offen`;

type LaufRoh = Omit<LaufZeile, 'einlese_hinweise'> & { einlese_hinweise: string | null };
const alsLaufZeile = (z: LaufRoh): LaufZeile => ({
  ...z,
  einlese_hinweise: z.einlese_hinweise ? (JSON.parse(z.einlese_hinweise) as string[]) : [],
});

/** Ausgeführte Läufe, der neueste zuerst. Übersprungene Läufe gehören nicht in den Eingangskorb. */
export function listeAusgefuehrteLaeufe(db: Datenbank): LaufZeile[] {
  return (
    db
      .prepare(`SELECT ${LAUF_SPALTEN} FROM recherchelauf l WHERE l.ergebnis = ? ORDER BY l.datum DESC, l.id DESC`)
      .all('zu_pruefen' satisfies VorschlagZustand, 'ausgefuehrt' satisfies LaufErgebnis) as unknown as LaufRoh[]
  ).map(alsLaufZeile);
}

export function liesAusgefuehrtenLauf(db: Datenbank, id: number): LaufZeile | undefined {
  const z = db
    .prepare(`SELECT ${LAUF_SPALTEN} FROM recherchelauf l WHERE l.id = ? AND l.ergebnis = ?`)
    .get('zu_pruefen' satisfies VorschlagZustand, id, 'ausgefuehrt' satisfies LaufErgebnis) as unknown as
    LaufRoh | undefined;
  return z ? alsLaufZeile(z) : undefined;
}

/** Alle noch ungeprüften Vorschläge mit dem Datum ihres Laufs, für den Abgleich beim Anlegen (E2-S5, Kriterium 3). */
export function offeneVorschlaege(db: Datenbank): { daten: VorschlagKarte['daten']; lauf_datum: string }[] {
  const zeilen = db
    .prepare(
      `SELECT v.daten, l.datum AS lauf_datum FROM vorschlag v JOIN recherchelauf l ON l.id = v.recherchelauf_id
       WHERE v.zustand = ? ORDER BY v.id`,
    )
    .all('zu_pruefen' satisfies VorschlagZustand) as { daten: string; lauf_datum: string }[];
  return zeilen.map((z) => ({ daten: JSON.parse(z.daten), lauf_datum: z.lauf_datum }));
}

export type VorschlagRoh = Pick<
  VorschlagKarte,
  'id' | 'zustand' | 'daten' | 'ist_dublette' | 'ist_wiederansprache' | 'verwerf_grund'
> & {
  bezug_ansprechpartner_id: number | null;
};

export function vorschlaegeVonLauf(db: Datenbank, laufId: number): VorschlagRoh[] {
  const zeilen = db
    .prepare(
      `SELECT id, zustand, daten, ist_dublette, ist_wiederansprache, bezug_ansprechpartner_id, verwerf_grund
       FROM vorschlag WHERE recherchelauf_id = ? ORDER BY id`,
    )
    .all(laufId) as {
    id: number;
    zustand: VorschlagKarte['zustand'];
    daten: string;
    ist_dublette: number;
    ist_wiederansprache: number;
    bezug_ansprechpartner_id: number | null;
    verwerf_grund: string | null;
  }[];
  return zeilen.map((z) => ({
    id: z.id,
    zustand: z.zustand,
    daten: JSON.parse(z.daten),
    ist_dublette: z.ist_dublette === 1,
    ist_wiederansprache: z.ist_wiederansprache === 1,
    bezug_ansprechpartner_id: z.bezug_ansprechpartner_id,
    verwerf_grund: z.verwerf_grund,
  }));
}

export interface VorschlagZeile {
  id: number;
  recherchelauf_id: number;
  zustand: VorschlagKarte['zustand'];
  daten: string;
  ist_dublette: number;
  ist_wiederansprache: number;
  bezug_ansprechpartner_id: number | null;
}

export function liesVorschlag(db: Datenbank, id: number): VorschlagZeile | undefined {
  return db
    .prepare(
      `SELECT id, recherchelauf_id, zustand, daten, ist_dublette, ist_wiederansprache, bezug_ansprechpartner_id
       FROM vorschlag WHERE id = ?`,
    )
    .get(id) as unknown as VorschlagZeile | undefined;
}

export function markiereFreigegeben(db: Datenbank, vorschlagId: number, ansprechpartnerId: number): void {
  db.prepare(`UPDATE vorschlag SET zustand = ?, ansprechpartner_id = ? WHERE id = ?`).run(
    'freigegeben' satisfies VorschlagZustand,
    ansprechpartnerId,
    vorschlagId,
  );
}

export function markiereVerworfen(db: Datenbank, vorschlagId: number, grund: string): void {
  db.prepare(`UPDATE vorschlag SET zustand = ?, verwerf_grund = ? WHERE id = ?`).run(
    'verworfen' satisfies VorschlagZustand,
    grund,
    vorschlagId,
  );
}

export function zaehleFreigabe(db: Datenbank, laufId: number): void {
  db.prepare(`UPDATE recherchelauf SET anzahl_freigegeben = anzahl_freigegeben + 1 WHERE id = ?`).run(laufId);
}
