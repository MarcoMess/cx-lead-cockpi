# Pflege 1 – Bausteingrenzen und gesammelte Befunde: Prüfung 3

Branch: pflege/bausteingrenzen (Commit b67d39e, verglichen mit `f5651d5` = Stand von Prüfung 2) · Datum: 19.11.2026 · **Urteil: Bestanden**

Das ist die Nachprüfung nach der zweiten und letzten Korrekturschleife. Ich habe drei Dinge geprüft: Ist der blockierende Befund aus `pflege-1-pruefung-2.md` behoben? Sind die mitbehobenen »Sollte«-Befunde (Runde 1: 4 und 6, Runde 2: 2) erledigt? Hat die Korrektur etwas kaputtgemacht? Den ganzen Stand habe ich nicht erneut nach neuen Befunden abgesucht. Maßstab waren `architektur.md` §3 und §9 sowie die Abschnitte »Nachbesserung 1« und »Nachbesserung 2« in `docs/umsetzung/pflege-1.md`.

## Tests
Ausgeführt: 78 · Bestanden: 78 · Befehl: `PLAYWRIGHT_CHANNEL=chrome TEST_API_PORT=4400 TEST_WEB_PORT=6474 npm test`

- Typprüfung ohne Fehler, `eslint .` ohne Befund, Vitest mit 11 Dateien und 68 Tests bestanden, Playwright mit 10 Tests bestanden, Exit 0. Umgebung: Node.js 22.23.5.
- **Vergleich mit Runde 2:** 59 → 68 Logiktests. Neu in `tests/regeln/grenzen.test.ts` sind 7 »verboten«-Fälle (5× weitere Simulator-Datei, 2× Wert aus `daten/db`) und 2 »erlaubt«-Fälle (Typ aus `daten/db`). Playwright bleibt bei 10.
- **Kein Test abgeschwächt.** `git diff f5651d5..b67d39e -- tests` ändert in bestehenden Zeilen nur den Filter in `fehler()`: Statt `no-restricted-imports` wird jetzt `@typescript-eslint/no-restricted-imports` gezählt. Das passt zur Umstellung der Regel in `eslint.config.js`, wo `no-restricted-imports` in jedem Block mit `'off'` abgeschaltet ist. Sonst gibt es nur hinzugefügte Fälle, kein `skip`, `only`, `todo` und kein `fixme`. Die Sollwerte (`length > 0` bzw. `[]`) sind unverändert.
- **Würden die neuen Fälle ohne die Korrektur fehlschlagen?** Ich habe b67d39e nach `/tmp` gelegt und dort die `eslint.config.js` aus `f5651d5` eingesetzt. Den Filter im Test habe ich auf beide Regelnamen erweitert, damit nur die Konfiguration den Unterschied macht. Ergebnis: Genau die 7 neuen »verboten«-Fälle scheitern, die übrigen 22 Fälle bestehen. Die neuen Tests messen also die Korrektur.

## Blockierender Befund aus Runde 2
| Befund aus Runde 2 | Ergebnis (behoben · nicht behoben · teilweise) | Beleg |
|---|---|---|
| 1 Simulator-Regeln galten nur für `agent.ts` und `sim-routen.ts` | **behoben** | Ich habe die temporäre Datei `src/simulator/hilfe.ts` mit Werte-Importen aus `server/dienste/lege-lauf-an`, `server/daten/laeufe`, `server/daten/leeren`, `server/regeln/fristen`, `server/anbindungen/uhr` und `server/api/agent` angelegt. `npm run typecheck` ergab Exit 0, `npm run lint` meldete **6 Fehler** (je Zeile einer, `@typescript-eslint/no-restricted-imports`) und endete mit Exit 1. `npm test` endete mit **Exit 1** nach der Lint-Stufe, bevor Vitest lief. Dazu habe ich Varianten in derselben Datei geprüft: `export { … } from` (Dienst), `export * from` (`daten/laeufe`), `import type` aus `regeln/zugang` und `import type` aus `daten/db`. Alle vier wurden gemeldet, denn für weitere Simulator-Dateien ist die Datenhaltung ganz gesperrt. Ein Unterordner (`src/simulator/unter/tief.ts` → `regeln/fristen`) wird ebenfalls gemeldet. Damit ist auch der Umweg aus Runde 2 zu (`agent.ts` reicht über eine Hilfsdatei weiter): Die Hilfsdatei selbst scheitert an der Prüfung. Eine weitere Simulator-Datei darf auch `daten/einstellungen` nicht nutzen, das darf laut §3 nur `agent.ts`. |

