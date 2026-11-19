# Pflege 1 – Bausteingrenzen und gesammelte Befunde: Übergabe

Branch: pflege/bausteingrenzen (baut auf story/E1-S3-agenten-simulator auf) · Datum: 19.11.2026 · Ergebnis: Fertig

Keine Story. Behebt »Sollte«-Befunde aus den Prüfungen von E1-S0, E1-S1, E1-S2 und E2-S3, ohne neue Funktion. Architektur auf 1.3.

## Was geändert wurde
| Nr. | Befund (Prüfung, Nr.) | Änderung | Test |
|---|---|---|---|
| 1 | Bausteingrenzen verletzt (E1-S0 #1, E1-S1 #2, E1-S2 #5 und #6) | SQL nur noch in `daten` (`daten/einstellungen.ts`, `daten/leeren.ts`); `startdaten.ts` ohne Regel-Import (feste Normalnamen); Zurücksetzen und Vorführdatum als Dienste (`dienste/zuruecksetzen.ts`, `dienste/vorfuehrdatum.ts`); Reset-Skript nach `src/server/reset.ts`; `regeln/datum.ts` heißt jetzt `regeln/fristen.ts`. **Neu: ESLint prüft die Grenzen** (`eslint.config.js`) | `npm run lint`; `tests/regeln/pflege.test.ts` »Pflege #1« |
| 2 | Reinhardts E-Mail trug den LinkedIn-Wortlaut (E1-S0 #2) | Startdaten: E-Mail-Fassung mit Anrede und Signatur | »Pflege #2« |
| 3 | `transaktion()` nicht verschachtelbar, asynchron unsicher (E1-S1 #3) | Sicherungspunkte; Promise wird abgelehnt und zurückgerollt | »Pflege #3«, »Pflege #4« |
| 4 | Zwei Wege zum Zurücksetzen, Test prüfte nicht `npm run reset` (E1-S2 #1) | Ein Weg: `setzeZurueck()`; Test startet das Skript wirklich | »Pflege #5« |
| 5 | `npm run reset` bei laufendem Server ohne Hinweis (E1-S2 #2) | Ausgabe nennt Neustart oder »Zurücksetzen« in der Leiste | »Pflege #5« |
| 6 | `plus_werktage` ohne Grenze (E1-S2 #3) | 1 bis 30, Ergebnis muss gültiges Datum sein | »Pflege #6« |
| 7 | Englische oder falsche Rückweisungen (E2-S3 #1, #2) | Deutsche Meldungen je Fehlerart, richtiges Feld | »Pflege #7« |
| 8 | Erlaubte Werte als Text (E2-S3 #3) | `ANREDEN`, `LAUF_HERKUNFT` in `werte.ts`; Statuswerte im SQL als Parameter | `npm run lint`, Typprüfung |
| 9 | Englische Meldung bei kaputtem JSON (E1-S0 #3) | Deutsche Meldung | »Pflege #8« |
| 10 | Leere Fläche bei unbekannter Adresse (E1-S0 #4) | Seite »Diese Seite gibt es nicht« mit Link zum Dashboard | `tests/oberflaeche/pflege.spec.ts` »Pflege #9« |
| 11 | Vite lieferte Datenbank aus (E1-S1 #1; Sperre kam mit E1-S3) | Test ergänzt | »Pflege #10« |

## Nicht behoben (bewusst offen, an Marco gemeldet)
- Vite-Proxy liest `PORT` nicht aus `.env` (E1-S0, Hinweis 6): wirkt nur bei geändertem Port.
- Fehlender 21-Tage-Vorschlag für Reinhardt im Altbestand (E1-S0, Hinweis 8): wird mit E6-S5 entschieden.
- Untertitel der Screens aus dem Clickdummy (E1-S0, Hinweis 10): kommen mit den Screens.

## So prüft man es von Hand
`npm test` (enthält jetzt die Grenzprüfung). Einen verbotenen Import ausprobieren, z. B. in `src/server/daten/` etwas aus `../dienste/` importieren: `npm run lint` meldet »Baustein darf keine Dienste kennen«.

## Nachbesserung 1 (nach Prüfung pflege-1-pruefung-1)

| Befund | Umsetzung | Nachweis |
|---|---|---|
| 1 Bausteingrenzen nur teilweise in ESLint | `eslint.config.js` setzt jetzt jede Zeile der Tabelle in architektur.md §3 um: Agenten-Simulator nur `daten/einstellungen` (und den Typ `daten/db`), Vorführ-Routen nur Dienste, `api` ohne Regeln und Anbindungen, `anbindungen` ohne Datenhaltung außer in `*-simulator.ts`, dazu Verbot von dynamischem `import()`. Gefundene Verstöße behoben: `api/zugang.ts` fragt die Zugangsart jetzt über den Dienst `zugangFuer`; das Vorführdatum der Uhr liegt in `anbindungen/uhr-simulator.ts`, `uhr.ts` kennt keine Datenhaltung mehr. | `tests/regeln/grenzen.test.ts`: 15 verbotene Importe (u. a. alle aus dem Befund) müssen von ESLint gemeldet werden, 5 erlaubte nicht |
| 2 Statuswerte als freier Text in `daten/laeufe.ts` | Die Werte sind jetzt mit `satisfies LaufErgebnis` bzw. `satisfies VorschlagZustand` gegen die Listen in `gemeinsam/werte.ts` geprüft; ein Tippfehler bricht die Typprüfung. | `npm run typecheck` (Probe: `'ausgefuert'` → TS1360) |

Offene Sollte-Befunde aus Runde 1 und wo sie hingehören (Korrektur aus Runde 2, Befund 3: der Abschnitt in status.md existierte auf diesem Branch nicht; ab E4-S2 steht er dort):

| Befund Runde 1 | Stand |
|---|---|
| 4 SQL in `reset.ts` | behoben in Nachbesserung 2 (`zaehleBestand` in `daten/leeren.ts`) |
| 5 `transaktion()` mit asynchroner Funktion | offen; bisher ruft niemand sie asynchron auf. Pflege vor dem Halt |
| 6 `setzeAgentSchluessel` ohne Transaktion | behoben in Nachbesserung 2 |
| 7 Vorführleiste zeigt keine Fehlermeldung (E1-S2 #4) | offen, Pflege vor dem Halt |

## Nachbesserung 2 (nach Prüfung pflege-1-pruefung-2)

| Befund | Umsetzung | Nachweis |
|---|---|---|
| 1 (Blockiert) Simulator-Regeln galten nur für `agent.ts` und `sim-routen.ts` | Neuer strenger Block für `src/simulator/**/*.ts` (keine api, dienste, regeln, daten, anbindungen); danach die beiden Ausnahmen aus §3 | `tests/regeln/grenzen.test.ts`: fünf Fälle »weitere Simulator-Datei → …« |
| 2 (Sollte) `daten/db` erlaubte auch Werte | Umstellung auf `@typescript-eslint/no-restricted-imports`; aus `daten/db` dürfen Simulator und Anbindungen nur `import type` | Fälle »Wert aus daten/db« (verboten) und »Typ aus daten/db« (erlaubt) |
| 3 (Sollte) Abschnitt »Offene Punkte« fehlte | Liste oben in dieser Übergabe; ab E4-S2 in docs/status.md | – |

Nicht gebaut (Hinweise aus Runde 2): Absichtliche Umgehungen über `../`-Pfade oder `createRequire` fängt ESLint nicht; Statuswerte in `startdaten.ts` sind über den Typ der Startdaten nicht gegen `werte.ts` geprüft. Beides steht in docs/status.md unter »Offene Punkte«.
