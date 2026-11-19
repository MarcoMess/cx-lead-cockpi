// Fachfehler werden in Diensten geworfen und zentral in das Fehlerformat übersetzt.
export class FachFehler extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 422 | 502,
    readonly code: string,
    meldung: string,
    readonly feld?: string,
  ) {
    super(meldung);
  }
}
