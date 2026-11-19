// Anwendungsfall »Recherchelauf anlegen« (A1 Schritt 5, Story E2-S3). Wird auch vom Upload genutzt (E2-S5).
import type { z } from 'zod';
import { LaufEingabe, VorschlagEingabe, type LaufAngelegt, type Zurueckgewiesen } from '../../gemeinsam/lauf';
import type { LaufHerkunft } from '../../gemeinsam/werte';
import type { Uhr } from '../anbindungen/uhr';
import { transaktion, type Datenbank } from '../daten/db';
import { fuegeLaufEin, fuegeVorschlagEin, gibtAusgefuehrtenLaufAm } from '../daten/laeufe';
import { FachFehler } from '../fehler';

export function legeLaufAn(db: Datenbank, uhr: Uhr, eingabe: unknown, herkunft: LaufHerkunft): LaufAngelegt {
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
    throw new FachFehler(409, 'bereits_gelaufen', 'Für heute gibt es schon einen ausgeführten Recherchelauf.');
  }

  const gueltig: unknown[] = [];
  const zurueckgewiesen: Zurueckgewiesen[] = [];
  lauf.data.vorschlaege.forEach((roh, index) => {
    const v = VorschlagEingabe.safeParse(roh);
    if (v.success) gueltig.push(v.data);
    else {
      zurueckgewiesen.push({ index, ...rueckweisung(v.error.issues[0], roh) });
    }
  });

  const laufId = transaktion(db, () => {
    const id = fuegeLaufEin(db, {
      datum: heute,
      abdeckungsgrenzen: lauf.data.abdeckungsgrenzen ?? null,
      herkunft,
      anzahl_vorschlaege: gueltig.length,
    });
    for (const v of gueltig) fuegeVorschlagEin(db, id, v);
    return id;
  });
  return { lauf_id: laufId, angelegt: gueltig.length, zurueckgewiesen };
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
