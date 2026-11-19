// Zugriff auf Rechercheläufe und Vorschläge (nur Lesen und Schreiben, keine Entscheidungen).
import type { Datenbank } from './db';

export interface NeuerLauf {
  datum: string;
  abdeckungsgrenzen: string | null;
  herkunft: 'api' | 'upload';
  anzahl_vorschlaege: number;
}

export function gibtAusgefuehrtenLaufAm(db: Datenbank, datum: string): boolean {
  return !!db.prepare(`SELECT 1 FROM recherchelauf WHERE datum = ? AND ergebnis = 'ausgefuehrt'`).get(datum);
}

export function fuegeLaufEin(db: Datenbank, l: NeuerLauf): number {
  const r = db
    .prepare(
      `INSERT INTO recherchelauf (datum, ergebnis, anzahl_vorschlaege, anzahl_freigegeben, abdeckungsgrenzen, herkunft)
       VALUES (?, 'ausgefuehrt', ?, 0, ?, ?)`,
    )
    .run(l.datum, l.anzahl_vorschlaege, l.abdeckungsgrenzen, l.herkunft);
  return Number(r.lastInsertRowid);
}

export function fuegeVorschlagEin(db: Datenbank, laufId: number, daten: unknown): number {
  const r = db
    .prepare(`INSERT INTO vorschlag (recherchelauf_id, zustand, daten) VALUES (?, 'zu_pruefen', ?)`)
    .run(laufId, JSON.stringify(daten));
  return Number(r.lastInsertRowid);
}
