// Zugriff auf Rechercheläufe und Vorschläge (nur Lesen und Schreiben, keine Entscheidungen).
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
