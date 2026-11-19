// Regeln zum Ausschluss (Konzept, Abschnitt 9 »Verwerfen im Eingangskorb«). Reine Funktionen ohne Datenbank.
import type { VerwerfGrund } from '../../gemeinsam/werte';
import type { VorschlagDaten } from '../../gemeinsam/lauf';
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

// Anreden und Titel vor dem Namen, die beim Abgleich von Personen nicht zählen (Prüfung E2-S5, Befund 3).
const ANREDE_ODER_TITEL = /^(herr|frau|dr|prof|mag|ing|dipl|dipl-ing|dipl-kfm|dr-ing)$/;

/** Vergleichbare Form eines Personennamens auf der Sperrliste: wie `sperrSchluessel`, ohne Anrede und Titel davor. */
export function personenSchluessel(name: string): string {
  const teile = sperrSchluessel(name).split(' ');
  while (teile.length > 2 && ANREDE_ODER_TITEL.test(teile[0].replace(/\./g, ''))) teile.shift();
  return teile.join(' ');
}

/**
 * Trifft ein Firmeneintrag der Sperrliste diese Firma? Gleicher Name ohne Rechtsform oder der Eintrag ist der
 * Anfang des Namens in ganzen Wörtern: »HORNBACH« sperrt »HORNBACH Baumarkt AG«, »Bobst« sperrt »Bobst Group SA«,
 * aber »Horn« nicht »Hornbach« (Prüfung E2-S5, Befund 3).
 */
export function firmaGesperrt(eintrag: string, firma: string): boolean {
  const e = normalisiereFirmenname(eintrag);
  const f = normalisiereFirmenname(firma);
  return !!e && (f === e || f.startsWith(e + ' '));
}

/**
 * Der **gültige** Eintrag für diese Firma oder Person, sonst null. Firmen werden ohne Rechtsform verglichen,
 * Personen mit ihrer Firma; ein abgelaufener Eintrag (»gesperrt bis« vor heute) zählt nicht (Prüfung E3-S4, Befund 1).
 */
export function findeGueltigeSperre<
  E extends { art: 'firma' | 'person'; name: string; firma_name: string | null; gesperrt_bis: string | null },
>(eintraege: E[], neu: { art: 'firma' | 'person'; name: string; firma_name?: string | null }, heute: string): E | null {
  return (
    eintraege.find((e) => {
      if (e.art !== neu.art || (e.gesperrt_bis && e.gesperrt_bis < heute)) return false;
      if (e.art === 'firma') return normalisiereFirmenname(e.name) === normalisiereFirmenname(neu.name);
      const gleicheFirma =
        !e.firma_name ||
        !neu.firma_name ||
        normalisiereFirmenname(e.firma_name) === normalisiereFirmenname(neu.firma_name);
      return personenSchluessel(e.name) === personenSchluessel(neu.name) && gleicheFirma;
    }) ?? null
  );
}

/** Gibt es für diese Firma oder Person schon einen gültigen Eintrag? */
export function gueltigeSperre(
  eintraege: { art: 'firma' | 'person'; name: string; firma_name: string | null; gesperrt_bis: string | null }[],
  neu: { art: 'firma' | 'person'; name: string; firma_name?: string | null },
  heute: string,
): boolean {
  return findeGueltigeSperre(eintraege, neu, heute) !== null;
}

/**
 * Was beim Verwerfen mit einem vorhandenen gültigen Eintrag geschieht: Eine befristete Personensperre, die vor der
 * neuen Frist endet, wird bis zur neuen Frist verlängert (Prüfung E3-S4 Runde 2); sonst bleibt der Eintrag, wie er ist.
 */
export function sperreNachVerwerfen(
  vorhanden: { gesperrt_bis: string | null },
  folge: Sperrfolge,
): { gesperrt_bis: string | null; verlaengern: boolean } {
  if (folge.art === 'person' && vorhanden.gesperrt_bis && vorhanden.gesperrt_bis < folge.gesperrt_bis) {
    return { gesperrt_bis: folge.gesperrt_bis, verlaengern: true };
  }
  return { gesperrt_bis: vorhanden.gesperrt_bis, verlaengern: false };
}

export interface Sperre {
  art: 'firma' | 'person';
  name: string;
  firma_name: string | null;
  grund: string;
  gesperrt_bis: string | null;
}

/**
 * Sperrt die Sperrliste diesen Vorschlag? Firma über `firmaGesperrt`, Person über den Namen ohne Anrede und Titel
 * (und, wenn eingetragen, die Firma). Personensperren gelten bis einschließlich »gesperrt bis«, Firmensperren ohne Ablauf.
 */
export function sperreFuer(v: VorschlagDaten, sperren: Sperre[], heute: string): Sperre | null {
  const person = personenSchluessel(`${v.person.vorname} ${v.person.nachname}`);
  return (
    sperren.find((s) => s.art === 'firma' && firmaGesperrt(s.name, v.firma.name)) ??
    sperren.find(
      (s) =>
        s.art === 'person' &&
        personenSchluessel(s.name) === person &&
        (!s.firma_name || firmaGesperrt(s.firma_name, v.firma.name)) &&
        (!s.gesperrt_bis || s.gesperrt_bis >= heute),
    ) ??
    null
  );
}
