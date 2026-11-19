# CX Lead Cockpit – Stories

Abgeleitet aus: konzept.md Version 1.2, clickdummy.html vom 18.11.2026 · Stand: Freigegeben (Marco, 18.11.2026); Wegbereiter E1-S0, E1-S2, E1-S3 aus der Architektur am 19.11.2026 ergänzt und freigegeben

Konzept und Clickdummy sind von Marco freigegeben. Die Stories folgen dem Konzept; wo der Clickdummy abweicht, steht das unter »Fragen an das Konzept«. Beispielwerte stammen aus Abschnitt 8 des Konzepts. Als »heute« gilt, wenn nichts anderes dasteht, der 18.11.2026.

## Überblick

| Epic | Stories | Bezug im Konzept |
|---|---|---|
| E1 – Grundlagen | 4 | Abschnitt 3, 11 · architektur.md |
| E2 – Recherchelauf übernehmen | 6 | A1, F1, F9, Regeln Laufentscheidung und Dublettenprüfung |
| E3 – Vorschläge prüfen und freigeben | 4 | A2, F2, S2 |
| E4 – Firmen und Kontakte führen | 4 | F3, S3, S4 |
| E5 – Ansprechen | 5 | A3, F4, S5, Regeln Kanalwahl |
| E6 – Antwort und Nachfassen | 5 | A4, F5, S6 |
| E7 – Übergabe an SAP Sales Cloud V2 | 4 | A5, F7, S7 |
| E8 – Agent steuern | 6 | A7, F10, S9 |
| E9 – Wirkung prüfen | 3 | A6, F6, S1 |
| E10 – Einstellungen und Schnittstelle | 5 | F8, F9, S8 |

Zusammen 46 Stories.

## Vorgeschlagene Reihenfolge

Zuerst der dünnste Weg durch den Kern: Lauf kommt an, wird freigegeben, Kontakt wird angesprochen, Versand ist protokolliert. Danach Antwort und SAP, dann Verbreiterung.

1. E1-S0 – Grundgerüst mit Startdaten und den vier Befehlen
2. E1-S1 – ohne Zugang lässt sich nichts prüfen
3. E1-S2 – Vorführdatum und Zurücksetzen, damit die festen Daten der Kriterien gelten
4. E2-S3 – ein Recherchelauf kommt im Cockpit an
5. E1-S3 – der simulierte Agent liefert den Beispiel-Lauf, damit der Kernweg vorführbar ist
6. E3-S1 – der Lauf ist im Eingangskorb sichtbar
7. E3-S3 – aus einem Vorschlag werden Firma und Kontakt
8. E4-S2 – der Kontakt steht in der Liste
9. E4-S3 – die Kontaktakte zeigt Status und Verlauf
10. E5-S1 – die Nachricht lässt sich fertigstellen
11. E5-S2 – Kopieren und Profil öffnen für LinkedIn
12. E5-S3 – Versand protokolliert: der Kernweg ist durchgängig
13. E6-S3 – die erzeugte Wiedervorlage wird sichtbar
14. E6-S1 – Antworten verändern den Status
15. E6-S2 – ein Gespräch macht den Kontakt übergabefähig
16. E7-S1 – SAP-Verbindung steht
17. E7-S2 – Vorschau der Übergabe
18. E7-S3 – Übergabe: der zweite durchgängige Weg bis ins Zielsystem
19. E7-S4 – Fehlerfall und Protokoll der Übergabe
20. E10-S1 – Sperrliste als Grundlage für alle Sperrregeln
21. E2-S4 – Dubletten werden beim Anlegen erkannt
22. E3-S2 – Angaben prüfen, Pflichtangaben für die Freigabe
23. E3-S4 – Verwerfen mit Sperrfolge
24. E2-S2 – der Agent bekommt die Ausschlussliste
25. E8-S1 – Rechercheprofil im Cockpit
26. E8-S3 – Sperrzeiten
27. E8-S2 – Pausieren und Aktivieren
28. E2-S1 – Laufauftrag: das Cockpit steuert den Agenten
29. E8-S5 – Obergrenze setzt Läufe aus
30. E8-S4 – Zusatzlauf
31. E8-S6 – Laufprotokoll und nächster Lauf
32. E10-S2 – API-Schlüssel erneuern
33. E2-S6 – der Agent läuft als geplante Claude-Aufgabe gegen das Cockpit
34. E2-S5 – Ausweichweg Datei-Upload
35. E10-S3 – Fristen und Signatur in den Einstellungen
36. E5-S4 – E-Mail-Fassung auf Knopfdruck
37. E5-S5 – E-Mail-Grundlage und Entwurf im Mailprogramm
38. E6-S4 – Nachfassen
39. E6-S5 – Ohne Antwort schließen und wieder öffnen
40. E4-S1 – Firmenliste und Firmendetail
41. E4-S4 – Sperren und Löschen von Hand
42. E9-S1 – Dashboard »Heute«
43. E9-S2 – Kennzahlen
44. E9-S3 – Aufschlüsselung
45. E10-S4 – CSV-Export
46. E10-S5 – Bestand und Kennzahlen per API lesen

## Epic E1 – Grundlagen

Ziel: Nur Marco arbeitet in der Oberfläche, der Agent erreicht ausschließlich die API.

### E1-S0 – Grundgerüst mit Startdaten

**Als** Marco **möchte ich** ein lauffähiges Grundgerüst mit meinen Beispieldaten, **damit** jede weitere Story auf demselben Fundament aufsetzt.

- **Art:** Wegbereiter
- **Bezug:** architektur.md Abschnitte 2, 4, 5 (Fehlerformat), 7, 8 · Konzept Abschnitt 8 (Beispieldaten) · Screens S1–S9
- **Größe:** mittel
- **Abhängig von:** –

**Akzeptanzkriterien**
1. Gegeben ein frischer Checkout, wenn `npm run einrichten` läuft, dann sind die Abhängigkeiten installiert, `.env` ist aus `.env.example` angelegt und die Datenbank ist mit den Startdaten gefüllt.
2. Wenn `npm run dev` läuft, dann antwortet `GET /api/v1/gesundheit` mit `{ "ok": true }` und die Oberfläche ist unter http://localhost:5173 erreichbar.
3. Die Navigation zeigt die neun Bereiche in der Reihenfolge des Clickdummys (Dashboard, Eingangskorb, Firmen, Kontakte, Ansprache, Wiedervorlagen, SAP-Übergabe, Agent-Steuerung, Einstellungen); jeder Screen zeigt im Kopf seine ID S1–S9 und seinen Namen.
4. Nach `npm run reset` enthält die Datenbank 7 Firmen, 7 Ansprechpartner, 7 Kontaktversuche, 3 Antworten, 4 offene Wiedervorlagen, 1 Rechercheprofil »DACH Kernbranchen«, 3 Sperrzeiten, 4 Rechercheläufe und 5 Sperreinträge mit den Werten aus Abschnitt 8 des Konzepts.
5. `npm test` führt Typprüfung, ESLint, Vitest und Playwright aus und ist grün; es gibt je mindestens einen Test für Regeln, Schnittstelle und Oberfläche.
6. Gegeben eine unbekannte Adresse wie `GET /api/v1/gibt-es-nicht`, dann antwortet der Server mit 404 und `{ "fehler": { "code": "nicht_gefunden", … } }`.

**Nicht enthalten:** Anmeldung (E1-S1), Vorführleiste (E1-S2), Fachfunktionen.

### E1-S1 – Zugang für Marco und den Agenten

**Als** Marco **möchte ich**, dass nur ich das Cockpit bedienen kann und der Agent nur über seinen Schlüssel an die API kommt, **damit** niemand sonst meine Kontakte sieht oder verändert.

- **Art:** Wegbereiter
- **Bezug:** Abschnitt 3 (Rollen) · Abschnitt 11 (Anmeldung nach Hausstandard) · Screens S1–S9
- **Größe:** mittel
- **Abhängig von:** –

**Akzeptanzkriterien**
1. Gegeben ein nicht angemeldeter Aufruf des Cockpits, wenn eine beliebige Seite S1–S9 geöffnet wird, dann erscheint die Anmeldung und keine Daten.
2. Gegeben Marco ist angemeldet, wenn er das Cockpit öffnet, dann sieht er das Dashboard S1 und in der Navigation die neun Bereiche Dashboard, Eingangskorb, Firmen, Kontakte, Ansprache, Wiedervorlagen, SAP-Übergabe, Agent-Steuerung, Einstellungen.
3. Gegeben ein API-Aufruf ohne oder mit falschem Schlüssel, wenn der Laufauftrag abgefragt wird, dann lehnt das Cockpit ab und liefert keine Daten.
4. Gegeben ein API-Aufruf mit gültigem Agenten-Schlüssel, wenn er versucht, einen Vorschlag freizugeben, einen Kontaktversuch anzulegen oder etwas zu löschen, dann lehnt das Cockpit ab.
5. Jeder neu angelegte Datensatz (Firma, Ansprechpartner) trägt Marco als Besitzer.

**Nicht enthalten:** mehrere Nutzer und Rollen (Später). Das Anmeldeverfahren legt die Architektur-Stufe fest.

### E1-S2 – Vorführdatum, Zurücksetzen und Vorführleiste

**Als** Marco **möchte ich** im Prototyp das Datum setzen und den Ausgangszustand jederzeit wiederherstellen, **damit** sich die Abläufe mit den festen Daten der Stories vorführen und prüfen lassen.

- **Art:** Wegbereiter
- **Bezug:** architektur.md Abschnitt 6 (Uhr) und 8 (Zurücksetzen) · Clickdummy (Vorführleiste)
- **Größe:** klein
- **Abhängig von:** E1-S1

**Akzeptanzkriterien**
1. Nach `npm run reset` und nach `POST /api/v1/sim/zuruecksetzen` gilt als »heute« der 18.11.2026, und alle Startdaten sind wiederhergestellt, auch wenn vorher Daten geändert wurden.
2. `POST /api/v1/sim/datum` mit `{ "plus_werktage": 1 }` setzt heute von Mittwoch, 18.11.2026, auf Donnerstag, 19.11.2026, und von Freitag, 20.11.2026, auf Montag, 23.11.2026.
3. `POST /api/v1/sim/datum` mit `{ "heute": "2026-11-24" }` setzt das Datum direkt; ein ungültiges Datum wird mit 400 abgelehnt.
4. Über dem Produkt steht eine optisch abgesetzte, gestreifte Vorführleiste wie im Clickdummy mit dem Datum im Dummy, der ID des aktuellen Screens und den Schaltflächen »Zurücksetzen« und »Nächster Werktag«.
5. Ist `COCKPIT_DEMO` nicht auf 1 gesetzt, antworten die Adressen unter `/api/v1/sim` mit 404 und es gibt keine Vorführleiste.
6. Die Adressen unter `/api/v1/sim` verlangen eine Anmeldung wie alle anderen.

**Nicht enthalten:** Agenten-Simulator (E1-S3), SAP-Simulator (E7-S1, E7-S4).

### E1-S3 – Agenten-Simulator liefert den Beispiel-Lauf

**Als** Marco **möchte ich**, dass ein simulierter Agent auf Knopfdruck einen Recherchelauf über die Agenten-API anlegt, **damit** ich Eingangskorb und Freigabe ohne echte Claude-Aufgabe vorführen kann.

- **Art:** Wegbereiter
- **Bezug:** architektur.md Abschnitt 6 (Recherche-Agent) · A1 Auslöser und Schritt 5 · A1 Ausnahme »API nicht erreichbar«
- **Größe:** klein
- **Abhängig von:** E1-S2, E2-S3

