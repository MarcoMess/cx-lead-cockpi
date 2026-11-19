# CX Lead Cockpit – Konzept

Version: 1.3 · Datum: 19.11.2026 · Status: Freigegeben (Konzept 1.0 und Clickdummy von Marco freigegeben am 18.11.2026; 1.1 und 1.2 übernehmen die Ergebnisse aus Clickdummy und Stories; 1.3 übernimmt Marcos Entscheidung zum Weg des Agenten vom 19.11.2026)

Lesehilfe: Unmarkierte Aussagen hat Marco bestätigt oder sie stammen aus seinem Agenten-Prompt. `[Annahme]` = Vorschlag, noch nicht bestätigt. `[Offen]` = Lücke.

## 1. Die Idee in einem Satz

Ein eigenes, persönliches »Pre-CRM« für Marcos CX-Vertrieb: Ein Recherche-Agent, den Marco im Cockpit selbst einstellt, liefert belegte DACH-Zielkontakte samt individueller Ansprache in eine schlanke App, die Firmen, Ansprechpartner, Kontaktversuche per LinkedIn und E-Mail sowie Antworten nachhält, Kennzahlen zeigt und einen Kontakt ab einer Antwort per Knopfdruck an die SAP Sales Cloud V2 übergibt.

## 2. Problem und Anlass

- Marco lässt heute einen Agenten per Prompt 10 B2B-Zielkontakte je Lauf recherchieren, inklusive Aufhänger, Betreff und LinkedIn-Nachricht. Die Ergebnisse stehen danach nur im Chatverlauf.
- Die Dublettenprüfung ist dadurch schwach: Der Prompt muss bereits genannte Firmen von Hand ausschließen (Windmöller & Hölscher, BOBST, Haberkorn, HORNBACH, Energie Steiermark) und selbst einräumen, wenn die Historie nicht zugänglich ist.
- Zielbild, Menge und Takt stehen fest im Prompt. Wer Branche, Anzahl oder Rhythmus ändern oder im Urlaub pausieren will, muss den Prompt umschreiben.
- Es gibt keinen Ort, der festhält, wem wann was geschrieben wurde, wer geantwortet hat und wo nachgefasst werden muss.
- Viele Zielkontakte sind bereits in HubSpot bekannt; dort ist eine Ansprache per E-Mail oft in Ordnung. Ob das im Einzelfall zutrifft, prüft Marco von Hand.
- Erfolg lässt sich nicht messen. Der Prompt verlangt ausdrücklich, keine Erfolgsquoten ohne Daten zu erfinden – die Daten dafür entstehen heute aber nirgends.
- Recherchierte, noch unqualifizierte Kontakte gehören nicht ins Unternehmens-CRM. Erst mit Antwort oder Gesprächstermin sollen sie in die SAP Sales Cloud V2 – ohne Abtippen.

## 3. Nutzer und Rollen

| Rolle | Ziel | Nutzt es wie oft und wo | Darf |
|---|---|---|---|
| Marco (Inhaber) | Passende Kontakte ansprechen, nichts doppelt, nichts vergessen, Wirkung sehen, den Agenten selbst steuern | Täglich 10–20 Minuten am Desktop `[Annahme]` | Alles: Agent einstellen, prüfen, freigeben, Versand protokollieren, Antworten erfassen, an SAP übergeben, Einstellungen |
| Recherche-Agent (technische Rolle) | Neue belegte Zielkontakte nach Marcos Rechercheprofil liefern, ohne Wiederholungen | So oft, wie das Rechercheprofil im Cockpit es vorgibt | Nur über die API: Laufauftrag und Ausschlussliste lesen, Recherchelauf anlegen. Darf nichts senden, nichts freigeben, nichts löschen |

Erster Wurf ist ein Ein-Nutzer-System am Desktop. Jeder Datensatz trägt trotzdem einen Besitzer, damit später Kollegen dazukommen können.

## 4. Nutzenversprechen

- Kein Unternehmen und keine Person wird versehentlich doppelt angeschrieben.
- Marco stellt Takt, Menge und Zielbild des Agenten selbst ein und kann ihn pausieren, ohne einen Prompt anzufassen.
- Jeder Kontaktversuch ist mit zwei Klicks dokumentiert (Text kopieren, »Als gesendet markieren«).
- Bei jeder E-Mail ist festgehalten, auf welcher von Marco geprüften Grundlage sie verschickt wurde.
- Fällige Nachfassaktionen stehen jeden Morgen auf einer Liste.
- Antwortquote, Gesprächsquote und SAP-Übergaben sind jederzeit sichtbar – nach Branche, Land, Rolle, Kanal und Art des Aufhängers.
- Übergabe an die SAP Sales Cloud V2 ohne erneutes Eintippen.

## 5. Umfang

### Erster Wurf

| Nr. | Kernfunktion |
|---|---|
| F1 | Recherchelauf des Agenten per API annehmen, mit automatischer Dublettenprüfung |
| F2 | Eingangskorb: Vorschläge prüfen, freigeben oder verwerfen (mit Grund) |
| F3 | Firmen und Ansprechpartner führen, inkl. Umsatz mit Jahr/Währung/Bezug und Quellen |
| F4 | Ansprache halbautomatisch über zwei Kanäle: LinkedIn (Text kopieren, Profil öffnen) und E-Mail (Fassung auf Knopfdruck, Grundlage von Hand prüfen, Entwurf im Mailprogramm öffnen); Versand von Hand, danach protokollieren |
| F5 | Antworten erfassen, Status führen, Wiedervorlagen; schließen statt löschen |
| F6 | Kennzahlen-Dashboard |
| F7 | Übergabe an SAP Sales Cloud V2 per Knopfdruck ab Antwort |
| F8 | Sperrliste (Firmen und Personen, inkl. Opt-out) |
| F9 | REST-API für Agent, Export und spätere Anbindungen |
| F10 | Agent-Steuerung: Lauftage, Anzahl je Lauf, Branchen, Länder, Umsatzschwelle, Rollen; Pause und Sperrzeiten (Urlaub) |

### Später

- HubSpot anbinden: zuerst lesender Abgleich (bekannt ja/nein, Besitzer, Abmeldestatus), danach Kontaktversuche zurückschreiben und Sequenzen.
- E-Mail-Fassung vom Agenten eigens formulieren lassen, statt sie aus der LinkedIn-Fassung abzuleiten.
- Uhrzeit des Laufs im Cockpit einstellen; dafür startet das Cockpit den Agenten selbst über die Claude-API.
- Outlook-Entwürfe direkt anlegen (Microsoft Graph oder Claude-Connector), sobald die IT das freigibt.
- Mehrere Rechercheprofile nebeneinander (z. B. je Branche eigener Takt).
- Regeltext des Agenten (Tonalität, Nachrichtenlänge, Qualitätsprüfung) im Cockpit bearbeiten.
- App als Claude-Connector (MCP), damit Claude im Chat Fragen zum Bestand beantworten kann.
- Mehrere Nutzer mit Team-Kennzahlen.
- Bedienung am Handy.
- Auswertung, welche Aufhänger und Formulierungen Antworten bringen, als Rückkanal an den Agenten.

### Ergänzung 1.3: Echtbetrieb

- Neben dem Vorführbestand gibt es einen Echtbestand: eigene Datenbank ohne Beispieldaten, nur mit dem Startbestand der Sperrliste und dem Rechercheprofil; echtes Datum, keine Vorführleiste. Ein eigener Befehl startet das Cockpit im Echtbetrieb. Echte Kontaktdaten liegen nur in dieser Datenbank auf Marcos Rechner, nie im Repository.

