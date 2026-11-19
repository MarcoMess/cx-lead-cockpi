# E10-S1 – Sperrliste verwalten: Prüfung 2

Branch: story/E10-S1-sperrliste (Commit 2c55f24, Nachbesserung gegen Runde 1 = `git diff b98a3b4..2c55f24`) · PR #14 · Datum: 19.11.2026 · **Urteil: Bestanden unter Vorbehalt der Annahme durch Marco**

**Vorbehalt:** Kriterium 4, Teil »fehlt in der Ausschlussliste des Agenten«, ist weiter nicht am System prüfbar, weil `GET /agent/ausschlussliste` erst mit E2-S2 entsteht. Der Nachweis ist jetzt als offener Punkt an E2-S2 gebunden (`docs/status.md`, Offene Punkte Zeile »E10-S1«, und Planzeile 19 »E2-S2 Ausschlussliste (auch Nachweis E10-S1 #4)«). Nimmt Marco diese Verschiebung an, ist die Story bestanden; nimmt er sie nicht an, lautet das Urteil »Nicht bestanden«, bis E2-S2 den Test »E10-S1 #4« liefert. Am Code gibt es keinen blockierenden Befund.

## Tests
Ausgeführt: 157 · Bestanden: 157 · Befehl: `npm run reset`, dann `PLAYWRIGHT_CHANNEL=chrome TEST_API_PORT=5700 TEST_WEB_PORT=7774 npm test`, Exit-Code 0

- Typprüfung (`tsc --noEmit`) und ESLint mit Bausteingrenzen: ohne Befund.
- Vitest: 21 Dateien, 122 Tests bestanden (Runde 1: 120; neu »Prüfung E10-S1 Befund 2« und »Anfrage ohne Inhalt«).
- Playwright: 35 Tests bestanden, darunter die zwei E10-S1-Tests.
- `git diff --stat b98a3b4..2c55f24 -- tests package.json eslint.config.js playwright.config.ts vite.config.ts`: nur `tests/api/E10-S1.test.ts` und `tests/oberflaeche/E10-S1.spec.ts` geändert. Kein Test gelöscht, gelockert oder übersprungen. Die geänderten Erwartungen folgen den geänderten Texten (»Eintrag hinzufügen«, »Startbestand«, »steht nicht mehr auf der Sperrliste«); die Datumsprüfung ist strenger geworden (24.11.2026 statt 18.11.2026).

Zu den nachgebesserten Tests:
- #2: API und Oberfläche verstellen die Uhr auf den 24.11.2026 und erwarten `erstellt_am: 2026-11-24` bzw. »24.11.2026«. Ein fest eingetragenes Datum würde jetzt scheitern – Befund 3 aus Runde 1 ist damit wirksam behoben. Zusätzlich prüft der API-Test den Ersatzgrund »Von Marco gesperrt«.
- Befund 2: `' bobst '` als Firma ergibt 409 `schon_gesperrt` mit `feld: name`, in der Tabelle bleiben 5 Einträge; »BOBST« als Person ist erlaubt (201). Ohne die neue Prüfung schlüge der Test fehl. Groß- und Kleinschreibung wird nur mit ASCII-Buchstaben geprüft (siehe Befund 1).
- #4 Oberfläche: Nach dem Neuladen wird jetzt geprüft, dass HORNBACH fehlt und Erika Beispiel bleibt (Hinweis 8 aus Runde 1 behoben).

## Akzeptanzkriterien
Geprüft am Entwicklungsserver (`PORT=5600 npx tsx src/server/start.ts`, `API_PORT=5600 WEB_PORT=7674 npx vite --port 7674`) mit `curl` (angemeldet mit dem Passwort aus `.env`) und einem Playwright-Skript in Chrome (1440 × 1000), das außerhalb des Repositorys lag.

| Kriterium | Ergebnis (erfüllt · nicht erfüllt · nicht prüfbar) | Beleg |
|---|---|---|
| 1 Fünf Firmen als Startbestand mit Grund »In früherer Ausgabe genannt« | erfüllt | `/einstellungen` nach Zurücksetzen: »Windmöller & Hölscher / BOBST / Haberkorn / HORNBACH / Energie Steiermark«, je »Firma · In früherer Ausgabe genannt · Startbestand · Entfernen«. `GET /api/v1/sperrliste`: dieselben fünf, `herkunft: startbestand`, `erstellt_am: 2026-11-18`. |
| 2 Neuer Eintrag steht mit dem heutigen Datum in der Liste | erfüllt | Uhr per `POST /sim/datum {"heute":"2026-11-24"}`, dann in der Oberfläche »Erika Beispiel«, Person, ohne Grund → »»Erika Beispiel« steht jetzt auf der Sperrliste.«, Zeile »Erika Beispiel · Person · Von Marco gesperrt · 24.11.2026«. API: »Beispiel Werke GmbH« → `erstellt_am: 2026-11-24`, `grund: Von Marco gesperrt`. |
| 3 Leerer Name: nichts angelegt, Name verlangt | erfüllt | »Eintrag hinzufügen« ohne Namen: `role=alert` »Gib den Namen der Firma oder Person ein.«, weiter 5 Zeilen. Ohne Körper und mit `[]` als Körper: 422 »Gib Name, Art und Grund des Eintrags an.« |
| 4 Entfernter Eintrag fehlt in der Liste und in der Ausschlussliste des Agenten | **Liste: erfüllt · Ausschlussliste: nicht prüfbar (Vorbehalt, siehe oben)** | Liste: »HORNBACH entfernen« → »»HORNBACH« steht nicht mehr auf der Sperrliste.«, Zeile weg, nach Neuladen weiter weg, Erika Beispiel bleibt. HORNBACH lässt sich danach wieder eintragen (201). Ausschlussliste: unverändert erst mit E2-S2; jetzt in `docs/status.md` vermerkt. |
| 5 Jeder Eintrag zeigt Art, Grund und seit wann er gilt | erfüllt | Spalten »Eintrag · Art · Grund · Seit«; neue Einträge zeigen das Datum, der Startbestand »Startbestand« wie im Clickdummy (`clickdummy.html` Zeile 445). Zur Auslegung siehe Hinweis 5. |

## Stand der Befunde aus Runde 1
| Nr. R1 | Befund | Stand | Beleg |
|---|---|---|---|
| 1 | Nachweis Ausschlussliste nicht vermerkt | behoben | `docs/status.md` Offene Punkte »E10-S1 … Marco nimmt die Verschiebung an?« und Planzeile 19 E2-S2 |
| 2 | doppelte Einträge möglich | behoben mit Lücke | »Haberkorn«, »  hornbach «, »windmöller & hölscher« → 409; »WINDMÖLLER & HÖLSCHER« und »Energie  Steiermark« (zwei Leerzeichen) → 201 (Befund 1) |
| 3 | Datum nur am 18.11. geprüft | behoben | Tests »#2« mit 24.11.2026; am System bestätigt |
| 4 | Texte weichen vom Clickdummy ab | behoben | »Eintrag hinzufügen«, »Von Marco gesperrt«, »Startbestand« an der Oberfläche gesehen |
| 5 | schreibende Dienste ohne `transaktion()` | behoben | `pflege-sperrliste.ts` nutzt `transaktion()`; der 409-Fall im Test lässt die Zahl der Einträge bei 5 (Rücknahme greift) |
| 6 (Hinweis) | englische Meldung ohne Körper | teilweise | jetzt deutsch; weiter 422 statt 400 aus Architektur §5 (Hinweis 3) |
| 7 (Hinweis) | Meldung bleibt nach »Zurücksetzen« stehen | offen | nicht bearbeitet, nicht in den offenen Punkten (Hinweis 6) |
| 8 (Hinweis) | Neuladen schwach geprüft | behoben | Oberflächentest prüft HORNBACH weg, Erika Beispiel da |
| 9 (Hinweis) | `firma_name` bei Personen nicht erfassbar | offen | für E2-S2 zu bedenken, nicht vermerkt (Hinweis 6) |
| 10 (Hinweis) | »Konzept 1.3«, »Nächster Schritt« gemischt | teilweise | Zeile 18 jetzt »kommt mit Konzept 1.3«; »Nächster Schritt« unverändert (Hinweis 6) |

Weitere Prüfungen am System:
- Doppeleintrag in der Oberfläche: »haberkorn« → `role=alert` mit der 409-Meldung, weiter 5 Zeilen, Name bleibt im Feld stehen.
- Konsole: nur 404 für `/favicon.ico` und die erwarteten 422 (leerer Name) und 409 (Doppeleintrag); kein Seitenfehler.
- Stichprobe früherer Hauptablauf (API): `plus_werktage: 1` → 19.11.2026, Agent meldet sich → Lauf mit 4 Vorschlägen, Freigabe Vorschlag 1 → Ansprechpartner 8 (wie in Runde 1). Dazu lief die gesamte Oberflächen-Suite der früheren Stories grün.
- Die Duplikatsprüfung sitzt nur im Dienst `fuegeSperreHinzu`; `legeSperreAn` hat außer diesem Dienst noch keinen Aufrufer, die Nachbesserung kann also keine andere Funktion brechen.
- Zugangsdaten: keine im Diff. Server danach per PID beendet, Ports 5600 und 7674 frei, `npm run reset` ausgeführt, Arbeitskopie ohne Änderungen außer diesem Bericht.

## Befunde
| Nr. | Stelle | Befund | Schwere | So nachvollziehen |
|---|---|---|---|---|
| 1 | `src/server/daten/sperrliste.ts`, `findeSperre` | Der Abgleich »ohne Groß- und Kleinschreibung« nutzt `lower()` von SQLite, das nur ASCII-Buchstaben umwandelt. Ein großgeschriebener Name mit Umlaut wird nicht als Doppeleintrag erkannt (»WINDMÖLLER & HÖLSCHER« neben »Windmöller & Hölscher« → 201). Doppelte Leerzeichen im Namen werden ebenfalls nicht angeglichen. Damit bleibt bei Namen mit Umlauten – im DACH-Raum häufig – die Lage aus Befund 2 der Runde 1 bestehen: Entfernt Marco einen Eintrag, bleibt die Firma über den anderen gesperrt. Ein Abgleich in TypeScript (`toLocaleLowerCase('de')`, Leerraum zusammenfassen) würde es lösen. | Sollte | `POST /api/v1/sperrliste {"art":"firma","name":"WINDMÖLLER & HÖLSCHER"}` → 201, `GET` zeigt beide Einträge. |
| 2 | `src/server/dienste/pflege-sperrliste.ts`, Meldung `schon_gesperrt` | Die Meldung sagt »Pass den bestehenden Eintrag an, statt einen zweiten anzulegen.« S8 bietet aber kein Bearbeiten, nur »Entfernen«. Der Handlungshinweis führt ins Leere; treffender wäre etwa »… steht schon auf der Sperrliste.« oder »Entferne den bestehenden Eintrag, wenn du ihn neu anlegen willst.« | Sollte | In S8 »haberkorn« eintragen → Meldung lesen, eine Bearbeitungsmöglichkeit suchen. |
| 3 | `docs/architektur.md` §5, Zeile »Sperrliste« | Die Zeile nennt als Fehler nur 422; neu ist 409 `schon_gesperrt`. Schemafehler (kein Körper, Array) antworten weiter mit 422, die allgemeine Tabelle in §5 sieht dafür 400 vor. | Hinweis | §5 Zeile 220 neben `curl -X POST …/sperrliste` ohne Körper lesen. |
| 4 | `src/web/screens/S8Einstellungen.tsx` | Die Entfernen-Meldung wurde von »ist nicht mehr gesperrt« auf »steht nicht mehr auf der Sperrliste« geändert, ohne dass die Nachbesserung es nennt. Sie ist so sachlich richtiger. Die Rückmeldungen im Clickdummy lauten »Sperreintrag hinzugefügt.«, »Sperreintrag entfernt.« und »Bitte einen Namen eintragen.« – diese Abweichung bestand schon in Runde 1 und wurde dort nicht gemeldet; die neuen Texte sind ausführlicher und in der Du-Form. Nur zur Kenntnis. | Hinweis | `clickdummy.html` Zeilen 318 und 319 neben S8 lesen. |
| 5 | S8, Spalte »Seit« | Beim Startbestand steht jetzt »Startbestand« statt eines Datums, wie im Clickdummy. Kriterium 5 (»seit wann er gilt«) ist so erfüllt, wenn man »Startbestand« als »seit Beginn« liest; das Datum bleibt in der Schnittstelle. Die in Runde 1 offene Entscheidung (Befund 4) hat der Entwickler zugunsten des Clickdummys getroffen – Marco kann es beim Durchklicken bestätigen. | Hinweis | `/einstellungen` öffnen. |
| 6 | `docs/status.md` | Die Hinweise 7 (Meldung bleibt nach »Zurücksetzen«), 9 (`firma_name` bei Personen, wichtig für E2-S2) und der Rest von 10 (Absatz »Nächster Schritt« mischt den alten Stand »Danach #11, #12, #13 zusammenführen« mit dem neuen) sind weder bearbeitet noch unter »Offene Punkte« vermerkt. Hinweise müssen nicht behoben werden; Hinweis 9 sollte aber bei E2-S2 nicht verloren gehen. | Hinweis | `docs/status.md` Zeilen 50 bis 77 lesen. |
| 7 | `fuegeSperreHinzu` gegen spätere Auslöser | Die neue Duplikatsprüfung gilt nur für Einträge von Hand. Wenn E3-S4, E4-S4 und E6-S1 `legeSperreAn` direkt aufrufen, können dort weiterhin doppelte Einträge entstehen (z. B. eine Firma aus dem Startbestand wird verworfen). Ob das gewollt ist, sollte mit E3-S4 entschieden werden. | Hinweis | Code lesen. |

## Nicht geprüft
- Kriterium 4, zweite Hälfte: Die Ausschlussliste des Agenten gibt es erst mit E2-S2 (Vorbehalt, siehe Urteil).
- Ob der Kopf von PR #14 auf 2c55f24 steht: Geprüft wurde der Commit 2c55f24 in der Arbeitskopie, nicht der Stand auf GitHub.
- Gemäß Nachprüfungsregel kein vollständiger neuer Durchgang durch die Story; geprüft wurden die gemeldeten Befunde, alle Tests und ob die Nachbesserung etwas bricht.