**Akzeptanzkriterien**
1. Gegeben der Ausgangszustand, wenn Marco in der Vorführleiste »Agent meldet sich« klickt, dann legt der Simulator über `POST /api/v1/agent/laeufe` mit dem Agenten-Schlüssel einen Lauf mit dem heutigen Datum und den vier Vorschlägen Sabine Kortmann, Miriam Voss, Dr. Katrin Albers und Reto Ammann an, mit der Abdeckungsgrenze »Nur 4 belegte Treffer statt 10, Lücke benannt; 1 Profil ohne verifizierte URL«.
2. Der Simulator schreibt nicht direkt in die Datenbank; der Lauf entsteht ausschließlich über die Agenten-API.
3. Wenn »Agent meldet sich« ein zweites Mal an einem späteren Tag geklickt wird, dann entsteht ein Lauf mit null Vorschlägen und der Abdeckungsgrenze »Keine weiteren belegten Treffer«.
4. Gegeben in der Vorführleiste ist »API für den Agenten gestört« eingeschaltet, wenn der Agent sich meldet, dann entsteht kein Lauf, und unter `GET /api/v1/sim/agent/ergebnisdatei` liegt die Ergebnisdatei im Format von »Lauf anlegen« bereit.
5. Die Schaltflächen gibt es nur bei `COCKPIT_DEMO=1`.

**Nicht enthalten:** Laufauftrag und Ausschlussliste im Ablauf des Simulators (E2-S6), Upload der Ergebnisdatei (E2-S5).

### E1-S4 – Echtbetrieb neben dem Vorführbestand

**Als** Marco **möchte ich** das Cockpit mit einem eigenen, leeren Datenbestand starten können, **damit** echte Kontakte nicht mit den erfundenen Beispieldaten vermischt werden.

- **Art:** Wegbereiter *(neu mit Konzept 1.3, 19.11.2026)*
- **Bezug:** Abschnitt 5 »Ergänzung 1.3: Echtbetrieb« · Abschnitt 11 Datenschutz
- **Größe:** klein
- **Abhängig von:** E1-S0, E1-S2, E10-S1

**Akzeptanzkriterien**
1. Wenn Marco `npm run echt` ausführt, dann startet das Cockpit mit der Datenbank `data/echt.sqlite`; gibt es sie noch nicht, wird sie angelegt mit den fünf Firmen des Startbestands der Sperrliste und dem Rechercheprofil, aber ohne Firmen, Kontakte und Läufe.
2. Im Echtbetrieb gibt es keine Vorführleiste und keine Adressen unter `/api/v1/sim`; »heute« ist das echte Datum.
3. `npm run reset` und die Tests ändern `data/echt.sqlite` nicht.
4. Ein zweiter Start mit `npm run echt` behält alle bis dahin erfassten Daten.

**Nicht enthalten:** Betrieb auf einem Server, Sicherung der Datenbank.

## Epic E2 – Recherchelauf übernehmen

Ziel: Der Agent fragt das Cockpit, ob er laufen soll, kennt den Bestand und liefert seine Vorschläge strukturiert ab.

### E2-S1 – Laufauftrag abfragen

**Als** Recherche-Agent **möchte ich** beim Cockpit abfragen, ob ich heute laufen soll und mit welchem Zielbild, **damit** Marco mich im Cockpit steuert und nicht im Prompt.

- **Art:** Fachlich
- **Bezug:** A1 Schritt 1–2 · Regel Laufentscheidung · F10 · Abschnitt 11 (Aufruf »Laufauftrag« im Entwurf)
- **Größe:** mittel
- **Abhängig von:** E1-S1, E8-S1, E8-S2, E8-S3

**Akzeptanzkriterien**
1. Gegeben das Profil »DACH Kernbranchen« ist aktiv mit Lauftagen Montag und Donnerstag und 10 Vorschlägen je Lauf, wenn der Agent am Donnerstag, 19.11.2026, abfragt, dann antwortet das Cockpit »Heute laufen« mit Anzahl 10, den acht Branchen, den Ländern Deutschland, Österreich, Schweiz, Mindestumsatz 50 Mio. EUR und den acht Rollen.
2. Gegeben derselbe Stand, wenn der Agent am Freitag, 20.11.2026, abfragt, dann antwortet das Cockpit »Heute nicht« mit dem Grund »kein Lauftag«.
3. Gegeben das Profil ist pausiert, wenn der Agent an einem Donnerstag abfragt, dann lautet die Antwort »Heute nicht« mit dem Grund »pausiert«, auch wenn zugleich eine Sperrzeit gilt.
4. Gegeben die Sperrzeit »Weihnachtsurlaub« vom 21.12.2026 bis 03.01.2027, wenn der Agent am Montag, 21.12.2026, abfragt, dann lautet die Antwort »Heute nicht« mit dem Grund »Sperrzeit Weihnachtsurlaub«.
5. Gegeben am 19.11.2026 wurde bereits ein Lauf ausgeführt, wenn der Agent am selben Tag erneut abfragt, dann lautet die Antwort »Heute nicht«.
6. Treffen mehrere Gründe zu, nennt das Cockpit den ersten in der Reihenfolge pausiert, kein Lauftag, Sperrzeit, Obergrenze.

**Nicht enthalten:** Obergrenze (E8-S5), Zusatzlauf (E8-S4), Anzeige im Laufprotokoll (E8-S6).

### E2-S2 – Ausschlussliste abrufen

**Als** Recherche-Agent **möchte ich** alle bekannten, geschlossenen und gesperrten Firmen und Personen abrufen, **damit** ich niemanden erneut vorschlage.

- **Art:** Fachlich
- **Bezug:** A1 Schritt 3 · Regeln Status (Wiederansprache, Kein Interesse, Opt-out, Verwerfen) · F8
- **Größe:** mittel
- **Abhängig von:** E1-S1, E10-S1, E3-S3

**Akzeptanzkriterien**
1. Gegeben der Beispielbestand, wenn der Agent die Liste abruft, dann enthält sie die fünf Firmen des Startbestands (Windmöller & Hölscher, BOBST, Haberkorn, HORNBACH, Energie Steiermark) und alle sieben Beispielkontakte mit ihrer Firma.
2. Gegeben Jana Wiesner steht auf »Kein Interesse«, wenn der Agent die Liste zu einem beliebigen späteren Zeitpunkt abruft, dann ist sie als dauerhaft gesperrt enthalten.
3. Gegeben Markus Ostermann wurde »Ohne Antwort geschlossen«, wenn der Agent die Liste innerhalb von 6 Monaten nach dem Schließen abruft, dann ist er als gesperrt enthalten; nach Ablauf der 6 Monate ist er als »für Wiederansprache mit neuem Anlass zulässig« gekennzeichnet.
4. Gegeben eine Person steht mit dem Grund »Opt-out« auf der Sperrliste, wenn der Agent die Liste abruft, dann ist sie dauerhaft als gesperrt enthalten.
5. Gegeben ein Vorschlag wurde mit »Anlass zu schwach« verworfen, wenn der Agent die Liste innerhalb von 6 Monaten abruft, dann ist diese Person gesperrt, ihre Firma aber nicht.

**Nicht enthalten:** die Recherche selbst und ihr Regeltext (liegen beim Agenten).

### E2-S3 – Recherchelauf anlegen

**Als** Recherche-Agent **möchte ich** einen Lauf mit meinen Vorschlägen im Cockpit anlegen, **damit** Marco sie im Eingangskorb prüfen kann.

- **Art:** Fachlich
- **Bezug:** A1 Schritt 5 und Ergebnis · Ausnahme »weniger Treffer als angefordert« · Objekte Recherchelauf, Firma, Ansprechpartner, Anlass, Nachricht · F1, F9
- **Größe:** mittel
- **Abhängig von:** E1-S1

**Akzeptanzkriterien**
1. Gegeben der Agent liefert den Beispiel-Lauf vom 19.11.2026 mit den vier Vorschlägen Kortmann, Voss, Albers und Ammann, wenn er den Lauf anlegt, dann speichert das Cockpit den Lauf mit Datum 19.11.2026, 4 Vorschlägen, 0 Freigaben und jeder Vorschlag hat den Zustand »Zu prüfen«.
2. Je Vorschlag sind gespeichert: Firma (Name, Branche, Land, Umsatz mit Währung, Bezugsjahr, Bezug und Quelle; bei Fremdwährung zusätzlich Wechselkurs mit Quelle und Gegenwert in EUR), Ansprechpartner (Anrede, Name, Funktion, Quelle, LinkedIn-URL oder leer), Anlass (Typ, Beschreibung, Ereignisdatum, Quellenlink, Relevanzhypothese, Gesprächsziel) sowie Betreff und LinkedIn-Nachricht.
3. Gegeben der Lauf enthält 4 statt der angeforderten 10 Vorschläge, wenn er angelegt wird, dann steht im Feld »Abdeckungsgrenzen« der vom Agenten gelieferte Text, zum Beispiel »Nur 4 belegte Treffer statt 10, Lücke benannt«.
4. Gegeben ein Vorschlag ohne Namen der Person oder ohne Firmenname, wenn der Lauf angelegt wird, dann weist das Cockpit diesen Vorschlag mit einer Meldung zurück, die das fehlende Feld nennt, und legt die übrigen an.
5. Der Agent kann über diesen Weg weder einen Vorschlag freigeben noch einen bestehenden Datensatz ändern.

**Nicht enthalten:** Dublettenprüfung (E2-S4), Pflichtangaben für die Freigabe (E3-S2).

### E2-S4 – Dubletten und Wiederansprache erkennen

**Als** Marco **möchte ich**, dass das Cockpit bekannte Firmen und Personen beim Anlegen eines Laufs erkennt, **damit** ich niemanden doppelt anschreibe.

- **Art:** Fachlich
- **Bezug:** A1 Schritt 5 · Regel Dublettenprüfung · Regel Wiederansprache · S2
- **Größe:** mittel
- **Abhängig von:** E2-S3, E3-S3

**Akzeptanzkriterien**
1. Gegeben Dr. Katrin Albers (Nordwerk Fördertechnik GmbH) ist im Bestand, wenn ein Lauf sie erneut vorschlägt, dann ist der Vorschlag als »Dublette« markiert und lässt sich nicht freigeben.
2. Gegeben ein Vorschlag nennt »nordwerk fördertechnik« ohne Rechtsform und in Kleinschreibung, wenn der Lauf angelegt wird, dann ordnet das Cockpit ihn der bestehenden Firma Nordwerk Fördertechnik GmbH zu.
3. Gegeben zwei Personen mit unterschiedlichem Namen, aber derselben LinkedIn-URL, wenn die zweite vorgeschlagen wird, dann gilt sie als Dublette.
4. Gegeben bei Hansemarkt Handels SE steht Tobias Reinhardt auf »Angeschrieben«, wenn Miriam Voss für dieselbe Firma vorgeschlagen wird, dann ist der Vorschlag freigebbar und trägt den Hinweis »Zweiter Ansprechpartner, dort läuft eine Ansprache (Tobias Reinhardt, Angeschrieben)«.
5. Gegeben bei einer Firma steht der einzige Kontakt auf »Freigegeben« oder »Gespräch vereinbart«, wenn ein zweiter Ansprechpartner vorgeschlagen wird, dann erscheint kein solcher Hinweis.
6. Gegeben Markus Ostermann wurde vor mehr als 6 Monaten ohne Antwort geschlossen, wenn der Agent ihn mit neuem Anlass vorschlägt, dann ist der Vorschlag als »Wiederansprache« gekennzeichnet und nicht als Dublette gesperrt.

**Nicht enthalten:** Abgleich gegen HubSpot oder SAP (Bewusst nicht).

### E2-S5 – Ergebnisdatei von Hand hochladen

**Als** Marco **möchte ich** die Ergebnisdatei des Agenten im Eingangskorb hochladen können, **damit** ein Lauf nicht verloren geht, wenn der Agent die API nicht erreicht – und im ersten Echtbetrieb als regulärer Weg (Konzept 1.3).

- **Art:** Fachlich
- **Bezug:** A1 Ausnahme »API nicht erreichbar« · S2 Aktion »Datei hochladen«
- **Größe:** klein
- **Abhängig von:** E2-S3, E2-S4, E3-S1