### Bewusst nicht

- Kein automatisches Senden, Vernetzen oder Auslesen auf LinkedIn / Sales Navigator.
- Kein automatischer E-Mail-Versand, kein Massenmailing, keine Newsletter.
- Kein Ersatz für die SAP Sales Cloud: keine Opportunities, Angebote, Forecasts.
- Keine Verbindung zu HubSpot im ersten Wurf; ob ein Kontakt dort bekannt ist, prüft Marco von Hand.
- Kein automatischer Bestandskundenabgleich gegen SAP oder HubSpot im ersten Wurf.
- Keine kostenpflichtige Datenanreicherung, keine Kontaktfreischaltungen.
- Keine erfundenen oder geratenen Kontaktdaten (E-Mail-Muster, Telefonnummern).

## 6. Hauptabläufe

### A1 – Recherchelauf übernehmen (F1, F8, F9, F10)

- Rolle: Recherche-Agent. Auslöser: Der Agent meldet sich an jedem Werktag um 6:30 Uhr beim Cockpit.
1. Der Agent fragt den Laufauftrag ab → das System prüft Rechercheprofil, Pause, Sperrzeiten und die Obergrenze ungeprüfter Vorschläge und antwortet mit »Heute laufen« samt Zielbild und Anzahl oder mit »Heute nicht« samt Grund (kein Screen, API; sichtbar im Laufprotokoll auf S9).
2. Bei »Heute nicht« beendet sich der Agent sofort.
3. Bei »Heute laufen« ruft der Agent die Ausschlussliste ab → das System liefert alle bekannten, geschlossenen und gesperrten Firmen und Personen (API).
4. Der Agent recherchiert nach dem gelieferten Zielbild und Marcos Regeltext.
5. Der Agent legt einen Recherchelauf mit den Vorschlägen an (Firma, Ansprechpartner, Anlass mit Datum und Quelle, Relevanzhypothese, Gesprächsziel, Betreff und LinkedIn-Nachricht) → das System prüft Dubletten und Pflichtfelder und legt den Lauf im Eingangskorb ab (S2).
- Ergebnis: Ein neuer Lauf mit Status »Zu prüfen«; Dubletten sind markiert und nicht freigebbar.
- Ausnahmen: Weniger belegte Treffer als angefordert → der Lauf nennt die Lücke im Feld »Abdeckungsgrenzen«. API nicht erreichbar → Marco lädt die Ergebnisdatei des Agenten von Hand in S2 hoch.
- **Weg im ersten Echtbetrieb (Entscheidung 19.11.2026):** Das Cockpit läuft nur auf Marcos Rechner; eine geplante Claude-Aufgabe in der Cloud erreicht es nicht. Deshalb gilt zunächst: Die Claude-Aufgabe recherchiert werktags um 6:30 Uhr nach Marcos Regeltext und liefert die Ergebnisdatei; Marco lädt sie in S2 hoch (Schritt 5 über den Upload statt über die API). Die Schritte 1 bis 3 entfallen auf diesem Weg: Zielbild und Anzahl stehen im Prompt der Aufgabe, den Abgleich mit der Sperrliste und dem Bestand macht das Cockpit beim Hochladen. Die Agenten-API bleibt bestehen und wird genutzt, sobald das Cockpit erreichbar betrieben wird.

### A2 – Vorschläge prüfen und freigeben (F2, F3)

- Rolle: Marco. Auslöser: Hinweis »1 neuer Recherchelauf« auf dem Dashboard (S1).
1. Marco öffnet den Lauf → das System zeigt die Vorschläge als Karten mit Firma, Umsatz, Person, Anlass und Quellenlinks (S2).
2. Marco öffnet einen Vorschlag und prüft die Quellen → das System zeigt alle Angaben mit Herkunft und markiert Fehlendes als »nicht belegt« (S2).
3. Marco klickt »Freigeben« → das System legt Firma und Ansprechpartner an, Status »Freigegeben« (S3, S4).
4. Oder Marco klickt »Verwerfen« und wählt einen Grund (passt nicht ins Zielbild, Kontakt nicht belegt, bereits bekannt, Anlass zu schwach, wird von Kollegen betreut) → das System sperrt je nach Grund die Firma oder nur die Person für den Agenten (Regel in Abschnitt 9) (S2).
- Ergebnis: Freigegebene Kontakte stehen in der Ansprache-Warteschlange.

### A3 – Ansprechen per LinkedIn oder E-Mail (F4)

- Rolle: Marco. Auslöser: freigegebene Kontakte in »Heute« (S1).
1. Marco öffnet den Kontakt in der Ansprache-Ansicht → das System zeigt links Aufhänger, Datum, Quelle und Hypothese, rechts Betreff und LinkedIn-Nachricht, beides bearbeitbar; darüber die Kanalwahl LinkedIn / E-Mail, LinkedIn ist vorausgewählt (S5).
2. Marco passt den Text an → das System speichert die Fassung und zählt die Wörter (Zielkorridor LinkedIn 45–70) (S5).
3. **LinkedIn:** Marco klickt »Betreff kopieren« bzw. »Nachricht kopieren« und danach »Profil öffnen« → das System öffnet das hinterlegte LinkedIn-Profil; fehlt die URL, zeigt es Name plus Firma als Suchhinweis für den Sales Navigator. Marco sendet selbst (S5).
4. **E-Mail, Schritt a:** Marco wählt den Kanal E-Mail und klickt »E-Mail-Fassung erzeugen« → das System legt aus der LinkedIn-Fassung einen E-Mail-Entwurf mit Betreff, Anrede und Marcos Signatur an, den Marco frei bearbeitet (S5).
5. **E-Mail, Schritt b:** Marco prüft außerhalb des Cockpits, ob eine E-Mail an diesen Kontakt in Ordnung ist, und wählt die Grundlage: »In HubSpot bekannt«, »Hat bereits geantwortet« oder »Andere« mit Notiz → erst danach wird »E-Mail-Entwurf öffnen« aktiv; das System öffnet das Mailprogramm mit Empfänger, Betreff und Text. Marco sendet selbst (S5).
6. Marco klickt »Als gesendet markieren« und bestätigt den Kanal (InMail, Vernetzungsanfrage mit Notiz, LinkedIn-Nachricht, E-Mail) → das System legt einen Kontaktversuch mit Zeitstempel, gesendetem Text und – bei E-Mail – der Grundlage an, setzt den Status auf »Angeschrieben« und eine Wiedervorlage in 7 Werktagen (S5 → S4).
- Ergebnis: Der Versand ist dokumentiert, das Nachfassen terminiert.
- Ausnahme: Keine veröffentlichte berufliche E-Mail-Adresse hinterlegt → Marco trägt die Adresse von Hand ein (z. B. aus HubSpot); das System rät keine Adressen.

### A4 – Antwort erfassen und nachfassen (F5)

