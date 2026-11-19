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
| 10 | E5-S1 Ansprache-Ansicht | story/E5-S1-ansprache | #11 | In Prüfung | 0 von 2 |
| 11 | E5-S2 Kopieren, Profil | story/E5-S2-kopieren-profil | #12 | In Prüfung | 0 von 2 |
| 12 | E5-S3 Versand protokollieren | story/E5-S3-versand | – | Offen | 0 von 2 |

Danach die übrigen 34 Stories in der Reihenfolge aus `stories.md`.

## Nächster Schritt
E5-S3 Versand protokollieren umsetzen; Prüfungen von E5-S1 und E5-S2 abwarten.

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
| E5-S1 | Kriterium 7 nennt Bernasconi, der auf »Nachgefasst« steht und keine Ansprache hat | Frage an Marco |
| E4-S2 | Meldung `filter_ungueltig` ohne Handlungshinweis; »Dr.« fehlt in der Meldung `person_bekannt` | Pflege vor dem Halt |
| Konzept | 21-Tage-Schließvorschlag für Reinhardts Altdaten | Entscheidung mit E6-S5 |
| Konzept | Rechtliches (UWG E-Mail, InMail) und Datenschutz | Frage an Marco vor dem Echtbetrieb |

## Verlauf
| Datum | Was passiert ist |
|---|---|
| 18.11.2026 | Konzept 1.0, Clickdummy und Stories freigegeben; Konzept 1.1 und 1.2 mit den Ergebnissen aus Clickdummy und Stories |
| 19.11.2026 | Pflege 1 und E3-S1 in Runde 1 nicht bestanden (Bausteingrenzen unvollständig, Abdeckungsgrenzen nicht in der Liste), nachgebessert; E3-S1 Runde 2 bestanden; E3-S3 bestanden, zwei Sollte-Befunde gleich behoben; E4-S2 gebaut |
| 19.11.2026 | E1-S1, E1-S2, E2-S3 bestanden und zusammengeführt; wiederkehrender Befund »Bausteingrenzen« → Pflege 1 mit Lint-Regel, Architektur 1.3, Lernnotizen angelegt |
| 19.11.2026 | E1-S0 bestanden und zusammengeführt (5 Sollte, 5 Hinweise); Datenhaltung wegen Befund 5 auf node:sqlite umgestellt (Architektur 1.2) |
| 19.11.2026 | Architektur 1.1 freigegeben (TypeScript schlank, Prototyp simuliert, Node.js 22); Wegbereiter E1-S0, E1-S2, E1-S3 aufgenommen; unabhängige Prüfung je Story durch einen separaten Agenten vereinbart; Halt nach dem Kernweg vereinbart |
