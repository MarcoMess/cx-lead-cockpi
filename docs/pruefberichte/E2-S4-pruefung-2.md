# E2-S4 – Dubletten und Wiederansprache erkennen: Prüfung 2

Branch: story/E2-S4-dubletten (PR #15, Stand ac0a0d4, geprüfter Diff 274a481..ac0a0d4) · Datum: 19.11.2026 · **Urteil: Bestanden**

Nachprüfung nach Nachbesserung 1. Der Schwerpunkt liegt auf dem blockierenden Befund 1 aus Runde 1. Außerdem geprüft: ob die Sollte-Befunde behoben sind und ob die Korrektur, vor allem die geänderte Normalisierung, etwas Neues kaputt macht.

## Tests
Ausgeführt: 175 · Bestanden: 175 · Befehle: `npm run typecheck` (0 Fehler), `npm run lint` (0 Fehler), `npx vitest run` (23 Dateien, 139 von 139), `PLAYWRIGHT_CHANNEL=chrome TEST_API_PORT=6300 TEST_WEB_PORT=8374 npx playwright test` (36 von 36)

Beurteilung der geänderten Tests:
- Neu in `tests/api/E2-S4.test.ts`: »Befund 1« mit zwei offenen Läufen (Kortmann ohne URL) und mit zweimal Voss im selben Lauf (`www.` und Schrägstrich). Jeder Test prüft die Kennzeichnung nach der ersten Freigabe, 422 `dublette` bei der zweiten und dass es genau einen Kontakt gibt. Ohne die Korrektur würden beide fehlschlagen (Runde 1: zwei Kontakte). Dazu ein Test für die Domain und für den gleichen alten Anlass.
- `tests/regeln/dubletten-bestand.test.ts`: Grenzfälle der Firmennamen und LinkedIn-Adressen, Domain, Grenztag der Frist, »Antwort erhalten« ohne Hinweis.
- Bestehende Tests: `E2-S4 #1` und `E3-S3` erwarten jetzt 422 statt 409. Das folgt aus architektur.md §5 und ist keine Lockerung. In `E3-S3` ersetzt die Erwartung `dublette` die Erwartung `person_bekannt`; der Test prüft weiter, dass kein Kontakt dazukommt und der Vorschlag offen bleibt. Gelöschte oder übersprungene Tests gibt es nicht.

## Blockierender Befund 1 aus Runde 1: behoben

Am laufenden System (API auf Port 6200) jeweils nach `sim/zuruecksetzen` geprüft:

| Fall | Ergebnis |
|---|---|
| Zwei offene Läufe (19.11. und 20.11.), Kortmann ohne LinkedIn-URL | Vor der Freigabe sind beide Karten ohne Kennzeichen. Nach der Freigabe der ersten Karte (200) zeigt die zweite `ist_dublette: true` mit Bezug »8 Sabine Kortmann, freigegeben«. Ihre Freigabe → 422 `dublette`. Danach gibt es 1 Kontakt Kortmann und 1 neue Firma |
| Selber Lauf, zweimal Ammann (ohne URL, ohne Anlass) | erste Freigabe 200, zweite 422 `dublette`, 1 Kontakt |
| Selber Lauf, fünfmal Voss: `linkedin.com/in/…`, `https://www.…/`, `https://de.…`, `https://m.…/Miriam-Voss-Beispiel?trk=x`, `…/de/` | nach der ersten Freigabe alle vier anderen Karten Dublette, jede Freigabe 422, 1 Kontakt |
| Zwei Läufe, erst mit URL, dann ohne URL | zweite Karte Dublette (über den Namen bei derselben Firma), 422, 1 Kontakt |
| Zwei Läufe ohne URL, Firma einmal als »kranbau oberhavel G.m.b.H.« | zweite Karte der Firma Kranbau Oberhavel GmbH zugeordnet, Dublette, 422 |
| Zwei Läufe ohne URL, Name als »SABINE kortmann« | Dublette, 422 |
| Zwei Läufe, anderer Name und andere Firma, aber `https://de.linkedin.com/in/sabine-kortmann-beispiel/`; die *spätere* Karte zuerst freigegeben | die frühere Karte wird zur Dublette (Bezug »Sabina Kortmann-Lenz«), 422 |
| Ostermann als Wiederansprache in zwei offenen Läufen | erste Freigabe öffnet Kontakt 5 (200, `wiederansprache: true`), zweite Karte danach Dublette, 422, kein zweiter Kontakt |
| Zwei Karten derselben Person gleichzeitig freigegeben (`Promise.all`) | 200 und 422 `dublette`, 1 Kontakt |

Oberfläche (Chrome, Vite auf Port 8274): Ich habe Lauf 1 über den Knopf »Freigeben« freigegeben. Die Meldung lautet »Sabine Kortmann freigegeben …«. Danach zeigt Lauf 2 bei Kortmann das Etikett »Dublette«, den roten Hinweis »Dublette: Diese Person ist bereits im Cockpit (Sabine Kortmann, Status »Freigegeben«). Der Vorschlag kann nicht freigegeben werden.« und einen gesperrten Knopf »Freigeben«. Bei zweimal Voss im selben Lauf wechselt die zweite Karte direkt nach dem Klick auf die erste, ohne Neuladen, auf »Dublette« mit gesperrtem Knopf. In der Datenbank steht je 1 Kontakt.

## Akzeptanzkriterien
| Kriterium | Ergebnis | Beleg |
|---|---|---|
| 1 Albers erneut vorgeschlagen: »Dublette«, nicht freigebbar | erfüllt | Oberfläche: Etikett »Dublette«, roter Hinweis mit »Dr. Katrin Albers, Status »Gespräch vereinbart««, »Freigeben« gesperrt. API: Freigabe → 422 `dublette`. Ändert sich der Bestand nach dem Anlegen, greift die Prüfung jetzt auch (siehe oben) |
| 2 »nordwerk fördertechnik« → Nordwerk Fördertechnik GmbH | erfüllt | Oberfläche: »Bestehende Firma: Nordwerk Fördertechnik GmbH«. Freigabe → 200 mit `firma_id: 1`, weiter 7 Firmen |
| 3 Anderer Name, dieselbe LinkedIn-URL → Dublette | erfüllt | Oberfläche: »Anna Andersname« mit `https://www.linkedin.com/in/simone-gruber-beispiel/` → »Dublette … (Simone Gruber, Status »Freigegeben«)«, Knopf gesperrt. Auch mit `de.`-Subdomain (Fall oben) |
| 4 Voss bei Hansemarkt: freigebbar, Hinweis auf Reinhardt | erfüllt | Oberfläche: »Zweiter Ansprechpartner, dort läuft eine Ansprache (Tobias Reinhardt, Angeschrieben)«, Knopf aktiv, Freigabe 200 mit `firma_id: 4` |
| 5 Einziger Kontakt »Freigegeben« / »Gespräch vereinbart«: kein Hinweis | erfüllt | Oberfläche: Zweitkontakt bei Alpenstrom Netze AG (Gruber, Freigegeben) und Neukontakt bei Nordwerk (Albers, Gespräch vereinbart): nur »Bestehende Firma: …«, kein Hinweis |
| 6 Ostermann mehr als 6 Monate geschlossen, neuer Anlass: »Wiederansprache« | erfüllt | `geschlossen_am` 01.05.2026, heute 19.11.2026. Oberfläche: Etikett »Wiederansprache«, Hinweis »… am 01.05.2026 ohne Antwort geschlossen, die Sperre von 6 Monaten ist abgelaufen …«, Knopf aktiv. Freigabe → 200, Kontakt 5 »freigegeben«, kein zweiter Kontakt |

## Sollte-Befunde aus Runde 1

| Nr. (R1) | Stand | Beleg |
|---|---|---|
| 2 Rechtsformen | behoben | Regeltest und eigene Probe: `G.m.b.H.`, `GmbH.`, `, GmbH`, `GmbH & Co KG` mit und ohne Punkt, `mbH`, `Gesellschaft mbH`, `S.E.`, NFD-Umlaut → »nordwerk fördertechnik«. Live: »kranbau oberhavel G.m.b.H.« der bestehenden Firma zugeordnet |
| 3 LinkedIn-Varianten | behoben | `de.`, `at.`, `m.`, `/de/`, `/en`, `/fr`, `?trk`, `//` → gleiche Form. Der Schutz bei der Freigabe nutzt jetzt dieselbe normalisierte Prüfung (Fälle oben) |
| 4 Domain | behoben | Live: Firma 1 mit Domain `https://www.nordwerk-beispiel.example/`, Vorschlag »Nordwerk Intralogistik GmbH« mit `nordwerk-beispiel.example` → »Bestehende Firma: Nordwerk Fördertechnik GmbH«. Albers wird darüber auch ohne URL als Dublette erkannt. Eine Subdomain (`karriere.…`) gilt nicht als gleich |
| 5 »Antwort erhalten« | behoben | Live: Vorschlag bei Stadtwerke Lindental (Hollenstein, Antwort erhalten) → Hinweis `null` |
| 6 Fehlercode | behoben | Freigabe einer Dublette → 422 `dublette` (architektur.md §5) |
| 7 Grenztag | behoben | festgelegt und kommentiert (`bewerteBekanntePerson`), Regeltest 18.11. → Dublette, 19.11. → Wiederansprache. Siehe Befund 3 unten |
| 8 Alter Anlass | behoben | API-Test mit gleicher Beschreibung in anderer Schreibweise → Dublette |
| 9 Veraltete Kennzeichen | behoben | (a) Wiederansprache-Karte, danach Ostermann per SQL auf »angeschrieben« → Karte jetzt `ist_dublette: true`, Bezug »angeschrieben«, Freigabe 422. (b) Dublette vom 19.11.2026, Datum 10.05.2027 → Karte jetzt Wiederansprache, Freigabe öffnet Kontakt 5, kein zweiter Kontakt |
| 10 Oberflächentests #2, #3, #6 | **nicht behoben** | siehe Befund 1 unten |
| 11 Wortlaut und Farbe (Hinweis) | behoben | roter Hinweis `note fehler` (Hintergrund rgb(252, 233, 231)), Wortlaut wie im Clickdummy, ergänzt um den Namen |
| 12 Bestehende Firma über Personentreffer (Hinweis) | behoben | »Anna Andersname« bei Kranbau zeigt keine »Bestehende Firma: Alpenstrom …« mehr |
| 13 »6 Monaten« fest im Text (Hinweis) | behoben | `FRISTEN.sperreNachSchliessenMonate` |

## Befunde
| Nr. | Stelle | Befund | Schwere | So nachvollziehen |
|---|---|---|---|---|
| 1 | `tests/oberflaeche/E2-S4.spec.ts`, `docs/umsetzung/E2-S4.md` | Für #2, #3 und #6 gibt es weiter keinen Oberflächentest, für den behobenen Befund 1 (zweite Karte wird nach der Freigabe zur Dublette) auch nicht. Die Übergabe begründet das so: Die Oberflächentests könnten die Startdaten nicht verändern. Das stimmt nicht. Die Tests haben `request` und den bekannten Testschlüssel (`tests/hilfen.ts`, `AGENT`; `playwright.config.ts` `COCKPIT_AGENT_KEY`). Damit können sie über `POST /api/v1/agent/laeufe` eigene Vorschläge anlegen (#2: »nordwerk fördertechnik«, #3: fremder Name mit Grubers URL). Für #6 reicht `POST /api/v1/sim/datum` auf ein Datum mehr als 6 Monate nach dem 09.11.2026, ganz ohne SQL. CLAUDE.md verlangt Tests für Logik **und** Oberfläche jeder Story. Die Kriterien selbst sind an der Oberfläche erfüllt (von mir nachvollzogen), deshalb nicht blockierend | Sollte | Datei lesen; `grep -n AGENT tests/hilfen.ts`; `grep -n COCKPIT_AGENT_KEY playwright.config.ts` |
| 2 | `regeln/dubletten.ts` `normalisiereFirmenname` | Die Regel »ohne Rechtsform« legt verschiedene Gesellschaften mit gleichem Stammnamen zusammen, und mit der erweiterten Liste (zwei Rechtsformen, `mbh`, `gbr`, `bv`, `nv`, `ev`, `sarl`, `kgaa`) noch öfter. Das ist im DACH-Raum realistisch: eine Ländergesellschaft »… GmbH« (AT) und »… AG« (CH) derselben Marke. Live: Vorschlag »Hansemarkt Handels AG« (Land CH) wird »Hansemarkt Handels SE« zugeordnet, bekommt den Hinweis auf Reinhardt, und die Freigabe legt den Kontakt bei Firma 4 an (Land und Umsatz der SE). Ebenso gleich: »Beispiel AG«/»Beispiel SE«/»Beispiel GmbH«. Auch Namen, die nur auf eine Rechtsform zu enden scheinen, verlieren das letzte Wort: »Radio Ag«, »Kanzlei Sa«, »Studio SE« → »radio«, »kanzlei«, »studio«. Das entspricht dem Wortlaut von Konzept §9, und schon in Runde 1 wurden `ag`, `se` und `gmbh` abgeschnitten. Deshalb ist das keine Abweichung, aber eine Entscheidung, die Marco kennen sollte (z. B. Land als zusätzliches Merkmal) | Hinweis | `npx tsx /tmp/e2s4r2/norm.ts`; Lauf mit »Hansemarkt Handels AG« → `bestehende_firma` Hansemarkt Handels SE, Freigabe `firma_id: 4` |
| 3 | `regeln/dubletten.ts` `bewerteBekanntePerson` | Der Grenztag (am Tag genau 6 Monate nach dem Schließen wieder frei) steht jetzt im Code und in der Übergabe. Eine Bestätigung durch Marco ist nicht vermerkt (CLAUDE.md: »nachfragen, nicht raten«). E2-S2 und die Anzeige »gesperrt bis …« müssen denselben Tag verwenden | Hinweis | Kommentar in `bewerteBekanntePerson`; Regeltest »Grenztag« |
| 4 | `regeln/dubletten.ts` | Kleine Lücken in der Normalisierung, keine davon in den Kriterien: »Handels-GmbH« (Bindestrich) behält die Rechtsform. »Foerdertechnik« ≠ »Fördertechnik«. Eine prozentkodierte LinkedIn-Adresse (`/in/j%C3%B6rg-m`) ≠ `/in/jörg-m`. `/in/x/details/experience` wird nicht gekürzt. Unsinnige Eingaben fallen zusammen: `https://www.linkedin.com/in/` → `linkedin.com/in`, Domain `mailto:…` → `mailto` | Hinweis | `npx tsx /tmp/e2s4r2/norm.ts` |
| 5 | Ablauf | Solange keine der Karten freigegeben ist, haben zwei Karten derselben Person (selber Lauf oder zwei offene Läufe) kein Kennzeichen. Erst nach der ersten Freigabe wird die zweite zur Dublette. Der Zweck der Story ist damit erfüllt (es entsteht nur ein Kontakt, und die Oberfläche zeigt die Dublette sofort). Eine Markierung schon beim Anlegen (»steht auch in Lauf …«) wäre nur eine Bequemlichkeit | Hinweis | Fälle oben, Spalte »vorher« |

Stichprobe früherer Stories: E2-S3, zweiter Lauf am selben Tag → 409 `bereits_gelaufen`. E3-S3, Freigabe eines neuen Vorschlags (Kortmann) → 200 mit neuer Firma 8 und Kontakt 8; dieselbe Freigabe noch einmal → 409 `schon_geprueft`. E3-S3 #5 (Wiederansprache öffnet den bestehenden Kontakt) → wie erwartet. Bausteingrenzen: `regeln` bekommt Bestand und »heute« als Parameter, `daten` liest nur, `dienste` enthält kein SQL. Zugangsdaten oder echte Personendaten im Diff: keine.

## Nicht geprüft
- Datei-Upload (E2-S5) und Wieder öffnen (E6-S5) gibt es noch nicht. Für Befund 9a aus Runde 1 habe ich den Status per SQL gesetzt.
- Abgleich gegen Sperrliste, HubSpot und SAP gehört nicht zu dieser Story.
- Hilfsskripte und Bildschirmfotos liegen außerhalb des Repositorys unter `/tmp/e2s4r2/` (`t1.mjs` bis `t4.mjs`, `ui2.mjs`, `norm.ts`, `ui-*.png`). Server per PID beendet, Startdaten mit `npm run reset` zurückgesetzt.
