# E3-S4 – Vorschlag verwerfen: Prüfung 3

Branch: story/E3-S4-verwerfen (Commit 13af092, Diff gegen Runde 2 = `git diff c806dc7..13af092`) · PR #17 · Datum: 19.11.2026 · **Urteil: Bestanden**

Grund: Der offene blockierende Rest aus Prüfung 2 ist behoben. Ist eine Person noch gesperrt und endet die Sperre vor der neuen 6-Monats-Frist, wird der vorhandene Eintrag bis zur neuen Frist verlängert. Er bekommt dabei den neuen Grund, und ein zweiter Eintrag entsteht nicht. Die Antwort nennt das Ende, das tatsächlich auf der Sperrliste steht, und die Oberfläche meldet die Verlängerung mit Datum. Das gilt auch am letzten Tag der alten Sperre und für eine Variante der Rechtsform. Ist die vorhandene Sperre länger oder dauerhaft, bleibt sie, und die Antwort nennt ihr Ende (`null` bei dauerhaft). Alle Tests bestehen, die Kriterien 1 bis 5 sind am System weiter erfüllt, und die Stichproben zu E10-S1 und zum Eingangskorb (E3-S3) gehen. Neu gefunden habe ich nur Hinweise.

## Tests
Ausgeführt: 207 · Bestanden: 207 · Befehl: `npm run reset`, dann `PLAYWRIGHT_CHANNEL=chrome TEST_API_PORT=6900 TEST_WEB_PORT=8974 npm test`, Exit-Code 0

- Typprüfung (`tsc --noEmit`) und ESLint laufen ohne Befund.
- Vitest: 27 Dateien, 164 Tests bestanden (Runde 2: 159). Neu sind zwei API-Tests in `tests/api/E3-S4.test.ts` und drei Regeltests in `tests/regeln/ausschluss.test.ts`.
- Playwright: 43 Tests bestanden (Runde 2: 42). Neu ist ein Oberflächentest in `tests/oberflaeche/E3-S4.spec.ts`.
- `git diff --stat c806dc7..13af092 -- tests` ergibt 79 Zeilen mehr und 3 weniger. Die drei geänderten Zeilen sind:
  - Eine Erwartung wurde um `verlaengert: false` ergänzt.
  - Der Titel »… und zerlegtem Umlaut« wurde gekürzt, wie Hinweis 5 aus Runde 2 verlangt hat.
  - Eine Erwartung wurde um `name: 'Seehotel-Gruppe Bodan'` verschärft.
- Kein Test wurde gelöscht oder gelockert. Im Repository gibt es kein `.only`, kein `.skip` und kein `fixme`.

Beurteilung der neuen Tests:
- **»eine noch gültige, aber kürzere Personensperre wird … verlängert«** legt Kortmann bis 2026-12-03 an, die Uhr steht auf dem 19.11.2026. Der Test erwartet `neu: false`, `verlaengert: true` und `gesperrt_bis: 2027-05-19`. Er prüft außerdem, dass genau ein Eintrag mit dieser Frist und dem neuen Grund vorhanden ist. Mit dem Stand aus Runde 2 schlüge er fehl, denn dort gab es `verlaengert` nicht und der Eintrag blieb bei 2026-12-03.
- **»eine längere oder dauerhafte Personensperre bleibt«** nimmt eine dauerhafte Sperre von Marco und erwartet `gesperrt_bis: null`. In Runde 2 hätte die Antwort 2027-05-19 gelautet, der Test schlüge also fehl.
- **Regeltests:** `sperreNachVerwerfen` wird mit kürzerer, längerer, gleich langer und dauerhafter Sperre geprüft. `findeGueltigeSperre` überspringt abgelaufene Einträge.
- **Oberflächentest:** Er deckt nur den Weg »war schon auf der Sperrliste« ohne Datum ab. Für die Meldung »Die Sperre von … gilt jetzt bis …« fehlt ein Oberflächentest (Hinweis 3). Am System habe ich sie geprüft.

