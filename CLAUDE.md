# CX Lead Cockpit – Regeln für Claude

Dieses Repository enthält das **CX Lead Cockpit**, ein „CRM Light“ für den Nagarro-CX-Bereich DACH:
Ein Agent recherchiert B2B-Leads, das Cockpit führt Firmen und Ansprechpartner, protokolliert die
Ansprache (LinkedIn und E-Mail) und übergibt Kontakte bei Antwort per Knopfdruck an die SAP Sales Cloud V2.

## Verbindliche Grundlagen

Vor jeder Arbeit lesen, in dieser Reihenfolge:

1. `docs/konzept.md` – freigegebenes Konzept v1.2 (18.11.2026)
2. `docs/clickdummy/` – freigegebener Clickdummy (Look and Feel, Abläufe); wo er vom Konzept 1.2 abweicht, gilt das Konzept
3. `docs/stories.md` – freigegebene Epics und User Stories mit Akzeptanzkriterien
4. `docs/architektur.md` – technische Architektur v1.1 (freigegeben 19.11.2026)
5. `docs/status.md` – Stand der Umsetzung je Story

Wenn etwas im Code den Dokumenten widerspricht, gelten die Dokumente. Wenn die Dokumente
unklar oder widersprüchlich sind: nachfragen, nicht raten.

## Erster Wurf: Prototyp

- Nur ein Nutzer (Marco), nur Desktop-Ansicht.
- **Alle Anbindungen sind simuliert:** SAP Sales Cloud V2, der Lead-Recherche-Agent, LinkedIn / Sales Navigator,
  HubSpot. Simulationen liegen hinter klaren Schnittstellen (Adapter), damit echte Anbindungen später
  ohne Umbau der Oberfläche eingesetzt werden können.
- Versand ist halbautomatisch: Marco sendet selbst, das Cockpit protokolliert.

## Technik

- TypeScript durchgehend
- Frontend: React
- Backend: Node.js-Server mit REST-API
- Datenbank: SQLite
- Automatische Tests für Logik und Oberfläche jeder Story
- Details, Bausteine und Datenmodell: `docs/architektur.md`

## Fachliche Leitplanken (aus dem Konzept)

- Kontakte ohne Antwort werden **geschlossen, nie gelöscht**; geschlossene Kontakte sind 6 Monate für den Agenten gesperrt,
  danach Wiederansprache nur mit neuem Anlass.
- Agent liefert die LinkedIn-Fassung; die E-Mail-Fassung entsteht nur auf Knopfdruck aus einer Vorlage (keine KI im Cockpit).
- Agent-Lauf vorerst fest um 6:30 Uhr; Konfiguration (Zeit, Häufigkeit, Anzahl, Branche), Pausieren und Urlaubssperre im Cockpit.
- Auto-Pause des Agenten bei mehr als 20 ungeprüften Vorschlägen.
- Zweiter Ansprechpartner je Firma erlaubt, aber markiert.
- Vor dem Anlegen in SAP immer zuerst nach einem bestehenden Account suchen.
- Oberfläche in Nagarro-Farben und in der Du-Form.

## Arbeitsweise

- **Eine Story pro Branch**, Branch-Name `story/<ID>-<kurzname>` (z. B. `story/E1-S1-firmenliste`).
- Pro Story: Code **und** Tests, dann Pull Request gegen `main`. Nie direkt auf `main` committen.
- Im PR-Text: umgesetzte Story-ID, jedes Akzeptanzkriterium mit Nachweis (Test oder Prüfschritt), offene Punkte.
- Vor dem Merge prüft eine unabhängige Prüfung (Skill „Story prüfen“) die Story am laufenden System.
- Höchstens zwei Korrekturschleifen pro Story; danach Rückfrage an Marco.
- Keine Funktionen bauen, die in keiner Story stehen.

## Sicherheit

- **Keine echten Zugangsdaten, Tokens oder Kundendaten im Repository.** Konfiguration über `.env` (steht in `.gitignore`),
  Beispielwerte in `.env.example`.
- Beispieldaten sind erfunden und als solche erkennbar.
