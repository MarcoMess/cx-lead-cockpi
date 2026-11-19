import { describe, expect, it } from 'vitest';
import { STARTDATEN, erstelleStartdatenbank } from '../../src/server/daten/startdaten';
import { normalisiereFirmenname } from '../../src/server/regeln/dubletten';
import { oeffneDatenbank, transaktion } from '../../src/server/daten/db';

describe('Pflege nach den Prüfungen E1-S0 bis E2-S3', () => {
  it('Pflege #1 die festen Normalnamen der Startdaten entsprechen der Regel', () => {
    for (const f of STARTDATEN.firmen) expect(f.name_norm, f.name).toBe(normalisiereFirmenname(f.name));
  });

  it('Pflege #2 Reinhardts Erstkontakt per E-Mail trägt die E-Mail-Fassung (Prüfung E1-S0, Befund 2)', () => {
    const db = erstelleStartdatenbank();
    const t = db.prepare(`SELECT text FROM kontaktversuch WHERE ansprechpartner_id = 2`).get() as { text: string };
    expect(t.text.startsWith('Guten Tag Herr Reinhardt,\n\nin Ihrem Interview vom 28.10.')).toBe(true);
    expect(t.text.endsWith('Beste Grüße\nMarco Messinger\nDirector Customer Experience & Innovation\nNagarro')).toBe(
      true,
    );
  });

  it('Pflege #3 transaktion() lässt sich verschachteln und rollt nur den inneren Teil zurück', () => {
    const db = oeffneDatenbank(':memory:');
    transaktion(db, () => {
      db.prepare(`INSERT INTO sperrzeit (von, bis, bezeichnung) VALUES ('2026-01-01', '2026-01-02', 'außen')`).run();
      expect(() =>
        transaktion(db, () => {
          db.prepare(
            `INSERT INTO sperrzeit (von, bis, bezeichnung) VALUES ('2026-02-01', '2026-02-02', 'innen')`,
          ).run();
          throw new Error('innen gescheitert');
        }),
      ).toThrow('innen gescheitert');
    });
    expect(db.prepare(`SELECT bezeichnung FROM sperrzeit`).all()).toEqual([{ bezeichnung: 'außen' }]);
    expect(db.isTransaction).toBe(false);
  });

  it('Pflege #4 transaktion() lehnt asynchrone Funktionen ab und speichert nichts', () => {
    const db = oeffneDatenbank(':memory:');
    expect(() =>
      transaktion(db, () => {
        db.prepare(`INSERT INTO sperrzeit (von, bis, bezeichnung) VALUES ('2026-01-01', '2026-01-02', 'x')`).run();
        return Promise.resolve(1);
      }),
    ).toThrow('synchrone Funktion');
    expect(db.prepare(`SELECT COUNT(*) n FROM sperrzeit`).get()).toEqual({ n: 0 });
  });
});