**Akzeptanzkriterien**
1. Gegeben eine Ergebnisdatei mit den vier Beispielvorschlägen, wenn Marco sie auf S2 hochlädt, dann entsteht derselbe Lauf wie beim Anlegen über die API, mit Dublettenprüfung und Zustand »Zu prüfen«.
2. Gegeben eine Datei, die sich nicht lesen lässt, wenn Marco sie hochlädt, dann entsteht kein Lauf und eine Meldung nennt den Grund.
3. Gegeben dieselbe Datei wird ein zweites Mal hochgeladen, dann sind alle Vorschläge als Dubletten oder bereits vorhanden erkennbar und es entstehen keine doppelten Firmen oder Kontakte.
4. *(neu mit Konzept 1.3)* Gegeben die Firma Seehotel-Gruppe Bodan AG steht auf der Sperrliste, wenn eine Datei mit Reto Ammann hochgeladen wird, dann ist sein Vorschlag als »Gesperrt« mit dem Grund des Eintrags gekennzeichnet und lässt sich nicht freigeben; dasselbe gilt für eine gesperrte Person bis zu ihrem »gesperrt bis«.

**Nicht enthalten:** das Dateiformat; es wird in der Architektur-Stufe festgelegt.

### E2-S6 – Agent als geplante Claude-Aufgabe

**Als** Marco **möchte ich**, dass der Recherche-Agent als geplante Aufgabe in Claude werktäglich um 6:30 Uhr läuft und über die Cockpit-API arbeitet, **damit** Vorschläge ohne mein Zutun im Eingangskorb landen.

- **Art:** Wegbereiter
- **Bezug:** A1 Auslöser und Schritte 1–5 · Abschnitt 11 (Claude Desktop) · Abschnitt 3 (Rolle Recherche-Agent)
- **Größe:** mittel
- **Abhängig von:** E2-S1, E2-S2, E2-S3, E10-S2

**Akzeptanzkriterien**
1. Gegeben die Aufgabe ist eingerichtet, wenn sie an einem Werktag um 6:30 Uhr startet, dann fragt sie zuerst den Laufauftrag ab.
2. Gegeben die Antwort lautet »Heute nicht«, dann endet die Aufgabe, ohne zu recherchieren und ohne einen Lauf anzulegen.
3. Gegeben die Antwort lautet »Heute laufen« mit Anzahl 10 und dem Zielbild des Profils, dann ruft die Aufgabe die Ausschlussliste ab, recherchiert nach Zielbild und Marcos Regeltext und legt genau einen Lauf an.
4. Kein Vorschlag des Laufs steht auf der zuvor abgerufenen Ausschlussliste.
5. Der Prompt der Aufgabe enthält keine von Hand gepflegte Ausschlussliste und kein festes Zielbild mehr; beides kommt aus dem Cockpit.
6. Die Aufgabe sendet keine Nachrichten über LinkedIn oder E-Mail.

**Nicht enthalten:** Start des Agenten aus dem Cockpit über die Claude-API (Später).

## Epic E3 – Vorschläge prüfen und freigeben

Ziel: Marco entscheidet im Eingangskorb, welche Vorschläge zu Kontakten werden.

### E3-S1 – Eingangskorb zeigt Läufe und Vorschläge

**Als** Marco **möchte ich** im Eingangskorb die Läufe und ihre Vorschläge sehen, **damit** ich weiß, was zu prüfen ist.

- **Art:** Fachlich
- **Bezug:** A2 Schritt 1 · S2
- **Größe:** mittel
- **Abhängig von:** E2-S3

**Akzeptanzkriterien**
1. Gegeben die Läufe vom 16.11., 12.11. und 09.11.2026, wenn Marco S2 öffnet, dann stehen sie mit Datum, Zahl der Vorschläge (10, 8, 10), Zahl der Freigaben (7, 6, 8) und Abdeckungsgrenzen in der Liste, der neueste zuerst.
2. Gegeben der Lauf vom 19.11.2026 mit vier ungeprüften Vorschlägen, wenn Marco ihn öffnet, dann zeigt jede Karte Person, Funktion, Firma, Branche und Land, Umsatz, Anlass mit Datum und einen klickbaren Quellenlink.
3. Gegeben der Vorschlag Reto Ammann ohne Anlass, dann trägt die Karte das Etikett »Kein belastbarer aktueller Anlass«.
4. Gegeben ein Lauf mit ungeprüften Vorschlägen, dann zeigt die Laufliste die Zahl der offenen Vorschläge, hier »4 offen«.
5. Gegeben ein Lauf, dessen Vorschläge alle geprüft sind, wenn Marco ihn öffnet, dann sagt ein Hinweis, dass nichts mehr zu prüfen ist.

**Nicht enthalten:** Freigeben und Verwerfen (E3-S3, E3-S4).

### E3-S2 – Angaben prüfen und Pflichtangaben für die Freigabe

**Als** Marco **möchte ich** bei jedem Vorschlag alle Angaben mit Herkunft sehen und nur vollständige Vorschläge freigeben können, **damit** kein unbelegter Kontakt in meine Ansprache rutscht.

- **Art:** Fachlich
- **Bezug:** A2 Schritt 2 · Regel Pflichtangaben für die Freigabe · Regel Daten (Herkunft) · S2
- **Größe:** mittel
- **Abhängig von:** E3-S1, E3-S3

**Akzeptanzkriterien**
1. Gegeben der Vorschlag Sabine Kortmann, wenn Marco die Angaben öffnet, dann stehen Umsatzquelle, Beleg der Funktion, LinkedIn-Profil, Hypothese, Gesprächsziel, Betreff und Nachricht jeweils mit Herkunft da; die Hypothese trägt das Etikett »Hypothese«.
2. Gegeben der Vorschlag Reto Ammann ohne LinkedIn-URL, dann ist das Profil als »nicht belegt« markiert und es steht der Suchhinweis »Reto Ammann, Seehotel-Gruppe Bodan AG« da.
3. Gegeben ein Vorschlag ohne Umsatzquelle oder ohne Bezugsjahr, dann ist »Freigeben« gesperrt und ein Hinweis nennt die fehlende Angabe.
4. Gegeben der Mindestumsatz im Profil ist 50 Mio. EUR und ein Vorschlag nennt 40 Mio. EUR, dann ist »Freigeben« gesperrt mit dem Hinweis »unter Mindestumsatz«.
5. Gegeben ein Vorschlag mit Umsatz in CHF (Seehotel-Gruppe Bodan AG, 88 Mio. CHF), dann zeigt das Cockpit den vom Agenten gelieferten Gegenwert in EUR (rund 93 Mio. EUR) mit Kurs und Quelle und prüft den Mindestumsatz an diesem EUR-Wert; fehlen Kurs oder Gegenwert, ist »Freigeben« gesperrt.
6. Gegeben ein Vorschlag ohne Anlass und ohne die Kennzeichnung »Kein belastbarer aktueller Anlass«, dann ist »Freigeben« gesperrt.
7. Gegeben ein Vorschlag ohne Betreff oder ohne Nachricht, dann ist »Freigeben« gesperrt.

**Nicht enthalten:** inhaltliche Prüfung der Quellen; die nimmt Marco selbst vor.

### E3-S3 – Vorschlag freigeben

**Als** Marco **möchte ich** einen Vorschlag freigeben, **damit** Firma und Ansprechpartner angelegt sind und der Kontakt zur Ansprache bereitsteht.

- **Art:** Fachlich
- **Bezug:** A2 Schritt 3 und Ergebnis · Regel Status (Neu → Freigegeben) · Regel Wiederansprache · S2, S3, S4
- **Größe:** klein
- **Abhängig von:** E3-S1

**Akzeptanzkriterien**
1. Gegeben der Vorschlag Sabine Kortmann (Kranbau Oberhavel GmbH), wenn Marco »Freigeben« klickt, dann gibt es die Firma Kranbau Oberhavel GmbH (Maschinenbau, DE, 121 Mio. EUR, 2025, Konzern) und die Ansprechpartnerin Sabine Kortmann, Leiterin After-Sales Service, im Status »Freigegeben«.
2. Anlass, Hypothese, Gesprächsziel, Betreff und Nachricht des Vorschlags hängen am neuen Kontakt.
3. Gegeben der Vorschlag Miriam Voss für die bestehende Firma Hansemarkt Handels SE, wenn Marco freigibt, dann entsteht keine zweite Firma; Voss ist der bestehenden zugeordnet.
4. Nach der Freigabe zeigt die Karte »Freigegeben«, die Zahl der Freigaben des Laufs steigt um 1 und der Vorschlag lässt sich nicht erneut freigeben.
5. Gegeben ein als »Wiederansprache« gekennzeichneter Vorschlag für Markus Ostermann, wenn Marco freigibt, dann steht der bestehende Kontakt Ostermann auf »Freigegeben«, sein Verlauf mit dem Erstkontakt per InMail vom 19.10.2026 ist erhalten, der neue Anlass und die neue Nachricht hängen am Kontakt, und es gibt keinen zweiten Kontakt gleichen Namens.

**Nicht enthalten:** Pflichtangaben-Prüfung (E3-S2).

### E3-S4 – Vorschlag verwerfen

**Als** Marco **möchte ich** einen Vorschlag mit Grund verwerfen, **damit** der Agent ihn nicht wieder liefert und aus dem Grund lernt.

- **Art:** Fachlich
- **Bezug:** A2 Schritt 4 · Regel Verwerfen im Eingangskorb · S2, S8
- **Größe:** klein
- **Abhängig von:** E3-S1, E10-S1

**Akzeptanzkriterien**
1. Wenn Marco »Verwerfen« klickt, dann muss er einen der Gründe wählen: passt nicht ins Zielbild, Kontakt nicht belegt, bereits bekannt, Anlass zu schwach, wird von Kollegen betreut.
2. Gegeben der Vorschlag Reto Ammann, wenn Marco mit »passt nicht ins Zielbild« verwirft, dann steht die Firma Seehotel-Gruppe Bodan AG mit diesem Grund auf der Sperrliste und bleibt gesperrt, bis Marco den Eintrag entfernt.
3. Gegeben derselbe Vorschlag, wenn Marco stattdessen mit »wird von Kollegen betreut« verwirft, dann ist ebenfalls die Firma gesperrt.
4. Gegeben der Vorschlag Sabine Kortmann, wenn Marco am 19.11.2026 mit »Anlass zu schwach« verwirft, dann ist nur die Person gesperrt, und zwar bis 19.05.2027; die Firma Kranbau Oberhavel GmbH ist nicht gesperrt.
5. Nach dem Verwerfen zeigt die Karte »Verworfen« mit dem Grund; es entstehen weder Firma noch Kontakt.

**Nicht enthalten:** Auswertung der Verwerfungsgründe als Rückkanal an den Agenten (Später).

## Epic E4 – Firmen und Kontakte führen

Ziel: Der Bestand ist auffindbar, vollständig einsehbar und von Hand pflegbar.

### E4-S1 – Firmenliste und Firmendetail

**Als** Marco **möchte ich** alle Firmen mit Umsatzangaben und Ansprechpartnern sehen und pflegen, **damit** ich den Überblick je Unternehmen habe.

- **Art:** Fachlich
- **Bezug:** S3 · F3 · Objekt Firma · A2 Schritt 3
- **Größe:** mittel
- **Abhängig von:** E3-S3

