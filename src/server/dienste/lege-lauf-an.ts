// Anwendungsfall »Recherchelauf anlegen« (A1 Schritt 5, Stories E2-S3 und E2-S4). Wird auch vom Upload genutzt (E2-S5).
import type { z } from 'zod';
import {
  LaufEingabe,
  VorschlagEingabe,
  type BereitsVorhanden,
  type LaufAngelegt,
  type VorschlagDaten,
  type Zurueckgewiesen,
} from '../../gemeinsam/lauf';
import type { LaufHerkunft } from '../../gemeinsam/werte';
import type { Uhr } from '../anbindungen/uhr';
import { transaktion, type Datenbank } from '../daten/db';
import { liesBestand } from '../daten/bestand';
import { fuegeLaufEin, fuegeVorschlagEin, gibtAusgefuehrtenLaufAm, offeneVorschlaege } from '../daten/laeufe';
import { FachFehler } from '../fehler';
import { gleichePerson, pruefeGegenBestand } from '../regeln/dubletten';

export interface LaufOptionen {
  herkunft: LaufHerkunft;
  /**
   * Beim Hochladen: Bringt die Datei Vorschläge, aber keinen neuen, entsteht kein Lauf. So bleibt der Tag frei,
   * und Marco kann eine korrigierte Datei noch am selben Tag hochladen (Prüfung E2-S5, Befund 4).
   */
  ohneNeueAbweisen?: boolean;
}

export function legeLaufAn(db: Datenbank, uhr: Uhr, eingabe: unknown, optionen: LaufOptionen): LaufAngelegt {
  const lauf = LaufEingabe.safeParse(eingabe);
  if (!lauf.success) {
    const feld = String(lauf.error.issues[0]?.path[0] ?? 'vorschlaege');
    const meldung =
      feld === 'abdeckungsgrenzen'
        ? 'Die Abdeckungsgrenzen müssen Text sein.'
        : 'Der Lauf braucht eine Liste »vorschlaege«.';
    throw new FachFehler(400, 'lauf_ungueltig', meldung, feld);
  }
  const heute = uhr.heute();
  if (gibtAusgefuehrtenLaufAm(db, heute)) {
    throw new FachFehler(
      409,
      'bereits_gelaufen',
      'Für heute gibt es schon einen ausgeführten Recherchelauf. Lade die Datei am nächsten Werktag hoch; ' +
        'Vorschläge, die schon im Eingangskorb liegen, werden dabei übersprungen.',
    );
  }

  const gueltig: VorschlagDaten[] = [];
  const zurueckgewiesen: Zurueckgewiesen[] = [];
  const bereitsVorhanden: BereitsVorhanden[] = [];
  const offen = offeneVorschlaege(db);
  lauf.data.vorschlaege.forEach((roh, index) => {
    const v = VorschlagEingabe.safeParse(roh);
    if (!v.success) {
      zurueckgewiesen.push({ index, ...rueckweisung(v.error.issues[0], roh), bezeichnung: bezeichnungRoh(roh) });
      return;
    }
    // Liegt dieselbe Person schon ungeprüft im Eingangskorb oder weiter oben in der Datei, wird sie nicht noch
    // einmal angelegt (Kriterium 3); freigegebene erkennt die Dublettenprüfung gegen den Bestand.
    const schonOffen = offen.find((o) => gleichePerson(o.daten, v.data));
    const schonInDatei = !schonOffen && gueltig.some((g) => gleichePerson(g, v.data));
    if (schonOffen || schonInDatei) {
      bereitsVorhanden.push({ index, bezeichnung: bezeichnung(v.data), lauf_datum: schonOffen?.lauf_datum ?? null });
      return;
    }
    gueltig.push(v.data);
  });

  if (optionen.ohneNeueAbweisen && gueltig.length === 0 && lauf.data.vorschlaege.length > 0) {
    throw new FachFehler(
      422,
      'nichts_neu',
      `Es wurde kein Lauf angelegt: ${hinweise(zurueckgewiesen, bereitsVorhanden).join(' ')}`,
    );
  }

  const laufId = transaktion(db, () => {
    const id = fuegeLaufEin(db, {
      datum: heute,
      abdeckungsgrenzen: lauf.data.abdeckungsgrenzen ?? null,
      herkunft: optionen.herkunft,
      anzahl_vorschlaege: gueltig.length,
      einlese_hinweise: hinweise(zurueckgewiesen, bereitsVorhanden),
    });
    // Dublettenprüfung beim Anlegen (A1 Schritt 5, Story E2-S4).
    const bestand = liesBestand(db);
    for (const v of gueltig) {
      const p = pruefeGegenBestand(v, bestand, heute);
      fuegeVorschlagEin(db, id, v, p);
    }
    return id;
  });
  return { lauf_id: laufId, angelegt: gueltig.length, zurueckgewiesen, bereits_vorhanden: bereitsVorhanden };
}