- Rolle: Marco. Auslöser: Antwort in LinkedIn oder im Postfach, oder fällige Wiedervorlage (S6).
1. Marco öffnet den Kontakt → das System zeigt den Verlauf aller Kontaktversuche (S4).
2. Marco klickt »Antwort erfassen«, wählt die Einordnung (positiv, neutral/später, kein Interesse, bitte nicht mehr kontaktieren) und fügt optional den Wortlaut ein → das System setzt den Status nach der Regel in Abschnitt 9 (S4).
3. Bei positiver Antwort trägt Marco das Gesprächsdatum ein → Status »Gespräch vereinbart«. Bei »neutral/später« setzt Marco eine Wiedervorlage mit eigenem Datum (S4).
4. Ohne Antwort am Wiedervorlagetag: Marco öffnet die Nachfass-Ansicht → das System zeigt die erste Nachricht und ein leeres Feld für das Nachfassen; Kanalwahl und E-Mail-Grundlage gelten wie beim Erstkontakt; nach dem Senden Status »Nachgefasst« (S5).
5. 21 Tage nach dem Erstkontakt ohne Antwort: Marco bestätigt den Vorschlag »Ohne Antwort schließen« → der Kontakt bleibt mit vollständigem Verlauf erhalten und verschwindet nur aus den Arbeitslisten (S6 → S4).
- Ergebnis: Jeder Kontakt hat einen eindeutigen Status und nächsten Termin; nichts wird gelöscht.
- Ausnahme: »Bitte nicht mehr kontaktieren« → Person kommt sofort auf die Sperrliste (S8).

### A5 – An SAP Sales Cloud V2 übergeben (F7, F9)

- Rolle: Marco. Auslöser: Status »Antwort erhalten (positiv)« oder »Gespräch vereinbart«.
1. Marco klickt im Kontakt »An SAP übergeben« → das System zeigt eine Vorschau: welcher Account, welcher Ansprechpartner und welcher Lead angelegt werden, mit Feldzuordnung (S7).
2. Marco bestätigt → das System sucht zuerst nach einem bestehenden Account gleichen Namens in SAP, legt Fehlendes an und speichert die SAP-IDs am Datensatz (S7).
3. Das System zeigt das Ergebnis je Objekt (angelegt, verknüpft, Fehler mit Meldung) und setzt den Status »An SAP übergeben« (S7 → S4).
- Ergebnis: Der Kontakt lebt in SAP weiter; im Cockpit bleibt er lesbar, aber abgeschlossen.
- Ausnahme: SAP meldet einen Fehler → nichts wird als übergeben markiert, die Meldung steht im Übergabeprotokoll, »Erneut versuchen« ist möglich.

### A6 – Wirkung prüfen (F6)

- Rolle: Marco. Auslöser: Wochenrückblick.
1. Marco öffnet das Dashboard und wählt den Zeitraum → das System zeigt Trichter und Quoten (S1).
2. Marco schlüsselt nach Branche, Land, Rolle, Kanal oder Art des Aufhängers auf → das System zeigt die Vergleichswerte und die zugrunde liegende Kontaktliste (S1 → S4).
- Ergebnis: Marco sieht, welche Zielgruppen, Kanäle und Aufhänger Antworten bringen.

### A7 – Agent einstellen, pausieren, Urlaub eintragen (F10)

- Rolle: Marco. Auslöser: Zielbild oder Takt soll sich ändern, Urlaub steht an, oder der Eingangskorb läuft über.
1. Marco öffnet die Agent-Steuerung → das System zeigt das Rechercheprofil, den Schalter Aktiv/Pausiert, die Sperrzeiten, den nächsten geplanten Lauf und das Laufprotokoll (S9).
2. Marco ändert Lauftage, Anzahl je Lauf, Branchen, Länder, Mindestumsatz oder Rollen und speichert → das System zeigt sofort den neu berechneten nächsten Lauf und wendet die Änderung ab dem nächsten Lauf an (S9).
3. Marco trägt eine Sperrzeit ein (von, bis, Bezeichnung) → das System überspringt alle Läufe in diesem Zeitraum und vermerkt den Grund im Laufprotokoll (S9).
4. Marco schaltet auf »Pausiert« → kein Lauf, bis er wieder aktiviert (S9).
5. Marco klickt »Zusatzlauf anfordern« → das System merkt den Lauf vor; der Agent führt ihn am nächsten Werktag um 6:30 Uhr aus (S9).
- Ergebnis: Der Agent arbeitet nach Marcos Vorgaben, ohne dass ein Prompt geändert wird.
- Ausnahme: Mehr ungeprüfte Vorschläge im Eingangskorb als die eingestellte Obergrenze → das System setzt Läufe aus und zeigt den Hinweis auf S1 und S9.

## 7. Screens

| ID | Name | Zweck | Wichtigste Inhalte | Aktionen | Führt zu |
|---|---|---|---|---|---|
| S1 | Dashboard | Tagesstart und Wirkung | »Heute«: neue Läufe, freigegebene Kontakte, fällige Wiedervorlagen, Agent-Status (aktiv, pausiert, Sperrzeit, nächster Lauf). Kennzahlen-Kacheln, Trichter, Aufschlüsselung | Zeitraum wählen, aufschlüsseln, Eintrag öffnen | S2, S4, S5, S6, S9 |
| S2 | Eingangskorb | Recherchelauf prüfen | Läufe mit Datum, Anzahl, Abdeckungsgrenzen; Vorschlagskarten mit Quellen und Dublettenhinweis | Freigeben, Verwerfen mit Grund, Datei hochladen | S3, S4 |
| S3 | Firmen | Firmen führen | Liste mit Branche, Land, Umsatz (Jahr, Währung, Konzern/Einzelgesellschaft), Zahl der Kontakte, Status. Detail: Anschrift, allgemeine Firmenkontakte, Quellen, Ansprechpartner | Filtern, bearbeiten (Anschrift, allgemeiner Firmenkontakt), sperren, löschen | S4, S8 |
| S4 | Kontakte | Pipeline und Kontaktakte | Liste nach Status, auch geschlossene per Filter. Detail: Funktion, Profil-Link oder Suchhinweis, Direktkontakte getrennt von Firmenkontakten, Anlässe, Verlauf mit Kanal und E-Mail-Grundlage, SAP-IDs | Antwort erfassen, Wiedervorlage setzen, schließen, wieder öffnen, An SAP übergeben, sperren, löschen | S5, S7, S3 |
| S5 | Ansprache | Nachricht fertigstellen und Versand protokollieren | Aufhänger/Datum/Quelle, Hypothese, Gesprächsziel; Kanalwahl; Betreff und Nachricht mit Wortzähler; bei E-Mail die Auswahl der geprüften Grundlage. Ohne gewählten Kontakt: Listen »Erstkontakt offen« und »Angeschrieben, Nachfassen möglich« | Kopieren, Profil öffnen, E-Mail-Fassung erzeugen, E-Mail-Entwurf öffnen, Als gesendet markieren | S4 |
| S6 | Wiedervorlagen | Nichts vergessen | Fällige und überfällige Aufgaben mit Kontakt, Firma, letzter Aktion; Vorschläge »Ohne Antwort schließen« | Erledigen, verschieben, schließen, Kontakt öffnen | S4, S5 |
| S7 | SAP-Übergabe | Kontrollierte Übergabe | Vorschau der Feldzuordnung; Ergebnis je Objekt; Protokoll früherer Übergaben. Ohne gewählten Kontakt: Liste »Bereit zur Übergabe« | Bestätigen, erneut versuchen | S4 |
| S8 | Einstellungen | Regeln und Zugänge | Sperrliste, API-Schlüssel für den Agenten, SAP-Verbindung mit Test, Fristen (nur Anzeige), E-Mail-Signatur, Export | Eintrag hinzufügen/entfernen, Schlüssel erneuern, Verbindung testen, CSV-Export | S3, S4 |
| S9 | Agent-Steuerung | Agent einstellen und überwachen | Rechercheprofil (Lauftage, Anzahl, Branchen, Länder, Mindestumsatz, Rollen, Obergrenze ungeprüft), Schalter Aktiv/Pausiert, Sperrzeiten, nächster Lauf, Laufprotokoll mit ausgeführten und übersprungenen Läufen | Speichern, pausieren/aktivieren, Sperrzeit anlegen/löschen, Zusatzlauf anfordern, Lauf öffnen | S2, S1 |