**Werte-Import aus `daten/db`** (Teil des Auftrags, zugleich Runde 2 Befund 2): Ich habe an `src/simulator/agent.ts` die Zeile `import { oeffneDatenbank, transaktion } from '../server/daten/db'` angehängt und an `src/server/anbindungen/uhr.ts` die Zeile `import { oeffneDatenbank } from '../daten/db'`. Dazu habe ich die neue Datei `src/server/anbindungen/sap.ts` mit `transaktion` aus `daten/db` und `liesEinstellung` aus `daten/einstellungen` angelegt. `tsc` ergab Exit 0, `npm run lint` meldete **4 Fehler** (»Aus daten/db nur den Typ Datenbank importieren« bzw. »Nur die Simulatoren … kennen die Datenhaltung«) und endete mit Exit 1, `npm test` mit **Exit 1**. Die Änderungen habe ich mit `git checkout` zurückgenommen und die Dateien gelöscht.

**Erlaubte Wege gehen weiter durch** (`eslint --stdin --stdin-filename … -f json`, ausgewertet nach Regelname):
- `sim-routen.ts` → `dienste/zuruecksetzen` und `dienste/lege-lauf-an`: keine Meldung.
- `agent.ts` → `liesEinstellung` aus `daten/einstellungen`: keine Meldung.
- `agent.ts` → `import type { Datenbank }` und `import { type Datenbank }` aus `daten/db`: keine Meldung. Dagegen werden gemeldet: `import { type Datenbank, oeffneDatenbank }`, `import * as`, `export { transaktion } from` und `import '../server/daten/db'`.
- `anbindungen/uhr.ts` → `import type { Datenbank }`: keine Meldung.
- `anbindungen/uhr-simulator.ts` → Werte aus `daten/einstellungen` und `daten/db`: keine Meldung, denn der Simulator darf die Datenhaltung kennen.
- Der unveränderte Stand ist lint-grün, die bestehenden erlaubten Importe bleiben es also auch. Das gilt auch für `agent.ts` mit `import type` aus `daten/db`.

## Mitbehobene »Sollte«-Befunde
| Befund | Ergebnis | Beleg |
|---|---|---|
| Runde 1, Nr. 4: SQL in `reset.ts` | behoben | `grep -n "prepare\|exec\|SELECT" src/server/reset.ts` findet nichts. Die Zählung liegt jetzt in `zaehleBestand` in `daten/leeren.ts`. `npm run reset` meldet »7 Firmen, 7 Ansprechpartner, 4 Rechercheläufe, 5 Sperreinträge. Vorführdatum: 2026-11-18.«, Exit 0. Eine direkte Zählung in der SQLite-Datei ergab dieselben Zahlen (7/7/4/5). |
| Runde 1, Nr. 6: `setzeAgentSchluessel` ohne Transaktion | behoben | Beide Schreibvorgänge stehen in `transaktion()`. Der Aufruf innerhalb von `setzeZurueck` (selbst eine Transaktion) läuft über einen Sicherungspunkt, `npm run reset` mit neuem Schlüssel klappt. Atomarität geprüft an einer Kopie der Datenbank in `/tmp`: Ein Trigger ließ das Schreiben von `agent_schluessel_endung` scheitern. `setzeAgentSchluessel` warf den Fehler, `agent_schluessel_hash` blieb **unverändert**, und es blieb keine Transaktion offen. Nach `npm run reset` stehen beide Einstellungen in der Datenbank (Hash 64 Zeichen, Endung 4 Zeichen). |
| Runde 2, Nr. 2: `daten/db` erlaubte auch Werte | behoben | siehe oben, »Werte-Import aus `daten/db`« |

