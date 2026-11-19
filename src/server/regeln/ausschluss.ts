// Regeln zum Ausschluss (Konzept, Abschnitt 9 »Verwerfen im Eingangskorb«). Reine Funktionen ohne Datenbank.
import type { VerwerfGrund } from '../../gemeinsam/werte';
import { plusMonate } from './fristen';

/** Diese Gründe sperren die Firma (dauerhaft, bis Marco den Eintrag entfernt); die übrigen nur die Person. */
export const GRUENDE_FIRMENSPERRE: readonly VerwerfGrund[] = ['passt nicht ins Zielbild', 'wird von Kollegen betreut'];

/** Sperre der Person nach dem Verwerfen in Monaten [Annahme im Konzept]. */
export const PERSONENSPERRE_MONATE = 6;

export type Sperrfolge =
  | { art: 'firma'; name: string; gesperrt_bis: null }
  | { art: 'person'; name: string; firma_name: string; gesperrt_bis: string };

export function sperrfolgeVerwerfen(
  grund: VerwerfGrund,
  v: { firma: string; vorname: string; nachname: string },
  heute: string,
): Sperrfolge {
  if (GRUENDE_FIRMENSPERRE.includes(grund)) return { art: 'firma', name: v.firma, gesperrt_bis: null };
  return {
    art: 'person',
    name: `${v.vorname} ${v.nachname}`,
    firma_name: v.firma,
    gesperrt_bis: plusMonate(heute, PERSONENSPERRE_MONATE),
  };
}

/** Vergleichbare Form eines Namens auf der Sperrliste: klein (auch Umlaute), Leerraum zusammengefasst. */
export function sperrSchluessel(name: string): string {
  return name.toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
}
