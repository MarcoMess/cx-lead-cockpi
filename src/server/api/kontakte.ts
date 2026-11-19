// Kontakte (nur mit Marcos Sitzung; nur lesend mit Agenten-Schlüssel folgt mit E10-S5).
import type { FastifyPluginAsync } from 'fastify';
import { ladeKontakte } from '../dienste/lade-kontakte';

export const kontakteRouten: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { status?: string } }>('/kontakte', async (req) => ladeKontakte(app.db, req.query.status));
};
