// Zugriff auf das Rechercheprofil (ein Datensatz).
import type { Datenbank } from './db';

/** Mindestumsatz des Profils in Mio. EUR; ohne Profil gilt der Standard des Konzepts, 50 Mio. EUR. */
export function liesMindestumsatz(db: Datenbank): number {
  const r = db.prepare(`SELECT mindestumsatz_mio_eur AS m FROM rechercheprofil WHERE id = 1`).get() as
    { m: number } | undefined;
  return r?.m ?? 50;
}
