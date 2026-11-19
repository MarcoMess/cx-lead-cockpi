import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// Bausteingrenzen aus architektur.md, Abschnitt 3 – maschinell geprüft, damit einzeln gebaute Stories zusammenpassen.
const verbiete = (...gruppen) => ({
  'no-restricted-imports': [
    'error',
    { patterns: gruppen.map((g) => ({ group: [g.muster, ...(g.ausser ?? [])], message: g.grund })) },
  ],
});
const NICHT_API = { muster: '**/api/*', grund: 'Nur app.ts bindet Routen ein.' };
const NICHT_DIENSTE = { muster: '**/dienste/*', grund: 'Baustein darf keine Dienste kennen (architektur.md §3).' };
const NICHT_REGELN = { muster: '**/regeln/*', grund: 'Baustein darf keine Regeln kennen (architektur.md §3).' };
const NICHT_DATEN = { muster: '**/daten/*', grund: 'Baustein darf die Datenhaltung nicht kennen (architektur.md §3).' };
const NICHT_ANBINDUNGEN = {
  muster: '**/anbindungen/**',
  grund: 'Baustein darf keine Anbindungen kennen (architektur.md §3).',
};
const NICHT_SIMULATOR = { muster: '**/simulator/*', grund: 'Nur app.ts bindet den Simulator ein.' };
const NICHT_SERVER = {
  muster: '**/server/**',
  grund: 'Die Oberfläche kennt nur gemeinsam/ und die HTTP-Schnittstelle.',
};
// Der Agenten-Simulator nutzt die Agenten-API wie ein Fremder; für den eigenen Zustand nur daten/einstellungen.
const NUR_EINSTELLUNGEN = {
  muster: '**/daten/*',
  ausser: ['!**/daten/einstellungen', '!**/daten/db'],
  grund: 'Der Agenten-Simulator darf nur daten/einstellungen nutzen (architektur.md §3).',
};
// Kein dynamisches import(): Es würde die Prüfung der Bausteingrenzen umgehen.
const KEIN_DYNAMISCHER_IMPORT = {
  'no-restricted-syntax': [
    'error',
    { selector: 'ImportExpression', message: 'Kein dynamisches import(), es umgeht die Bausteingrenzen.' },
  ],
};

export default tseslint.config(
  { ignores: ['node_modules', 'data', 'docs', 'test-results', 'playwright-report', 'dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], rules: KEIN_DYNAMISCHER_IMPORT },
  {
    files: ['src/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules, ...verbiete(NICHT_SERVER, NICHT_SIMULATOR) },
  },
  {
    files: ['src/gemeinsam/**/*.ts'],
    rules: verbiete(NICHT_SERVER, NICHT_SIMULATOR, { muster: '**/web/**', grund: 'gemeinsam/ kennt nichts.' }),
  },
  {
    files: ['src/server/regeln/**/*.ts'],
    rules: verbiete(NICHT_API, NICHT_DIENSTE, NICHT_DATEN, NICHT_ANBINDUNGEN, NICHT_SIMULATOR),
  },
  {
    files: ['src/server/daten/**/*.ts'],
    rules: verbiete(NICHT_API, NICHT_DIENSTE, NICHT_REGELN, NICHT_ANBINDUNGEN, NICHT_SIMULATOR),
  },
  {
    files: ['src/server/anbindungen/**/*.ts'],
    rules: verbiete(NICHT_API, NICHT_DIENSTE, NICHT_REGELN, NICHT_SIMULATOR, {
      ...NICHT_DATEN,
      ausser: ['!**/daten/db'],
      grund: 'Nur die Simulatoren (anbindungen/*-simulator.ts) kennen die Datenhaltung (architektur.md §3).',
    }),
  },
  {
    files: ['src/server/anbindungen/*-simulator.ts'],
    rules: verbiete(NICHT_API, NICHT_DIENSTE, NICHT_REGELN, NICHT_SIMULATOR),
  },
  { files: ['src/server/dienste/**/*.ts'], rules: verbiete(NICHT_API, NICHT_SIMULATOR) },
  {
    files: ['src/server/api/**/*.ts'],
    rules: verbiete(NICHT_DATEN, NICHT_REGELN, NICHT_ANBINDUNGEN, NICHT_SIMULATOR),
  },
  {
    files: ['src/simulator/sim-routen.ts'],
    rules: verbiete(NICHT_API, NICHT_REGELN, NICHT_DATEN, NICHT_ANBINDUNGEN),
  },
  {
    files: ['src/simulator/agent.ts'],
    rules: verbiete(NICHT_API, NICHT_DIENSTE, NICHT_REGELN, NICHT_ANBINDUNGEN, NUR_EINSTELLUNGEN),
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
);