## 8. Objekte und Daten

| Objekt | Wichtigste Felder | Herkunft der Daten |
|---|---|---|
| Firma | Name, Domain, Branche, Land, Anschrift, Umsatz, Währung, Bezugsjahr, Bezug (Konzern/Einzelgesellschaft), Umsatzquelle, bei Fremdwährung Wechselkurs mit Quelle und Gegenwert in EUR, allgemeine Firmenkontakte, Status, SAP-Account-ID | Agent (öffentliche Quellen), Marco |
| Ansprechpartner | Anrede, Name, Funktion, Zuständigkeit, LinkedIn-URL oder Suchhinweis, berufliche E-Mail/Telefon mit Herkunft (veröffentlicht oder von Marco eingetragen), Sprache, Status, Besitzer, SAP-IDs | Agent, Marco |
| Anlass | Typ (eigener Beitrag, Unternehmensanlass, kein belastbarer Anlass), Beschreibung, Ereignisdatum, Veröffentlichungsdatum, Quellenlink, Relevanzhypothese, Gesprächsziel | Agent |
| Nachricht | Kanal (LinkedIn vom Agenten; E-Mail auf Knopfdruck daraus erzeugt), Betreff, Text, Sprache, Wortzahl, Fassung (Agent / von Marco geändert) | Agent, System, Marco |
| Kontaktversuch | Kanal, Zeitpunkt, gesendeter Betreff/Text, Art (Erstkontakt, Nachfassen), bei E-Mail die von Marco geprüfte Grundlage (in HubSpot bekannt, hat bereits geantwortet, andere mit Notiz) | Marco per Klick |
| Antwort | Zeitpunkt, Einordnung, Wortlaut (optional), nächster Schritt | Marco |
| Wiedervorlage | Fällig am, Grund, erledigt | System, Marco |
| Rechercheprofil | Name, Status (aktiv/pausiert), Lauftage, Anzahl je Lauf, Branchen, Länder, Mindestumsatz, Rollen, Obergrenze ungeprüfter Vorschläge | Marco |
| Sperrzeit | Von, bis, Bezeichnung | Marco |
| Recherchelauf | Datum, Ergebnis (ausgeführt / übersprungen mit Grund), Anzahl Vorschläge, Freigaben, Abdeckungsgrenzen, verwendetes Zielbild | Agent, System |
| Sperreintrag | Firma oder Person, Grund, Datum | Marco, System (Opt-out), Startbestand |
| SAP-Übergabe | Zeitpunkt, Ergebnis je Objekt, SAP-IDs, Fehlermeldung | System |

### Beispieldaten (frei erfunden, nur für den Clickdummy)

Ausformulierte Nachrichten, Hypothesen, Gesprächsziele, Profil-Links und E-Mail-Adressen der Beispielkontakte stehen im freigegebenen `clickdummy.html`; er ist dafür maßgeblich. Ostermann, Wiesner und Hollenstein sind Altbestand ohne erfassten Anlass.

**Firmen**

| Name | Branche / Land | Umsatz | Status |
|---|---|---|---|
| Nordwerk Fördertechnik GmbH | Maschinenbau / DE | 182 Mio. EUR, 2025, Konzern | Aktiv |
| Alpenstrom Netze AG | Utilities / AT | 640 Mio. EUR, 2025, Konzern | Aktiv |
| Rheintal Technikhandel AG | Technischer Handel / CH | 96 Mio. CHF, 2025, Einzelgesellschaft (rund 102 Mio. EUR, Beispielkurs 1,06) | Aktiv |
| Hansemarkt Handels SE | Retail / DE | 1,4 Mrd. EUR, 2025, Konzern | Aktiv |
| Weserland Entsorgung GmbH | Entsorgung / DE | 74 Mio. EUR, 2025, Einzelgesellschaft | Aktiv |
| Bergland Sport Handels AG | Retail / AT | 310 Mio. EUR, 2025, Konzern | Aktiv |
| Stadtwerke Lindental GmbH | Utilities / DE | 228 Mio. EUR, 2025, Einzelgesellschaft | Aktiv |

**Ansprechpartner**

| Name | Funktion | Firma | Status |
|---|---|---|---|
| Dr. Katrin Albers | Leiterin Customer Service & After-Sales | Nordwerk Fördertechnik | Gespräch vereinbart |
| Tobias Reinhardt | Head of CRM & E-Commerce | Hansemarkt Handels | Angeschrieben |
| Simone Gruber | Chief Digital Officer | Alpenstrom Netze | Freigegeben |
| Luca Bernasconi | Leiter Vertrieb Innendienst | Rheintal Technikhandel | Nachgefasst |
| Markus Ostermann | Leiter Service | Weserland Entsorgung | Ohne Antwort geschlossen |
| Jana Wiesner | Leiterin E-Commerce | Bergland Sport Handels | Kein Interesse |
| Peter Hollenstein | CIO | Stadtwerke Lindental | Antwort erhalten (neutral/später) |

**Anlässe**

| Kontakt | Typ | Beschreibung | Datum |
|---|---|---|---|
| Albers | Unternehmensanlass | Pressemitteilung: neues Servicezentrum für Ersatzteile in Bremen | 04.11.2026 |
| Reinhardt | Eigener Beitrag | Interview im Fachmagazin zur Zusammenführung von Kundenkarte und Onlineshop | 28.10.2026 |
| Gruber | Unternehmensanlass | Geschäftsbericht: Kundenportal für Netzanschlüsse als Schwerpunkt 2027 | 15.09.2026 |
| Bernasconi | Kein belastbarer Anlass | – | – |

**Nachricht (Beispiel für Albers, Kanal LinkedIn, Fassung: Agent)**

Betreff: Servicezentrum Bremen und Kundenprozesse

> Hallo Frau Dr. Albers, mit dem neuen Servicezentrum für Ersatzteile in Bremen ändern sich vermutlich auch Abläufe rund um Anfragen und Einsätze Ihrer Kunden. Ich verantworte bei Nagarro Customer Experience & Innovation und würde gern mit Ihnen einordnen, welche Kundenprozesse dabei mitwachsen sollten. Wäre ein kurzes Gespräch dazu für Sie interessant?
> Beste Grüße
> Marco

Sprache: Deutsch · 54 Wörter. Für Reinhardt, Gruber und Bernasconi zeigt der Clickdummy je eine LinkedIn-Nachricht gleicher Bauart; bei Reinhardt zusätzlich eine auf Knopfdruck erzeugte E-Mail-Fassung (gleicher Text mit Anrede »Guten Tag Herr Reinhardt,« und Signatur), bei Bernasconi das Etikett »Kein belastbarer aktueller Anlass«.

**Kontaktversuche**

| Kontakt | Kanal | Zeitpunkt | Art | E-Mail-Grundlage |
|---|---|---|---|---|
| Albers | InMail | 06.11.2026 08:40 | Erstkontakt | – |
| Reinhardt | E-Mail | 12.11.2026 09:15 | Erstkontakt | In HubSpot bekannt |
| Bernasconi | InMail | 03.11.2026 17:05 | Erstkontakt | – |
| Bernasconi | LinkedIn-Nachricht | 12.11.2026 08:20 | Nachfassen | – |
| Ostermann | InMail | 19.10.2026 08:10 | Erstkontakt | – |
| Wiesner | InMail | 02.11.2026 08:30 | Erstkontakt | – |
| Hollenstein | E-Mail | 10.11.2026 09:05 | Erstkontakt | Andere: Kontakt vom Stadtwerke-Webinar |

