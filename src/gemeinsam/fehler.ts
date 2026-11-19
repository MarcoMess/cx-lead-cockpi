// Fehlerformat der Schnittstelle (architektur.md, Abschnitt 5).
export interface FehlerAntwort {
  fehler: { code: string; meldung: string; feld?: string };
}
