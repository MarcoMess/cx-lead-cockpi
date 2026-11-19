# E3-S4 – Vorschlag verwerfen: Prüfung 2

Branch: story/E3-S4-verwerfen (Commit c806dc7, Diff gegen Runde 1 = `git diff 7bd5eb4..c806dc7`) · PR #17 · Datum: 19.11.2026 · **Urteil: Nicht bestanden**

Grund: Befund 1 (blockiert) ist nur zum Teil behoben. Der Hauptfall aus Runde 1 funktioniert jetzt. Ist die Sperre einer Person abgelaufen, entsteht beim erneuten Verwerfen ein neuer Eintrag mit neuer Frist. Auch eine gleichnamige Person bei einer anderen Firma bekommt einen eigenen Eintrag. Offen ist der dritte Fall, den Befund 1 in Runde 1 ausdrücklich nannte: Der vorhandene Personeneintrag gilt noch, endet aber früher als die neue Sperre. Dann entsteht kein neuer Eintrag. Die Schnittstelle meldet trotzdem eine Sperre für 6 Monate ab heute, und die Person ist früher wieder frei. Die Nachbesserung erwähnt diesen Fall nicht. Alle Tests bestehen, die Kriterien 1 bis 5 sind am System weiterhin erfüllt, und die Sollte-Befunde 2 bis 4 sind behoben.

## Tests
Ausgeführt: 201 · Bestanden: 201 · Befehl: `npm run reset`, dann `PLAYWRIGHT_CHANNEL=chrome TEST_API_PORT=6900 TEST_WEB_PORT=8974 npm test`, Exit-Code 0

- Typprüfung (`tsc --noEmit`) und ESLint: ohne Befund.
- Vitest: 27 Dateien, 159 Tests bestanden (Runde 1: 157). Neu sind zwei Tests in `tests/api/E3-S4.test.ts` und eine Erweiterung in `tests/api/E10-S1.test.ts`.
- Playwright: 42 Tests bestanden.
- `git diff --stat 7bd5eb4..c806dc7 -- tests`: In `tests/oberflaeche/E3-S4.spec.ts` wurden nur die erwarteten Texte an die neuen Clickdummy-Texte angepasst (vier Zeilen). Kein Test wurde gelöscht oder gelockert. Im Repository gibt es kein `.only`, `.skip` oder `fixme`.

Beurteilung der neuen Tests:
- »Befund 1« legt einen abgelaufenen Eintrag an (bis 18.11.2026, die Uhr steht auf dem 19.11.2026). Der Test erwartet `neu: true` mit Frist 19.05.2027 und zwei Einträge. Mit dem Stand aus Runde 1 schlüge er fehl. Nicht getestet sind die gleichnamige Person bei einer anderen Firma (am System geprüft, geht) und ein gültiger Eintrag, der früher endet (Befund 1 unten).
- »gültiger Eintrag vorhanden«: Er prüft `neu: false` bei abweichender Rechtsform. Ein zerlegter Umlaut kommt in diesem Test entgegen seinem Titel nicht vor. Den Umlaut prüft nur der Test in `E10-S1.test.ts`, und zwar auf dem Weg über `POST /sperrliste` (Hinweis 5).

## Akzeptanzkriterien
Geprüft am Entwicklungsserver (`PORT=6800 npx tsx src/server/start.ts`, `API_PORT=6800 npx vite --port 8874`), mit `curl` (angemeldet mit dem Passwort aus `.env`), mit einem Einreich-Skript für `POST /agent/laeufe` (Agentenschlüssel aus `.env`, Vorschläge aus `src/simulator/beispiel-lauf.json`) und mit Playwright-Skripten in Chrome (1440 × 1000). Die Skripte lagen außerhalb des Repositorys. Das Datum wurde über `POST /sim/datum` verstellt.

