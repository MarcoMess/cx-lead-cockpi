// Anwendungsfall »Einen Lauf mit seinen Vorschlägen laden« (A2 Schritt 1, Stories E3-S1 und E2-S4).
import type { LaufDetail, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import type { Uhr } from '../anbindungen/uhr';
import { liesBestand } from '../daten/bestand';
import type { Datenbank } from '../daten/db';
import { liesAusgefuehrtenLauf, vorschlaegeVonLauf } from '../daten/laeufe';
import { FachFehler } from '../fehler';
import { pruefeGegenBestand } from '../regeln/dubletten';

export function ladeLauf(db: Datenbank, uhr: Uhr, id: number): LaufDetail {
  const lauf = Number.isInteger(id) ? liesAusgefuehrtenLauf(db, id) : undefined;
  if (!lauf) throw new FachFehler(404, 'lauf_unbekannt', 'Diesen Recherchelauf gibt es nicht.');
  const bestand = liesBestand(db);
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
    };
  });
  return { ...lauf, vorschlaege };
}
