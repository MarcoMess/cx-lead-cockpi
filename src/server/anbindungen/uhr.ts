// Die Uhr des Cockpits: einziger Ort für die Systemzeit (architektur.md, Abschnitt 9).
// Im Prototyp gilt ein Vorführdatum aus den Einstellungen (`heute_override`), wenn es gesetzt ist.
import type { Datenbank } from '../daten/db';

const ZEITZONE = 'Europe/Berlin';

export class Uhr {
  constructor(private readonly db: Datenbank) {}

  /** Heutiges Datum JJJJ-MM-TT. */
  heute(): string {
    const z = this.db.prepare(`SELECT wert FROM einstellung WHERE schluessel = 'heute_override'`).get() as
      { wert: string | null } | undefined;
    return z?.wert || new Intl.DateTimeFormat('sv-SE', { timeZone: ZEITZONE }).format(new Date());
  }

  /** Zeitpunkt JJJJ-MM-TT HH:MM: Datum der Uhr, Uhrzeit der Systemzeit. */
  jetzt(): string {
    const zeit = new Intl.DateTimeFormat('de-DE', { timeZone: ZEITZONE, hour: '2-digit', minute: '2-digit' }).format(
      new Date(),
    );
    return `${this.heute()} ${zeit}`;
  }
}

export function setzeVorfuehrdatum(db: Datenbank, datum: string | null): void {
  db.prepare(
    `INSERT INTO einstellung (schluessel, wert) VALUES ('heute_override', ?)
     ON CONFLICT (schluessel) DO UPDATE SET wert = excluded.wert`,
  ).run(datum);
}