## Akzeptanzkriterien
Geprüft am Entwicklungsserver mit `PORT=6800 npx tsx src/server/start.ts` und `API_PORT=6800 npx vite --port 8874`. Die Schnittstelle habe ich mit `curl` geprüft, angemeldet mit dem Passwort aus `.env`. Vorschläge kamen über `POST /sim/agent/meldung` und über `POST /agent/laeufe` (Agentenschlüssel aus `.env`, Kortmann aus `src/simulator/beispiel-lauf.json`). Die Oberfläche habe ich mit Playwright-Skripten in Chrome (1440 × 1000) geprüft. Die Skripte lagen unter `/tmp/p3`, also außerhalb des Repositorys. Das Datum habe ich über `POST /sim/datum` verstellt.

| Kriterium | Ergebnis (erfüllt · nicht erfüllt · nicht prüfbar) | Beleg |
|---|---|---|
| 1 »Verwerfen« verlangt einen der fünf Gründe | erfüllt | `POST /vorschlaege/4/verwerfung {}` und `{"grund":"Passt nicht ins Zielbild"}` ergeben jeweils 400 `grund_fehlt` mit der Meldung »Wähle einen Grund: passt nicht ins Zielbild, Kontakt nicht belegt, bereits bekannt, Anlass zu schwach, wird von Kollegen betreut.«. In der Oberfläche öffnet »Verwerfen« die Auswahl »Grund« mit den fünf Gründen in dieser Reihenfolge, gesehen an der Karte Kortmann am 01.12.2027. Der Playwright-Test #1 besteht. |
| 2 Ammann »passt nicht ins Zielbild«: Firma mit Grund auf der Sperrliste, bis Marco entfernt | erfüllt | API am 19.11.2026: `{"art":"firma","name":"Seehotel-Gruppe Bodan AG","gesperrt_bis":null,"neu":true,"verlaengert":false}`. Der Eintrag hat den Grund »passt nicht ins Zielbild«, die Herkunft `verworfen` und `gesperrt_bis: null`. Nach dem Verstellen der Uhr bis auf den 02.06.2028 steht er unverändert da. Die Oberfläche am 18.01.2027 zeigt das Etikett »Verworfen: passt nicht ins Zielbild« und legt Sperreintrag id 8 an. |
| 3 »wird von Kollegen betreut« sperrt ebenfalls die Firma | erfüllt | API mit Voss: `{"art":"firma","name":"Hansemarkt Handels SE","gesperrt_bis":null,"neu":true,"verlaengert":false}`. Ammann mit diesem Grund deckt der API-Test »#3« ab (bestanden). |
| 4 Kortmann am 19.11.2026 »Anlass zu schwach«: nur die Person bis 19.05.2027, Firma frei | erfüllt | API: `{"art":"person","name":"Sabine Kortmann","gesperrt_bis":"2027-05-19","neu":true,"verlaengert":false}`. Der Eintrag hat `firma_name: Kranbau Oberhavel GmbH`. Einen Firmeneintrag für Kranbau gibt es nicht. |
| 5 Karte »Verworfen« mit Grund; weder Firma noch Kontakt | erfüllt | `GET /laeufe/5`: Kortmann, Voss und Ammann haben `zustand: verworfen` mit Grund und kein `ansprechpartner_id`. In der Datenbank gibt es 0 Firmen »Seehotel%«/»Kranbau%« und 0 Ansprechpartner Ammann/Kortmann. Ein zweites Verwerfen ergibt 409 `schon_geprueft`. In der Oberfläche trägt die Karte das Etikett »Verworfen: Anlass zu schwach« (Albers) bzw. »Verworfen: passt nicht ins Zielbild« (Ammann). |

Nachprüfung des blockierenden Befunds aus Runde 2:

