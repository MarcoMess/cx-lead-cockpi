// Die Uhr des Cockpits: einziger Ort für die Systemzeit (architektur.md, Abschnitt 9).
// Im Prototyp gilt ein Vorführdatum aus dem Uhr-Simulator, wenn es gesetzt ist.
import type { Datenbank } from '../daten/db';
import { liesVorfuehrdatum } from './uhr-simulator';

const ZEITZONE = 'Europe/Berlin';

export class Uhr {
  constructor(private readonly vorfuehrdatum: () => string | null = () => null) {}

  /** Heutiges Datum JJJJ-MM-TT. */
  heute(): string {
    return this.vorfuehrdatum() || new Intl.DateTimeFormat('sv-SE', { timeZone: ZEITZONE }).format(new Date());
  }

  /** Zeitpunkt JJJJ-MM-TT HH:MM: Datum der Uhr, Uhrzeit der Systemzeit. */
  jetzt(): string {
    const zeit = new Intl.DateTimeFormat('de-DE', { timeZone: ZEITZONE, hour: '2-digit', minute: '2-digit' }).format(
      new Date(),
    );
    return `${this.heute()} ${zeit}`;
  }
}

/** Uhr des Prototyps: Systemzeit, überschrieben vom Vorführdatum. */
export function erstelleUhr(db: Datenbank): Uhr {
  return new Uhr(() => liesVorfuehrdatum(db));
}

export { setzeVorfuehrdatum } from './uhr-simulator';