| Kriterium | Ergebnis (erfüllt · nicht erfüllt · nicht prüfbar) | Beleg |
|---|---|---|
| 1 »Verwerfen« verlangt einen der fünf Gründe | erfüllt | API: `{}` ergibt 400 `grund_fehlt` »Wähle einen Grund: passt nicht ins Zielbild, Kontakt nicht belegt, bereits bekannt, Anlass zu schwach, wird von Kollegen betreut.«. Die Oberfläche testet Playwright (bestanden). Der Code der Grundauswahl hat sich seit Runde 1 nicht geändert. |
| 2 Ammann »passt nicht ins Zielbild«: Firma mit Grund auf der Sperrliste, bis Marco entfernt | erfüllt | Oberfläche am 19.11.2026: Meldung »Reto Ammann verworfen (passt nicht ins Zielbild). Die Firma Seehotel-Gruppe Bodan AG ist für den Agenten gesperrt.«. S8: »Seehotel-Gruppe Bodan AG · Firma · Verworfen: passt nicht ins Zielbild · 19.11.2026 · Entfernen«. Die Einträge haben `gesperrt_bis: null` (auch nach dem Verstellen der Uhr auf 2027-06-07 noch vorhanden). |
| 3 »wird von Kollegen betreut« sperrt ebenfalls die Firma | erfüllt | API mit Voss: 200 `{"art":"firma","name":"Hansemarkt Handels SE","gesperrt_bis":null,"neu":true}`. Ammann deckt der API-Test »#3« ab (bestanden). |
| 4 Kortmann am 19.11.2026 »Anlass zu schwach«: nur die Person bis 19.05.2027, Firma frei | erfüllt | Oberfläche: »Sabine Kortmann verworfen (Anlass zu schwach). Sabine Kortmann ist bis 19.05.2027 für den Agenten gesperrt.«. S8: »Sabine Kortmann (Kranbau Oberhavel GmbH) · Person · Verworfen: Anlass zu schwach – gesperrt bis 19.05.2027 · 19.11.2026«. Für Kranbau gibt es keinen Firmeneintrag. |
| 5 Karte »Verworfen« mit Grund; weder Firma noch Kontakt | erfüllt | `GET /laeufe/5`: Die Vorschläge 1, 2 und 4 haben `zustand: verworfen` mit Grund und kein `ansprechpartner_id`. In der Datenbank gibt es keine `firma` »Seehotel%«/»Kranbau%« und keinen `ansprechpartner` Ammann/Kortmann. Ein zweites Verwerfen ergibt 409 `schon_geprueft`. Das Etikett der Karte testet Playwright (bestanden). |

Nachprüfung der Befunde aus Runde 1:

| Befund Runde 1 | Stand | Beleg |
|---|---|---|
| 1 (blockiert), Fall »Sperre abgelaufen« | behoben | Am 19.11.2026 Kortmann mit »Anlass zu schwach« verworfen (Eintrag bis 2027-05-19). Uhr auf 2027-06-03 gestellt, Kortmann über `POST /agent/laeufe` neu eingereicht (Lauf 6), mit »Kontakt nicht belegt« verworfen. Antwort: `{"gesperrt_bis":"2027-12-03","neu":true}`. Auf der Sperrliste steht ein zweiter Eintrag (id 7, bis 2027-12-03). |
| 1, Fall »gleichnamige Person einer anderen Firma« | behoben | 2027-06-04: Kortmann mit Firma »Elbtal Beispiel Logistik GmbH« (erfunden) eingereicht und mit »bereits bekannt« verworfen. Ergebnis `neu: true`, eigener Eintrag mit dieser Firma bis 2027-12-04, obwohl Kortmann (Kranbau) noch gesperrt war. |
| 1, Fall »vorhandener Eintrag endet früher als die neue Sperre« | **offen** | Siehe Befund 1 unten. |
| 2 (Sollte) zerlegter Umlaut | behoben | `POST /sperrliste {"art":"firma","name":"Windmöller & Hölscher"}` ergibt 409 `schon_gesperrt`. |
| 3 (Sollte) fehlende Tests | behoben, mit Lücken | Neue Tests siehe oben. Es fehlt ein Test für den früher endenden Eintrag (Befund 1), außerdem Hinweis 5. |
| 4 (Sollte) Texte wie im Clickdummy | behoben | Die Rückmeldung lautet »… ist für den Agenten gesperrt.«, S8 zeigt »Verworfen: <Grund>« (siehe oben). Kleine Restabweichungen nennt Hinweis 6. |
| Hinweis 6 »Abbrechen« | nachgetragen | In der Übergabe unter Nachbesserung 1 aufgeführt. |
| Hinweis 10 `durchklicken.md` | behoben | Der Satz »Verwerfen … fehlt noch« ist gestrichen. |

Neue Fehlerbilder durch den Vergleich ohne Rechtsform (Schwerpunkt dieser Runde):
- Startbestand gegen Varianten: »Haberkorn GmbH«, »HABERKORN  G.m.b.H.«, »Bobst SA« und »Energie Steiermark AG« ergeben jeweils 409. Das ist so gewollt. »Hornbach Baumarkt AG« ergibt 201, ist also richtig nicht gleich »HORNBACH«.
- Ich habe alle 13 Firmennamen aus Bestand und Sperrliste der Startdaten mit `normalisiereFirmenname` verglichen. Keine zwei verschiedenen Firmen fallen zusammen. Stichproben: »Haus am See« bleibt »haus am see«, »Berg Kg Bau« bleibt unverändert, und »Müller GmbH« ist nicht gleich »Mueller AG«.
- Kortmann mit der Firma »Kranbau Oberhavel AG« gilt als dieselbe Person wie die bei »Kranbau Oberhavel GmbH« (`neu: false`). Das ist folgerichtig.
- Was bewusst gleich behandelt wird, wirkt sich so aus: Wer »X GmbH« verwirft, während »X AG« gesperrt ist, bekommt keinen eigenen Eintrag (Hinweis 2). Ein schädliches Fehlerbild (eine fremde Firma wird gesperrt oder freigegeben) habe ich nicht gefunden.