**Antworten**

| Kontakt | Zeitpunkt | Einordnung | Nächster Schritt |
|---|---|---|---|
| Albers | 09.11.2026 | Positiv | Kurzes Gespräch am 24.11.2026, 14:00 Uhr |
| Wiesner | 04.11.2026 | Kein Interesse | Geschlossen |
| Hollenstein | 13.11.2026 | Neutral/später | Wiedervorlage 15.01.2027 |

**Wiedervorlagen**

| Kontakt | Fällig | Grund |
|---|---|---|
| Reinhardt | 23.11.2026 | Nachfassen, keine Antwort |
| Bernasconi | 24.11.2026 | Ohne Antwort schließen? |
| Albers | 24.11.2026 | Gespräch vorbereiten |
| Hollenstein | 15.01.2027 | Nach Jahreswechsel erneut melden |

**Rechercheprofil**

| Feld | Wert |
|---|---|
| Name | DACH Kernbranchen |
| Status | Aktiv |
| Lauftage | Montag, Donnerstag |
| Uhrzeit | 6:30 Uhr (fest, nicht änderbar) |
| Vorschläge je Lauf | 10 |
| Branchen | Maschinen-/Anlagenbau, Retail, Großhandel/technischer Handel, Utilities; ergänzend Entsorgung, Infrastruktur, technische Dienstleistungen, Hospitality |
| Länder | Deutschland, Österreich, Schweiz |
| Mindestumsatz | 50 Mio. EUR, keine Obergrenze |
| Rollen | CIO/IT-Leitung, Digitalisierung/CDO, Customer Experience, Service/After-Sales, Vertrieb, CRM, E-Commerce, Kundenbindung |
| Obergrenze ungeprüft | 20 Vorschläge |

**Sperrzeiten**

| Von | Bis | Bezeichnung |
|---|---|---|
| 21.12.2026 | 03.01.2027 | Weihnachtsurlaub |
| 15.02.2027 | 19.02.2027 | Skiurlaub |
| 24.11.2026 | 24.11.2026 | Webinartag |

**Rechercheläufe (Laufprotokoll)**

| Datum | Ergebnis | Vorschläge | Freigegeben | Abdeckungsgrenzen |
|---|---|---|---|---|
| 19.11.2026 | Geplant | – | – | – |
| 16.11.2026 | Ausgeführt | 10 | 7 | 2 Profile ohne verifizierte URL |
| 12.11.2026 | Ausgeführt | 8 | 6 | Nur 8 belegte Treffer, Lücke benannt |
| 09.11.2026 | Ausgeführt | 10 | 8 | – |
| 05.11.2026 | Übersprungen: pausiert | – | – | – |

Die Läufe vom 09. bis 16.11. zählen zusammen 21 Freigaben; als Beispielkontakte ausgeführt sind davon sieben.

**Vorschläge im Eingangskorb (Lauf vom 19.11.2026, im Clickdummy per Auslöser; Abdeckungsgrenze: nur 4 belegte Treffer statt 10)**

| Person | Funktion | Firma | Branche / Land | Umsatz | Anlass | Besonderheit |
|---|---|---|---|---|---|---|
| Sabine Kortmann | Leiterin After-Sales Service | Kranbau Oberhavel GmbH | Maschinenbau / DE | 121 Mio. EUR, 2025, Konzern | Pressemitteilung: Kundenportal für Ersatzteile angekündigt, 12.11.2026 | – |
| Miriam Voss | Leiterin Kundenbindung | Hansemarkt Handels SE | Retail / DE | 1,4 Mrd. EUR, 2025, Konzern | Pressemitteilung: Kundenkarte künftig auch im Onlineshop einlösbar, 10.11.2026 | Zweiter Ansprechpartner, dort läuft eine Ansprache |
| Dr. Katrin Albers | Leiterin Customer Service & After-Sales | Nordwerk Fördertechnik GmbH | Maschinenbau / DE | 182 Mio. EUR, 2025, Konzern | wie oben | Dublette, nicht freigebbar |
| Reto Ammann | Leiter Gästeservice & CRM | Seehotel-Gruppe Bodan AG | Hospitality / CH | 88 Mio. CHF, 2025, Konzern (rund 93 Mio. EUR, Beispielkurs 1,06) | Kein belastbarer aktueller Anlass | Kein verifizierter Profil-Link, Suchhinweis |

**Sperrliste (Startbestand aus dem Prompt)**

| Eintrag | Grund |
|---|---|
| Windmöller & Hölscher | In früherer Ausgabe genannt |
| BOBST | In früherer Ausgabe genannt |
| Haberkorn | In früherer Ausgabe genannt |
| HORNBACH | In früherer Ausgabe genannt |
| Energie Steiermark | In früherer Ausgabe genannt |

**SAP-Übergaben (Protokoll, wie es bei der Übergabe von Albers in A5 entsteht; vorher ist es leer)**

| Kontakt | Zeitpunkt | Ergebnis |
|---|---|---|
| Albers / Nordwerk | Tag der Übergabe, 16:10 | Fehler: Pflichtfeld »Land« fehlt – nichts angelegt |
| Albers / Nordwerk | Tag der Übergabe, 16:12 | Account angelegt, Ansprechpartner angelegt, Lead angelegt |

## 9. Regeln und Logik

**Status eines Ansprechpartners**

Neu → Freigegeben → Angeschrieben → Nachgefasst → Antwort erhalten → Gespräch vereinbart → An SAP übergeben.
Endzustände daneben: Verworfen, Kein Interesse, Ohne Antwort geschlossen, Gesperrt.

- »Angeschrieben« entsteht nur durch »Als gesendet markieren«, nie automatisch.
- Wiedervorlage 7 Werktage nach dem Erstkontakt; höchstens eine Nachfass-Nachricht; 21 Tage nach dem Erstkontakt ohne Antwort schlägt das System »Ohne Antwort schließen« vor, unabhängig davon, ob nachgefasst wurde.
- Schließen heißt nicht löschen: Geschlossene Kontakte behalten Verlauf, Anlässe und Nachrichten, zählen weiter in den Kennzahlen und lassen sich wieder öffnen.
- Wieder öffnen setzt den Kontakt auf »Angeschrieben« zurück, ohne bisherigen Kontaktversuch auf »Freigegeben«.
- Geschlossene Kontakte bleiben für den Agenten 6 Monate gesperrt; danach darf er sie mit neuem Anlass erneut vorschlagen, gekennzeichnet als »Wiederansprache«. Gibt Marco eine Wiederansprache frei, wird der bestehende Kontakt mit vollständigem Verlauf auf »Freigegeben« gesetzt und erhält den neuen Anlass und die neue Nachricht; es entsteht kein zweiter Kontakt.
- Antwort »neutral/später«: Status »Antwort erhalten«, Marco setzt eine Wiedervorlage mit eigenem Datum; vorgeschlagen wird heute plus 30 Tage.
- »Kein Interesse« schließt den Kontakt und sperrt ihn dauerhaft für den Agenten; Marco kann ihn von Hand wieder öffnen `[Annahme]`.
- Hochladen der Ergebnisdatei (1.3): Steht die Firma oder die Person eines Vorschlags auf der Sperrliste (bei Personen nur bis »gesperrt bis«), ist der Vorschlag als »Gesperrt« gekennzeichnet und nicht freigebbar; der Grund steht dabei. Ein Firmeneintrag sperrt auch Namen, die mit ihm beginnen (»HORNBACH« sperrt »HORNBACH Baumarkt AG«); bei Personen zählen Anrede und Titel im Eintrag nicht `[Annahme]`.
- Beim Anlegen eines Laufs (Upload und API, 1.3): Liegt dieselbe Person schon ungeprüft im Eingangskorb oder steht sie zweimal in der Datei, wird sie nicht noch einmal angelegt; der Lauf nennt sie unter »Beim Einlesen«, ebenso zurückgewiesene Vorschläge. Bringt eine hochgeladene Datei keinen neuen Vorschlag, entsteht kein Lauf, und Marco kann am selben Tag eine korrigierte Datei hochladen. Kleine Formatabweichungen (etwa »Deutschland« statt »DE«, Zahlen als Text) werden beim Einlesen geglättet `[Annahme]`.
- Verwerfen im Eingangskorb: Die Gründe »passt nicht ins Zielbild« und »wird von Kollegen betreut« sperren die Firma für den Agenten; die übrigen Gründe sperren nur die Person, für 6 Monate `[Annahme]`. Eine so gesperrte Firma bleibt gesperrt, bis Marco den Sperreintrag entfernt.
- »An SAP übergeben« ist nur aus »Antwort erhalten (positiv)« oder »Gespräch vereinbart« möglich.
- Opt-out setzt »Gesperrt« und erzeugt einen Sperreintrag; gesperrte Personen liefert die API dem Agenten dauerhaft als Ausschluss.

