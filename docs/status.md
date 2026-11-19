# CX Lead Cockpit – Status

Arbeitsweise: Begleitet · Repository: https://github.com/MarcoMess/cx-lead-cockpi

| Stufe | Ergebnis | Version | Stand | Korrekturrunden | Freigegeben am |
|---|---|---|---|---|---|
| 1 Konzept | docs/konzept.md | 1.2 | Freigegeben | – | 18.11.2026 |
| 2 Clickdummy | docs/clickdummy/clickdummy.html | – | Freigegeben (zeigt Konzept 1.0/1.1) | – | 18.11.2026 |
| 3 Stories | docs/stories.md | 46 Stories | Freigegeben | – | 18.11.2026, Wegbereiter 19.11.2026 |
| 4 Architektur | docs/architektur.md | 1.1 | Freigegeben | – | 19.11.2026 |
| 5/6 Umsetzung und Prüfung | Code, docs/umsetzung, docs/pruefberichte | – | In Arbeit | je Story | – |

## Umsetzung je Story

Stand-Werte: Offen · In Arbeit · In Prüfung · Korrektur · Bestanden · Zusammengeführt · Wartet auf Entscheidung

Block 1 (Kernweg, danach Halt zum Durchklicken):

| Nr. | Story | Branch | PR | Stand | Korrekturrunden |
|---|---|---|---|---|---|
| 1 | E1-S0 Grundgerüst | story/E1-S0-grundgeruest | #1 | Zusammengeführt (Prüfung 1 bestanden) | 0 von 2 |
| 2 | E1-S1 Zugang | story/E1-S1-zugang | #2 | In Prüfung | 0 von 2 |
| 3 | E1-S2 Vorführdatum, Zurücksetzen | story/E1-S2-vorfuehrdatum | #3 | In Prüfung | 0 von 2 |
| 4 | E2-S3 Lauf anlegen | story/E2-S3-lauf-anlegen | – | Offen | 0 von 2 |
| 5 | E1-S3 Agenten-Simulator | story/E1-S3-agenten-simulator | – | Offen | 0 von 2 |
| 6 | E3-S1 Eingangskorb | story/E3-S1-eingangskorb | – | Offen | 0 von 2 |
| 7 | E3-S3 Freigeben | story/E3-S3-freigeben | – | Offen | 0 von 2 |
| 8 | E4-S2 Kontaktliste | story/E4-S2-kontaktliste | – | Offen | 0 von 2 |
| 9 | E4-S3 Kontaktakte | story/E4-S3-kontaktakte | – | Offen | 0 von 2 |
| 10 | E5-S1 Ansprache-Ansicht | story/E5-S1-ansprache | – | Offen | 0 von 2 |
| 11 | E5-S2 Kopieren, Profil | story/E5-S2-kopieren-profil | – | Offen | 0 von 2 |
| 12 | E5-S3 Versand protokollieren | story/E5-S3-versand | – | Offen | 0 von 2 |

Danach die übrigen 34 Stories in der Reihenfolge aus `stories.md`.

## Nächster Schritt
E2-S3 Lauf anlegen umsetzen; Prüfungen von E1-S1 und E1-S2 abwarten.

## Verlauf
| Datum | Was passiert ist |
|---|---|
| 18.11.2026 | Konzept 1.0, Clickdummy und Stories freigegeben; Konzept 1.1 und 1.2 mit den Ergebnissen aus Clickdummy und Stories |
| 19.11.2026 | E1-S0 bestanden und zusammengeführt (5 Sollte, 5 Hinweise); Datenhaltung wegen Befund 5 auf node:sqlite umgestellt (Architektur 1.2) |
| 19.11.2026 | Architektur 1.1 freigegeben (TypeScript schlank, Prototyp simuliert, Node.js 22); Wegbereiter E1-S0, E1-S2, E1-S3 aufgenommen; unabhängige Prüfung je Story durch einen separaten Agenten vereinbart; Halt nach dem Kernweg vereinbart |
