// Antworten der Schnittstelle für den Eingangskorb S2 (Story E3-S1).
import type { VorschlagDaten } from './lauf';
import type { AnsprechpartnerStatus, VORSCHLAG_ZUSTAND } from './werte';

export interface LaufZeile {
  id: number;
  datum: string;
  anzahl_vorschlaege: number;
  anzahl_freigegeben: number;
  abdeckungsgrenzen: string | null;
  /** Was beim Einlesen nicht übernommen wurde (zurückgewiesen oder schon offen), je Eintrag ein Satz. */
  einlese_hinweise: string[];
  offen: number;
}

export interface VorschlagKarte {
  id: number;
  zustand: (typeof VORSCHLAG_ZUSTAND)[number];
  daten: VorschlagDaten;
  /** Beim Anlegen des Laufs festgestellt (Story E2-S4). */
  ist_dublette: boolean;
  ist_wiederansprache: boolean;
  /** Der bekannte Kontakt, auf den sich Dublette oder Wiederansprache bezieht. */
  bezug: { id: number; name: string; status: AnsprechpartnerStatus; geschlossen_am: string | null } | null;
  /** Bestehende Firma, der der Vorschlag zugeordnet ist (Abgleich über den normalisierten Namen). */
  bestehende_firma: { id: number; name: string } | null;
  /** Hinweis, wenn bei der Firma schon eine Ansprache läuft. */
  hinweis_zweiter_ansprechpartner: string | null;
  /** Eintrag der Sperrliste, der diesen Vorschlag sperrt (Konzept 1.3, Story E2-S5); dann nicht freigebbar. */
  gesperrt: { art: 'firma' | 'person'; name: string; grund: string; gesperrt_bis: string | null } | null;
  /** Grund, wenn Marco den Vorschlag verworfen hat (Story E3-S4). */
  verwerf_grund: string | null;
  /** Fehlende oder unzulässige Pflichtangaben; nicht leer heißt: Freigeben gesperrt (Story E3-S2). */
  fehlende_pflichtangaben: string[];
}

export interface LaufDetail extends LaufZeile {
  vorschlaege: VorschlagKarte[];
}