**Akzeptanzkriterien**
1. Gegeben der Beispielbestand, wenn Marco S3 öffnet, dann stehen sieben Firmen mit Branche, Land, Umsatz samt Jahr, Währung und Bezug, Zahl der Kontakte und Status in der Liste, zum Beispiel »Rheintal Technikhandel AG, Technischer Handel / CH, 96 Mio. CHF, 2025, Einzelgesellschaft, 1 Kontakt, Aktiv«.
2. Wenn Marco »Hanse« in die Suche tippt, dann bleibt nur Hansemarkt Handels SE stehen; mit dem Filter Branche »Utilities« bleiben Alpenstrom Netze AG und Stadtwerke Lindental GmbH.
3. Wenn Marco Nordwerk Fördertechnik GmbH öffnet, dann sieht er Anschrift, allgemeinen Firmenkontakt, die Umsatzquelle als Link und Dr. Katrin Albers als Ansprechpartnerin; fehlende Angaben stehen als »nicht belegt« da.
4. Wenn Marco »Bearbeiten« wählt, die Anschrift einträgt und speichert, dann zeigt das Detail die neue Anschrift; änderbar sind Anschrift und allgemeiner Firmenkontakt.
5. Ein Klick auf einen Ansprechpartner öffnet dessen Kontaktakte auf S4.
6. Gegeben ein Filter ohne Treffer, dann sagt die Liste, dass keine Firma passt.

**Nicht enthalten:** Firma sperren (E4-S4).

### E4-S2 – Kontaktliste mit Statusfilter

**Als** Marco **möchte ich** meine Kontakte nach Status filtern, **damit** ich die offene Pipeline sehe und geschlossene Kontakte trotzdem finde.

- **Art:** Fachlich
- **Bezug:** S4 (Liste) · Regel Status · Regel »Schließen heißt nicht löschen«
- **Größe:** klein
- **Abhängig von:** E3-S3

**Akzeptanzkriterien**
1. Gegeben der Beispielbestand, wenn Marco S4 öffnet, dann zeigt die Liste mit dem Filter »Offene« Albers, Reinhardt, Gruber, Bernasconi und Hollenstein mit Funktion, Firma und Status; Ostermann und Wiesner fehlen.
2. Wenn Marco den Filter auf »Ohne Antwort geschlossen« stellt, dann erscheint Markus Ostermann.
3. Wenn Marco den Filter auf »Alle« stellt, dann stehen alle sieben Kontakte da.
4. Hollenstein zeigt den Status »Antwort erhalten (neutral/später)«.
5. Gegeben ein Filter ohne Treffer, dann sagt die Liste, dass kein Kontakt passt.

**Nicht enthalten:** Filter aus der Kennzahlen-Aufschlüsselung (E9-S3).

### E4-S3 – Kontaktakte

**Als** Marco **möchte ich** je Kontakt Stammdaten, Anlass und den vollständigen Verlauf sehen, **damit** ich vor jeder Aktion weiß, was bisher geschah.

- **Art:** Fachlich
- **Bezug:** S4 (Detail) · A4 Schritt 1 · Objekte Ansprechpartner, Anlass, Kontaktversuch, Antwort
- **Größe:** mittel
- **Abhängig von:** E4-S2

**Akzeptanzkriterien**
1. Gegeben Dr. Katrin Albers, wenn Marco ihre Akte öffnet, dann sieht er Funktion, Firma als Link, LinkedIn-Profil, den Anlass »Pressemitteilung: neues Servicezentrum für Ersatzteile in Bremen« vom 04.11.2026 mit Quellenlink und die Hypothese mit dem Etikett »Hypothese«.
2. Die sieben Status Neu bis An SAP übergeben stehen in ihrer Reihenfolge da; bei Albers ist »Gespräch vereinbart« als aktueller Status hervorgehoben.
3. Der Verlauf zeigt zeitlich geordnet »Erstkontakt per InMail am 06.11.2026, 08:40 Uhr« und »Antwort: Positiv am 09.11.2026« mit dem nächsten Schritt.
4. Gegeben Tobias Reinhardt, dann zeigt der Verlauf beim Erstkontakt per E-Mail die Grundlage »In HubSpot bekannt«.
5. Persönliche Direktkontakte (E-Mail, Telefon) und allgemeine Firmenkontakte stehen getrennt und sind als solche bezeichnet.
6. Gegeben Markus Ostermann im Endzustand »Ohne Antwort geschlossen«, dann zeigt die Akte den Endzustand als Hinweis und der Verlauf ist vollständig lesbar.
7. Gegeben ein Kontakt ohne LinkedIn-URL, dann steht statt des Links der Suchhinweis aus Name und Firma.

**Nicht enthalten:** die Aktionen der Akte; sie stehen in E5, E6, E7 und E4-S4.

### E4-S4 – Sperren und Löschen von Hand

**Als** Marco **möchte ich** eine Firma oder einen Kontakt sperren und einzelne Datensätze löschen können, **damit** ich Wünsche von Kontakten und meine eigene Ordnung durchsetzen kann.

- **Art:** Fachlich
- **Bezug:** S3 und S4 Aktionen »sperren« und »löschen« · Regel Daten (Löschen von Hand, Sperreintrag bleibt) · F8
- **Größe:** klein
- **Abhängig von:** E4-S3, E4-S1, E10-S1

**Akzeptanzkriterien**
1. Wenn Marco in der Akte von Luca Bernasconi »Sperren« wählt, dann steht der Kontakt auf »Gesperrt«, seine offenen Wiedervorlagen sind erledigt und auf der Sperrliste steht »Luca Bernasconi (Rheintal Technikhandel AG)« als Person.
2. Wenn Marco die Firma Weserland Entsorgung GmbH sperrt, dann zeigt S3 den Status »Gesperrt« und die Firma steht auf der Sperrliste.
3. Wenn Marco in der Kontaktakte (S4) »Löschen« wählt und bestätigt, dann sind Stammdaten, Anlass, Nachrichten und Verlauf des Kontakts entfernt; ein Sperreintrag mit Name und Firma bleibt bestehen.
4. Vor dem Löschen fragt das Cockpit nach und nennt den Namen des Kontakts oder der Firma.
5. Es gibt keine automatische Löschung: Ein Kontakt, dessen letzter Kontaktversuch mehr als 12 Monate zurückliegt, ist unverändert vorhanden.
6. Gegeben eine Firma ohne Ansprechpartner, wenn Marco im Firmendetail (S3) »Löschen« wählt und bestätigt, dann ist die Firma entfernt; hat sie noch Ansprechpartner wie Nordwerk Fördertechnik GmbH, ist »Löschen« gesperrt und ein Hinweis nennt den Grund.

**Nicht enthalten:** Sperre durch Opt-out (E6-S1).

## Epic E5 – Ansprechen

Ziel: Marco stellt die Nachricht fertig, sendet selbst und der Versand ist mit zwei Klicks dokumentiert.

### E5-S1 – Ansprache-Ansicht mit Aufhänger und Nachricht

**Als** Marco **möchte ich** Aufhänger und Nachricht nebeneinander sehen und den Text anpassen, **damit** ich eine individuelle Nachricht fertig habe.

- **Art:** Fachlich
- **Bezug:** A3 Schritt 1–2 · S5 · Objekt Nachricht
- **Größe:** mittel
- **Abhängig von:** E3-S3, E4-S3

**Akzeptanzkriterien**
1. Gegeben Simone Gruber im Status »Freigegeben«, wenn Marco sie in der Ansprache öffnet, dann stehen links der Anlass »Geschäftsbericht: Kundenportal für Netzanschlüsse als Schwerpunkt 2027« mit Datum 15.09.2026 und Quellenlink, die Hypothese und das Gesprächsziel, rechts Betreff und LinkedIn-Nachricht des Agenten.
2. Der Kanal LinkedIn ist vorausgewählt.
3. Unter der Nachricht steht die Wortzahl; bei der Nachricht für Gruber lautet sie 50 mit dem Zusatz, dass sie im Zielkorridor 45–70 liegt.
4. Wenn Marco den Text kürzt, sodass er unter 45 Wörtern liegt, dann zeigt der Zähler sofort die neue Zahl und nennt den Zielkorridor.
5. Wenn Marco Betreff oder Text ändert und den Versand protokolliert, dann ist die Fassung als »von Marco geändert« gespeichert; unverändert bleibt sie »Agent«.
6. Gegeben kein Kontakt ist gewählt, wenn Marco S5 öffnet, dann stehen die Listen »Erstkontakt offen« (hier Simone Gruber) und »Angeschrieben, Nachfassen möglich« (hier Tobias Reinhardt) da.
7. Gegeben ein freigegebener Kontakt ohne Anlass (Reto Ammann aus dem Lauf vom 19.11.2026), dann steht statt eines Aufhängers das Etikett »Kein belastbarer aktueller Anlass«. *(Geändert am 19.11.2026 mit Marcos Zustimmung; vorher Luca Bernasconi, der in den Beispieldaten »Nachgefasst« ist.)*

*Nachweis zu Kriterium 5 mit E5-S3 (Speichern beim Protokollieren); von Marco am 19.11.2026 so angenommen.*

**Nicht enthalten:** Kopieren und Profil öffnen (E5-S2), Protokoll (E5-S3), E-Mail (E5-S4, E5-S5).

### E5-S2 – LinkedIn: kopieren und Profil öffnen

**Als** Marco **möchte ich** Betreff und Nachricht kopieren und das Profil öffnen, **damit** ich in LinkedIn oder im Sales Navigator ohne Suchen selbst senden kann.

- **Art:** Fachlich
- **Bezug:** A3 Schritt 3 · S5 · Abschnitt 11 (LinkedIn: Versand bleibt Handarbeit)
- **Größe:** klein
- **Abhängig von:** E5-S1

**Akzeptanzkriterien**
1. Wenn Marco »Betreff kopieren« klickt, dann liegt der aktuelle Betreff in der Zwischenablage und das Cockpit bestätigt es; ebenso »Nachricht kopieren« für den aktuellen Text.
2. Gegeben Simone Gruber mit hinterlegter LinkedIn-URL, wenn Marco »Profil öffnen« klickt, dann öffnet sich dieses Profil in einem neuen Fenster.
3. Gegeben ein Kontakt ohne verifizierte URL (Reto Ammann), dann gibt es kein »Profil öffnen«; stattdessen steht der Suchhinweis »Reto Ammann, Seehotel-Gruppe Bodan AG« da und lässt sich kopieren.
4. Das Cockpit sendet zu keinem Zeitpunkt selbst eine Nachricht oder Vernetzungsanfrage an LinkedIn und liest dort nichts aus.

**Nicht enthalten:** jede Automatisierung in LinkedIn (Bewusst nicht).

### E5-S3 – Versand protokollieren

**Als** Marco **möchte ich** nach dem Senden »Als gesendet markieren« klicken, **damit** der Kontaktversuch dokumentiert und das Nachfassen terminiert ist.

- **Art:** Fachlich
- **Bezug:** A3 Schritt 6 und Ergebnis · Regeln Status (»Angeschrieben« nur durch Markieren, Wiedervorlage 7 Werktage) · Objekte Kontaktversuch, Wiedervorlage · S5, S4
- **Größe:** mittel
- **Abhängig von:** E5-S1

**Akzeptanzkriterien**
1. Gegeben Simone Gruber im Status »Freigegeben«, wenn Marco am Donnerstag, 19.11.2026, den Kanal »Vernetzungsanfrage mit Notiz« wählt und »Als gesendet markieren« klickt, dann gibt es einen Kontaktversuch mit Art »Erstkontakt«, diesem Kanal, dem Zeitpunkt und dem gesendeten Betreff und Text.
2. Der Status wechselt auf »Angeschrieben« und eine Wiedervorlage »Nachfassen, keine Antwort« ist für Montag, 30.11.2026, angelegt (7 Werktage).
3. Zur Wahl stehen bei LinkedIn die Kanäle InMail, Vernetzungsanfrage mit Notiz und LinkedIn-Nachricht.
4. Nach dem Markieren zeigt das Cockpit die Kontaktakte auf S4 mit dem neuen Eintrag im Verlauf.
5. Ohne das Markieren ändert sich der Status nie auf »Angeschrieben«, auch nicht durch Kopieren oder Profil öffnen.
6. Gegeben eine leere Nachricht, wenn Marco markieren will, dann verweigert das Cockpit das mit einem Hinweis.

