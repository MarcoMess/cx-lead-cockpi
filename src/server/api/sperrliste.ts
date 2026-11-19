// Sperrliste (Story E10-S1); nur mit Marcos Sitzung.
import type { FastifyPluginAsync } from 'fastify';
import { entferneSperreintrag, fuegeSperreHinzu, ladeSperrliste } from '../dienste/pflege-sperrliste';

export const sperrlisteRouten: FastifyPluginAsync = async (app) => {
  app.get('/sperrliste', async () => ladeSperrliste(app.db));
  app.post('/sperrliste', async (req, reply) => reply.code(201).send(fuegeSperreHinzu(app.db, app.uhr, req.body)));
  app.delete<{ Params: { id: string } }>('/sperrliste/:id', async (req) =>
    entferneSperreintrag(app.db, /^[1-9][0-9]*$/.test(req.params.id) ? Number(req.params.id) : NaN),
  );
};
