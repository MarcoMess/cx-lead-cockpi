// Sitzung für Marco, Bearer-Schlüssel für den Agenten, zentrale Rollenprüfung als Hook (E1-S1).
import secureSession from '@fastify/secure-session';
import type { FastifyInstance } from 'fastify';
import { FachFehler } from '../fehler';
import { zugangsart } from '../regeln/zugang';
import { gleich, istAgentSchluessel } from '../dienste/zugang';

declare module '@fastify/secure-session' {
  interface SessionData {
    nutzer: string;
  }
}
declare module 'fastify' {
  interface FastifyRequest {
    rolle?: 'marco' | 'agent';
  }
}

export interface ZugangOptionen {
  passwort: string;
  sitzungsSchluessel: Buffer;
}

/** Richtet Sitzung, Rollenprüfung und Anmelde-Routen direkt auf der Wurzel-Instanz ein, damit der Hook für alle Routen gilt. */
export async function richteZugangEin(app: FastifyInstance, opt: ZugangOptionen): Promise<void> {
  await app.register(secureSession, {
    key: opt.sitzungsSchluessel,
    cookieName: 'cockpit_sitzung',
    cookie: { path: '/', httpOnly: true, sameSite: 'strict' },
  });

  app.addHook('onRequest', async (req) => {
    const art = zugangsart(req.method, req.url);
    const angemeldet = req.session.get('nutzer') === 'marco';
    const auth = req.headers.authorization ?? '';
    const schluessel = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const agent = schluessel !== '' && istAgentSchluessel(app.db, schluessel);
    if (angemeldet) req.rolle = 'marco';
    else if (agent) req.rolle = 'agent';

    if (art === 'oeffentlich') return;
    if (art === 'agent') {
      if (!agent) throw new FachFehler(401, 'schluessel_ungueltig', 'Der Agenten-Schlüssel fehlt oder ist ungültig.');
      req.rolle = 'agent';
      return;
    }
    if (angemeldet) return;
    if (agent) throw new FachFehler(403, 'rolle_nicht_erlaubt', 'Der Agent darf diese Aktion nicht ausführen.');
    throw new FachFehler(401, 'nicht_angemeldet', 'Bitte melde dich an.');
  });

  app.post<{ Body: { passwort?: string } }>('/api/v1/anmeldung', async (req, reply) => {
    const passwort = typeof req.body?.passwort === 'string' ? req.body.passwort : '';
    if (!passwort || !gleich(passwort, opt.passwort)) {
      throw new FachFehler(401, 'passwort_falsch', 'Das Passwort stimmt nicht.', 'passwort');
    }
    req.session.set('nutzer', 'marco');
    return reply.send({ nutzer: 'marco' });
  });

  app.post('/api/v1/abmeldung', async (req, reply) => {
    req.session.delete();
    return reply.status(204).send();
  });

  app.get('/api/v1/ich', async (req) => {
    if (req.session.get('nutzer') !== 'marco') throw new FachFehler(401, 'nicht_angemeldet', 'Bitte melde dich an.');
    return { nutzer: 'marco' };
  });
}
