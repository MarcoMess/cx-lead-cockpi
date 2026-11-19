// Baut den Server zusammen. Tests rufen baueApp() mit einer Datenbank im Speicher auf.
import Fastify, { type FastifyInstance } from 'fastify';
import { FachFehler } from './fehler';
import type { Datenbank } from './daten/db';
import { gesundheitRouten } from './api/gesundheit';
import { agentRouten } from './api/agent';
import { laeufeRouten } from './api/laeufe';
import { vorschlaegeRouten } from './api/vorschlaege';
import { richteZugangEin } from './api/zugang';
import { Uhr } from './anbindungen/uhr';
import { simRouten } from '../simulator/sim-routen';

export interface AppOptionen {
  db: Datenbank;
  demo: boolean;
  passwort: string;
  sitzungsSchluessel: Buffer;
  /** Klartext des Agenten-Schlüssels; braucht nur der simulierte Agent im Vorführmodus. */
  agentSchluessel?: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Datenbank;
    demo: boolean;
    uhr: Uhr;
  }
}

export async function baueApp(opt: AppOptionen): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.decorate('db', opt.db);
  app.decorate('demo', opt.demo);
  app.decorate('uhr', new Uhr(opt.db));

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof FachFehler) {
      return reply.status(err.status).send({ fehler: { code: err.code, meldung: err.message, feld: err.feld } });
    }
    const e = err as { validation?: unknown; statusCode?: number; message: string };
    if (e.validation || e.statusCode === 400) {
      return reply.status(400).send({
        fehler: {
          code: 'eingabe_ungueltig',
          meldung: /json/i.test(e.message)
            ? 'Die Anfrage enthält kein gültiges JSON.'
            : 'Die Eingabe ist ungültig. Bitte prüfe die Angaben.',
        },
      });
    }
    app.log.error(err);
    return reply
      .status(500)
      .send({ fehler: { code: 'interner_fehler', meldung: 'Im Cockpit ist ein Fehler aufgetreten.' } });
  });

  app.setNotFoundHandler((req, reply) =>
    reply.status(404).send({ fehler: { code: 'nicht_gefunden', meldung: `Die Adresse ${req.url} gibt es nicht.` } }),
  );

  await richteZugangEin(app, { passwort: opt.passwort, sitzungsSchluessel: opt.sitzungsSchluessel });
  await app.register(gesundheitRouten, { prefix: '/api/v1' });
  await app.register(agentRouten, { prefix: '/api/v1' });
  await app.register(laeufeRouten, { prefix: '/api/v1' });
  await app.register(vorschlaegeRouten, { prefix: '/api/v1' });
  if (opt.demo) await app.register(simRouten, { prefix: '/api/v1', agentSchluessel: opt.agentSchluessel });
  return app;
}