## Hat die Korrektur etwas kaputtgemacht?
Nein. Alle 78 Tests bestehen. Im Code wurden nur `eslint.config.js`, `daten/leeren.ts` (neue Funktion), `dienste/zugang.ts` (Transaktion) und `reset.ts` (Aufruf statt SQL) geändert. Die Änderung geht nicht über die drei Befunde hinaus.

**Stichprobe am laufenden System** (`npm run reset`, dann `PORT=4500 API_PORT=4500 WEB_PORT=6574 npm run dev`, Python-Playwright mit Chrome):
- Ohne Anmeldung erscheint »Melde dich mit deinem Passwort an.« (`GET /ich` → 401). Nach der Anmeldung mit dem Passwort aus `.env` (`POST /anmeldung` → 200) zeigt die Vorführleiste 18.11.2026.
- »Agent meldet sich« ergibt »Der Agent hat 4 Vorschläge geliefert.« (200). Ein zweites Mal ergibt »Der Agent konnte keinen Lauf anlegen: Für heute gibt es schon einen ausgeführten Recherchelauf.« (409).
- »Nächster Werktag« schaltet auf 19.11.2026. »Zurücksetzen« (`POST /sim/zuruecksetzen` → 200) stellt 18.11.2026 wieder her. »Agent meldet sich« danach ergibt wieder »Der Agent hat 4 Vorschläge geliefert.«, der Agenten-Schlüssel bleibt also gültig.
- Agenten-API direkt: Mit dem Schlüssel aus `.env` kommt 409 `bereits_gelaufen` (der Schlüssel wird also angenommen), mit falschem Schlüssel 401 `schluessel_ungueltig`.
- Danach habe ich den Server beendet (Ports 4500 und 6574 antworten nicht mehr) und `npm run reset` ausgeführt (7/7/4/5, 2026-11-18). Alle Probedateien sind gelöscht, `git status` ist sauber, `npm run lint` ergibt Exit 0.

## Befunde
| Nr. | Stelle | Befund | Schwere | So nachvollziehen |
|---|---|---|---|---|
| 1 | `eslint.config.js`, Block `files: ['src/simulator/**/*.ts']` | Der strenge Simulator-Block gilt nur für `.ts`. Eine Datei `src/simulator/x.tsx` mit `import { setzeZurueck } from '../server/dienste/zuruecksetzen'` wird nicht gemeldet, und `tsc` übersetzt sie. Im Simulator gibt es keine Oberfläche, so eine Datei entsteht kaum aus Versehen. `src/**/*.{ts,tsx}` für das Verbot von `import()` zeigt, wie man es dicht macht. | Hinweis | Datei anlegen, `npx tsc --noEmit` (Exit 0), `npx eslint src/simulator` meldet sie nicht. Datei löschen. |
| 2 | `docs/umsetzung/pflege-1.md`, letzter Satz der »Nachbesserung 2« | Dort steht »Beides steht in docs/status.md unter »Offene Punkte««. Auf diesem Branch hat `docs/status.md` diesen Abschnitt nicht. Die Übergabe sagt selbst, dass er erst mit E4-S2 kommt. Die beiden Hinweise (Umgehung über `../`/`createRequire`, Statuswerte in `startdaten.ts`) sind im selben Satz der Übergabe genannt und gehen also nicht verloren. Beim Zusammenführen sollte geprüft werden, dass sie in `status.md` landen. | Hinweis | `grep -n -i "offene punkte" docs/status.md` findet nichts. |

## Nicht geprüft
- **Die übrigen offenen »Sollte«-Befunde aus Runde 1** (5 `transaktion()` bei `async`, 7 Fehlermeldung in der Vorführleiste) sind laut Übergabe bewusst offen und gehören nicht zu dieser Nachprüfung.
- **Absichtliche Umgehungen** über `../`-Pfade und `createRequire` (Hinweise 4 und 5 aus Runde 2) sind bewusst nicht gebaut und stehen in der Übergabe.
- **Standardports 3000 und 5173:** Für diese Prüfung waren nur 4400/6474 (Tests) und 4500/6574 (von Hand) vorgesehen.
