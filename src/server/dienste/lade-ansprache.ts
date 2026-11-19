// Anwendungsfall »Ansprache laden« (A3 Schritt 1, Story E5-S1).
import type { Ansprache } from '../../gemeinsam/ansprache';
import { liesAkteStamm, liesAnlaesse, liesNachricht } from '../daten/ansprechpartner';
import type { Datenbank } from '../daten/db';
import { FachFehler } from '../fehler';
import { anspracheModus } from '../regeln/ansprache';

export function ladeAnsprache(db: Datenbank, id: number): Ansprache {
  const a = Number.isInteger(id) && id > 0 ? liesAkteStamm(db, id) : undefined;
  if (!a) throw new FachFehler(404, 'kontakt_unbekannt', 'Diesen Kontakt gibt es nicht.');
  return {
    kontakt: {
      id: a.id,
      anrede: a.anrede,
      titel: a.titel,
      vorname: a.vorname,
      nachname: a.nachname,
      funktion: a.funktion,
      firma_name: a.firma.name,
      linkedin_url: a.linkedin_url,
      status: a.status,
      antwort_art: a.antwort_art,
    },
    modus: anspracheModus(a.status),
    aufhaenger: liesAnlaesse(db, id)[0] ?? null,
    nachricht: liesNachricht(db, id, 'linkedin', 'erstkontakt') ?? null,
    erste_nachricht: null,
  };
}
