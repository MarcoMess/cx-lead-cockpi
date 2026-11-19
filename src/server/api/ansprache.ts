// Ansprache eines Kontakts (A3, Story E5-S1); nur mit Marcos Sitzung.
import type { FastifyPluginAsync } from 'fastify';
import { ladeAnsprache } from '../dienste/lade-ansprache';

export const anspracheRouten: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { id: string } }>('/kontakte/:id/ansprache', async (req) =>
    ladeAnsprache(app.db, /^[1-9][0-9]*$/.test(req.params.id) ? Number(req.params.id) : NaN),
  );
};
