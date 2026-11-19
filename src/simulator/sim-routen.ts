// Vorführ-Adressen unter /api/v1/sim – nur bei COCKPIT_DEMO=1 (architektur.md, Abschnitt 6).
import type { FastifyPluginAsync } from 'fastify';
import { FachFehler } from '../server/fehler';
import { istDatum, plusWerktage } from '../server/regeln/datum';
import { setzeVorfuehrdatum } from '../server/anbindungen/uhr';
import { setzeZurueck } from '../server/daten/zuruecksetzen';

export const simRouten: FastifyPluginAsync = async (app) => {
  app.get('/sim/zustand', async () => ({ heute: app.uhr.heute() }));

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