**Nicht enthalten:** E-Mail als Kanal mit Grundlage (E5-S5), Nachfassen (E6-S4).

### E5-S4 – E-Mail-Fassung auf Knopfdruck

**Als** Marco **möchte ich** aus der LinkedIn-Fassung per Knopfdruck eine E-Mail-Fassung erzeugen, **damit** ich bei geeigneten Kontakten ohne Neuschreiben per E-Mail ansprechen kann.

- **Art:** Fachlich
- **Bezug:** A3 Schritt 4 · Regeln Kanalwahl (Vorlage, Signatur, Agent liefert nur LinkedIn) · S5
- **Größe:** klein
- **Abhängig von:** E5-S1, E10-S3

**Akzeptanzkriterien**
1. Gegeben Simone Gruber mit ihrer LinkedIn-Fassung, wenn Marco den Kanal E-Mail wählt und »E-Mail-Fassung erzeugen« klickt, dann entsteht ein E-Mail-Text, der mit »Guten Tag Frau Gruber,« beginnt, den Inhalt der LinkedIn-Fassung enthält und mit der Signatur aus den Einstellungen endet.
2. Gegeben ein Kontakt mit Titel wie Dr. Katrin Albers, dann lautet die Anrede »Guten Tag Frau Dr. Albers,«.
3. Die Grußformel »Beste Grüße / Marco« der LinkedIn-Fassung steht in der E-Mail-Fassung nicht zusätzlich zur Signatur.
4. Der Betreff der E-Mail ist mit dem Betreff der LinkedIn-Fassung vorbelegt; Betreff und Text sind frei bearbeitbar.
5. Vor dem Klick gibt es keine E-Mail-Fassung; der Agent liefert keine.
6. Die Erzeugung arbeitet ohne KI im Cockpit: Derselbe Ausgangstext ergibt immer dieselbe E-Mail-Fassung.

**Nicht enthalten:** eigens formulierte E-Mail vom Agenten oder über die Claude-API (Später).

### E5-S5 – E-Mail-Grundlage prüfen und Entwurf öffnen

**Als** Marco **möchte ich** vor einer E-Mail die von mir geprüfte Grundlage festhalten und den Entwurf in meinem Mailprogramm öffnen, **damit** nachvollziehbar ist, warum ich per E-Mail angeschrieben habe.

- **Art:** Fachlich
- **Bezug:** A3 Schritt 5 und Ausnahme »keine Adresse« · Regeln Kanalwahl (Grundlage, gesperrter Entwurf) · Abschnitt 11 (Outlook: Link ins Mailprogramm) · S5
- **Größe:** mittel
- **Abhängig von:** E5-S4, E5-S3

**Akzeptanzkriterien**
1. Gegeben eine erzeugte E-Mail-Fassung ohne gewählte Grundlage, dann ist »E-Mail-Entwurf öffnen« gesperrt und ein Hinweis nennt, was fehlt.
2. Zur Wahl stehen »In HubSpot bekannt«, »Hat bereits geantwortet« und »Andere«; bei »Andere« ist eine Notiz Pflicht.
3. Gegeben Tobias Reinhardt mit der Adresse t.reinhardt@hansemarkt.example und der Grundlage »In HubSpot bekannt«, wenn Marco »E-Mail-Entwurf öffnen« klickt, dann öffnet sich sein Mailprogramm mit diesem Empfänger, dem Betreff und dem Text einschließlich Umlauten.
4. Gegeben Simone Gruber ohne hinterlegte Adresse, dann ist das Empfängerfeld leer, ein Hinweis sagt, dass Marco die Adresse von Hand einträgt, und das Cockpit schlägt keine Adresse vor.
5. Wenn Marco nach dem Senden »Als gesendet markieren« klickt, dann trägt der Kontaktversuch den Kanal »E-Mail« und die Grundlage, bei »Andere« samt Notiz, zum Beispiel »Andere: Kontakt vom Stadtwerke-Webinar«.
6. Ohne gewählte Grundlage lässt sich ein E-Mail-Versand nicht protokollieren.
7. Das Cockpit trifft keine eigene Aussage darüber, ob die E-Mail zulässig ist, und sendet selbst keine E-Mail.

**Nicht enthalten:** HubSpot-Abgleich, Outlook-Entwürfe über Graph oder Connector (Später).

## Epic E6 – Antwort und Nachfassen

Ziel: Jeder Kontakt hat nach jedem Schritt einen eindeutigen Status und einen nächsten Termin.

### E6-S1 – Antwort erfassen

**Als** Marco **möchte ich** eine Antwort mit Einordnung erfassen, **damit** der Status stimmt und der nächste Schritt feststeht.

- **Art:** Fachlich
- **Bezug:** A4 Schritt 2 und Ausnahme Opt-out · Regeln Status (neutral/später, Kein Interesse, Opt-out) · S4, S8
- **Größe:** mittel
- **Abhängig von:** E4-S3, E5-S3, E6-S3

**Akzeptanzkriterien**
1. Gegeben Tobias Reinhardt im Status »Angeschrieben«, wenn Marco »Antwort erfassen« wählt, »Positiv« einordnet und speichert, dann steht der Status auf »Antwort erhalten (positiv)« und der Verlauf zeigt die Antwort mit Datum.
2. Gegeben die Einordnung »Neutral/später«, dann verlangt das Cockpit ein Datum für die Wiedervorlage und schlägt heute plus 30 Tage vor; nach dem Speichern steht der Status auf »Antwort erhalten (neutral/später)« und die Wiedervorlage ist angelegt.
3. Gegeben die Einordnung »Kein Interesse«, dann steht der Kontakt auf »Kein Interesse«, ist aus der Liste der offenen Kontakte verschwunden und für den Agenten dauerhaft gesperrt.
4. Gegeben die Einordnung »Bitte nicht mehr kontaktieren«, dann steht der Kontakt auf »Gesperrt« und auf der Sperrliste steht die Person mit dem Grund »Opt-out«.
5. Offene Wiedervorlagen »Nachfassen« und »Ohne Antwort schließen?« des Kontakts sind nach jeder erfassten Antwort erledigt.
6. Der Wortlaut der Antwort ist optional und erscheint, wenn eingetragen, im Verlauf.

**Nicht enthalten:** automatisches Erkennen von Antworten in LinkedIn oder im Postfach.

### E6-S2 – Gespräch eintragen

**Als** Marco **möchte ich** nach einer positiven Antwort das Gesprächsdatum eintragen, **damit** der Kontakt als »Gespräch vereinbart« geführt und übergabefähig ist.

- **Art:** Fachlich
- **Bezug:** A4 Schritt 3 · Regel Status (Antwort erhalten → Gespräch vereinbart) · S4
- **Größe:** klein
- **Abhängig von:** E6-S1

**Akzeptanzkriterien**
1. Gegeben ein Kontakt im Status »Antwort erhalten (positiv)«, wenn Marco »26.11.2026, 10:00 Uhr« einträgt und bestätigt, dann steht der Status auf »Gespräch vereinbart« und die Akte zeigt den Termin.
2. Gegeben ein leeres Feld, wenn Marco bestätigt, dann bleibt der Status unverändert und ein Hinweis verlangt Datum und Uhrzeit.
3. Bei Kontakten mit anderer Einordnung als »positiv« wird das Feld nicht angeboten.

**Nicht enthalten:** Kalendereintrag oder Einladung.

### E6-S3 – Wiedervorlagen

**Als** Marco **möchte ich** alle fälligen und geplanten Wiedervorlagen an einer Stelle sehen und bearbeiten, **damit** ich kein Nachfassen vergesse.

- **Art:** Fachlich
- **Bezug:** S6 · A4 Auslöser · Objekt Wiedervorlage · S4 Aktion »Wiedervorlage setzen«
- **Größe:** mittel
- **Abhängig von:** E4-S3

**Akzeptanzkriterien**
1. Gegeben der Beispielbestand am 18.11.2026, wenn Marco S6 öffnet, dann stehen vier Einträge nach Datum geordnet da: Reinhardt 23.11.2026 »Nachfassen, keine Antwort«, Bernasconi 24.11.2026 »Ohne Antwort schließen?«, Albers 24.11.2026 »Gespräch vorbereiten«, Hollenstein 15.01.2027 »Nach Jahreswechsel erneut melden«; alle als »geplant«.
2. Gegeben heute ist der 24.11.2026, dann ist Reinhardt als »überfällig« und sind Bernasconi und Albers als »heute« gekennzeichnet.
3. Jede Zeile zeigt Kontakt, Firma, Grund und die letzte Aktion mit Datum, bei Bernasconi »Nachfassen per LinkedIn-Nachricht, 12.11.2026«.
4. Wenn Marco »Erledigen« klickt, dann verschwindet der Eintrag aus der Liste.
5. Wenn Marco ein neues Datum wählt und »Verschieben« klickt, dann steht der Eintrag unter dem neuen Datum.
6. Wenn Marco in einer Kontaktakte »Wiedervorlage setzen« mit Datum und Grund speichert, dann erscheint sie auf S6.
7. Gegeben keine offenen Wiedervorlagen, dann sagt S6 das ausdrücklich.

**Nicht enthalten:** Nachfassen und Schließen aus der Liste heraus (E6-S4, E6-S5).

### E6-S4 – Nachfassen

**Als** Marco **möchte ich** genau einmal nachfassen können und dabei die erste Nachricht vor Augen haben, **damit** mein Nachfassen passt und ich nicht aufdringlich werde.

- **Art:** Fachlich
- **Bezug:** A4 Schritt 4 · Regeln Status (höchstens eine Nachfass-Nachricht) · Regel Kanalwahl (Nachfassen per E-Mail) · S5, S6
- **Größe:** mittel
- **Abhängig von:** E5-S3, E5-S5, E6-S3

**Akzeptanzkriterien**
1. Gegeben Tobias Reinhardt im Status »Angeschrieben«, wenn Marco aus S6 oder der Akte »Nachfassen« wählt, dann zeigt S5 die erste Nachricht mit Datum und Kanal und ein leeres Feld für die Nachfass-Nachricht.
2. Wenn Marco einen Text schreibt, selbst sendet und »Als gesendet markieren« klickt, dann gibt es einen Kontaktversuch mit Art »Nachfassen«, der Status steht auf »Nachgefasst« und die Wiedervorlage »Nachfassen, keine Antwort« ist erledigt.
3. Gegeben Luca Bernasconi im Status »Nachgefasst«, dann bietet das Cockpit kein weiteres Nachfassen an und sagt, dass die eine Nachfass-Nachricht gesendet ist.
4. Für das Nachfassen gelten dieselbe Kanalwahl und dieselbe Pflicht zur E-Mail-Grundlage wie beim Erstkontakt.
5. Beim Nachfassen per E-Mail entsteht die E-Mail-Fassung aus dem zuvor geschriebenen Nachfass-Text; ohne Text weist das Cockpit darauf hin.

**Nicht enthalten:** vom Agenten vorformulierte Nachfass-Nachrichten.

### E6-S5 – Ohne Antwort schließen und wieder öffnen

**Als** Marco **möchte ich** Kontakte ohne Antwort nach 21 Tagen schließen und bei Bedarf wieder öffnen, **damit** meine Arbeitslisten sauber bleiben und nichts verloren geht.

- **Art:** Fachlich
- **Bezug:** A4 Schritt 5 · Regeln Status (21 Tage, Schließen heißt nicht löschen, Wieder öffnen, 6 Monate Sperre) · S6, S4
- **Größe:** mittel
- **Abhängig von:** E6-S3, E5-S3

