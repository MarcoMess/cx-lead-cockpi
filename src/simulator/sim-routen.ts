// Vorführ-Adressen unter /api/v1/sim – nur bei COCKPIT_DEMO=1 (architektur.md, Abschnitt 6).
// Eine Routen-Datei wie in `api`: Sie prüft die Eingabe und ruft genau einen Dienst oder den Agenten-Simulator.
import type { FastifyPluginAsync } from 'fastify';
import { FachFehler } from '../server/fehler';
import { setzeZurueck } from '../server/dienste/zuruecksetzen';
import { aendereVorfuehrdatum } from '../server/dienste/vorfuehrdatum';
import { agentMeldetSich, agentZustand, ergebnisdatei, setzeApiGestoert } from './agent';

export const simRouten: FastifyPluginAsync<{ agentSchluessel?: string }> = async (app, opt) => {
  app.get('/sim/zustand', async () => ({ heute: app.uhr.heute(), agent: agentZustand(app.db) }));

  app.post('/sim/zuruecksetzen', async () => {
    setzeZurueck(app.db);
    return { heute: app.uhr.heute() };
  });

  app.post<{ Body: { heute?: unknown; plus_werktage?: unknown } }>('/sim/datum', async (req) => ({
    heute: aendereVorfuehrdatum(app.db, app.uhr, req.body ?? {}),
  }));

  app.post('/sim/agent/meldung', async () => agentMeldetSich(app, opt.agentSchluessel));

  app.put<{ Body: { api_gestoert?: unknown } }>('/sim/agent', async (req) => {
    if (typeof req.body?.api_gestoert !== 'boolean') {
      throw new FachFehler(
        400,
        'eingabe_ungueltig',
        'Bitte »api_gestoert« als true oder false angeben.',
        'api_gestoert',
      );
    }
    setzeApiGestoert(app.db, req.body.api_gestoert);
    return agentZustand(app.db);
  });

  app.get('/sim/agent/ergebnisdatei', async () => {
    const d = ergebnisdatei(app.db);
    if (d === null)
      throw new FachFehler(404, 'keine_ergebnisdatei', 'Es liegt keine Ergebnisdatei des Agenten bereit.');
    return d;
  });
};