| Fall | Stand | Beleg |
|---|---|---|
| Person noch gesperrt, die Sperre endet vor der neuen Frist (Hauptfall) | behoben | Am 19.11.2026 Kortmann mit »Anlass zu schwach« verworfen (id 7, bis 2027-05-19). Am 01.03.2027 Kortmann über `POST /agent/laeufe` neu eingereicht und mit »Kontakt nicht belegt« verworfen. Antwort: `{"gesperrt_bis":"2027-09-01","neu":false,"verlaengert":true}`. Auf der Sperrliste steht genau ein Kortmann-Eintrag, id 7, mit `gesperrt_bis: 2027-09-01` und `grund: Kontakt nicht belegt`. |
| Verwerfen am letzten Tag der alten Sperre (schlimmster Fall aus Runde 2) | behoben | Am 01.09.2027 (id 7 gilt bis 01.09.2027) in der Oberfläche mit »bereits bekannt« verworfen. Meldung: »Sabine Kortmann verworfen (bereits bekannt). Die Sperre von Sabine Kortmann gilt jetzt bis 01.03.2028.« S8 zeigt »Sabine Kortmann (Kranbau Oberhavel GmbH) · Person · Verworfen: bereits bekannt – gesperrt bis 01.03.2028 · 19.11.2026 · Entfernen«. Die API zeigt id 7 bis 2028-03-01. |
| Variante der Rechtsform (»Kranbau Oberhavel AG«) | behoben | Am 01.12.2027 in der Oberfläche mit »Kontakt nicht belegt« verworfen. Meldung: »… Die Sperre von Sabine Kortmann gilt jetzt bis 01.06.2028.« Der Eintrag id 7 läuft jetzt bis 2028-06-01. Ein zweiter Eintrag ist nicht entstanden. |
| Vorhandene Sperre länger als die neue Frist | behoben | Nach dem Zurücksetzen: id 6 bis 2027-05-19, Uhr auf 2026-11-10 zurückgestellt und erneut verworfen. Antwort: `{"gesperrt_bis":"2027-05-19","neu":false,"verlaengert":false}`. Der Eintrag ist unverändert. |
| Dauerhafte Personensperre von Marco | behoben | `POST /sperrliste {"art":"person","name":"Katrin Albers"}`, dann Albers in der Oberfläche mit »Anlass zu schwach« verworfen. Meldung: »Dr. Katrin Albers verworfen (Anlass zu schwach). Katrin Albers war schon auf der Sperrliste.« Ein Datum wird nicht genannt. Der Eintrag bleibt dauerhaft (`gesperrt_bis: null`). Der API-Test prüft `gesperrt_bis: null` in der Antwort. |
| Weiterhin: Sperre abgelaufen → neuer Eintrag (aus Runde 1) | geht weiter | Am 02.06.2028 (id 7 lief bis 01.06.2028): `{"gesperrt_bis":"2028-12-02","neu":true,"verlaengert":false}`. Es gibt einen neuen Eintrag id 10, id 7 bleibt stehen. |
| Weiterhin: gleichnamige Person bei einer anderen Firma | geht weiter | Am 15.01.2027 Kortmann mit der erfundenen Firma »Elbtal Beispiel Logistik GmbH« verworfen. Ergebnis `neu: true` mit eigenem Eintrag bis 2027-07-15. Der Eintrag Kranbau bleibt bei 2027-05-19. |

Weitere Prüfungen:
- **Stichprobe E10-S1:**
  - `POST /sperrliste` »Beispiel Prüffirma GmbH« ergibt 201.
  - »beispiel  prüffirma« ergibt 409 mit der Meldung »… steht schon auf der Sperrliste. Ein zweiter Eintrag ist nicht nötig.«.
  - `DELETE /sperrliste/:id` ergibt 200, der Eintrag ist danach weg.
  - Ist Kortmann befristet gesperrt, ergibt eine Personensperre von Hand weiterhin 409 (bekannt, Hinweis 4 aus Runde 2).
- **Stichprobe Eingangskorb und E3-S3:** Der Agentenlauf vom 18.01.2027 (`POST /sim/agent/meldung`) brachte 4 Vorschläge. `POST /vorschlaege/5/freigabe` (Voss) ergibt `{"ansprechpartner_id":8,"firma_id":4,"wiederansprache":false}`, die Karte zeigt »Freigegeben«. Verwerfen im selben Lauf geht weiter (Ammann).
- **Seitenfehler in Chrome:** keine.
- **Umfang und Architektur:**
  - Die neue Logik steckt in den reinen Funktionen `findeGueltigeSperre` und `sperreNachVerwerfen` in `regeln/ausschluss.ts`.
  - Das SQL steht in `daten/sperrliste.ts` (`verlaengereSperre`). Der Dienst läuft weiter in `transaktion()`.
  - Neue Abhängigkeiten oder ein neues Schema gibt es nicht. Die Antwort hat das neue Feld `verlaengert`, und der Typ in `gemeinsam/verwerfen.ts` ist angepasst.
  - Zugangsdaten stehen keine im Diff.
