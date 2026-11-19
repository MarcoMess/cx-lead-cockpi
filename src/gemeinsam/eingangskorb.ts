// Antworten der Schnittstelle für den Eingangskorb S2 (Story E3-S1).
import type { VorschlagDaten } from './lauf';
import type { AnsprechpartnerStatus, VORSCHLAG_ZUSTAND } from './werte';

export interface LaufZeile {
  id: number;
  datum: string;
  anzahl_vorschlaege: number;
  anzahl_freigegeben: number;
  abdeckungsgrenzen: string | null;
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
}

export interface LaufDetail extends LaufZeile {
  vorschlaege: VorschlagKarte[];
}