const datum = (d: string) => d.split('-').reverse().join('.');

/** Je nicht übernommenem Vorschlag ein Satz; wird am Lauf gespeichert und beim Hochladen angezeigt. */
export function hinweise(zurueck: Zurueckgewiesen[], vorhanden: BereitsVorhanden[]): string[] {
  return [
    ...zurueck.map((z) => `Nr. ${z.index + 1} (${z.bezeichnung}) zurückgewiesen: ${z.meldung}`),
    ...vorhanden.map(
      (b) =>
        `Nr. ${b.index + 1} (${b.bezeichnung}) nicht noch einmal angelegt: ` +
        (b.lauf_datum
          ? `liegt schon ungeprüft im Lauf vom ${datum(b.lauf_datum)}.`
          : 'steht weiter oben in derselben Datei.'),
    ),
  ];
}

const bezeichnung = (v: VorschlagDaten) => `${v.person.vorname} ${v.person.nachname}, ${v.firma.name}`;

/** Firma und Person aus einem ungültigen Vorschlag, soweit lesbar. */
function bezeichnungRoh(roh: unknown): string {
  const o = (x: unknown, k: string): unknown =>
    x !== null && typeof x === 'object' ? (x as Record<string, unknown>)[k] : undefined;
  const t = (x: unknown) => (typeof x === 'string' && x.trim() ? x.trim() : null);
  const person = [t(o(o(roh, 'person'), 'vorname')), t(o(o(roh, 'person'), 'nachname'))].filter(Boolean).join(' ');
  const firma = t(o(o(roh, 'firma'), 'name'));
  return [person, firma].filter(Boolean).join(', ') || 'ohne Namen';
}

/** Übersetzt den ersten Fehler eines Vorschlags in Feld und deutsche Meldung. */
function rueckweisung(f: z.core.$ZodIssue, roh: unknown): { feld: string; meldung: string } {
  if (f.path.length === 0 || roh === null || typeof roh !== 'object') {
    return { feld: 'vorschlag', meldung: 'Der Vorschlag muss ein Objekt mit »firma« und »person« sein.' };
  }
  const feld = f.path.join('.');
  const wert = f.path.reduce<unknown>(
    (o, k) => (o !== null && typeof o === 'object' ? (o as Record<PropertyKey, unknown>)[k as PropertyKey] : undefined),
    roh,
  );
  if (wert === undefined) return { feld, meldung: `Das Feld »${feld}« fehlt.` };
  if (f.code === 'invalid_value') {
    return { feld, meldung: `Das Feld »${feld}« hat einen unzulässigen Wert. Erlaubt: ${f.values.join(', ')}.` };
  }
  if (f.code === 'invalid_type')
    return { feld, meldung: `Das Feld »${feld}« hat den falschen Typ (erwartet: ${f.expected}).` };
  if (f.code === 'too_small' || f.code === 'custom') return { feld, meldung: f.message };
  return { feld, meldung: `Das Feld »${feld}« ist ungültig.` };
}
