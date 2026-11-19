// Anwendungsfall »Recherchelauf anlegen« (A1 Schritt 5, Story E2-S3). Wird auch vom Upload genutzt (E2-S5).
import { LaufEingabe, VorschlagEingabe, type LaufAngelegt, type Zurueckgewiesen } from '../../gemeinsam/lauf';
import type { Uhr } from '../anbindungen/uhr';
import { transaktion, type Datenbank } from '../daten/db';
import { fuegeLaufEin, fuegeVorschlagEin, gibtAusgefuehrtenLaufAm } from '../daten/laeufe';
import { FachFehler } from '../fehler';

export function legeLaufAn(db: Datenbank, uhr: Uhr, eingabe: unknown, herkunft: 'api' | 'upload'): LaufAngelegt {
  const lauf = LaufEingabe.safeParse(eingabe);
  if (!lauf.success) {
    throw new FachFehler(400, 'lauf_ungueltig', 'Der Lauf braucht eine Liste »vorschlaege«.', 'vorschlaege');
  }
  const heute = uhr.heute();
  if (gibtAusgefuehrtenLaufAm(db, heute)) {
    throw new FachFehler(409, 'bereits_gelaufen', 'Für heute gibt es schon einen ausgeführten Recherchelauf.');
  }

  const gueltig: unknown[] = [];
  const zurueckgewiesen: Zurueckgewiesen[] = [];
  lauf.data.vorschlaege.forEach((roh, index) => {
    const v = VorschlagEingabe.safeParse(roh);
    if (v.success) gueltig.push(v.data);
    else {
      const f = v.error.issues[0];
      const feld = f.path.join('.');
      const meldung = f.code === 'invalid_type' && f.input === undefined ? `Das Feld »${feld}« fehlt.` : f.message;
      zurueckgewiesen.push({ index, feld, meldung });
    }
  });

  const laufId = transaktion(db, () => {
    const id = fuegeLaufEin(db, {
      datum: heute,
      abdeckungsgrenzen: lauf.data.abdeckungsgrenzen ?? null,
      herkunft,
      anzahl_vorschlaege: gueltig.length,
    });
    for (const v of gueltig) fuegeVorschlagEin(db, id, v);
    return id;
  });
  return { lauf_id: laufId, angelegt: gueltig.length, zurueckgewiesen };
}
