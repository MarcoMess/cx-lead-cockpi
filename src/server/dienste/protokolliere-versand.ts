// Anwendungsfall »Versand protokollieren« (A3 Schritt 6, Story E5-S3).
// »Angeschrieben« entsteht nur hier, nie automatisch (Konzept, Abschnitt 9).
import { VersandEingabe, type VersandProtokolliert } from '../../gemeinsam/versand';
import { LINKEDIN_KANAELE } from '../../gemeinsam/werte';
import type { Uhr } from '../anbindungen/uhr';
import { liesAkteStamm, liesNachricht, setzeStatus } from '../daten/ansprechpartner';
import { transaktion, type Datenbank } from '../daten/db';
import { legeKontaktversuchAn, legeWiedervorlageAn, speichereGesendeteFassung } from '../daten/kontaktversuche';
import { FachFehler } from '../fehler';
import { fristWiedervorlage } from '../regeln/fristen';
import { anspracheModus, fassungNachVersand } from '../regeln/kanal';

export const GRUND_NACHFASSEN = 'Nachfassen, keine Antwort';

export function protokolliereVersand(db: Datenbank, uhr: Uhr, id: number, eingabe: unknown): VersandProtokolliert {
  return transaktion(db, () => {
    const k = Number.isInteger(id) && id > 0 ? liesAkteStamm(db, id) : undefined;
    if (!k) throw new FachFehler(404, 'kontakt_unbekannt', 'Diesen Kontakt gibt es nicht.');
    if (anspracheModus(k.status) !== 'erstkontakt') {
      throw new FachFehler(
        409,
        'kein_erstkontakt',
        'Dieser Kontakt ist nicht im Status »Freigegeben«; einen Erstkontakt kannst du nur dort protokollieren.',
      );
    }
    const e = VersandEingabe.safeParse(eingabe);
    if (!e.success) {
      const f = e.error.issues[0];
      throw new FachFehler(422, 'eingabe_ungueltig', f.message, String(f.path[0] ?? ''));
    }
    const { kanal } = e.data;
    const betreff = e.data.betreff?.trim() || null;
    const text = e.data.text.trim();
    if (!text) {
      throw new FachFehler(
        422,
        'text_leer',
        'Die Nachricht ist leer. Schreib oder füge den gesendeten Text ein, bevor du markierst.',
        'text',
      );
    }
    if (!(LINKEDIN_KANAELE as readonly string[]).includes(kanal)) {
      throw new FachFehler(
        422,
        'kanal_nicht_moeglich',
        'Den Versand per E-Mail kannst du in diesem Stand noch nicht protokollieren.',
        'kanal',
      );
    }
    const agent = liesNachricht(db, id, 'linkedin', 'erstkontakt');
    const fassung =
      agent && agent.fassung === 'agent' ? fassungNachVersand(agent, { betreff, text }) : 'von_marco_geaendert';
    speichereGesendeteFassung(db, id, { betreff, text, fassung });

    const zeitpunkt = uhr.jetzt();
    const kvId = legeKontaktversuchAn(db, {
      ansprechpartner_id: id,
      kanal,
      art: 'erstkontakt',
      zeitpunkt,
      betreff,
      text,
    });
    setzeStatus(db, id, 'angeschrieben');
    const faellig = fristWiedervorlage(uhr.heute());
    legeWiedervorlageAn(db, {
      ansprechpartner_id: id,
      faellig_am: faellig,
      grund: GRUND_NACHFASSEN,
      art: 'nachfassen',
    });
    return {
      kontaktversuch: { id: kvId, zeitpunkt, kanal, art: 'erstkontakt' },
      status: 'angeschrieben',
      wiedervorlage: { faellig_am: faellig, grund: GRUND_NACHFASSEN },
    };
  });
}