**Kanalwahl**

- LinkedIn ist immer möglich und vorausgewählt.
- Der Agent liefert nur die LinkedIn-Fassung (45–70 Wörter mit Betreff). Die E-Mail-Fassung entsteht erst auf Knopfdruck im Cockpit.
- E-Mail-Fassung im ersten Wurf: Text der LinkedIn-Fassung, förmliche Anrede aus den Kontaktdaten, Betreff übernommen, Marcos Signatur aus den Einstellungen; ohne KI im Cockpit, Marco formuliert selbst nach.
- Das Cockpit entscheidet nicht, ob eine E-Mail zulässig ist. Marco prüft das von Hand und wählt eine Grundlage; ohne gewählte Grundlage bleibt »E-Mail-Entwurf öffnen« gesperrt.
- Die gewählte Grundlage wird am Kontaktversuch gespeichert und ist auswertbar.
- Nachfassen per E-Mail: erst die Nachfass-Nachricht schreiben, dann daraus die E-Mail-Fassung erzeugen.
- Die Signatur steht in den Einstellungen; Startwert: Beste Grüße / Marco Messinger / Director Customer Experience & Innovation / Nagarro.

**Laufentscheidung des Agenten**

Ein Lauf findet statt, wenn alle Bedingungen erfüllt sind: Profil aktiv, heute ist ein Lauftag oder ein Zusatzlauf ist vorgemerkt, heute liegt in keiner Sperrzeit, im Eingangskorb liegen weniger ungeprüfte Vorschläge als die Obergrenze. Sonst vermerkt das System »Übersprungen« mit dem ersten zutreffenden Grund. Je Tag höchstens ein Lauf. Die Uhrzeit ist im ersten Wurf fest auf 6:30 Uhr und nicht im Cockpit einstellbar. Ein Zusatzlauf, dessen nächster Werktag in einer Sperrzeit liegt, wartet bis zum ersten Werktag danach. Tage, die kein Lauftag sind, erscheinen nicht im Laufprotokoll; protokolliert werden nur ausgeführte Läufe und Lauftage, die wegen Pause, Sperrzeit oder Obergrenze entfallen.

**Dublettenprüfung**

- Firma: gleiche Domain oder gleicher normalisierter Name (ohne Rechtsform, Groß-/Kleinschreibung egal).
- Person: gleiche LinkedIn-URL oder gleicher Name bei gleicher Firma.
- Ein zweiter Ansprechpartner bei einer bekannten Firma ist erlaubt, wird aber markiert, solange dort ein Kontakt im Status »Angeschrieben« oder »Nachgefasst« steht.

**Pflichtangaben für die Freigabe**

Firma mit Umsatz, Währung, Bezugsjahr und Quelle (mindestens der im Rechercheprofil eingestellte Mindestumsatz; maßgeblich ist der Umsatz in EUR: bei anderer Währung liefert der Agent den Originalwert, den Wechselkurs mit Quelle und den Gegenwert in EUR, das Cockpit zeigt und prüft den Gegenwert in EUR); Person mit Name, Funktion und Quelle; Betreff und Nachricht. Fehlt ein Anlass, muss er ausdrücklich als »Kein belastbarer aktueller Anlass« gekennzeichnet sein.

**Kennzahlen**

| Kennzahl | Berechnung |
|---|---|
| Vorschläge je Woche | Vom Agenten gelieferte Kontakte |
| Freigabequote | Freigegeben ÷ geliefert (Qualität des Agenten) |
| Angeschrieben je Woche | Kontakte mit Erstkontakt im Zeitraum |
| Antwortquote | Kontakte mit Antwort ÷ angeschriebene Kontakte, bezogen auf die Woche des Erstkontakts |
| Positive Antwortquote | Positive Antworten ÷ angeschriebene Kontakte |
| Gesprächsquote | Vereinbarte Gespräche ÷ angeschriebene Kontakte |
| SAP-Übergaben | Anzahl im Zeitraum |
| Zeit bis Antwort | Median in Tagen |
| Überfällige Wiedervorlagen | Anzahl heute |

Jede Quote ist aufschlüsselbar nach Branche, Land, Rolle, Kanal (LinkedIn / E-Mail), E-Mail-Grundlage und Art des Aufhängers. Quoten erscheinen erst ab 20 angeschriebenen Kontakten im Zeitraum, darunter nur absolute Zahlen `[Annahme]`. Standardzeitraum des Dashboards: letzte 30 Tage `[Annahme]`. Bezugsgrößen: »Vorschläge« und »Freigegeben« zählen die Läufe im Zeitraum, alle übrigen Kennzahlen die Kontakte mit Erstkontakt im Zeitraum.

**Daten**

- Gespeichert werden nur berufliche Angaben aus öffentlichen Quellen oder von Marco eingetragen, jeweils mit Herkunft.
- Es gibt keine automatische Löschung. Marco kann einzelne Datensätze von Hand löschen: Kontakte in der Kontaktakte (S4), Firmen im Firmendetail (S3), jeweils mit Rückfrage; ein Sperreintrag bleibt dann bestehen. Eine Firma lässt sich nur löschen, wenn sie keine Ansprechpartner mehr hat.
- Der CSV-Export der Kontakte enthält Name, Funktion, Firma, Branche, Land und Status.

**Feldzuordnung zur SAP Sales Cloud V2**

| Cockpit | SAP |
|---|---|
| Firma | Account (Interessent) |
| Ansprechpartner | Kontaktperson am Account |
| Anlass + Hypothese + Verlauf | Lead mit Notiz, Quelle »CX Lead Cockpit« |

## 10. Look and Feel

- Gerät: nur Desktop.
- Anmutung: nüchternes Arbeitswerkzeug, viel Liste, wenig Dekoration; Nagarro-Farben.
- Sprache der Oberfläche: Deutsch. Tonalität: knapp, sachlich, Du-Form.
- Quellen sind überall klickbar; Fakten und Hypothesen sind optisch getrennt (Hypothesen tragen ein eigenes Etikett).
- Das SAP-Kennzeichen ist ein kleines Etikett an Firma und Kontakt.

