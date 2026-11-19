# Lernnotizen

Gilt für die ganze Kette (Konzept → Clickdummy → Stories → Architektur → Umsetzung → Prüfung). Liegt im Repository, damit sie Sitzungen überdauert.

## Stufe 4 – Architektur
| Datum | Projekt | Beobachtung | Regel für künftige Läufe |
|---|---|---|---|
| 19.11.2026 | CX Lead Cockpit | Native Datenbanktreiber (better-sqlite3) werden bei jeder Installation kompiliert und brauchen Build-Werkzeuge. Aufgefallen erst in der Prüfung des Grundgerüsts | Bei lokalen Prototypen Bibliotheken ohne Kompilierung wählen (z. B. `node:sqlite`) und die Einrichtung im frischen Klon zum Kriterium der Grundgerüst-Story machen |
| 19.11.2026 | CX Lead Cockpit | Bausteingrenzen standen nur als Text in der Architektur; dreimal hintereinander verletzt | Bausteingrenzen in der Architektur zugleich als Lint-Regel festlegen, die das Grundgerüst einrichtet |

## Stufe 5 – Umsetzung
| Datum | Projekt | Beobachtung | Regel für künftige Läufe |
|---|---|---|---|
| 19.11.2026 | CX Lead Cockpit | Der Entwicklungsserver (Vite) lieferte Projektdateien samt Datenbank ohne Anmeldung aus | Im Grundgerüst `server.fs.deny` für Daten- und Zugangsdateien setzen und mit einem Test absichern |

## Steuerung
| Datum | Projekt | Beobachtung | Regel für künftige Läufe |
|---|---|---|---|
| 19.11.2026 | CX Lead Cockpit | »Sollte«-Befunde sammeln sich über Stories hinweg und werden einzeln nicht behoben | Nach etwa fünf Stories einen Pflege-Schritt einplanen, der wiederkehrende »Sollte«-Befunde bündelt, mit eigener schmaler Prüfung |
