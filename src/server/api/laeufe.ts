// Läufe für den Eingangskorb und Upload der Ergebnisdatei (nur mit Marcos Sitzung).
import type { FastifyPluginAsync } from 'fastify';
import { ladeLaeufe } from '../dienste/lade-laeufe';
import { ladeLauf } from '../dienste/lade-lauf';
import { ladeLaufHoch } from '../dienste/lade-lauf-hoch';

export const laeufeRouten: FastifyPluginAsync = async (app) => {
  app.get('/laeufe', async () => ladeLaeufe(app.db));
  app.post('/laeufe/upload', async (req, reply) => reply.code(201).send(ladeLaufHoch(app.db, app.uhr, req.body)));
  app.get<{ Params: { id: string } }>('/laeufe/:id', async (req) => ladeLauf(app.db, app.uhr, Number(req.params.id)));
};
