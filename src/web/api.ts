// Einziger Ort für Aufrufe an den Server (architektur.md, Abschnitt 7).
import type { FehlerAntwort } from '../gemeinsam/fehler';

export class ApiFehler extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    meldung: string,
    readonly feld?: string,
  ) {
    super(meldung);
  }
}

export async function api<T>(methode: string, pfad: string, body?: unknown): Promise<T> {
  const res = await fetch('/api/v1' + pfad, {
    method: methode,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  });
  if (res.status === 204) return undefined as T;
  const daten = await res.json().catch(() => ({}));
  if (!res.ok) {
    const f = (daten as FehlerAntwort).fehler;
    throw new ApiFehler(res.status, f?.code ?? 'unbekannt', f?.meldung ?? 'Unbekannter Fehler.', f?.feld);
  }
  return daten as T;
}
