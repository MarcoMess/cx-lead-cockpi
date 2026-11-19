// Läufe für den Eingangskorb (nur mit Marcos Sitzung).
import type { FastifyPluginAsync } from 'fastify';
import { ladeLaeufe } from '../dienste/lade-laeufe';
import { ladeLauf } from '../dienste/lade-lauf';

export const laeufeRouten: FastifyPluginAsync = async (app) => {
  app.get('/laeufe', async () => ladeLaeufe(app.db));
  app.get<{ Params: { id: string } }>('/laeufe/:id', async (req) => ladeLauf(app.db, app.uhr, Number(req.params.id)));
};