## 11. Rahmenbedingungen

### Ergebnis der Verbindungsprüfung (Stand 18.11.2026)

| Weg | Befund | Folge für das Konzept |
|---|---|---|
| LinkedIn / Sales Navigator | Keine nutzbare Schnittstelle: Das Partnerprogramm für die Sales-Navigator-API nimmt keine neuen Partner auf, und keine offizielle LinkedIn-API sendet Nachrichten oder Vernetzungsanfragen. LinkedIn untersagt Software, die Aktivitäten automatisiert, und nennt Kontosperren als Folge. | Versand bleibt Handarbeit. Die App kopiert und öffnet, Marco sendet. Auch Claude im Browser sendet nicht in LinkedIn. |
| SAP Sales Cloud V2 | REST-API je Objekt, nutzbar mit technischem API-Nutzer; Pfade z. B. `/sap/c4c/api/v1/account-service/accounts` und `/sap/c4c/api/v1/lead-service/leads`. Leads lassen sich auch für noch unbekannte Kunden anlegen. Die Aufrufe sind synchron und erscheinen nicht im SAP-Nachrichtenmonitor. | Übergabe ist machbar. Das Cockpit braucht ein eigenes Übergabeprotokoll. Marco hat bzw. bekommt einen API-Nutzer. |
| HubSpot | API für Kontakte und Firmen; Sequenzen-API schreibt Kontakte in Sequenzen ein (Sales Hub Professional/Enterprise). Die Sales-Navigator-Integration bringt InMail als Aufgabe in Sequenzen, gesendet wird trotzdem von Hand. Marco hat einen Sales-Hub-Seat. | Erster Wurf: keine Verbindung, Marco prüft von Hand. Anbindung später. |
| Outlook | Claudes Microsoft-365-Connector kann Entwürfe anlegen und senden, wenn der Administrator die Schreibfunktionen freigibt. Marco hat den Connector derzeit nicht. | Erster Wurf: Link, der das Mailprogramm mit Empfänger, Betreff und Text öffnet `[Annahme]`. Direkte Entwürfe später. |
| Claude Desktop | Geplante Aufgaben starten zu festen Zeiten eine neue Sitzung. Lokale Aufgaben laufen nur bei wachem Rechner und geöffneter App; es gibt auch Aufgaben in der Cloud. Der Zeitplan einer solchen Aufgabe liegt in Claude, nicht im Cockpit. | Der Agent läuft als geplante Aufgabe in Claude, meldet sich werktäglich um 6:30 Uhr und fragt das Cockpit, ob und was er heute tun soll. Dass das Cockpit den Agenten selbst über die Claude-API startet, ist für später vorgemerkt. |

