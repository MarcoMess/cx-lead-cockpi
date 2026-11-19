// Prüft, dass ESLint jeden verbotenen Import aus architektur.md, Abschnitt 3, als Fehler meldet (Prüfung Pflege 1, Befund 1).
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint();

async function fehler(datei: string, code: string): Promise<string[]> {
  const [ergebnis] = await eslint.lintText(code + '\n', { filePath: datei });
  return ergebnis.messages
    .filter((m) => m.ruleId === '@typescript-eslint/no-restricted-imports' || m.ruleId === 'no-restricted-syntax')
    .map((m) => m.ruleId!);
}

const verboten: [string, string, string][] = [
  ['weitere Simulator-Datei → Dienst', 'src/simulator/hilfe.ts', "import { x } from '../server/dienste/lege-lauf-an';"],
  ['weitere Simulator-Datei → daten', 'src/simulator/hilfe.ts', "import { x } from '../server/daten/laeufe';"],
  ['weitere Simulator-Datei → Regeln', 'src/simulator/hilfe.ts', "import { x } from '../server/regeln/fristen';"],
  ['weitere Simulator-Datei → api', 'src/simulator/hilfe.ts', "import { x } from '../server/api/agent';"],
  ['weitere Simulator-Datei → Anbindungen', 'src/simulator/hilfe.ts', "import { x } from '../server/anbindungen/uhr';"],
  [
    'Agenten-Simulator → Wert aus daten/db',
    'src/simulator/agent.ts',
    "import { oeffneDatenbank } from '../server/daten/db';",
  ],
  ['Anbindung → Wert aus daten/db', 'src/server/anbindungen/sap.ts', "import { transaktion } from '../daten/db';"],
  [
    'Agenten-Simulator → Dienst',
    'src/simulator/agent.ts',
    "import { legeLaufAn } from '../server/dienste/lege-lauf-an';",
  ],
  ['Agenten-Simulator → daten/leeren', 'src/simulator/agent.ts', "import { leere } from '../server/daten/leeren';"],
  ['Agenten-Simulator → daten/laeufe', 'src/simulator/agent.ts', "import { x } from '../server/daten/laeufe';"],
  [
    'Agenten-Simulator → Anbindungen',
    'src/simulator/agent.ts',
    "import { erstelleUhr } from '../server/anbindungen/uhr';",
  ],
  ['Vorführ-Routen → daten', 'src/simulator/sim-routen.ts', "import { x } from '../server/daten/laeufe';"],
  ['Vorführ-Routen → Anbindungen', 'src/simulator/sim-routen.ts', "import { x } from '../server/anbindungen/uhr';"],
  ['Vorführ-Routen → Regeln', 'src/simulator/sim-routen.ts', "import { x } from '../server/regeln/fristen';"],
  ['api → Regeln', 'src/server/api/x.ts', "import { zugangsart } from '../regeln/zugang';"],
  ['api → Anbindungen', 'src/server/api/x.ts', "import { erstelleUhr } from '../anbindungen/uhr';"],
  ['api → daten', 'src/server/api/x.ts', "import { x } from '../daten/laeufe';"],
  [
    'Anbindung (kein Simulator) → daten',
    'src/server/anbindungen/sap.ts',
    "import { x } from '../daten/einstellungen';",
  ],
  ['Regeln → daten', 'src/server/regeln/x.ts', "import { x } from '../daten/einstellungen';"],
  ['Dienst → api', 'src/server/dienste/x.ts', "import { x } from '../api/agent';"],
  ['Oberfläche → Server', 'src/web/x.ts', "import { x } from '../server/regeln/fristen';"],
  ['dynamisches import()', 'src/server/dienste/x.ts', "export const m = () => import('../daten/laeufe');"],
];

const erlaubt: [string, string, string][] = [
  [
    'Agenten-Simulator → Typ aus daten/db',
    'src/simulator/agent.ts',
    "import type { Datenbank } from '../server/daten/db';",
  ],
  ['Anbindung → Typ aus daten/db', 'src/server/anbindungen/uhr.ts', "import type { Datenbank } from '../daten/db';"],
  [
    'Agenten-Simulator → daten/einstellungen',
    'src/simulator/agent.ts',
    "import { x } from '../server/daten/einstellungen';",
  ],
  ['Vorführ-Routen → Dienst', 'src/simulator/sim-routen.ts', "import { x } from '../server/dienste/zuruecksetzen';"],
  [
    'Simulator in anbindungen → daten',
    'src/server/anbindungen/sap-simulator.ts',
    "import { x } from '../daten/einstellungen';",
  ],
  [
    'Dienst → Regeln, daten, Anbindungen',
    'src/server/dienste/x.ts',
    "import { a } from '../regeln/fristen';\nimport { b } from '../daten/laeufe';\nimport { c } from '../anbindungen/uhr';",
  ],
  ['api → Dienst', 'src/server/api/x.ts', "import { x } from '../dienste/zugang';"],
];

describe('Bausteingrenzen (architektur.md, Abschnitt 3)', () => {
  it.each(verboten)('verboten: %s', async (_, datei, code) => {
    expect((await fehler(datei, code)).length).toBeGreaterThan(0);
  });
  it.each(erlaubt)('erlaubt: %s', async (_, datei, code) => {
    expect(await fehler(datei, code)).toEqual([]);
  });
});
