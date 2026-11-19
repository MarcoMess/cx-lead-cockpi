// Antworten der Schnittstelle für den Eingangskorb S2 (Story E3-S1).
import type { VorschlagDaten } from './lauf';
import type { VORSCHLAG_ZUSTAND } from './werte';

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
}

export interface LaufDetail extends LaufZeile {
  vorschlaege: VorschlagKarte[];
}
