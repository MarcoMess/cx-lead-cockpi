# Clickdummy – Notizen

Gebaut aus: konzept.md Version 1.0 · Datum: 18.11.2026

Status: von Marco freigegeben am 18.11.2026. Die Lücken unten sind in konzept.md Version 1.1 eingearbeitet.

## So führst du ihn vor

1. Am Desktop öffnen. Die gelb gestreifte Leiste oben ist die Vorführleiste und gehört nicht zum Produkt.
2. Mit **A1** beginnen und dort »Nächster Werktag, 6:30 Uhr: Agent meldet sich« auslösen. Achte darauf, wie der Lauf im Laufprotokoll (S9) und im Eingangskorb (S2) erscheint.
3. Danach **A2** (prüfen, freigeben, verwerfen) und **A3** (Ansprechen). In A3 beide Kanäle ausprobieren: LinkedIn mit Kopieren und Profil öffnen, E-Mail mit »E-Mail-Fassung erzeugen« und der Auswahl der Grundlage.
4. Für **A4** den Agenten-Auslöser mehrmals klicken. Jeder Klick rückt das Datum um einen Werktag vor, so werden die Wiedervorlagen vom 23. und 24.11. fällig.
5. **A5** zeigt die SAP-Übergabe. Der erste Versuch scheitert absichtlich, damit der Fehlerfall sichtbar wird. »Zurücksetzen« stellt jederzeit den Ausgangszustand her.

Selbstprüfung: Alle sieben Abläufe samt Ausnahmen wurden automatisiert durchgeklickt (keine Fehler in der Konsole) und fünf Screens im Browser per Screenshot angesehen. Nicht geprüft: das Öffnen des E-Mail-Entwurfs in deinem Outlook.

## Annahmen beim Bauen

| Stelle (Screen oder Ablaufschritt) | Was im Konzept fehlte | Was ich angenommen habe |
|---|---|---|
| A1, A2, S2 | Beispieldaten enthalten keinen Vorschlag im Zustand »Zu prüfen« | Ein Lauf vom 19.11.2026 mit vier erfundenen Vorschlägen: Sabine Kortmann (Kranbau Oberhavel GmbH), Miriam Voss (Hansemarkt, zweiter Ansprechpartner), Dr. Katrin Albers als Dublette, Reto Ammann (Seehotel-Gruppe Bodan AG, kein Anlass, kein Profil-Link). Abdeckungsgrenze »Nur 4 belegte Treffer statt 10« |
| S5, Nachrichten | Nur die Nachricht für Albers ist ausformuliert, die übrigen »gleicher Bauart« | Texte für Reinhardt, Gruber, Bernasconi und die vier Vorschläge selbst geschrieben, 45–70 Wörter |
| S5, S4, Anlass | Relevanzhypothese und Gesprächsziel haben keine Beispielwerte | Je Anlass einen Satz formuliert |
| S4, S5 | LinkedIn-URLs und E-Mail-Adressen fehlen | Beispiel-URLs für Albers, Reinhardt, Gruber, Bernasconi; Adressen für Reinhardt und Hollenstein, weil beide laut Daten per E-Mail angeschrieben wurden |
| S1, Aufschlüsselung nach Rolle | Rollen-Kategorie je Kontakt fehlt | Aus der Funktion abgeleitet (z. B. Albers: Service/After-Sales) |
| S8, E-Mail-Fassung | Inhalt der Signatur fehlt | »Beste Grüße / Marco Messinger / Director Customer Experience & Innovation / Nagarro« |
| Vorführleiste | Kein Datum für »heute« festgelegt | Dummy startet am 18.11.2026; der Agenten-Auslöser rückt je Klick einen Werktag vor |
| S7 | SAP-IDs und Ablauf des Fehlerfalls | IDs erfunden; der erste Übergabeversuch je Sitzung liefert den Fehler »Pflichtfeld Land fehlt«, »Erneut versuchen« führt zum Erfolg |
| S1 | Zahlen für den Zustand ab 20 Kontakten | Schalter in der Vorführleiste mit Beispielzahlen (96 Vorschläge, 64 angeschrieben, 17 Antworten) |
| S4, »Wieder öffnen« | Zielstatus nicht festgelegt | Zurück auf »Angeschrieben«, ohne Kontaktversuch auf »Freigegeben« |
| S3, »Bearbeiten« | Welche Felder änderbar sind | Anschrift und allgemeiner Firmenkontakt |
| S4, Antwort »neutral/später« | Vorschlagsdatum der Wiedervorlage | Heute plus 30 Tage, frei änderbar |
| S5, »Profil öffnen« | – | Zeigt nur einen Hinweis, weil die Personen erfunden sind |
| S5 und S7 ohne gewählten Kontakt | Konzept beschreibt beide Screens nur mit Kontakt | S5 zeigt zwei Listen (Erstkontakt offen, Nachfassen möglich), S7 zeigt »Bereit zur Übergabe« und das Protokoll |
| S8, CSV-Export | Spalten des Exports | Name, Funktion, Firma, Branche, Land, Status |
| Alle Quellenlinks | Keine echten Quellen in den Beispieldaten | Links zeigen auf example.com |

