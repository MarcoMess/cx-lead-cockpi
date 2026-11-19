// Anwendungsfall »Einen Lauf mit seinen Vorschlägen laden« (A2 Schritt 1, Stories E3-S1, E2-S4 und E3-S2).
import type { LaufDetail, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import type { Uhr } from '../anbindungen/uhr';
import { liesBestand } from '../daten/bestand';
import type { Datenbank } from '../daten/db';
import { liesAusgefuehrtenLauf, vorschlaegeVonLauf } from '../daten/laeufe';
import { FachFehler } from '../fehler';
import { liesMindestumsatz } from '../daten/profil';
import { pruefeGegenBestand } from '../regeln/dubletten';
import { fehlendePflichtangaben } from '../regeln/pflichtangaben';

export function ladeLauf(db: Datenbank, uhr: Uhr, id: number): LaufDetail {
  const lauf = Number.isInteger(id) ? liesAusgefuehrtenLauf(db, id) : undefined;
  if (!lauf) throw new FachFehler(404, 'lauf_unbekannt', 'Diesen Recherchelauf gibt es nicht.');
  const bestand = liesBestand(db);
  const mindestumsatz = liesMindestumsatz(db);
  const vorschlaege = vorschlaegeVonLauf(db, id).map((v): VorschlagKarte => {
    const { bezug_ansprechpartner_id, ...rest } = v;
    const bezug = bestand.kontakte.find((k) => k.id === bezug_ansprechpartner_id);
    // Zuordnung und Hinweis gelten für den heutigen Bestand; Dublette und Wiederansprache stehen seit dem Anlegen fest.
    const p = v.zustand === 'zu_pruefen' ? pruefeGegenBestand(v.daten, bestand, uhr.heute()) : null;
    const firma = p?.firma_id ? bestand.firmen.find((f) => f.id === p.firma_id) : undefined;
    return {
      ...rest,
      bezug: bezug
        ? {
            id: bezug.id,
            name: [bezug.titel, bezug.vorname, bezug.nachname].filter(Boolean).join(' '),
            status: bezug.status,
            geschlossen_am: bezug.geschlossen_am,
          }
        : null,
      bestehende_firma: firma ? { id: firma.id, name: firma.name } : null,
      hinweis_zweiter_ansprechpartner: p?.hinweis_zweiter_ansprechpartner ?? null,
      fehlende_pflichtangaben: v.zustand === 'zu_pruefen' ? fehlendePflichtangaben(v.daten, mindestumsatz) : [],
    };
  });
  return { ...lauf, vorschlaege };
}