**Akzeptanzkriterien**
1. Gegeben Luca Bernasconi mit Erstkontakt am 03.11.2026 und ohne Antwort, dann gibt es für den 24.11.2026 die Wiedervorlage »Ohne Antwort schließen?«.
2. Gegeben ein Kontakt mit Erstkontakt am 19.11.2026, bei dem nicht nachgefasst wurde und keine Antwort kam, dann gibt es für den 10.12.2026 ebenfalls die Wiedervorlage »Ohne Antwort schließen?«.
3. Wenn Marco den Vorschlag bestätigt, dann steht der Kontakt auf »Ohne Antwort geschlossen«, seine offenen Wiedervorlagen sind erledigt und er fehlt in der Liste »Offene«.
4. Der geschlossene Kontakt zeigt weiterhin Anlass, Nachrichten und vollständigen Verlauf und zählt in den Kennzahlen als angeschrieben.
5. Wenn Marco bei Markus Ostermann »Wieder öffnen« wählt, dann steht er auf »Angeschrieben«; ein Kontakt ohne Kontaktversuch stünde auf »Freigegeben«.
6. Marco kann einen Kontakt in »Angeschrieben« oder »Nachgefasst« auch vor Ablauf der 21 Tage von Hand schließen.

**Nicht enthalten:** Wiederansprache-Vorschläge des Agenten (E2-S2, E2-S4).

## Epic E7 – Übergabe an SAP Sales Cloud V2

Ziel: Ein Kontakt mit positiver Antwort landet ohne Abtippen als Account, Kontaktperson und Lead in SAP.

### E7-S1 – SAP-Verbindung einrichten und testen

**Als** Marco **möchte ich** die Verbindung zur SAP Sales Cloud V2 hinterlegen und testen, **damit** ich vor der ersten Übergabe weiß, dass sie steht.

- **Art:** Wegbereiter
- **Bezug:** S8 (SAP-Verbindung mit Test) · Abschnitt 11 (SAP: REST-API mit technischem API-Nutzer)
- **Größe:** mittel
- **Abhängig von:** E1-S1

**Akzeptanzkriterien**
1. Gegeben gültige Zugangsdaten des API-Nutzers, wenn Marco auf S8 »Verbindung testen« klickt, dann meldet das Cockpit Erfolg mit Datum der Prüfung.
2. Gegeben falsche Zugangsdaten oder ein nicht erreichbares SAP, dann meldet das Cockpit den Fehler mit der Meldung von SAP und ohne Zugangsdaten anzuzeigen.
3. Der Test liest in SAP höchstens einen Account und legt nichts an.
4. Die Zugangsdaten sind nach dem Speichern in der Oberfläche nicht mehr im Klartext lesbar.

**Nicht enthalten:** lesender Bestandskundenabgleich gegen SAP (Bewusst nicht).

### E7-S2 – Vorschau der Übergabe

**Als** Marco **möchte ich** vor der Übergabe sehen, was in SAP angelegt wird, **damit** ich nichts Falsches ins Unternehmens-CRM schreibe.

- **Art:** Fachlich
- **Bezug:** A5 Schritt 1 · Regel Status (Übergabe nur ab positiver Antwort oder Gespräch) · Feldzuordnung SAP · S7, S4
- **Größe:** mittel
- **Abhängig von:** E6-S2, E7-S1

**Akzeptanzkriterien**
1. Gegeben Dr. Katrin Albers im Status »Gespräch vereinbart«, wenn Marco in der Akte »An SAP übergeben« klickt, dann zeigt S7 drei Zeilen: Account (Interessent) aus der Firma Nordwerk Fördertechnik GmbH, Kontaktperson aus der Ansprechpartnerin, Lead mit Notiz aus Anlass, Hypothese und Verlauf mit der Quelle »CX Lead Cockpit«.
2. Die Vorschau sagt, ob in SAP ein Account gleichen Namens gefunden wurde: bei Treffer »wird verknüpft«, sonst »wird neu angelegt«.
3. Gegeben Simone Gruber im Status »Freigegeben«, dann ist »An SAP übergeben« gesperrt und ein Hinweis nennt die Bedingung.
4. Gegeben ein Kontakt im Status »Antwort erhalten (neutral/später)«, dann ist die Übergabe ebenfalls gesperrt; bei »Antwort erhalten (positiv)« ist sie möglich.
5. Gegeben kein Kontakt ist gewählt, wenn Marco S7 öffnet, dann steht die Liste »Bereit zur Übergabe« da, im Beispielbestand mit Albers.
6. »Abbrechen« führt zurück zur Akte, ohne etwas zu ändern.

**Nicht enthalten:** das Anlegen selbst (E7-S3).

### E7-S3 – Übergabe ausführen

**Als** Marco **möchte ich** die Übergabe bestätigen, **damit** Account, Kontaktperson und Lead in SAP existieren und der Kontakt im Cockpit abgeschlossen ist.

- **Art:** Fachlich
- **Bezug:** A5 Schritt 2–3 und Ergebnis · Feldzuordnung SAP · Abschnitt 11 (SAP) · Objekt SAP-Übergabe
- **Größe:** groß
- **Abhängig von:** E7-S2

**Akzeptanzkriterien**
1. Gegeben Albers und kein bestehender Account in SAP, wenn Marco bestätigt, dann existieren in SAP ein Account »Nordwerk Fördertechnik GmbH«, eine Kontaktperson »Dr. Katrin Albers« an diesem Account und ein Lead, dessen Notiz Anlass, Hypothese und Verlauf enthält und dessen Quelle »CX Lead Cockpit« ist.
2. S7 zeigt das Ergebnis je Objekt: »Account angelegt«, »Ansprechpartner angelegt«, »Lead angelegt«, jeweils mit der SAP-ID.
3. Der Status des Kontakts steht auf »An SAP übergeben«; Akte und Firma zeigen die SAP-IDs.
4. Gegeben für dieselbe Firma wird später ein zweiter Kontakt übergeben, dann entsteht kein zweiter Account; das Ergebnis lautet »Account verknüpft«.
5. Gegeben in SAP existiert bereits ein Account gleichen Namens, dann wird dieser verknüpft und nicht neu angelegt.
6. Der übergebene Kontakt bleibt im Cockpit lesbar; Ansprache, Nachfassen und erneute Übergabe werden nicht mehr angeboten.

**Nicht enthalten:** Opportunities, Angebote, Rückfluss von Änderungen aus SAP.

### E7-S4 – Fehlerfall und Protokoll der Übergabe

**Als** Marco **möchte ich** bei einem Fehler die Meldung sehen und die Übergabe wiederholen können, **damit** kein Kontakt fälschlich als übergeben gilt.

- **Art:** Fachlich
- **Bezug:** A5 Ausnahme · Abschnitt 11 (SAP-Aufrufe erscheinen nicht im Nachrichtenmonitor, eigenes Protokoll) · S7
- **Größe:** mittel
- **Abhängig von:** E7-S3

**Akzeptanzkriterien**
1. Gegeben SAP lehnt das Anlegen ab, zum Beispiel mit »Pflichtfeld Land fehlt«, dann bleibt der Status des Kontakts unverändert, S7 zeigt die Meldung und im Protokoll steht »Fehler: Pflichtfeld »Land« fehlt – nichts angelegt« mit Zeitpunkt.
2. Wenn Marco »Erneut versuchen« klickt und SAP annimmt, dann steht ein zweiter Protokolleintrag »Account angelegt, Ansprechpartner angelegt, Lead angelegt« da und der Status wechselt auf »An SAP übergeben«.
3. Gegeben der Account wurde angelegt, das Anlegen des Leads scheitert aber, dann nennt das Protokoll je Objekt das Ergebnis, der Kontakt gilt nicht als übergeben und ein erneuter Versuch legt den Account nicht doppelt an.
4. Das Protokoll auf S7 zeigt alle Versuche mit Zeitpunkt, Kontakt, Firma und Ergebnis, den neuesten zuerst.
5. Gegeben SAP ist nicht erreichbar, dann sagt die Meldung das ausdrücklich und es wird nichts als übergeben markiert.

**Nicht enthalten:** automatische Wiederholung ohne Marcos Zutun.

## Epic E8 – Agent steuern

Ziel: Marco bestimmt Takt, Menge und Zielbild im Cockpit und sieht, was der Agent getan hat.

### E8-S1 – Rechercheprofil ansehen und ändern

**Als** Marco **möchte ich** Lauftage, Anzahl und Zielbild des Agenten im Cockpit einstellen, **damit** ich dafür keinen Prompt anfassen muss.

- **Art:** Fachlich
- **Bezug:** A7 Schritt 1–2 · S9 · Objekt Rechercheprofil · F10
- **Größe:** mittel
- **Abhängig von:** E1-S1

**Akzeptanzkriterien**
1. Wenn Marco S9 zum ersten Mal öffnet, dann steht das Profil »DACH Kernbranchen« da: aktiv, Lauftage Montag und Donnerstag, 10 Vorschläge je Lauf, acht Branchen, Länder Deutschland, Österreich, Schweiz, Mindestumsatz 50 Mio. EUR, acht Rollen, Obergrenze 20.
2. Die Uhrzeit steht als »6:30 Uhr« da und lässt sich nicht ändern.
3. Gegeben heute ist Mittwoch, 18.11.2026, dann nennt S9 als nächsten Lauf »Donnerstag, 19.11.2026, 6:30 Uhr«.
4. Wenn Marco am 19.11.2026 nach dem Lauf zusätzlich Mittwoch als Lauftag wählt, die Anzahl auf 6 setzt und speichert, dann nennt S9 sofort »Montag, 23.11.2026« als nächsten Lauf und der Laufauftrag liefert ab dann Anzahl 6.
5. Änderungen ohne »Speichern« wirken sich nicht auf den Laufauftrag aus.
6. Wenn Marco eine Branche abwählt und speichert, dann fehlt sie im nächsten Laufauftrag.

**Nicht enthalten:** mehrere Profile, Regeltext des Agenten bearbeiten, Uhrzeit einstellen (Später).

### E8-S2 – Agent pausieren und aktivieren

**Als** Marco **möchte ich** den Agenten mit einem Klick pausieren, **damit** keine Vorschläge kommen, wenn ich keine brauche.

- **Art:** Fachlich
- **Bezug:** A7 Schritt 4 · S9, S1
- **Größe:** klein
- **Abhängig von:** E8-S1

**Akzeptanzkriterien**
1. Wenn Marco auf S9 »Pausieren« klickt, dann zeigt S9 »Pausiert« und statt eines Datums »Kein Lauf, solange der Agent pausiert ist«.
2. Solange pausiert ist, entsteht an keinem Lauftag ein Lauf.
3. Wenn Marco »Aktivieren« klickt, dann zeigt S9 wieder »Aktiv« und den nächsten Lauf nach den Lauftagen.
4. Das Dashboard S1 zeigt denselben Zustand des Agenten wie S9.

**Nicht enthalten:** zeitlich begrenzte Pausen; dafür gibt es Sperrzeiten (E8-S3).

### E8-S3 – Sperrzeiten

**Als** Marco **möchte ich** Urlaub und andere Sperrzeiten eintragen, **damit** der Agent in dieser Zeit nicht läuft.

- **Art:** Fachlich
- **Bezug:** A7 Schritt 3 · S9 · Objekt Sperrzeit
- **Größe:** klein
- **Abhängig von:** E8-S1

**Akzeptanzkriterien**
1. Gegeben der Beispielbestand, dann stehen auf S9 nach Datum geordnet »Webinartag 24.11.2026«, »Weihnachtsurlaub 21.12.2026–03.01.2027« und »Skiurlaub 15.02.–19.02.2027«.
2. Wenn Marco die Sperrzeit »Kundentermine« vom 23.11. bis 27.11.2026 anlegt, dann nennt S9 als nächsten Lauf »Montag, 30.11.2026, 6:30 Uhr« (bei Lauftagen Montag und Donnerstag, heute 19.11.2026 nach dem Lauf).
3. Gegeben »Bis« liegt vor »Von« oder die Bezeichnung fehlt, dann legt das Cockpit nichts an und sagt, was fehlt.
4. Wenn Marco eine Sperrzeit löscht, dann rechnet S9 den nächsten Lauf sofort neu.

