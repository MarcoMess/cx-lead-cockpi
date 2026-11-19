// Anwendungsfall »Einen Lauf mit seinen Vorschlägen laden« (A2 Schritt 1, Stories E3-S1, E2-S4 und E3-S2).
import type { LaufDetail, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import type { Uhr } from '../anbindungen/uhr';
import { liesBestand } from '../daten/bestand';
import type { Datenbank } from '../daten/db';
import { liesAusgefuehrtenLauf, vorschlaegeVonLauf } from '../daten/laeufe';
import { FachFehler } from '../fehler';
import { liesMindestumsatz } from '../daten/profil';
import { listeSperren } from '../daten/sperrliste';
import { sperreFuer } from '../regeln/ausschluss';
import { pruefeGegenBestand } from '../regeln/dubletten';
import { fehlendePflichtangaben } from '../regeln/pflichtangaben';

export function ladeLauf(db: Datenbank, uhr: Uhr, id: number): LaufDetail {
  const lauf = Number.isInteger(id) ? liesAusgefuehrtenLauf(db, id) : undefined;
  if (!lauf) throw new FachFehler(404, 'lauf_unbekannt', 'Diesen Recherchelauf gibt es nicht.');
  const bestand = liesBestand(db);
  const mindestumsatz = liesMindestumsatz(db);
  const sperren = listeSperren(db);
  const vorschlaege = vorschlaegeVonLauf(db, id).map((v): VorschlagKarte => {
    const { bezug_ansprechpartner_id, ...rest } = v;
    // Ungeprüfte Vorschläge werden gegen den heutigen Bestand geprüft: Wer seit dem Anlegen dazugekommen ist,
    // gilt jetzt als Dublette (Prüfung E2-S4, Befund 1). Geprüfte zeigen, was beim Prüfen galt.
    const p = v.zustand === 'zu_pruefen' ? pruefeGegenBestand(v.daten, bestand, uhr.heute()) : null;
    const istDublette = p ? p.ist_dublette || (v.ist_dublette && !p.ist_wiederansprache) : v.ist_dublette;
    const istWiederansprache = p ? p.ist_wiederansprache : v.ist_wiederansprache;
    const bezugId = p?.bezug_ansprechpartner_id ?? bezug_ansprechpartner_id;
    const bezug = bestand.kontakte.find((k) => k.id === bezugId);
    const firma = p?.firma_id ? bestand.firmen.find((f) => f.id === p.firma_id) : undefined;
    return {
      ...rest,
      ist_dublette: istDublette,
      ist_wiederansprache: istWiederansprache,
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
      gesperrt: (() => {
        const g = v.zustand === 'zu_pruefen' ? sperreFuer(v.daten, sperren, uhr.heute()) : null;
        return g ? { art: g.art, name: g.name, grund: g.grund, gesperrt_bis: g.gesperrt_bis } : null;
      })(),
      fehlende_pflichtangaben:
        v.zustand === 'zu_pruefen' ? fehlendePflichtangaben(v.daten, mindestumsatz, uhr.heute()) : [],
    };
  });
  return { ...lauf, vorschlaege };
}
