// Regeln zum Ausschluss (Konzept, Abschnitt 9 »Verwerfen im Eingangskorb«). Reine Funktionen ohne Datenbank.
import type { VerwerfGrund } from '../../gemeinsam/werte';
import type { VorschlagDaten } from '../../gemeinsam/lauf';
import { normalisiereFirmenname, normalisierePersonenname } from './dubletten';
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

export interface Sperre {
  art: 'firma' | 'person';
  name: string;
  firma_name: string | null;
  grund: string;
  gesperrt_bis: string | null;
}

/**
 * Sperrt die Sperrliste diesen Vorschlag? Firma über den normalisierten Namen, Person über den Namen
 * (und, wenn eingetragen, die Firma). Personensperren gelten bis einschließlich »gesperrt bis«, Firmensperren ohne Ablauf.
 */
export function sperreFuer(v: VorschlagDaten, sperren: Sperre[], heute: string): Sperre | null {
  const firma = normalisiereFirmenname(v.firma.name);
  const person = normalisierePersonenname(v.person.vorname, v.person.nachname);
  return (
    sperren.find((s) => s.art === 'firma' && normalisiereFirmenname(s.name) === firma) ??
    sperren.find(
      (s) =>
        s.art === 'person' &&
        sperrSchluessel(s.name) === person &&
        (!s.firma_name || normalisiereFirmenname(s.firma_name) === firma) &&
        (!s.gesperrt_bis || s.gesperrt_bis >= heute),
    ) ??
    null
  );
}
