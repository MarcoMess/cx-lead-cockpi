# CX Lead Cockpit – Status

Arbeitsweise: Begleitet · Repository: https://github.com/MarcoMess/cx-lead-cockpi

| Stufe | Ergebnis | Version | Stand | Korrekturrunden | Freigegeben am |
|---|---|---|---|---|---|
| 1 Konzept | docs/konzept.md | 1.2 | Freigegeben | – | 18.11.2026 |
| 2 Clickdummy | docs/clickdummy/clickdummy.html | – | Freigegeben (zeigt Konzept 1.0/1.1) | – | 18.11.2026 |
| 3 Stories | docs/stories.md | 46 Stories | Freigegeben | – | 18.11.2026, Wegbereiter 19.11.2026 |
| 4 Architektur | docs/architektur.md | 1.3 | Freigegeben | – | 19.11.2026 |
| 5/6 Umsetzung und Prüfung | Code, docs/umsetzung, docs/pruefberichte | – | In Arbeit | je Story | – |

## Umsetzung je Story

Stand-Werte: Offen · In Arbeit · In Prüfung · Korrektur · Bestanden · Zusammengeführt · Wartet auf Entscheidung

Block 1 (Kernweg, danach Halt zum Durchklicken):

| Nr. | Story | Branch | PR | Stand | Korrekturrunden |
|---|---|---|---|---|---|
| 1 | E1-S0 Grundgerüst | story/E1-S0-grundgeruest | #1 | Zusammengeführt (Prüfung 1 bestanden) | 0 von 2 |
| 2 | E1-S1 Zugang | story/E1-S1-zugang | #2 | Zusammengeführt (Prüfung 1 bestanden) | 0 von 2 |
| 3 | E1-S2 Vorführdatum, Zurücksetzen | story/E1-S2-vorfuehrdatum | #3 | Zusammengeführt (Prüfung 1 bestanden) | 0 von 2 |
| 4 | E2-S3 Lauf anlegen | story/E2-S3-lauf-anlegen | #4 | Zusammengeführt (Prüfung 1 bestanden) | 0 von 2 |
| 5 | E1-S3 Agenten-Simulator | story/E1-S3-agenten-simulator | #5 | Zusammengeführt (Prüfung 1 bestanden) | 0 von 2 |
| 5a | Pflege 1 Bausteingrenzen | pflege/bausteingrenzen | #6 | Zusammengeführt (Runde 3 bestanden) | 2 von 2 |
| 6 | E3-S1 Eingangskorb | story/E3-S1-eingangskorb | #7 | Zusammengeführt (Runde 2 bestanden) | 1 von 2 |
| 7 | E3-S3 Freigeben | story/E3-S3-freigeben | #8 | Zusammengeführt (Runde 1 bestanden; Nachtrag in der Prüfung von E4-S2 mitgeprüft) | 0 von 2 |
| 8 | E4-S2 Kontaktliste | story/E4-S2-kontaktliste | #9 | Zusammengeführt (Runde 1 bestanden) | 0 von 2 |
| 9 | E4-S3 Kontaktakte | story/E4-S3-kontaktakte | #10 | Zusammengeführt (Runde 1 bestanden) | 0 von 2 |
| 10 | E5-S1 Ansprache-Ansicht | story/E5-S1-ansprache | #11 | Zusammengeführt (Marco nimmt Kriterium 5 und neuen Wortlaut von 7 an) | 0 von 2 |
| 11 | E5-S2 Kopieren, Profil | story/E5-S2-kopieren-profil | #12 | Zusammengeführt (Runde 1 bestanden) | 0 von 2 |
| 12 | E5-S3 Versand protokollieren | story/E5-S3-versand | #13 | Zusammengeführt (Runde 1 bestanden) | 0 von 2 |

### Weg zu echten Daten (Marco, 19.11.2026)
Marco will zuerst den echten Agenten statt des Simulators. Gewählt: Die geplante Claude-Aufgabe recherchiert in der Cloud und liefert die Ergebnisdatei, Marco lädt sie im Cockpit hoch. Vorher kommt ein erster echter Lauf aus dieser Sitzung.

