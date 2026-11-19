import { createHash, timingSafeEqual } from 'node:crypto';
// Wer darf welche Adresse aufrufen (Konzept Abschnitt 3, Story E1-S1). Reine Funktion ohne Datenbank.

export type Zugangsart = 'oeffentlich' | 'agent' | 'sitzung';

const OEFFENTLICH = new Set([
  'GET /api/v1/gesundheit',
  'POST /api/v1/anmeldung',
  'POST /api/v1/abmeldung',
  'GET /api/v1/ich',
]);

/** Ordnet eine Anfrage einer Zugangsart zu. Adressen außerhalb von /api/v1 bedient der Server nicht. */
export function zugangsart(methode: string, url: string): Zugangsart {
  const pfad = url.split('?')[0].replace(/\/+$/, '');
  if (OEFFENTLICH.has(`${methode} ${pfad}`)) return 'oeffentlich';
  if (pfad === '/api/v1/agent' || pfad.startsWith('/api/v1/agent/')) return 'agent';
  return 'sitzung';
}

/** Hash eines Schlüssels oder Passworts (SHA-256, hex). Schlüssel werden nur als Hash gespeichert. */
export function schluesselHash(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/** Vergleich in konstanter Zeit über die Hashes, damit die Länge nichts verrät. */
export function gleicheSchluessel(a: string, b: string): boolean {
  return timingSafeEqual(Buffer.from(schluesselHash(a), 'hex'), Buffer.from(schluesselHash(b), 'hex'));
}
