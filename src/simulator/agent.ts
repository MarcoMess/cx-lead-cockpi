// Simulierter Recherche-Agent (architektur.md, Abschnitt 6). Er benutzt ausschließlich die Agenten-API
// mit dem Agenten-Schlüssel – genau wie später die geplante Claude-Aufgabe – und schreibt nie direkt in die Datenbank.
// Die Anfrage läuft über `app.inject`, also durch dieselbe Routen-, Zugangs- und Fehlerbehandlung wie eine HTTP-Anfrage.
// Seinen eigenen Zustand (geliefert, API gestört, Ergebnisdatei) hält er in den Einstellungen.
import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { FehlerAntwort } from '../gemeinsam/fehler';
import type { LaufAngelegt } from '../gemeinsam/lauf';
import { FachFehler } from '../server/fehler';
import type { Datenbank } from '../server/daten/db';
import { liesEinstellung, schreibeEinstellung } from '../server/daten/einstellungen';

const BEISPIEL_LAUF = JSON.parse(readFileSync(fileURLToPath(new URL('./beispiel-lauf.json', import.meta.url)), 'utf8'));
const LEERER_LAUF = { abdeckungsgrenzen: 'Keine weiteren belegten Treffer', vorschlaege: [] };

// Zustand des Simulators; liegt in den Einstellungen und wird mit den Vorführdaten zurückgesetzt.
const GELIEFERT = 'sim_agent_geliefert';
const GESTOERT = 'sim_agent_api_gestoert';
const DATEI = 'sim_agent_ergebnisdatei';

const lies = liesEinstellung;
const schreibe = schreibeEinstellung;

export function agentZustand(db: Datenbank) {
  return { api_gestoert: lies(db, GESTOERT) === '1', ergebnisdatei_bereit: lies(db, DATEI) !== null };
}

export function setzeApiGestoert(db: Datenbank, gestoert: boolean): void {
  schreibe(db, GESTOERT, gestoert ? '1' : '0');
}

export function ergebnisdatei(db: Datenbank): unknown | null {
  const d = lies(db, DATEI);
  return d === null ? null : JSON.parse(d);
}

export type AgentMeldung =
  | { ergebnis: 'lauf_angelegt'; lauf_id: number; angelegt: number; meldung: string }
  | { ergebnis: 'api_gestoert'; meldung: string };

/** Der Agent meldet sich: erster Lauf mit den vier Beispielvorschlägen, danach Läufe ohne Vorschläge. */
export async function agentMeldetSich(
  app: FastifyInstance,
  agentSchluessel: string | undefined,
): Promise<AgentMeldung> {
  const lauf = lies(app.db, GELIEFERT) === '1' ? LEERER_LAUF : BEISPIEL_LAUF;

  if (lies(app.db, GESTOERT) === '1') {
    // Nicht als geliefert merken: Wird die Störung wieder ausgeschaltet, liefert der Agent den Lauf erneut
    // (Prüfung E1-S3, Befund 2). Den Upload der Ergebnisdatei baut E2-S5.
    schreibe(app.db, DATEI, JSON.stringify(lauf));
    return {
      ergebnis: 'api_gestoert',
      meldung:
        'Der Agent hat recherchiert, erreicht die Cockpit-API aber nicht. Die Ergebnisdatei liegt zum Hochladen bereit.',
    };
  }
  if (!agentSchluessel) {
    throw new FachFehler(409, 'agent_schluessel_fehlt', 'Für den simulierten Agenten fehlt COCKPIT_AGENT_KEY in .env.');
  }

  const r = await app.inject({
    method: 'POST',
    url: '/api/v1/agent/laeufe',
    headers: { authorization: `Bearer ${agentSchluessel}` },
    payload: lauf,
  });
  if (r.statusCode !== 201) {
    const f = (r.json() as FehlerAntwort).fehler;
    throw new FachFehler(
      r.statusCode === 409 ? 409 : 502,
      f.code,
      `Der Agent konnte keinen Lauf anlegen: ${f.meldung}`,
    );
  }
  const ergebnis = r.json() as LaufAngelegt;
  schreibe(app.db, GELIEFERT, '1');
  return {
    ergebnis: 'lauf_angelegt',
    lauf_id: ergebnis.lauf_id,
    angelegt: ergebnis.angelegt,
    meldung:
      ergebnis.angelegt === 1
        ? 'Der Agent hat 1 Vorschlag geliefert.'
        : `Der Agent hat ${ergebnis.angelegt} Vorschläge geliefert.`,
  };
}
