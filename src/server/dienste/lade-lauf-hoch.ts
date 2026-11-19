// Anwendungsfall »Ergebnisdatei hochladen« (A1 Ausnahme und Weg im ersten Echtbetrieb, Story E2-S5).
// Dieselbe Prüfung wie beim Anlegen über die API; Sperrliste und Bestand prüft das Cockpit beim Öffnen und Freigeben.
import type { LaufAngelegt } from '../../gemeinsam/lauf';
import type { Uhr } from '../anbindungen/uhr';
import type { Datenbank } from '../daten/db';
import { FachFehler } from '../fehler';
import { legeLaufAn } from './lege-lauf-an';

export function ladeLaufHoch(db: Datenbank, uhr: Uhr, inhalt: unknown): LaufAngelegt {
  if (inhalt === null || typeof inhalt !== 'object' || Array.isArray(inhalt)) {
    throw new FachFehler(
      400,
      'datei_unlesbar',
      'Die Datei lässt sich nicht lesen: Erwartet wird ein Lauf im JSON-Format mit der Liste »vorschlaege«.',
    );
  }
  return legeLaufAn(db, uhr, inhalt, 'upload');
}