- **Aufräumen:**
  - Meine Server habe ich per PID beendet (Ports 6800 und 8874 sind frei). Ein fremder Server aus `pruefung-E10-S1` lief weiter und blieb unberührt.
  - Danach habe ich `npm run reset` ausgeführt.
  - In der Arbeitskopie hat sich außer diesem Bericht nichts geändert.

## Befunde
| Nr. | Stelle | Befund | Schwere | So nachvollziehen |
|---|---|---|---|---|
| 1 | `verlaengereSperre` (`UPDATE … grund = ?`) und S8 | Beim Verlängern wird der alte Grund überschrieben, `erstellt_am` bleibt dagegen alt. S8 zeigt dann »Verworfen: bereits bekannt – gesperrt bis 01.03.2028 · 19.11.2026«. Das sieht aus, als sei am 19.11.2026 mit »bereits bekannt« verworfen worden. Der ursprüngliche Grund »Anlass zu schwach« steht nirgends mehr. Die Übergabe nennt das Überschreiben ausdrücklich, und keine Story verlangt eine Historie der Gründe. Für den späteren Rückkanal der Verwerfungsgründe an den Agenten (»Später«) gehen damit aber Gründe verloren. | Hinweis | Kortmann verwerfen, nach einigen Monaten erneut einreichen und mit einem anderen Grund verwerfen, dann S8 ansehen. |
| 2 | `findeGueltigeSperre` (`.find`) | Passen mehrere gültige Einträge, wird nur der erste betrachtet und gegebenenfalls verlängert. Die Antwort kann dann ein früheres Ende nennen als das tatsächlich wirksame. Mit den heutigen Wegen entsteht so eine Lage kaum: Von Hand anlegen ist bei gültigem Eintrag gesperrt, und beim Verwerfen entsteht kein Doppel. Ich habe sie nur durch Zurückstellen der Uhr erzeugt. Nur zur Kenntnis für E2-S2 und E4-S4. | Hinweis | Code lesen. |
| 3 | `tests/oberflaeche/E3-S4.spec.ts` | Für die neue Meldung »Die Sperre von … gilt jetzt bis …« gibt es keinen Oberflächentest. Getestet sind nur die API-Antwort und die Regel. Am System habe ich die Meldung geprüft (siehe oben). | Hinweis | Test lesen. |
| 4 | `src/server/daten/sperrliste.ts` Zeile 34 | Die neue Funktion `verlaengereSperre` steht zwischen dem Doc-Kommentar »true, wenn ein Eintrag entfernt wurde.« und `entferneSperre`. Der Kommentar hängt damit an der falschen Funktion. | Hinweis | Datei lesen. |
| 5 | `docs/status.md` Zeile 43 | Dort steht für E3-S4 noch »In Prüfung (Runde 2) · 1 von 2«. Nachbesserung 2 ist nicht nachgetragen. | Hinweis | Datei lesen. |

Die übrigen Hinweise aus Runde 2 bleiben laut Übergabe bewusst offen und sind nicht erneut bewertet:
- Hinweis 2: Name und Grund bei einer Variante der Rechtsform. Die Antwort nennt jetzt den Namen des vorhandenen Eintrags, der zweite Grund steht aber weiter nicht auf der Liste.
- Hinweis 3: Grenztag `<` gegen `<=`.
- Hinweis 4: Dauerhafte Personensperre von Hand.
- Hinweis 6: Kleine Textunterschiede zum Clickdummy.
- Hinweis 7: Abgelaufene Einträge auf S8 ohne Kennzeichnung.

## Nicht geprüft
- **Wiederlieferung durch den Agenten:** Ob der Agent gesperrte Firmen und Personen wirklich nicht wieder liefert, kommt erst mit E2-S2. Für die Prüfung habe ich gesperrte Personen bewusst über `POST /agent/laeufe` erneut eingereicht.
- **Stand von PR #17:** Ob der Kopf von PR #17 auf 13af092 steht, habe ich nicht geprüft. Geprüft wurde Commit 13af092 in der Arbeitskopie, nicht der Stand auf GitHub.
- **Optik:** Den Vergleich mit dem Clickdummy habe ich in dieser Runde nicht wiederholt. Der Code der Grundauswahl hat sich nur in der Rückmeldung geändert.
