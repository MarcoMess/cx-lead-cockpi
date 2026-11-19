// Zugriff auf Rechercheläufe und Vorschläge (nur Lesen und Schreiben, keine Entscheidungen).
import type { LaufZeile, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import type { LaufErgebnis, LaufHerkunft, VorschlagZustand } from '../../gemeinsam/werte';
import type { Datenbank } from './db';

export interface NeuerLauf {
  datum: string;
  abdeckungsgrenzen: string | null;
  herkunft: LaufHerkunft;
  anzahl_vorschlaege: number;
}

export function gibtAusgefuehrtenLaufAm(db: Datenbank, datum: string): boolean {
  return !!db
    .prepare(`SELECT 1 FROM recherchelauf WHERE datum = ? AND ergebnis = ?`)
    .get(datum, 'ausgefuehrt' satisfies LaufErgebnis);
}

export function fuegeLaufEin(db: Datenbank, l: NeuerLauf): number {
  const r = db
    .prepare(
      `INSERT INTO recherchelauf (datum, ergebnis, anzahl_vorschlaege, anzahl_freigegeben, abdeckungsgrenzen, herkunft)
       VALUES (?, ?, ?, 0, ?, ?)`,
    )
    .run(l.datum, 'ausgefuehrt' satisfies LaufErgebnis, l.anzahl_vorschlaege, l.abdeckungsgrenzen, l.herkunft);
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

const LAUF_SPALTEN = `l.id, l.datum, l.anzahl_vorschlaege, l.anzahl_freigegeben, l.abdeckungsgrenzen,
  (SELECT COUNT(*) FROM vorschlag v WHERE v.recherchelauf_id = l.id AND v.zustand = ?) AS offen`;

/** Ausgeführte Läufe, der neueste zuerst. Übersprungene Läufe gehören nicht in den Eingangskorb. */
export function listeAusgefuehrteLaeufe(db: Datenbank): LaufZeile[] {
  return db
    .prepare(`SELECT ${LAUF_SPALTEN} FROM recherchelauf l WHERE l.ergebnis = ? ORDER BY l.datum DESC, l.id DESC`)
    .all('zu_pruefen' satisfies VorschlagZustand, 'ausgefuehrt' satisfies LaufErgebnis) as unknown as LaufZeile[];
}

export function liesAusgefuehrtenLauf(db: Datenbank, id: number): LaufZeile | undefined {
  return db
    .prepare(`SELECT ${LAUF_SPALTEN} FROM recherchelauf l WHERE l.id = ? AND l.ergebnis = ?`)
    .get('zu_pruefen' satisfies VorschlagZustand, id, 'ausgefuehrt' satisfies LaufErgebnis) as unknown as
    LaufZeile | undefined;
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