Quellen: [LinkedIn – Prohibited software and extensions](https://www.linkedin.com/help/linkedin/answer/a1341387) · [Microsoft Learn – LinkedIn API-Zugang / SNAP](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access) · [Phyllo – LinkedIn Partner Program 2026](https://www.getphyllo.com/post/linkedin-api-access-in-2026-partner-program-approval-timeline-alternatives) · [SAP KBA 3417171 – REST-APIs in V2](https://userapps.support.sap.com/sap/support/knowledge/en/3417171) · [SAP KBA 3598722 – API-Nutzer anlegen](https://userapps.support.sap.com/sap/support/knowledge/en/3598722) · [SAP Community – Leads per API](https://groups.community.sap.com/t5/crm-and-cx-questions/sales-cloud-v2-api-error-create-leads/m-p/12730880) · [HubSpot – Sequences API](https://developers.hubspot.com/docs/api-reference/latest/automation/sequences/guide) · [HubSpot Community – InMail in Sequenzen](https://community.hubspot.com/t5/HubSpot-Ideas/Send-LinkedIn-InMails-with-Sequences/idi-p/20536/highlight/true) · [Claude Hilfe – Microsoft 365 verbinden](https://support.claude.com/en/articles/15183774-connect-to-microsoft-365) · [Claude Docs – Geplante Aufgaben](https://code.claude.com/docs/en/desktop-scheduled-tasks)

### Schnittstelle des Cockpits (Entwurf) `[Annahme]`

| Aufruf | Zweck | Wer |
|---|---|---|
| `GET /api/v1/agent/next-run` | Laufauftrag: heute laufen ja/nein, Grund, Zielbild, Anzahl | Agent |
| `GET /api/v1/exclusions` | Bekannte, geschlossene und gesperrte Firmen/Personen | Agent |
| `POST /api/v1/batches` | Recherchelauf mit Vorschlägen anlegen | Agent |
| `GET /api/v1/companies`, `GET /api/v1/contacts` | Bestand lesen, filterbar nach Status | Export, spätere Anbindungen |
| `POST /api/v1/contacts/{id}/touchpoints` | Kontaktversuch protokollieren | Oberfläche, später HubSpot |
| `POST /api/v1/contacts/{id}/sap-handover` | Übergabe an SAP auslösen | Oberfläche |
| `GET /api/v1/kpis` | Kennzahlen für Zeitraum | Oberfläche, Berichte |

### Recht und Datenschutz

- Werbung per E-Mail setzt nach § 7 UWG auch gegenüber Unternehmen eine vorherige ausdrückliche Einwilligung voraus; der Paragraf erfasst neben E-Mails auch Direktnachrichten in Messengern. Marco hält E-Mail an in HubSpot bekannte Kontakte oft für in Ordnung und prüft das je Kontakt von Hand. Ob »in HubSpot bekannt« als Grundlage reicht und wie InMail-Erstkontakte zu bewerten sind, muss die Nagarro-Rechtsabteilung bestätigen `[Offen]`. Quellen: [IHK München](https://www.ihk-muenchen.de/email-marketing/) · [IHK – Werbung per Telefon, Brief und E-Mail](https://www.ihk.de/blueprint/servlet/resource/blob/5513366/c1dd01c8dd13574d6ea8c9a920dd57e7/werbung-per-telefon-brief-und-e-mail-data.pdf)
- Speicherung personenbezogener Daten ohne Löschfrist: Rechtsgrundlage, Informationspflicht und Aufbewahrung mit dem Nagarro-Datenschutz klären `[Offen]`.
- Technik, Betrieb und Anmeldung folgen dem Nagarro-Hausstandard und werden in der Architektur-Stufe festgelegt `[Offen]`.

## 12. Erfolg

Nach drei Monaten:

- Jeder Erstkontakt seit Start ist im Cockpit protokolliert; keine doppelte Ansprache.
- Der Agent liefert ohne von Hand gepflegte Ausschlussliste im Prompt; Zielbild und Takt wurden mindestens einmal im Cockpit geändert, ohne den Prompt anzufassen.
- Antwort- und Gesprächsquote liegen als echte Messwerte vor, getrennt nach LinkedIn und E-Mail; der erste Monat ist die Ausgangsbasis, Zielwerte werden danach gesetzt `[Annahme]`.
- Jeder Kontakt mit vereinbartem Gespräch ist in der SAP Sales Cloud V2 angekommen.
- Tagesaufwand für Protokoll und Nachfassen unter 15 Minuten `[Annahme]`.

## 13. Risiken und offene Annahmen

| Annahme | Auswirkung, wenn falsch | Wie prüfen |
|---|---|---|
| Die geplante Claude-Aufgabe erreicht die Cockpit-API | Steuerung aus dem Cockpit greift nicht; Ausweichweg Datei-Upload in S2 | Kleiner Test mit einem Lauf, sobald eine API steht |
| E-Mail-Fassung per Vorlage aus der LinkedIn-Fassung reicht, ohne KI im Cockpit | Marco schreibt jede E-Mail weitgehend neu; dann Claude-API im Cockpit oder Fassung vom Agenten | Im Clickdummy an drei Beispielen ansehen; nach 4 Wochen Nutzung bewerten |
| Marco prüft vor jeder E-Mail von Hand in HubSpot | E-Mails ohne tragfähige Grundlage; später lesender HubSpot-Abgleich | Nach 4 Wochen Blick auf die Verteilung der Grundlagen |
| »In HubSpot bekannt« ist eine tragfähige Grundlage für E-Mail | E-Mail-Kanal fällt für viele Kontakte weg | Nagarro Legal |
| »Kein Interesse« sperrt dauerhaft; Verwerfen sperrt je nach Grund Firma oder Person (Abschnitt 9) | Agent liefert Unerwünschtes erneut oder lässt gute Firmen aus | Marco bei der Freigabe oder am Clickdummy |
| Obergrenze von 20 ungeprüften Vorschlägen setzt Läufe aus | Agent steht unbemerkt still | Hinweis auf S1; Wert im Profil änderbar |
| Zuschnitt der Cockpit-API wie in Abschnitt 11 | Agent oder Export brauchen andere Aufrufe | Architektur-Stufe |
| Die SAP-API erlaubt die Suche nach bestehenden Accounts per Name | Dubletten in SAP | Leseaufruf mit Namensfilter testen |
| Pfad und Pflichtfelder für Kontaktpersonen und Leads im Nagarro-Tenant passen zur Zuordnung in Abschnitt 9 | Übergabe scheitert | Mit dem API-Nutzer je Objekt einen Datensatz lesen und einen Testdatensatz anlegen |
| Marco markiert Versand und Antworten zuverlässig von Hand | Kennzahlen stimmen nicht | Nach 4 Wochen Stichprobe gegen LinkedIn-Postfach und Outlook |
| E-Mail-Entwurf per Link reicht im ersten Wurf | Lange Texte oder Umlaute kommen im Mailprogramm falsch an | Im Clickdummy mit Outlook testen |
| Quoten erst ab 20 angeschriebenen Kontakten; Standardzeitraum 30 Tage | Anfangs wirkt das Dashboard leer | Im Clickdummy beide Zustände zeigen |
| Täglich 10–20 Minuten Nutzung, Aufwand unter 15 Minuten | Werkzeug wird als Last empfunden | Nach 4 Wochen Selbsteinschätzung |
| Erster Monat dient als Ausgangsbasis, Zielwerte erst danach | Erfolg bleibt unbestimmt | Nach 4 Wochen Zielwerte festlegen |
| Keine automatische Löschung | Datenschutzrisiko bei wachsendem Bestand | Nagarro-Datenschutz |
| Upload-Weg (1.3): Pause, Urlaubssperre, Obergrenze von 20 und die Lauftage Mo/Do steuert auf diesem Weg nur der Prompt der Claude-Aufgabe, nicht das Cockpit `[Offen]` | Marco bekommt Läufe, obwohl er pausiert hat, oder zu viele Vorschläge | Marco entscheidet, ob das Cockpit beim Hochladen Pause, Sperrzeit und Obergrenze prüft |
| Je Tag nur ein Lauf; hat Marco einen Tag ausgelassen, liegen zwei Dateien vor `[Offen]` | Die zweite Datei lässt sich erst am nächsten Werktag hochladen | Marco entscheidet, ob ein Upload das Datum der Datei tragen darf |

## 14. Änderungsverlauf

| Version | Datum | Was sich geändert hat und warum |
|---|---|---|
| 0.1 | 18.11.2026 | Erstentwurf nach Runde 1: Ein-Nutzer-System, halbautomatischer Versand, SAP-Übergabe per Knopfdruck ab Antwort; Verbindungsprüfung eingearbeitet |
| 0.2 | 18.11.2026 | Runde 2: eigenes Cockpit bestätigt. Neu: Agent-Steuerung im Cockpit mit Pause und Sperrzeiten (F10, A7, S9). E-Mail als gleichwertiger Kanal neben LinkedIn, dazu lesender HubSpot-Abgleich (F11). Schließen statt löschen, automatische Löschfrist entfernt. Nur Desktop. Fristen 7 Werktage / ein Nachfassen / 21 Tage bestätigt |
| 0.3 | 18.11.2026 | Runde 3: Laufzeit fest 6:30 Uhr. HubSpot im ersten Wurf nicht angebunden, F11 gestrichen und nach »Später« verschoben. E-Mail-Grundlage prüft Marco von Hand und wählt sie vor dem Öffnen des Entwurfs. Agent liefert nur die LinkedIn-Fassung, E-Mail-Fassung auf Knopfdruck. Wiederansprache nach 6 Monaten bestätigt |
| 1.0 | 18.11.2026 | Runde 4 und Fertig-Check: E-Mail-Fassung per Vorlage, zweiter Ansprechpartner erlaubt und markiert, SAP-Suche vor dem Anlegen, Obergrenze und Zusatzlauf, Anmutung und Name bestätigt. Aus dem Fertig-Check ergänzt: Regeln für »neutral/später«, »Kein Interesse« und Verwerfen; Beispieldaten für Antworten und SAP-Fehlerfall erweitert |
| 1.1 | 18.11.2026 | Clickdummy freigegeben, Ergebnisse übernommen: Beispielvorschläge für den Eingangskorb ergänzt; Widerspruch bei Albers aufgelöst (SAP-Protokoll entsteht erst in A5); Regeln für »Wieder öffnen«, Zusatzlauf in Sperrzeiten, Nachfassen per E-Mail, Bezugsgrößen der Kennzahlen, CSV-Spalten und Signatur ergänzt; S5 und S7 ohne gewählten Kontakt beschrieben. Abweichung: Der Dummy erzeugt den Schließen-Vorschlag nur nach dem Nachfassen und protokolliert auch lauffreie Tage; maßgeblich sind die Regeln in Abschnitt 9 |
| 1.2 | 18.11.2026 | Entscheidungen aus der Stories-Stufe: lauffreie Tage erscheinen nicht im Laufprotokoll (bestätigt); Freigabe einer Wiederansprache öffnet den bestehenden Kontakt; Mindestumsatz wird am Gegenwert in EUR geprüft, den der Agent mit Kurs und Quelle liefert; Aktion »Löschen« in S3 und S4; Fristen in S8 nur Anzeige; verworfene Firmen bleiben gesperrt, bis der Eintrag entfernt wird. Der Clickdummy zeigt diese Punkte noch nicht. Stories am 18.11.2026 freigegeben; damit ist auch bestätigt, dass eine Firma nur ohne Ansprechpartner gelöscht werden kann |
| 1.3 | 19.11.2026 | Marco will echte Daten statt des Simulators. Entscheidung: Die geplante Claude-Aufgabe liefert die Ergebnisdatei, Marco lädt sie hoch (A1); beim Hochladen prüft das Cockpit gegen die Sperrliste (Regel in Abschnitt 9). Neu: Echtbetrieb mit eigenem Datenbestand neben dem Vorführbestand (Abschnitt 5). Die Agenten-API bleibt für später. Ergänzt nach der Prüfung von E2-S5: Abgleich mit offenen Vorschlägen beim Anlegen, Sperrliste über den Wortanfang, Glätten kleiner Formatabweichungen; offene Fragen zum Upload-Weg in Abschnitt 13 |
