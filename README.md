# CX Lead Cockpit

CRM Light für den Nagarro-CX-Bereich DACH: Lead-Recherche per Agent, Ansprache-Tracking für LinkedIn und E-Mail,
KPIs und Übergabe an die SAP Sales Cloud V2.

**Status:** Prototyp in Umsetzung, Stand siehe [docs/status.md](docs/status.md). Alle Anbindungen (SAP, Agent, LinkedIn, HubSpot) sind im ersten Wurf simuliert.

## Unterlagen

| Dokument | Stand |
|---|---|
| [Konzept](docs/konzept.md) | v1.2, freigegeben 18.11.2026 |
| [Clickdummy](docs/clickdummy/clickdummy.html) | freigegeben 18.11.2026 |
| [Stories](docs/stories.md) | 46 Stories, freigegeben 18.11.2026, Wegbereiter 19.11.2026 |
| [Architektur](docs/architektur.md) | v1.1, freigegeben 19.11.2026 |
| [Status](docs/status.md) | laufend |

## Technik

TypeScript · React · Node.js · SQLite – Details in der [Architektur](docs/architektur.md).

## Schnellstart

Voraussetzung: Node.js 22.22 oder neuer.

| Zweck | Befehl |
|---|---|
| Einrichten (einmalig) | `npm run einrichten` |
| Starten | `npm run dev` – Oberfläche auf http://localhost:5173 |
| Alle Tests | `npm test` |
| Startdaten zurücksetzen | `npm run reset` |
| **Echtbetrieb** (eigene Datenbank `data/echt.sqlite`, echtes Datum, keine Vorführleiste) | `npm run echt` |

`npm run dev` startet den Vorführbestand mit erfundenen Beispieldaten. `npm run echt` startet das Cockpit mit deinen echten Daten; beim ersten Start entsteht die Datenbank mit Sperrliste und Rechercheprofil, aber ohne Beispieldaten. `npm run reset` fasst den Echtbestand nie an. Echte Kontaktdaten liegen nur auf deinem Rechner und nie im Repository (alles in `data/` außer `.gitkeep` steht in `.gitignore`, dazu alle `.sqlite`-Dateien).

## Entwicklung

Die Entwicklung läuft in Claude-Code-Cloud-Sessions direkt auf diesem Repository.
Regeln für die Umsetzung stehen in [CLAUDE.md](CLAUDE.md): eine Story pro Branch, Pull Request mit Nachweis
je Akzeptanzkriterium, unabhängige Prüfung vor dem Merge.