**Nicht enthalten:** Feiertagskalender.

### E8-S4 – Zusatzlauf anfordern

**Als** Marco **möchte ich** außer der Reihe einen Lauf anfordern, **damit** ich bei Bedarf schneller Nachschub bekomme.

- **Art:** Fachlich
- **Bezug:** A7 Schritt 5 · Regel Laufentscheidung (Zusatzlauf, Sperrzeit) · S9
- **Größe:** klein
- **Abhängig von:** E2-S1

**Akzeptanzkriterien**
1. Gegeben heute ist Donnerstag, 19.11.2026, nach dem Lauf, wenn Marco »Zusatzlauf anfordern« klickt, dann nennt S9 »Freitag, 20.11.2026, 6:30 Uhr (Zusatzlauf)« und der Laufauftrag am 20.11. lautet »Heute laufen«, obwohl Freitag kein Lauftag ist.
2. Nach dem ausgeführten Zusatzlauf gilt wieder der normale Takt.
3. Gegeben der nächste Werktag liegt in einer Sperrzeit, dann wartet der Zusatzlauf bis zum ersten Werktag danach.
4. Solange ein Zusatzlauf vorgemerkt ist oder der Agent pausiert ist, lässt sich kein weiterer anfordern.

**Nicht enthalten:** sofortiger Start; der Agent läuft erst zur nächsten festen Uhrzeit.

### E8-S5 – Obergrenze setzt Läufe aus

**Als** Marco **möchte ich**, dass der Agent aussetzt, wenn zu viele Vorschläge ungeprüft sind, **damit** sich kein Berg aufstaut.

- **Art:** Fachlich
- **Bezug:** A7 Ausnahme · Regel Laufentscheidung (Obergrenze) · S1, S9
- **Größe:** klein
- **Abhängig von:** E2-S1, E3-S1

**Akzeptanzkriterien**
1. Gegeben die Obergrenze 20 und 20 ungeprüfte Vorschläge im Eingangskorb, wenn der Agent an einem Lauftag abfragt, dann lautet die Antwort »Heute nicht« mit dem Grund »Obergrenze ungeprüfter Vorschläge erreicht«.
2. Gegeben 19 ungeprüfte Vorschläge, dann lautet die Antwort »Heute laufen«.
3. Solange die Obergrenze erreicht ist, zeigen S1 und S9 einen Hinweis mit der Zahl der ungeprüften Vorschläge und der Obergrenze; S9 nennt statt eines Datums, dass der Agent aussetzt.
4. Wenn Marco so viele Vorschläge prüft, dass weniger als 20 offen sind, dann verschwindet der Hinweis und S9 nennt wieder den nächsten Lauf.

**Nicht enthalten:** Benachrichtigung außerhalb des Cockpits.

### E8-S6 – Laufprotokoll und nächster Lauf

**Als** Marco **möchte ich** sehen, wann der Agent gelaufen ist, was er geliefert hat und warum ein Lauf entfiel, **damit** ich seiner Arbeit trauen kann.

- **Art:** Fachlich
- **Bezug:** A1 Schritt 1 (sichtbar im Laufprotokoll) · A7 Schritt 1 · Regel Laufentscheidung (Protokoll) · S9 · Objekt Recherchelauf
- **Größe:** mittel
- **Abhängig von:** E2-S1, E2-S3

**Akzeptanzkriterien**
1. Gegeben der Beispielbestand am 18.11.2026, dann zeigt das Protokoll: 19.11.2026 Geplant; 16.11.2026 Ausgeführt, 10 Vorschläge, 7 freigegeben, »2 Profile ohne verifizierte URL«; 12.11.2026 Ausgeführt, 8, 6, »Nur 8 belegte Treffer, Lücke benannt«; 09.11.2026 Ausgeführt, 10, 8; 05.11.2026 »Übersprungen: pausiert«.
2. Gegeben der Lauftag Montag, 21.12.2026, liegt in der Sperrzeit »Weihnachtsurlaub«, dann steht nach diesem Tag »Übersprungen: Sperrzeit Weihnachtsurlaub« im Protokoll.
3. Gegeben Freitag, 20.11.2026, ist kein Lauftag und kein Zusatzlauf ist vorgemerkt, dann entsteht für diesen Tag kein Protokolleintrag.
4. Ein ausgeführter Lauf lässt sich aus dem Protokoll heraus im Eingangskorb S2 öffnen.
5. Die Zahl »freigegeben« eines Laufs steigt, wenn Marco einen seiner Vorschläge freigibt.

**Nicht enthalten:** Protokoll der einzelnen Rechercheschritte des Agenten.

## Epic E9 – Wirkung prüfen

Ziel: Marco sieht morgens, was zu tun ist, und im Rückblick, was wirkt.

### E9-S1 – Dashboard »Heute«

**Als** Marco **möchte ich** beim Öffnen sehen, was heute ansteht, **damit** ich in 10 bis 20 Minuten durch bin.

- **Art:** Fachlich
- **Bezug:** S1 (»Heute«) · A2 Auslöser · A3 Auslöser · A4 Auslöser
- **Größe:** mittel
- **Abhängig von:** E3-S1, E5-S1, E6-S3, E8-S6

**Akzeptanzkriterien**
1. Gegeben ein Lauf vom 19.11.2026 mit vier ungeprüften Vorschlägen, dann zeigt S1 »1 neuer Recherchelauf« mit Datum und Zahl; ein Klick öffnet diesen Lauf auf S2.
2. Gegeben der Beispielbestand, dann zeigt S1 unter »Freigegeben, noch nicht angeschrieben« Simone Gruber, Alpenstrom Netze AG; ein Klick öffnet sie in der Ansprache S5.
3. Gegeben heute ist der 18.11.2026, dann sagt S1, dass heute nichts fällig ist und die nächste Wiedervorlage am 23.11.2026 ansteht; am 24.11.2026 stehen Reinhardt als »überfällig« sowie Bernasconi und Albers als »heute« da.
4. S1 zeigt den Zustand des Agenten (aktiv, pausiert, Sperrzeit mit Bezeichnung oder ausgesetzt) und den nächsten Lauf.
5. Gegeben es gibt keinen neuen Lauf und keinen freigegebenen Kontakt, dann sagen die Bereiche das ausdrücklich, statt leer zu bleiben.

**Nicht enthalten:** Kennzahlen (E9-S2).

### E9-S2 – Kennzahlen

**Als** Marco **möchte ich** Trichter und Quoten für einen Zeitraum sehen, **damit** ich weiß, ob meine Ansprache wirkt.

- **Art:** Fachlich
- **Bezug:** A6 Schritt 1 · Regel Kennzahlen (Berechnung, Bezugsgrößen, Schwelle 20, Standardzeitraum) · Abschnitt 12 (Erfolg) · S1
- **Größe:** groß
- **Abhängig von:** E5-S3, E6-S1, E6-S2, E7-S3, E8-S6

**Akzeptanzkriterien**
1. Gegeben der Beispielbestand am 18.11.2026 und der Standardzeitraum »Letzte 30 Tage«, dann zeigt S1: 28 Vorschläge, 21 freigegeben, 6 angeschrieben, 3 Antworten, 1 positive Antwort, 1 vereinbartes Gespräch, 0 SAP-Übergaben, Zeit bis Antwort 3 Tage (Median).
2. Gegeben weniger als 20 angeschriebene Kontakte im Zeitraum, dann stehen nur absolute Zahlen da und ein Hinweis nennt die Schwelle und die aktuelle Zahl.
3. Gegeben 64 angeschriebene Kontakte mit 17 Antworten im Zeitraum, dann steht bei den Antworten zusätzlich die Antwortquote 27 %.
4. »Vorschläge« und »Freigegeben« zählen die Läufe im Zeitraum; alle anderen Kennzahlen zählen Kontakte, deren Erstkontakt im Zeitraum liegt.
5. Wenn Marco den Zeitraum auf »Letzte 7 Tage« stellt, dann zählt als angeschrieben nur Reinhardt (Erstkontakt 12.11.2026); Hollenstein (10.11.2026) liegt außerhalb. Die Zahl lautet 1.
6. Ein geschlossener Kontakt wie Ostermann zählt weiter als angeschrieben, solange sein Erstkontakt im Zeitraum liegt.
7. S1 nennt die Zahl der heute überfälligen Wiedervorlagen.

**Nicht enthalten:** Zielwerte; sie werden nach dem ersten Monat gesetzt.

### E9-S3 – Aufschlüsselung

**Als** Marco **möchte ich** die Kennzahlen nach Merkmalen aufschlüsseln und die Kontakte dahinter öffnen, **damit** ich sehe, welche Zielgruppen, Kanäle und Aufhänger Antworten bringen.

- **Art:** Fachlich
- **Bezug:** A6 Schritt 2 · Regel Kennzahlen (Aufschlüsselung) · S1, S4
- **Größe:** mittel
- **Abhängig von:** E9-S2, E4-S2

**Akzeptanzkriterien**
1. Zur Wahl stehen Branche, Land, Rolle, Kanal, E-Mail-Grundlage und Art des Aufhängers.
2. Gegeben der Beispielbestand und »Letzte 30 Tage«, wenn Marco »Kanal« wählt, dann stehen zwei Zeilen da: LinkedIn mit 4 angeschrieben, 2 Antworten, 1 Gespräch und E-Mail mit 2 angeschrieben, 1 Antwort, 0 Gesprächen.
3. Wenn Marco »Branche« wählt, dann steht bei Retail 2 angeschrieben, 1 Antwort, 0 Gespräche.
4. Wenn Marco die Zeile »E-Mail« anklickt, dann öffnet sich S4 mit Reinhardt und Hollenstein und einem sichtbaren Filter »Kanal: E-Mail«, der sich aufheben lässt.
5. Gegeben im Zeitraum wurde niemand angeschrieben, dann sagt die Tabelle das.

**Nicht enthalten:** Auswertung einzelner Formulierungen (Später).

## Epic E10 – Einstellungen und Schnittstelle

Ziel: Sperrregeln, Zugänge und Datenabfluss sind an einer Stelle geregelt.

### E10-S1 – Sperrliste verwalten

**Als** Marco **möchte ich** die Sperrliste sehen und pflegen, **damit** bestimmte Firmen und Personen nie vorgeschlagen werden.

- **Art:** Fachlich
- **Bezug:** S8 (Sperrliste) · F8 · Objekt Sperreintrag
- **Größe:** klein
- **Abhängig von:** E1-S1

**Akzeptanzkriterien**
1. Beim ersten Öffnen stehen fünf Firmen als Startbestand da: Windmöller & Hölscher, BOBST, Haberkorn, HORNBACH, Energie Steiermark, jeweils mit dem Grund »In früherer Ausgabe genannt«.
2. Wenn Marco einen Eintrag mit Name, Art (Firma oder Person) und Grund hinzufügt, dann steht er mit dem heutigen Datum in der Liste.
3. Gegeben ein leerer Name, dann legt das Cockpit nichts an und verlangt den Namen.
4. Wenn Marco einen Eintrag entfernt, dann fehlt er in der Liste und in der Ausschlussliste des Agenten.
5. Jeder Eintrag zeigt Art, Grund und seit wann er gilt.

**Nicht enthalten:** die Auslöser, die Einträge automatisch erzeugen (E3-S4, E4-S4, E6-S1).

### E10-S2 – API-Schlüssel des Agenten erneuern

**Als** Marco **möchte ich** den Schlüssel des Agenten erneuern können, **damit** ich den Zugang bei Bedarf sofort entziehe.

- **Art:** Fachlich
- **Bezug:** S8 (API-Schlüssel) · Abschnitt 3 (Rechte des Agenten) · F9
- **Größe:** klein
- **Abhängig von:** E1-S1

