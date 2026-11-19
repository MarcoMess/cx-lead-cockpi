// Adressen für den Recherche-Agenten (nur mit Agenten-Schlüssel, siehe E1-S1).
import type { FastifyPluginAsync } from 'fastify';
import { legeLaufAn } from '../dienste/lege-lauf-an';

export const agentRouten: FastifyPluginAsync = async (app) => {
  app.post('/agent/laeufe', async (req, reply) => {
    const ergebnis = legeLaufAn(app.db, app.uhr, req.body, { herkunft: 'api' });
    return reply.status(201).send(ergebnis);
  });
};