| # | Story | Branch | PR | Stand | Korrekturschleifen |
|---|---|---|---|---|---|
| 13 | E10-S1 Sperrliste | story/E10-S1-sperrliste | #14 | In Prüfung (Runde 2) | 1 von 2 |
| 14 | E2-S4 Dubletten und Wiederansprache | story/E2-S4-dubletten | #15 | In Prüfung (Runde 2) | 1 von 2 |
| 15 | E3-S2 Angaben prüfen, Pflichtangaben | story/E3-S2-pflichtangaben | #16 | Bestanden (Runde 1), Sollte-Befunde behoben; wartet auf #14 und #15 | 0 von 2 |
| 16 | E3-S4 Verwerfen | story/E3-S4-verwerfen | #17 | In Prüfung | 0 von 2 |
| 17 | E2-S5 Ergebnisdatei hochladen | story/E2-S5-upload | – | Offen | 0 von 2 |
| 18 | Echtbetrieb neben dem Vorführbestand (neu, kommt mit Konzept 1.3) | – | – | Offen | – |
| 19 | E2-S2 Ausschlussliste (auch Nachweis E10-S1 #4) | – | – | Offen | 0 von 2 |

Danach die übrigen Stories in der Reihenfolge aus `stories.md`.

## Nächster Schritt
Marco hat durchgeklickt und den Kernweg angenommen (19.11.2026). Weiter mit dem Weg zu echten Daten. Bisher: **Halt zum Durchklicken** (vereinbart). Marco klickt den Kernweg auf `story/E5-S3-versand` durch (Anleitung: docs/durchklicken.md) und entscheidet über E5-S1 (Kriterien 5 und 7). Danach #11, #12, #13 zusammenführen und mit den übrigen 34 Stories weitermachen, zuerst eine Pflege mit den gesammelten Punkten.

## Offene Punkte aus den Prüfungen
Sollte-Befunde und Hinweise, die nicht sofort behoben wurden. Sie werden mit der Story erledigt, die den Bereich ohnehin anfasst, spätestens in einer Pflege vor dem Halt.

| Herkunft | Punkt | Wohin |
|---|---|---|
| E1-S0 | Der Vite-Proxy liest `PORT` nicht aus `.env` | Pflege vor dem Halt |
| E1-S0 | Untertitel der Screens fehlen noch teilweise | mit dem jeweiligen Screen |
| Pflege 1 R1 | `transaktion()` mit asynchroner Funktion; Vorführleiste ohne Fehlermeldung (E1-S2 #4) | Pflege vor dem Halt |
| Pflege 1 R2 | Absichtliche Umgehung der Grenzen über `../`-Pfade oder `createRequire`; Statuswerte in `startdaten.ts` nicht gegen `werte.ts` geprüft | Pflege vor dem Halt |
| E3-S1 R2 | `/eingangskorb/1e0` zeigt Lauf 1 (harmlos) | erledigt mit E4-S2 (nur ganze Zahlen) |
| E3-S3 | Dublettenkennzeichnung, Abgleich über Domain, Sperre der Freigabe | E2-S4 |
| E3-S3 | Frist von 6 Monaten und neuer Anlass bei Wiederansprache | E10-S1 ff. |
| E4-S2 | Filter nach Merkmal und Tagen | E9 |
| E4-S3 | »An SAP übergeben« wird in der Akte als Endzustand gezeigt; Tests zu #5/#7 und zu `erlaubteAktionen` unvollständig; Schiene und Filter heißen beide »Status«; `regeln/verlauf.ts` fehlt in Architektur §7/§9 | erledigt mit E5-S2 |
| E4-S2 | Kontaktliste ohne Schutz gegen späte Antworten beim Filterwechsel; Tests zu #1 prüfen Funktion und Firma nur auf »nicht leer« | erledigt mit E5-S1 |
| E10-S1 | Kriterium 4, Teil »fehlt in der Ausschlussliste des Agenten«: die Ausschlussliste baut E2-S2; Nachweis mit einem Test »E10-S1 #4« dort | Marco nimmt die Verschiebung an? |
| E5-S1 | Kriterium 7 nennt Bernasconi, der auf »Nachgefasst« steht und keine Ansprache hat; Vorschlag: »ein freigegebener Kontakt ohne Anlass (Reto Ammann aus dem Lauf vom 19.11.2026)« | Frage an Marco |
| E5-S1 | Kriterium 5 (Fassung »von Marco geändert«) setzt das Protokollieren voraus, das erst E5-S3 baut; E5-S3 enthält die Servertests »E5-S1 #5« für beide Fälle | Marco nimmt die Verschiebung an? |
| E5-S1 | Änderungen an Betreff und Text gehen verloren, wenn Marco die Ansprache ohne Markieren verlässt (A3 Schritt 2 »speichert die Fassung«) | Frage an Marco |
| E5-S3 | Kein Regeltest für `fristWiedervorlage`; Servertest zu E5-S1 #5 ohne Fall »nur Betreff geändert«; »Als gesendet markieren« während der Anfrage nicht gesperrt; Meldungen bleiben stehen (Rückmeldung nach Neuladen, »Nachricht ist leer«, Vorführleiste); Oberflächentest heißt noch »#7 Bernasconi« | Pflege vor dem Weiterbau |
| E5-S2 | Kopier-Bestätigung bleibt nach weiterem Bearbeiten stehen; Test kopiert den Betreff nur unverändert; leeres Feld wird »kopiert« bestätigt | Pflege vor dem Halt |
| E4-S2 | Meldung `filter_ungueltig` ohne Handlungshinweis; »Dr.« fehlt in der Meldung `person_bekannt` | Pflege vor dem Halt |
| Konzept | 21-Tage-Schließvorschlag für Reinhardts Altdaten | Entscheidung mit E6-S5 |
| Konzept | Rechtliches (UWG E-Mail, InMail) und Datenschutz | Frage an Marco vor dem Echtbetrieb |

## Verlauf
| Datum | Was passiert ist |
|---|---|
| 18.11.2026 | Konzept 1.0, Clickdummy und Stories freigegeben; Konzept 1.1 und 1.2 mit den Ergebnissen aus Clickdummy und Stories |
| 19.11.2026 | Kernweg gebaut und geprüft: E4-S3, E5-S2, E5-S3 bestanden, E5-S1 wartet auf Marcos Entscheidung; Pflege 1 nach zwei Korrekturschleifen in Runde 3 bestanden; #6 bis #10 zusammengeführt. Halt zum Durchklicken |
| 19.11.2026 | Pflege 1 und E3-S1 in Runde 1 nicht bestanden (Bausteingrenzen unvollständig, Abdeckungsgrenzen nicht in der Liste), nachgebessert; E3-S1 Runde 2 bestanden; E3-S3 bestanden, zwei Sollte-Befunde gleich behoben; E4-S2 gebaut |
| 19.11.2026 | E1-S1, E1-S2, E2-S3 bestanden und zusammengeführt; wiederkehrender Befund »Bausteingrenzen« → Pflege 1 mit Lint-Regel, Architektur 1.3, Lernnotizen angelegt |
| 19.11.2026 | E1-S0 bestanden und zusammengeführt (5 Sollte, 5 Hinweise); Datenhaltung wegen Befund 5 auf node:sqlite umgestellt (Architektur 1.2) |
| 19.11.2026 | Architektur 1.1 freigegeben (TypeScript schlank, Prototyp simuliert, Node.js 22); Wegbereiter E1-S0, E1-S2, E1-S3 aufgenommen; unabhängige Prüfung je Story durch einen separaten Agenten vereinbart; Halt nach dem Kernweg vereinbart |
