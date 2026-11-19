import type { FastifyPluginAsync } from 'fastify';

// Lebenszeichen ohne Anmeldung (architektur.md, Abschnitt 5).
export const gesundheitRouten: FastifyPluginAsync = async (app) => {
  app.get('/gesundheit', async () => ({ ok: true }));
};
