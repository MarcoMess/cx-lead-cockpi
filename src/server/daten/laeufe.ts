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

export function fuegeVorschlagEin(db: Datenbank, laufId: number, daten: unknown): number {
  const r = db
    .prepare(`INSERT INTO vorschlag (recherchelauf_id, zustand, daten) VALUES (?, ?, ?)`)
    .run(laufId, 'zu_pruefen' satisfies VorschlagZustand, JSON.stringify(daten));
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

export function vorschlaegeVonLauf(db: Datenbank, laufId: number): VorschlagKarte[] {
  const zeilen = db
    .prepare(`SELECT id, zustand, daten FROM vorschlag WHERE recherchelauf_id = ? ORDER BY id`)
    .all(laufId) as { id: number; zustand: VorschlagKarte['zustand']; daten: string }[];
  return zeilen.map((z) => ({ id: z.id, zustand: z.zustand, daten: JSON.parse(z.daten) }));
}