## Lücken und Widersprüche im Konzept

| Abschnitt | Beobachtung | Vorschlag |
|---|---|---|
| 8, SAP-Übergaben | Albers steht als »Gespräch vereinbart«, laut Übergabe-Tabelle ist sie aber schon am 09.11. an SAP übergeben. Im Dummy bleibt sie »Gespräch vereinbart« und dient als Beispiel für A5 | Beispielübergabe aus den Daten streichen oder einem eigenen, bereits übergebenen Kontakt zuordnen |
| 8, Rechercheläufe | Die drei Läufe zählen zusammen 21 Freigaben, es gibt aber nur sieben Ansprechpartner. Das Dashboard zeigt deshalb »21 freigegeben« neben »6 angeschrieben« | Zahlen der Läufe an die Kontakte angleichen |
| 8, Beispieldaten | Kein Vorschlag im Zustand »Zu prüfen«, dadurch hat A2 keine Daten | Die vier Vorschläge aus dem Dummy ins Konzept übernehmen |
| 8, Beispieldaten | Für Ostermann, Wiesner und Hollenstein fehlen Anlass und Nachricht | Ergänzen oder als »Altbestand ohne Anlass« kennzeichnen |
| 8, Firma | Domain, Anschrift, Firmenkontakt und Umsatzquelle haben keine Beispielwerte | Je Firma ergänzen; im Dummy stehen sie als »nicht belegt« |
| 9, Laufentscheidung | Unklar, ob jeder Werktag ohne Lauf als »Übersprungen: kein Lauftag« im Protokoll steht. Im Dummy ja, das Protokoll wird dadurch schnell lang | Nur Lauftage protokollieren; andere Tage weglassen |
| 9, Schließen nach 21 Tagen | Unklar, wann die Wiedervorlage »Ohne Antwort schließen?« entsteht. Im Dummy erst beim Nachfassen; ohne Nachfassen gibt es keinen Vorschlag | Vorschlag immer 21 Tage nach dem Erstkontakt erzeugen |
| 9, Zusatzlauf | Unklar, was gilt, wenn der nächste Werktag in einer Sperrzeit liegt. Im Dummy wartet der Zusatzlauf bis nach der Sperrzeit | So festschreiben oder Sperrzeit für Zusatzläufe ignorieren |
| 9, Kennzahlen | »Freigegeben« zählt Läufe im Zeitraum, »Angeschrieben« zählt Erstkontakte im Zeitraum. Der Trichter mischt damit zwei Bezugsgrößen | Alles auf die Kohorte der Läufe beziehen oder im Dashboard erklären |
| 9, »Wieder öffnen« | Zielstatus fehlt | Regel aufnehmen (siehe Annahme oben) |
| 6, A3 | Nachfassen per E-Mail: Die E-Mail-Fassung entsteht aus der Nachfass-Nachricht, die es zu dem Zeitpunkt noch nicht gibt | Reihenfolge festlegen: erst Nachfass-Text schreiben, dann Fassung erzeugen (so im Dummy) |
| 11, E-Mail-Entwurf | In der claude.ai-Ansicht kann der Link ins Mailprogramm blockiert sein | Mit der Datei clickdummy.html lokal in Outlook testen, auch mit Umlauten |

## Gestaltungsentscheidungen

- **Farben:** Dunkelblau (#0E1B33) für Navigation und Text, Mintgrün (#47D7AC) als sparsamer Akzent für die Hauptaktion und den aktuellen Status. Das ist eine Annäherung an Nagarro; die offiziellen Farbwerte habe ich nicht verifiziert. Wenn du die Werte aus dem Styleguide nennst, tausche ich sie aus.
- **Schrift:** Überschriften in einer DIN-artigen Systemschrift (Bahnschrift unter Windows, DIN Alternate am Mac), passend zum technischen Zielmarkt. Externe Schriften sind nicht eingebunden, damit die Datei offline funktioniert.
- **Statusleiste in der Kontaktakte:** Die sieben Status stehen als nummerierte Schiene über dem Kontakt, weil sie eine echte Reihenfolge sind. Endzustände erscheinen als Hinweis statt auf der Schiene.
- **Etiketten:** Hypothesen violett, »nicht belegt« und fehlende Anlässe gelb, Fehler rot. So bleiben Fakten und Annahmen auf einen Blick getrennt.
- **Aufbau:** Listen links, Akte rechts; keine Kacheln zur Dekoration. Mindestbreite 1120 Pixel, weil das Konzept nur Desktop vorsieht.
- **Tonalität:** Du-Form, kurze Sätze, Schaltflächen nennen die Aktion (»Als gesendet markieren«, »Übergabe bestätigen«).
