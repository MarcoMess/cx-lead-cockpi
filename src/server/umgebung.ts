// Liest .env (falls vorhanden) und liefert die Einstellungen des Servers. Bereits gesetzte Variablen haben Vorrang.
import { existsSync } from 'node:fs';

export function ladeUmgebung(): void {
  if (existsSync('.env')) process.loadEnvFile('.env');
}

export interface Konfiguration {
  port: number;
  datenbankPfad: string;
  demo: boolean;
}

export function konfiguration(): Konfiguration {
  return {
    port: Number(process.env.PORT ?? 3000),
    datenbankPfad: process.env.DATABASE_PATH ?? './data/cockpit.sqlite',
    demo: process.env.COCKPIT_DEMO === '1',
  };
}
