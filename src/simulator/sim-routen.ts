// Vorführ-Adressen unter /api/v1/sim – nur bei COCKPIT_DEMO=1 (architektur.md, Abschnitt 6).
import type { FastifyPluginAsync } from 'fastify';
import { FachFehler } from '../server/fehler';
import { istDatum, plusWerktage } from '../server/regeln/datum';
import { setzeVorfuehrdatum } from '../server/anbindungen/uhr';
import { setzeZurueck } from '../server/daten/zuruecksetzen';
import { agentMeldetSich, agentZustand, ergebnisdatei, setzeApiGestoert } from './agent';

export const simRouten: FastifyPluginAsync<{ agentSchluessel?: string }> = async (app, opt) => {
  app.get('/sim/zustand', async () => ({ heute: app.uhr.heute(), agent: agentZustand(app) }));

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
    setzeApiGestoert(app, req.body.api_gestoert);
    return agentZustand(app);
  });

  app.get('/sim/agent/ergebnisdatei', async () => {
    const d = ergebnisdatei(app);
    if (d === null)
      throw new FachFehler(404, 'keine_ergebnisdatei', 'Es liegt keine Ergebnisdatei des Agenten bereit.');
    return d;
  });

  app.post('/sim/zuruecksetzen', async () => {
    setzeZurueck(app.db);
    return { heute: app.uhr.heute() };
  });

  app.post<{ Body: { heute?: unknown; plus_werktage?: unknown } }>('/sim/datum', async (req) => {
    const b = req.body ?? {};
    let neu: string;
    if (b.heute !== undefined) {
      if (!istDatum(b.heute)) {
        throw new FachFehler(400, 'datum_ungueltig', 'Bitte ein gültiges Datum im Format JJJJ-MM-TT angeben.', 'heute');
      }
      neu = b.heute;
    } else if (Number.isInteger(b.plus_werktage) && (b.plus_werktage as number) > 0) {
      neu = plusWerktage(app.uhr.heute(), b.plus_werktage as number);
    } else {
      throw new FachFehler(400, 'datum_ungueltig', 'Bitte »heute« oder »plus_werktage« (ganze Zahl ab 1) angeben.');
    }
    setzeVorfuehrdatum(app.db, neu);
    return { heute: neu };
  });
};