**Akzeptanzkriterien**
1. S8 zeigt den Schlüssel nur verkürzt, zum Beispiel mit den letzten vier Zeichen.
2. Wenn Marco »Schlüssel erneuern« klickt, dann zeigt das Cockpit den neuen Schlüssel einmal vollständig zum Kopieren und danach nur noch verkürzt.
3. Ein API-Aufruf mit dem alten Schlüssel wird ab diesem Moment abgelehnt.
4. Ein API-Aufruf mit dem neuen Schlüssel wird angenommen.

**Nicht enthalten:** mehrere Schlüssel für verschiedene Anwendungen.

### E10-S3 – Fristen und Signatur in den Einstellungen

**Als** Marco **möchte ich** die geltenden Fristen sehen und meine E-Mail-Signatur pflegen, **damit** ich weiß, wonach das Cockpit rechnet, und meine E-Mails richtig enden.

- **Art:** Fachlich
- **Bezug:** S8 (Fristen, E-Mail-Signatur) · Regeln Status (Fristen) · Regel Kanalwahl (Signatur)
- **Größe:** klein
- **Abhängig von:** E1-S1

**Akzeptanzkriterien**
1. S8 zeigt die Fristen: Wiedervorlage 7 Werktage nach Erstkontakt, höchstens eine Nachfass-Nachricht, Vorschlag »Ohne Antwort schließen« 21 Tage nach Erstkontakt, 6 Monate Sperre nach dem Schließen.
2. Die Signatur ist mit »Beste Grüße / Marco Messinger / Director Customer Experience & Innovation / Nagarro« vorbelegt.
3. Wenn Marco die Signatur ändert, dann endet die nächste erzeugte E-Mail-Fassung mit dem neuen Text; bereits erzeugte Fassungen bleiben unverändert.

**Nicht enthalten:** Ändern der Fristen.

### E10-S4 – CSV-Export der Kontakte

**Als** Marco **möchte ich** meine Kontakte als CSV exportieren, **damit** ich sie außerhalb des Cockpits auswerten kann.

- **Art:** Fachlich
- **Bezug:** S8 (Export) · Regel Daten (CSV-Spalten) · F9
- **Größe:** klein
- **Abhängig von:** E4-S2

**Akzeptanzkriterien**
1. Wenn Marco auf S8 »CSV-Export« wählt, dann erhält er eine Datei mit einer Kopfzeile und je einer Zeile pro Kontakt, im Beispielbestand sieben.
2. Die Spalten sind Name, Funktion, Firma, Branche, Land, Status.
3. Die Zeile für Albers lautet »Dr. Katrin Albers; Leiterin Customer Service & After-Sales; Nordwerk Fördertechnik GmbH; Maschinenbau; DE; Gespräch vereinbart«.
4. Umlaute und das Zeichen & kommen in Excel richtig an.

**Nicht enthalten:** Export von Verlauf und Nachrichten.

### E10-S5 – Bestand und Kennzahlen per API lesen

**Als** Marco **möchte ich**, dass Firmen, Kontakte und Kennzahlen auch über die API lesbar sind, **damit** spätere Anbindungen ohne Umbau möglich sind.

- **Art:** Fachlich
- **Bezug:** F9 · Abschnitt 11 (Schnittstelle des Cockpits, Entwurf)
- **Größe:** mittel
- **Abhängig von:** E1-S1, E4-S2, E9-S2

**Akzeptanzkriterien**
1. Gegeben ein gültiger Schlüssel, wenn die Kontakte mit dem Filter Status »Angeschrieben« abgefragt werden, dann enthält die Antwort im Beispielbestand genau Tobias Reinhardt mit Firma, Funktion und Status.
2. Wenn die Firmen abgefragt werden, dann enthält die Antwort die sieben Beispielfirmen mit Branche, Land und Umsatzangaben.
3. Wenn die Kennzahlen für die letzten 30 Tage abgefragt werden, dann stimmen die Werte mit dem Dashboard überein (28, 21, 6, 3, 1, 1, 0).
4. Ohne gültigen Schlüssel liefert keiner dieser Aufrufe Daten.
5. Diese Aufrufe ändern nichts am Bestand.

**Nicht enthalten:** Claude-Connector (MCP), HubSpot-Anbindung (Später). Den genauen Zuschnitt der Aufrufe legt die Architektur-Stufe fest.

## Abdeckung

| Quelle im Konzept | Abgedeckt durch |
|---|---|
| A1 Schritt 1–2 Laufauftrag, »Heute nicht« | E2-S1, E2-S6 |
| A1 Schritt 3 Ausschlussliste | E2-S2 |
| A1 Schritt 4 Recherche nach Zielbild | E2-S6 |
| A1 Schritt 5 Lauf anlegen, Dubletten, Pflichtfelder | E2-S3, E2-S4 |
| A1 Ausnahme weniger Treffer | E2-S3 |
| A1 Ausnahme API nicht erreichbar | E2-S5, E1-S3 |
| A2 Schritt 1 Lauf öffnen | E3-S1, E9-S1 |
| A2 Schritt 2 Quellen prüfen | E3-S2 |
| A2 Schritt 3 Freigeben | E3-S3 |
| A2 Schritt 4 Verwerfen | E3-S4 |
| A3 Schritt 1–2 Ansicht, Text anpassen | E5-S1 |
| A3 Schritt 3 LinkedIn | E5-S2 |
| A3 Schritt 4 E-Mail-Fassung | E5-S4 |
| A3 Schritt 5 Grundlage, Entwurf | E5-S5 |
| A3 Schritt 6 Als gesendet markieren | E5-S3, E5-S5 |
| A3 Ausnahme keine Adresse | E5-S5 |
| A4 Schritt 1 Verlauf | E4-S3 |
| A4 Schritt 2 Antwort erfassen | E6-S1 |
| A4 Schritt 3 Gespräch | E6-S2 |
| A4 Schritt 4 Nachfassen | E6-S4 |
| A4 Schritt 5 Schließen | E6-S5 |
| A4 Ausnahme Opt-out | E6-S1 |
| A5 Schritt 1 Vorschau | E7-S2 |
| A5 Schritt 2–3 Anlegen, Ergebnis | E7-S3 |
| A5 Ausnahme SAP-Fehler | E7-S4 |
| A6 Schritt 1 Trichter und Quoten | E9-S2 |
| A6 Schritt 2 Aufschlüsselung | E9-S3 |
| A7 Schritt 1–2 Profil | E8-S1, E8-S6 |
| A7 Schritt 3 Sperrzeit | E8-S3 |
| A7 Schritt 4 Pausieren | E8-S2 |
| A7 Schritt 5 Zusatzlauf | E8-S4 |
| A7 Ausnahme Obergrenze | E8-S5 |
| Screen S1 | E9-S1, E9-S2, E9-S3 |
| Screen S2 | E3-S1 bis E3-S4, E2-S5 |
| Screen S3 | E4-S1, E4-S4 |
| Screen S4 | E4-S2, E4-S3, E4-S4, E6-S1, E6-S2 |
| Screen S5 | E5-S1 bis E5-S5, E6-S4 |
| Screen S6 | E6-S3, E6-S4, E6-S5 |
| Screen S7 | E7-S2, E7-S3, E7-S4 |
| Screen S8 | E10-S1 bis E10-S4, E7-S1 |
| Screen S9 | E8-S1 bis E8-S6 |
| Regel: »Angeschrieben« nur durch Markieren | E5-S3 |
| Regel: 7 Werktage, ein Nachfassen, 21 Tage | E5-S3, E6-S4, E6-S5, E10-S3 |
| Regel: Schließen heißt nicht löschen, Wieder öffnen | E6-S5, E4-S2 |
| Regel: 6 Monate Sperre, Wiederansprache | E2-S2, E2-S4, E3-S3 |
| Regel: neutral/später, Kein Interesse, Opt-out | E6-S1, E2-S2 |
| Regel: Verwerfen sperrt Firma oder Person | E3-S4, E2-S2 |
| Regel: Übergabe nur ab positiver Antwort oder Gespräch | E7-S2 |
| Regeln Kanalwahl | E5-S1, E5-S4, E5-S5, E6-S4 |
| Regel Laufentscheidung | E2-S1, E8-S4, E8-S5, E8-S6 |
| Regel Dublettenprüfung | E2-S4 |
| Regel Pflichtangaben für die Freigabe | E3-S2 |
| Regel Kennzahlen | E9-S2, E9-S3 |
| Regel Daten: Herkunft, keine automatische Löschung, Löschen von Hand, CSV | E3-S2, E4-S4, E10-S4 |
| Feldzuordnung SAP | E7-S2, E7-S3 |
| Rollen und Rechte (Abschnitt 3) | E1-S1, E2-S3, E10-S2 |
| Grundgerüst, Startdaten, Befehle (architektur.md) | E1-S0 |
| Vorführdatum, Zurücksetzen, Vorführleiste (architektur.md Abschnitt 6) | E1-S2 |
| Agenten-Simulator (architektur.md Abschnitt 6) | E1-S3, E2-S6 |
| Anbindung SAP Sales Cloud V2 | E7-S1, E7-S3, E7-S4 |
| Anbindung Claude (geplante Aufgabe) | E2-S6 |
| Anbindung Mailprogramm (Link) | E5-S5 |
| LinkedIn / Sales Navigator (keine Schnittstelle, Handarbeit) | E5-S2 |
| HubSpot (keine Verbindung im ersten Wurf) | E5-S5 (Grundlage von Hand) |
| Schnittstelle des Cockpits (F9) | E2-S1, E2-S2, E2-S3, E10-S2, E10-S5 |
| Messung für Abschnitt 12 | E5-S3, E6-S1, E7-S4, E8-S6, E9-S2 |
| Rahmenbedingung Datenschutz und Recht | offen, siehe Fragen an das Konzept |

## Fragen an das Konzept

| Stelle | Frage oder Widerspruch | Vorschlag |
|---|---|---|
| Clickdummy | Der freigegebene Dummy weicht in fünf Punkten vom Konzept 1.2 ab: Er protokolliert lauffreie Tage, erzeugt den Schließen-Vorschlag nur nach dem Nachfassen, hat keine Aktion »Löschen«, zeigt bei CHF keinen Gegenwert in EUR und kennt die Freigabe einer Wiederansprache nicht. Die Stories folgen dem Konzept | Dummy so belassen oder auf Wunsch nachziehen; für die Umsetzung gilt das Konzept |
| Abschnitt 6, A1 | Format der Ergebnisdatei und der Lauf-Daten ist nicht festgelegt | In der Architektur-Stufe festlegen; Upload und API nutzen dasselbe Format |
| Abschnitt 11, Recht | E-Mail und InMail als Erstkontakt sowie »in HubSpot bekannt« als Grundlage sind von Nagarro Legal nicht bestätigt. E5-S5 baut die Auswahl trotzdem | Vor dem Echtbetrieb klären; bei Nein den Kanal E-Mail abschaltbar machen |
| Abschnitt 11, Datenschutz | Speicherung ohne Löschfrist ist mit dem Datenschutz nicht geklärt. E4-S4 schreibt »keine automatische Löschung« fest | Vor dem Echtbetrieb klären; eine spätere Löschfrist wäre eine neue Story |
| Abschnitt 11, Technik | Anmeldeverfahren und Betrieb sind offen. E1-S1 beschreibt nur das Ergebnis | In der Architektur-Stufe festlegen |

## Später

- HubSpot anbinden: lesender Abgleich, danach Kontaktversuche zurückschreiben und Sequenzen
- E-Mail-Fassung vom Agenten eigens formulieren lassen
- Uhrzeit des Laufs im Cockpit einstellen; Cockpit startet den Agenten über die Claude-API
- Outlook-Entwürfe direkt anlegen
- Mehrere Rechercheprofile nebeneinander
- Regeltext des Agenten im Cockpit bearbeiten
- App als Claude-Connector (MCP)
- Mehrere Nutzer mit Team-Kennzahlen
- Bedienung am Handy
- Auswertung der Aufhänger und Formulierungen als Rückkanal an den Agenten
