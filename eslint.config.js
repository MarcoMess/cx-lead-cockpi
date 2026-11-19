import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// Bausteingrenzen aus architektur.md, Abschnitt 3 – maschinell geprüft, damit einzeln gebaute Stories zusammenpassen.
const verbiete = (...gruppen) => ({
  'no-restricted-imports': ['error', { patterns: gruppen.map((g) => ({ group: [g.muster], message: g.grund })) }],
});
const NICHT_API = { muster: '**/api/*', grund: 'Nur app.ts bindet Routen ein.' };
const NICHT_DIENSTE = { muster: '**/dienste/*', grund: 'Baustein darf keine Dienste kennen (architektur.md §3).' };
const NICHT_REGELN = { muster: '**/regeln/*', grund: 'Baustein darf keine Regeln kennen (architektur.md §3).' };
const NICHT_DATEN = { muster: '**/daten/*', grund: 'Baustein darf die Datenhaltung nicht kennen (architektur.md §3).' };
const NICHT_ANBINDUNGEN = {
  muster: '**/anbindungen/*',
  grund: 'Baustein darf keine Anbindungen kennen (architektur.md §3).',
};
const NICHT_SIMULATOR = { muster: '**/simulator/*', grund: 'Nur app.ts bindet den Simulator ein.' };
const NICHT_SERVER = {
  muster: '**/server/**',
  grund: 'Die Oberfläche kennt nur gemeinsam/ und die HTTP-Schnittstelle.',
};

export default tseslint.config(
  { ignores: ['node_modules', 'data', 'docs', 'test-results', 'playwright-report', 'dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
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
    rules: verbiete(NICHT_API, NICHT_DIENSTE, NICHT_REGELN, NICHT_SIMULATOR),
  },
  { files: ['src/server/dienste/**/*.ts'], rules: verbiete(NICHT_API, NICHT_SIMULATOR) },
  { files: ['src/server/api/**/*.ts'], rules: verbiete(NICHT_DATEN, NICHT_SIMULATOR) },
  { files: ['src/simulator/**/*.ts'], rules: verbiete(NICHT_API, NICHT_REGELN) },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
);
