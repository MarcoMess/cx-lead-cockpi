// Aktionen auf Vorschlägen im Eingangskorb (nur mit Marcos Sitzung).
import type { FastifyPluginAsync } from 'fastify';
import { gibVorschlagFrei } from '../dienste/gib-frei';
import { verwirfVorschlag } from '../dienste/verwirf-vorschlag';

export const vorschlaegeRouten: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { id: string } }>('/vorschlaege/:id/freigabe', async (req) =>
    gibVorschlagFrei(app.db, app.uhr, Number(req.params.id)),
  );
  app.post<{ Params: { id: string } }>('/vorschlaege/:id/verwerfung', async (req) =>
    verwirfVorschlag(app.db, app.uhr, Number(req.params.id), req.body),
  );
};
