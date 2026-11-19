// Ansprache eines Kontakts und Protokoll des Versands (A3, Stories E5-S1 und E5-S3); nur mit Marcos Sitzung.
import type { FastifyPluginAsync } from 'fastify';
import { ladeAnsprache } from '../dienste/lade-ansprache';
import { protokolliereVersand } from '../dienste/protokolliere-versand';

export const anspracheRouten: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { id: string } }>('/kontakte/:id/ansprache', async (req) =>
    ladeAnsprache(app.db, id(req.params.id)),
  );
  app.post<{ Params: { id: string } }>('/kontakte/:id/kontaktversuche', async (req, reply) =>
    reply.code(201).send(protokolliereVersand(app.db, app.uhr, id(req.params.id), req.body)),
  );
};

const id = (roh: string) => (/^[1-9][0-9]*$/.test(roh) ? Number(roh) : NaN);
