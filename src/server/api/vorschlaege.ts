// Aktionen auf Vorschlägen im Eingangskorb (nur mit Marcos Sitzung).
import type { FastifyPluginAsync } from 'fastify';
import { gibVorschlagFrei } from '../dienste/gib-frei';

export const vorschlaegeRouten: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { id: string } }>('/vorschlaege/:id/freigabe', async (req) =>
    gibVorschlagFrei(app.db, app.uhr, Number(req.params.id)),
  );
};
