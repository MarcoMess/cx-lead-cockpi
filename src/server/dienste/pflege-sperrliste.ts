// Anwendungsfälle der Sperrliste (Story E10-S1, Screen S8): ansehen, Eintrag hinzufügen, Eintrag entfernen.
import { SperreEingabe, type SperrZeile } from '../../gemeinsam/sperrliste';
import type { Uhr } from '../anbindungen/uhr';
import { transaktion, type Datenbank } from '../daten/db';
import { entferneSperre, legeSperreAn, listeSperren } from '../daten/sperrliste';
import { FachFehler } from '../fehler';
import { gueltigeSperre } from '../regeln/ausschluss';

export function ladeSperrliste(db: Datenbank): SperrZeile[] {
  return listeSperren(db);
}

export function fuegeSperreHinzu(db: Datenbank, uhr: Uhr, eingabe: unknown): SperrZeile[] {
  const e = SperreEingabe.safeParse(eingabe);
  if (!e.success) {
    const f = e.error.issues[0];
    throw new FachFehler(422, 'eingabe_ungueltig', f.message, String(f.path[0] ?? ''));
  }
  return transaktion(db, () => {
    if (gueltigeSperre(listeSperren(db), { art: e.data.art, name: e.data.name }, uhr.heute())) {
      throw new FachFehler(
        409,
        'schon_gesperrt',
        `»${e.data.name}« steht schon auf der Sperrliste. Ein zweiter Eintrag ist nicht nötig.`,
        'name',
      );
    }
    legeSperreAn(db, {
      art: e.data.art,
      name: e.data.name,
      grund: e.data.grund || 'Von Marco gesperrt',
      herkunft: 'von_marco',
      erstellt_am: uhr.heute(),
    });
    return listeSperren(db);
  });
}

export function entferneSperreintrag(db: Datenbank, id: number): SperrZeile[] {
  return transaktion(db, () => {
    if (!Number.isInteger(id) || id < 1 || !entferneSperre(db, id)) {
      throw new FachFehler(404, 'sperre_unbekannt', 'Diesen Eintrag gibt es nicht mehr auf der Sperrliste.');
    }
    return listeSperren(db);
  });
}
