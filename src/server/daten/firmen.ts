// Zugriff auf Firmen.
import type { Datenbank } from './db';

export interface NeueFirma {
  name: string;
  name_norm: string;
  domain: string | null;
  branche: string;
  land: string;
  umsatz_wert: number;
  umsatz_waehrung: string;
  umsatz_jahr: number;
  umsatz_bezug: string;
  umsatz_quelle_url: string;
  wechselkurs: number | null;
  wechselkurs_quelle_url: string | null;
  umsatz_eur: number | null;
}

export function findeFirmaNachNormname(db: Datenbank, nameNorm: string): { id: number } | undefined {
  return db.prepare(`SELECT id FROM firma WHERE name_norm = ?`).get(nameNorm) as { id: number } | undefined;
}

export function legeFirmaAn(db: Datenbank, f: NeueFirma): number {
  const r = db
    .prepare(
      `INSERT INTO firma (name, name_norm, domain, branche, land, umsatz_wert, umsatz_waehrung, umsatz_jahr, umsatz_bezug,
        umsatz_quelle_url, wechselkurs, wechselkurs_quelle_url, umsatz_eur) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      f.name,
      f.name_norm,
      f.domain,
      f.branche,
      f.land,
      f.umsatz_wert,
      f.umsatz_waehrung,
      f.umsatz_jahr,
      f.umsatz_bezug,
      f.umsatz_quelle_url,
      f.wechselkurs,
      f.wechselkurs_quelle_url,
      f.umsatz_eur,
    );
  return Number(r.lastInsertRowid);
}
