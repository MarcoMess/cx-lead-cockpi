// Prüfung von Passwort und Agenten-Schlüssel. Der Schlüssel liegt nur als Hash in den Einstellungen.
import { timingSafeEqual } from 'node:crypto';
import type { Datenbank } from '../daten/db';
import { liesEinstellung, schreibeEinstellung } from '../daten/einstellungen';
import { gleicheSchluessel, schluesselHash } from '../regeln/zugang';

export const gleich = gleicheSchluessel;

export function setzeAgentSchluessel(db: Datenbank, schluessel: string): void {
  schreibeEinstellung(db, 'agent_schluessel_hash', schluesselHash(schluessel));
  schreibeEinstellung(db, 'agent_schluessel_endung', schluessel.slice(-4));
}

export function istAgentSchluessel(db: Datenbank, schluessel: string): boolean {
  const gespeichert = liesEinstellung(db, 'agent_schluessel_hash');
  if (!gespeichert || !schluessel) return false;
  return timingSafeEqual(Buffer.from(schluesselHash(schluessel), 'hex'), Buffer.from(gespeichert, 'hex'));
}

/** Liest den gespeicherten Schlüssel-Hash, damit er ein Zurücksetzen der Vorführdaten übersteht. */
export function liesAgentSchluesselHash(db: Datenbank): { hash: string | null; endung: string | null } {
  return { hash: liesEinstellung(db, 'agent_schluessel_hash'), endung: liesEinstellung(db, 'agent_schluessel_endung') };
}

export function schreibeAgentSchluesselHash(db: Datenbank, s: { hash: string | null; endung: string | null }): void {
  if (s.hash) schreibeEinstellung(db, 'agent_schluessel_hash', s.hash);
  if (s.endung) schreibeEinstellung(db, 'agent_schluessel_endung', s.endung);
}
