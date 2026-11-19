// Anwendungsfall »Vorschlag freigeben« (A2 Schritt 3, Story E3-S3).
// Legt Firma und Ansprechpartner an oder öffnet bei einer Wiederansprache den bestehenden Kontakt.
import type { VorschlagDaten } from '../../gemeinsam/lauf';
import type { Uhr } from '../anbindungen/uhr';
import { transaktion, type Datenbank } from '../daten/db';
import {
  fuegeAnlassHinzu,
  findeNachLinkedin,
  legeAnsprechpartnerAn,
  liesStatus,
  oeffneZurWiederansprache,
  setzeErstnachricht,
} from '../daten/ansprechpartner';
import { findeFirmaNachNormname, legeFirmaAn } from '../daten/firmen';
import { liesVorschlag, markiereFreigegeben, zaehleFreigabe } from '../daten/laeufe';
import { FachFehler } from '../fehler';
import { normalisiereFirmenname } from '../regeln/dubletten';
import { darfWiederangesprochenWerden } from '../regeln/status';

export interface Freigabe {
  ansprechpartner_id: number;
  firma_id: number | null;
  wiederansprache: boolean;
}

export function gibVorschlagFrei(db: Datenbank, uhr: Uhr, vorschlagId: number): Freigabe {
  return transaktion(db, () => {
    const v = Number.isInteger(vorschlagId) ? liesVorschlag(db, vorschlagId) : undefined;
    if (!v) throw new FachFehler(404, 'vorschlag_unbekannt', 'Diesen Vorschlag gibt es nicht.');
    if (v.zustand !== 'zu_pruefen') {
      throw new FachFehler(
        409,
        'schon_geprueft',
        'Dieser Vorschlag ist schon geprüft und lässt sich nicht erneut freigeben.',
      );
    }
    const d = JSON.parse(v.daten) as VorschlagDaten;
    const heute = uhr.heute();

    let ansprechpartnerId: number;
    let firmaId: number | null = null;
    if (v.ist_wiederansprache) {
      const bisher = v.bezug_ansprechpartner_id ? liesStatus(db, v.bezug_ansprechpartner_id) : undefined;
      if (!bisher || !darfWiederangesprochenWerden(bisher)) {
        throw new FachFehler(
          409,
          'wiederansprache_nicht_erlaubt',
          'Diesen Kontakt kannst du nicht wieder ansprechen: Wiederansprache gibt es nur für Kontakte, die ohne Antwort geschlossen wurden.',
        );
      }
      ansprechpartnerId = v.bezug_ansprechpartner_id!;
      oeffneZurWiederansprache(db, ansprechpartnerId, 'freigegeben');
    } else {
      if (d.person.linkedin_url && findeNachLinkedin(db, d.person.linkedin_url)) {
        throw new FachFehler(
          409,
          'person_bekannt',
          `${d.person.vorname} ${d.person.nachname} steht mit demselben LinkedIn-Profil schon in deinen Kontakten und wird nicht ein zweites Mal angelegt.`,
        );
      }
      firmaId = findeOderLegeFirmaAn(db, d.firma);
      ansprechpartnerId = legeAnsprechpartnerAn(db, {
        firma_id: firmaId,
        anrede: pflicht(d.person.anrede, 'person.anrede'),
        titel: d.person.titel || null,
        vorname: d.person.vorname,
        nachname: d.person.nachname,
        funktion: pflicht(d.person.funktion, 'person.funktion'),
        rolle: pflicht(d.person.rolle, 'person.rolle'),
        quelle_url: pflicht(d.person.quelle_url, 'person.quelle_url'),
        linkedin_url: d.person.linkedin_url || null,
        email: d.person.email || null,
        telefon: d.person.telefon || null,
        status: 'freigegeben',
      });
    }

    if (d.anlass?.typ) {
      fuegeAnlassHinzu(
        db,
        ansprechpartnerId,
        {
          typ: d.anlass.typ,
          beschreibung: d.anlass.beschreibung ?? null,
          ereignis_datum: d.anlass.ereignis_datum ?? null,
          veroeffentlicht_am: d.anlass.veroeffentlicht_am ?? null,
          quelle_url: d.anlass.quelle_url ?? null,
          hypothese: d.anlass.hypothese ?? null,
          gespraechsziel: d.anlass.gespraechsziel ?? null,
        },
        heute,
      );
    }
    if (d.nachricht?.text) {
      setzeErstnachricht(db, ansprechpartnerId, {
        betreff: d.nachricht.betreff ?? null,
        text: d.nachricht.text,
        sprache: d.nachricht.sprache || 'de',
      });
    }
    markiereFreigegeben(db, v.id, ansprechpartnerId);
    zaehleFreigabe(db, v.recherchelauf_id);
    return { ansprechpartner_id: ansprechpartnerId, firma_id: firmaId, wiederansprache: !!v.ist_wiederansprache };
  });
}

function findeOderLegeFirmaAn(db: Datenbank, f: VorschlagDaten['firma']): number {
  const norm = normalisiereFirmenname(f.name);
  const vorhanden = findeFirmaNachNormname(db, norm);
  if (vorhanden) return vorhanden.id;
  return legeFirmaAn(db, {
    name: f.name.trim(),
    name_norm: norm,
    domain: f.domain || null,
    branche: pflicht(f.branche, 'firma.branche'),
    land: pflicht(f.land, 'firma.land'),
    umsatz_wert: pflicht(f.umsatz_wert, 'firma.umsatz_wert'),
    umsatz_waehrung: pflicht(f.umsatz_waehrung, 'firma.umsatz_waehrung'),
    umsatz_jahr: pflicht(f.umsatz_jahr, 'firma.umsatz_jahr'),
    umsatz_bezug: pflicht(f.umsatz_bezug, 'firma.umsatz_bezug'),
    umsatz_quelle_url: pflicht(f.umsatz_quelle_url, 'firma.umsatz_quelle_url'),
    wechselkurs: f.wechselkurs ?? null,
    wechselkurs_quelle_url: f.wechselkurs_quelle_url || null,
    umsatz_eur: f.umsatz_eur ?? (f.umsatz_waehrung === 'EUR' ? (f.umsatz_wert ?? null) : null),
  });
}

/** Grundschutz, bis E3-S2 die vollständige Prüfung der Pflichtangaben vor der Freigabe baut. */
function pflicht<T>(wert: T | null | undefined, feld: string): T {
  if (wert === null || wert === undefined || wert === '') {
    throw new FachFehler(422, 'pflichtangabe_fehlt', `Für die Freigabe fehlt die Angabe »${feld}«.`, feld);
  }
  return wert;
}
