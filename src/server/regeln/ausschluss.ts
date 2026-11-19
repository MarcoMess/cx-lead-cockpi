// Regeln zum Ausschluss (Konzept, Abschnitt 9 »Verwerfen im Eingangskorb«). Reine Funktionen ohne Datenbank.
import type { VerwerfGrund } from '../../gemeinsam/werte';
import { normalisiereFirmenname } from './dubletten';
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
  return name.normalize('NFC').toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
}

/**
 * Gibt es für diese Firma oder Person schon einen **gültigen** Eintrag? Firmen werden ohne Rechtsform verglichen,
 * Personen mit ihrer Firma; ein abgelaufener Eintrag (»gesperrt bis« vor heute) zählt nicht (Prüfung E3-S4, Befund 1).
 */
export function gueltigeSperre(
  eintraege: { art: 'firma' | 'person'; name: string; firma_name: string | null; gesperrt_bis: string | null }[],
  neu: { art: 'firma' | 'person'; name: string; firma_name?: string | null },
  heute: string,
): boolean {
  return eintraege.some((e) => {
    if (e.art !== neu.art || (e.gesperrt_bis && e.gesperrt_bis < heute)) return false;
    if (e.art === 'firma') return normalisiereFirmenname(e.name) === normalisiereFirmenname(neu.name);
    const gleicheFirma =
      !e.firma_name ||
      !neu.firma_name ||
      normalisiereFirmenname(e.firma_name) === normalisiereFirmenname(neu.firma_name);
    return sperrSchluessel(e.name) === sperrSchluessel(neu.name) && gleicheFirma;
  });
}
