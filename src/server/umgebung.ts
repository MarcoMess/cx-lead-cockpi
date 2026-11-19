import { randomBytes } from 'node:crypto';
// Liest .env (falls vorhanden) und liefert die Einstellungen des Servers. Bereits gesetzte Variablen haben Vorrang.
import { existsSync } from 'node:fs';

export function ladeUmgebung(): void {
  if (existsSync('.env')) process.loadEnvFile('.env');
}

export interface Konfiguration {
  port: number;
  datenbankPfad: string;
  demo: boolean;
  passwort: string;
  sitzungsSchluessel: Buffer;
  agentSchluessel?: string;
}

export function konfiguration(): Konfiguration {
  return {
    port: Number(process.env.PORT ?? 3000),
    datenbankPfad: process.env.DATABASE_PATH ?? './data/cockpit.sqlite',
    demo: process.env.COCKPIT_DEMO === '1',
    passwort: pflicht('COCKPIT_PASSWORD'),
    sitzungsSchluessel: sitzungsSchluessel(),
    agentSchluessel: process.env.COCKPIT_AGENT_KEY || undefined,
  };
}

function pflicht(name: string): string {
  const wert = process.env[name];
  if (!wert) throw new Error(`Die Einstellung ${name} fehlt in .env. Vorlage: .env.example`);
  return wert;
}

/** 32 Byte als 64 Hexzeichen. Fehlt der Wert, gilt ein zufälliger Schlüssel bis zum nächsten Neustart. */
function sitzungsSchluessel(): Buffer {
  const hex = process.env.COCKPIT_SESSION_SECRET ?? '';
  if (/^[0-9a-f]{64}$/i.test(hex)) return Buffer.from(hex, 'hex');
  return randomBytes(32);
}