Weitere Prüfungen:
- Stichprobe E10-S1: Ein Eintrag lässt sich anlegen (`POST /sperrliste` »Beispiel Prüffirma GmbH« ergibt 201) und mit `DELETE /sperrliste/:id` wieder entfernen.
- Seitenfehler in Chrome: keine.
- Umfang und Architektur: Die Regel `gueltigeSperre` ist eine reine Funktion in `regeln/ausschluss.ts`. Beide Dienste laufen in `transaktion()` und enthalten kein SQL. Die ungenutzte Abfrage `namenDerArt` ist entfernt. Es gibt keine neuen Abhängigkeiten und kein neues Schema. Im Diff stehen keine Zugangsdaten. »Elbtal Beispiel Logistik GmbH« und »Beispiel Prüffirma GmbH« habe ich nur in der Prüf-Datenbank angelegt, danach wurde zurückgesetzt.
- Aufräumen: Die Server wurden per PID beendet (Ports 6800 und 8874 sind frei), danach `npm run reset`. In der Arbeitskopie hat sich außer diesem Bericht nichts geändert (`git status` ist leer bis auf diesen Bericht).

## Befunde
| Nr. | Stelle | Befund | Schwere | So nachvollziehen |
|---|---|---|---|---|
| 1 | `src/server/dienste/verwirf-vorschlag.ts` mit `gueltigeSperre` | Rest von Befund 1 aus Runde 1. Gibt es für die Person schon einen gültigen Eintrag, entsteht kein neuer. Das gilt auch dann, wenn der vorhandene Eintrag vor der neuen 6-Monats-Frist endet. Die Antwort liefert trotzdem `gesperrt_bis` = heute + 6 Monate (`folge.gesperrt_bis`), ein Datum, das auf der Sperrliste nicht steht. Im schlimmsten Fall wird am letzten Tag der alten Sperre verworfen. Dann meldet die Schnittstelle eine Sperre bis in 6 Monaten, und die Person ist ab dem nächsten Tag frei. Das ist dasselbe Fehlerbild wie in Runde 1 und widerspricht Abschnitt 9 (»sperren nur die Person, für 6 Monate«). Die Oberfläche zeigt in diesem Fall nur »… war schon auf der Sperrliste.« und nennt kein falsches Datum. Umgekehrt meldet die Antwort bei einer dauerhaften Personensperre von Marco ebenfalls 6 Monate. Einstufung: blockiert, weil Befund 1 diesen Fall ausdrücklich nannte und die Antwort einen Zustand meldet, den es nicht gibt. Der Fall setzt voraus, dass eine noch gesperrte Person wieder geliefert wird, was E2-S2 künftig verhindern soll. Marco kann den Befund deshalb auf »Sollte« herabstufen. | Blockiert | Wie oben bis zum Eintrag id 7 (bis 2027-12-03). Uhr auf 2027-12-03 stellen, Kortmann (Kranbau Oberhavel GmbH) über `POST /agent/laeufe` einreichen und mit `{"grund":"Anlass zu schwach"}` verwerfen. Antwort: `{"art":"person","name":"Sabine Kortmann","gesperrt_bis":"2028-06-03","neu":false}`. `GET /sperrliste` hat für Kortmann (Kranbau) als spätesten Eintrag den bis 2027-12-03. Ebenso am 2027-06-07 mit »Kranbau Oberhavel AG«: Antwort 2027-12-07, Eintrag bis 2027-12-03. In der Oberfläche am 2027-09-01: »Sabine Kortmann verworfen (Anlass zu schwach). Sabine Kortmann war schon auf der Sperrliste.« |
| 2 | `gueltigeSperre`, Firmen ohne Rechtsform | Ist »Seehotel-Gruppe Bodan AG« gesperrt und Marco verwirft »Seehotel-Gruppe Bodan GmbH« mit »wird von Kollegen betreut«, entsteht kein Eintrag (`neu: false`). Die Antwort und die Meldung nennen »Seehotel-Gruppe Bodan GmbH«, auf S8 steht aber nur »…AG« mit dem Grund »passt nicht ins Zielbild«. Der zweite Grund steht nirgends auf der Liste. Entfernt Marco den AG-Eintrag, ist auch die GmbH frei. Dasselbe gilt für die 409-Meldung beim Anlegen von Hand: Sie nennt die Eingabe und nicht den vorhandenen Eintrag (»»Bobst SA« steht schon auf der Sperrliste« – auf der Liste steht »BOBST«). Das ist folgerichtig zum Dublettenabgleich aus E2-S4, aber eine Rückmeldung mit dem Namen des vorhandenen Eintrags wäre klarer. | Hinweis | Ammann mit »passt nicht ins Zielbild« verwerfen, am nächsten Tag Ammann mit der Firma »Seehotel-Gruppe Bodan GmbH« einreichen und mit »wird von Kollegen betreut« verwerfen. |
| 3 | `gueltigeSperre` (`e.gesperrt_bis < heute`) gegen `regeln/dubletten.ts` (`sperreNachSchliessenBis(…) <= heute`) | Der Tag »gesperrt bis« zählt hier noch als gesperrt (am 2027-12-03 gilt der Eintrag bis 2027-12-03). Beim Schließen (E2-S4) gilt derselbe Tag schon als abgelaufen. Kein Kriterium legt die Grenze fest. E2-S2 (Ausschlussliste) muss sich für eine Lesart entscheiden, sonst widersprechen sich Liste und Verwerfen an genau einem Tag. | Hinweis | Code lesen. Am System: Verwerfen am 2027-12-03 ergibt `neu: false` (siehe Befund 1). |
| 4 | `fuegeSperreHinzu` mit `gueltigeSperre` | Steht eine Person mit befristetem Eintrag auf der Liste, kann Marco sie nicht von Hand dauerhaft sperren. Er bekommt 409 »… Ein zweiter Eintrag ist nicht nötig.«, obwohl der vorhandene Eintrag abläuft. Das gab es schon in Runde 1 und es gehört zu E10-S1/E4-S4. Durch die neue Regel zur Gültigkeit fällt es jetzt auf. | Hinweis | Kortmann verwerfen (»Anlass zu schwach«), dann `POST /sperrliste {"art":"person","name":"Sabine Kortmann"}` ergibt 409. |
| 5 | `tests/api/E3-S4.test.ts`, Test »gültiger Eintrag vorhanden: … auch bei Rechtsform und zerlegtem Umlaut« | Der Titel verspricht einen zerlegten Umlaut, im Test kommt keiner vor. Beim Verwerfen ist der Umlaut also nicht abgesichert, nur beim Anlegen von Hand. Ein Test für den früher endenden Eintrag (Befund 1) fehlt. | Hinweis | Test lesen. |
| 6 | S2-Rückmeldung, S8-Grundspalte | Gegenüber dem Clickdummy bleiben kleine Unterschiede. Die Rückmeldung beginnt mit »<Name> verworfen (<Grund>).« statt mit »Verworfen.«. Bei Personen nennt sie das Datum statt »6 Monate«. S8 trennt mit » – gesperrt bis« statt mit », gesperrt bis«. Inhaltlich gleichwertig, die Übergabe nennt die Unterschiede aber nicht als Abweichung. | Hinweis | `clickdummy.html` Zeilen 261/262 neben S2 und S8 legen. |
| 7 | S8 Sperrliste | Seit es neue Einträge nach Ablauf gibt, stehen abgelaufene und gültige Einträge derselben Person ohne Unterschied untereinander (am 01.09.2027: »gesperrt bis 19.05.2027« neben »gesperrt bis 03.12.2027«). Keine Story verlangt eine Kennzeichnung. Nur zur Kenntnis für E10-S1 und E2-S2. | Hinweis | S8 nach dem Ablauf ansehen (siehe Zeilen oben). |

## Nicht geprüft
- Ob der Agent eine gesperrte Firma oder Person wirklich nicht wieder liefert: Das kommt mit E2-S2, wie schon in Runde 1. Für die Prüfung habe ich gesperrte Personen bewusst über `POST /agent/laeufe` erneut eingereicht.
- Ob der Kopf von PR #17 auf c806dc7 steht: Geprüft wurde der Commit c806dc7 in der Arbeitskopie, nicht der Stand auf GitHub.
- Die Grundauswahl in der Oberfläche (Reihenfolge der Gründe, »Abbrechen«) habe ich in dieser Runde nicht erneut von Hand durchgeklickt. Dieser Code hat sich seit Runde 1 nicht geändert, und der Playwright-Test besteht.
