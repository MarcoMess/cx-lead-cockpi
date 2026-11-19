// `npm run echt`, Schritt 1: Datenbank für den Echtbetrieb anlegen, falls es sie noch nicht gibt.
// Gestartet wird danach mit DATABASE_PATH auf diese Datei und ohne Vorführmodus (scripts/echt.mjs).
import { Uhr } from './anbindungen/uhr';
import { oeffneDatenbank } from './daten/db';
import { zaehleBestand } from './daten/leeren';
import { richteEchtbetriebEin } from './dienste/richte-echtbetrieb-ein';
import { ladeUmgebung } from './umgebung';

export const ECHT_DATENBANK = './data/echt.sqlite';

ladeUmgebung();
const pfad = process.env.ECHT_DATABASE_PATH ?? ECHT_DATENBANK;
const db = oeffneDatenbank(pfad);
const { neu } = richteEchtbetriebEin(db, new Uhr().heute(), process.env.COCKPIT_AGENT_KEY || undefined);
const n = zaehleBestand(db);
console.log(
  neu
    ? `Echtbetrieb eingerichtet in ${pfad}: ${n.sperreintrag} Sperreinträge, Rechercheprofil angelegt, keine Beispieldaten.`
    : `Echtbetrieb mit ${pfad}: ${n.firma} Firmen, ${n.ansprechpartner} Ansprechpartner, ${n.recherchelauf} Läufe.`,
);
db.close();
