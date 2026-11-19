// Kontakte (nur mit Marcos Sitzung; nur lesend mit Agenten-Schlüssel folgt mit E10-S5).
import type { FastifyPluginAsync } from 'fastify';
import { ladeKontakte } from '../dienste/lade-kontakte';
import { ladeKontaktakte } from '../dienste/lade-kontaktakte';

export const kontakteRouten: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { status?: string } }>('/kontakte', async (req) => ladeKontakte(app.db, req.query.status));
  app.get<{ Params: { id: string } }>('/kontakte/:id', async (req) =>
    ladeKontaktakte(app.db, /^[1-9][0-9]*$/.test(req.params.id) ? Number(req.params.id) : NaN),
  );
};
