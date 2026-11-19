// Anwendungsfall »Vorschlag verwerfen« (A2 Schritt 4, Story E3-S4): Grund, Sperreintrag, keine Firma, kein Kontakt.
import type { VorschlagDaten } from '../../gemeinsam/lauf';
import { VerwerfEingabe, type Verworfen } from '../../gemeinsam/verwerfen';
import type { Uhr } from '../anbindungen/uhr';
import { transaktion, type Datenbank } from '../daten/db';
import { liesVorschlag, markiereVerworfen } from '../daten/laeufe';
import { legeSperreAn, namenDerArt } from '../daten/sperrliste';
import { FachFehler } from '../fehler';
import { sperrfolgeVerwerfen, sperrSchluessel } from '../regeln/ausschluss';

export function verwirfVorschlag(db: Datenbank, uhr: Uhr, vorschlagId: number, eingabe: unknown): Verworfen {
  return transaktion(db, () => {
    const v = Number.isInteger(vorschlagId) && vorschlagId > 0 ? liesVorschlag(db, vorschlagId) : undefined;
    if (!v) throw new FachFehler(404, 'vorschlag_unbekannt', 'Diesen Vorschlag gibt es nicht.');
    if (v.zustand !== 'zu_pruefen') {
      throw new FachFehler(
        409,
        'schon_geprueft',
        'Dieser Vorschlag ist schon geprüft und lässt sich nicht mehr verwerfen.',
      );
    }
    const e = VerwerfEingabe.safeParse(eingabe);
    if (!e.success) throw new FachFehler(400, 'grund_fehlt', e.error.issues[0].message, 'grund');

    const d = JSON.parse(v.daten) as VorschlagDaten;
    const folge = sperrfolgeVerwerfen(
      e.data.grund,
      { firma: d.firma.name, vorname: d.person.vorname, nachname: d.person.nachname },
      uhr.heute(),
    );
    // Steht die Firma oder Person schon auf der Sperrliste, bleibt es bei diesem Eintrag.
    const schluessel = sperrSchluessel(folge.name);
    const vorhanden = namenDerArt(db, folge.art).some((z) => sperrSchluessel(z.name) === schluessel);
    if (!vorhanden) {
      legeSperreAn(db, {
        art: folge.art,
        name: folge.name,
        firma_name: folge.art === 'person' ? folge.firma_name : null,
        grund: e.data.grund,
        herkunft: 'verworfen',
        gesperrt_bis: folge.gesperrt_bis,
        erstellt_am: uhr.heute(),
      });
    }
    markiereVerworfen(db, v.id, e.data.grund);
    return { sperreintrag: { art: folge.art, name: folge.name, gesperrt_bis: folge.gesperrt_bis, neu: !vorhanden } };
  });
}
