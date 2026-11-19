# E2-S3 – Recherchelauf anlegen: Prüfung 1

Branch: story/E2-S3-lauf-anlegen (Commit 1f705f9, Vergleich gegen 688bb80) · Datum: 19.11.2026 · **Urteil: Bestanden**

## Tests
Ausgeführt: 32 · Bestanden: 32 · Befehl: `TEST_API_PORT=3600 TEST_WEB_PORT=5674 PLAYWRIGHT_CHANNEL=chrome npm test`

- Typprüfung (`tsc --noEmit`) und ESLint ohne Fehler.
- Vitest: 7 Dateien, 26 Tests bestanden, davon 6 in `tests/api/E2-S3.test.ts`.
- Playwright: 6 Tests bestanden (E1-S0, E1-S1, E1-S2).
- Zwischen 688bb80 und dem Branch wurde unter `tests/` nur `tests/api/E2-S3.test.ts` hinzugefügt (`git diff --stat 688bb80 HEAD -- tests`). Kein bestehender Test wurde gelöscht, gelockert oder übersprungen.

Beurteilung der Tests:
- #1 prüft Datum 2026-11-19, `anzahl_vorschlaege` 4, `anzahl_freigegeben` 0, viermal `zu_pruefen` und die vier Nachnamen in der Datenbank. Ohne die Route schlägt der Test fehl (404).
- #2 prüft die Felder konkret, aber nur für Kortmann (alle Felder) und Ammann (Fremdwährung, LinkedIn leer). Voss und Albers habe ich am laufenden System nachgeprüft.
- #3 prüft den Text der Abdeckungsgrenze wörtlich.
- #4 prüft Index, Feld und Meldung der beiden Rückweisungen und dass die beiden übrigen Vorschläge angelegt werden.
- #5 schickt Zustand, Id, `ansprechpartner_id` und einen geänderten Umsatz einer bestehenden Firma mit und prüft, dass nichts davon wirkt.
- Der Zusatztest prüft 409 beim zweiten Lauf am selben Tag, 400 ohne Liste und 401 mit Sitzung statt Schlüssel.

## Akzeptanzkriterien
| Kriterium | Ergebnis (erfüllt · nicht erfüllt · nicht prüfbar) | Beleg |
|---|---|---|
| 1 Beispiel-Lauf vom 19.11.2026: Lauf mit Datum 19.11.2026, 4 Vorschlägen, 0 Freigaben, jeder Vorschlag »Zu prüfen« | erfüllt | Datum per `POST /sim/datum {"heute":"2026-11-19"}` gesetzt, dann `POST /api/v1/agent/laeufe` mit Schlüssel und `src/simulator/beispiel-lauf.json` → 201 `{"lauf_id":5,"angelegt":4,"zurueckgewiesen":[]}`. In der Datenbank hat `recherchelauf` id 5: datum `2026-11-19`, ergebnis `ausgefuehrt`, anzahl_vorschlaege 4, anzahl_freigegeben 0, herkunft `api`. `vorschlag` 1–4 sind alle `zu_pruefen`, in der Reihenfolge Kortmann, Voss, Albers, Ammann. |
| 2 Je Vorschlag Firma, Ansprechpartner, Anlass, Betreff und LinkedIn-Nachricht gespeichert, bei Fremdwährung Kurs mit Quelle und EUR-Gegenwert | erfüllt | `vorschlag.daten` von Lauf 5 enthält alle geforderten Felder, z. B. Ammann: `umsatz_wert` 88, `CHF`, 2025, `konzern`, Quell-URL, `wechselkurs` 1.06, `wechselkurs_quelle_url`, `umsatz_eur` 93.3, `anrede` Herr, `funktion`, `quelle_url`, `linkedin_url` null, Anlass `kein_anlass` mit Beschreibung, Hypothese und Gesprächsziel, Betreff »Gästeservice und CRM« und Text. Die Werte stimmen mit Konzept 8 und `clickdummy.html` (demoProps) überein. Bei Albers sind Betreff und Text leer geliefert, wie im Clickdummy; gespeichert ist, was geliefert wurde. |
| 3 Bei 4 statt 10 steht im Feld »Abdeckungsgrenzen« der Text des Agenten | erfüllt | `recherchelauf.abdeckungsgrenzen` von Lauf 5 = »Nur 4 belegte Treffer statt 10, Lücke benannt; 1 Profil ohne verifizierte URL«. Eigener Lauf mit `"abdeckungsgrenzen":"Test"` speichert »Test«. |
| 4 Vorschlag ohne Personen- oder Firmennamen wird mit Meldung samt Feld zurückgewiesen, die übrigen angelegt | erfüllt | Am 20.11.2026 ein Lauf mit 9 Vorschlägen → 201, `angelegt` 1, im Lauf nur Voss gespeichert (`anzahl_vorschlaege` 1). Die acht Rückweisungen nennen das Feld: vorname gelöscht → `person.vorname` »Das Feld »person.vorname« fehlt.«; nachname aus Leerzeichen → »Der Nachname der Person fehlt.«; `firma` fehlt → `firma`; `firma.name` null → `firma.name`; `person` fehlt → `person`; Vor- und Nachname leer → »Der Vorname der Person fehlt.« (zu Meldungen bei anderen Feldern siehe Befund 1). |
| 5 Der Agent kann über diesen Weg weder freigeben noch einen bestehenden Datensatz ändern | erfüllt | Am 23.11.2026 Albers mit `id`, `zustand:"freigegeben"`, `ansprechpartner_id:1`, `bezug_ansprechpartner_id:1`, `firma.id/status/sap_account_id`, `person.id/status/firma_id` geschickt, dazu oben `lauf_id:1`, `datum:"2026-11-16"`, `ergebnis`, `anzahl_freigegeben:4`, `herkunft:"upload"`, `zielbild` → 201. Neuer Lauf 7 mit Datum 2026-11-23, `herkunft` api, `anzahl_freigegeben` 0. Der Vorschlag ist `zu_pruefen`, `ansprechpartner_id` null, Zusatzfelder nicht in `daten`. Die Prüfsummen von `firma`, `ansprechpartner` und Läufen 1–6 sind vorher und nachher gleich. Mit Agenten-Schlüssel liefern `POST /vorschlaege/1/freigabe`, `PATCH /firmen/1`, `POST /sim/zuruecksetzen` und `POST /sim/datum` jeweils 403 `rolle_nicht_erlaubt`. |

Zusätzlich am laufenden System geprüft:
- **Doppelte Ausführung:** Ein zweiter Lauf am selben Tag liefert 409 `bereits_gelaufen` (Konzept 9: »Je Tag höchstens ein Lauf«).
- **Unerlaubte Rolle oder kein Schlüssel:** ohne Schlüssel, mit falschem Schlüssel und mit Marcos Sitzung kommt jeweils 401 `schluessel_ungueltig`.
- **Leere oder kaputte Eingaben:**
  - Bei kaputtem JSON, leerem Body, Array als Body oder `vorschlaege` als Text kommt 400.
  - Ein leerer Lauf mit `vorschlaege: []` und »Keine weiteren belegten Treffer« wird mit 0 Vorschlägen angelegt (201).
- **Ausnahme A1 »weniger Treffer als angefordert«:** siehe Kriterium 3.
- **Stichprobe aus früheren Stories:**
  - E1-S1: Anmeldung und `GET /ich` gehen.
  - E1-S2: `POST /sim/datum` mit `heute` und mit `plus_werktage` geht. `POST /sim/zuruecksetzen` setzt zurück auf 4 Läufe, 0 Vorschläge, 7 Firmen und das Datum 2026-11-18.

## Befunde
| Nr. | Stelle | Befund | Schwere | So nachvollziehen |
|---|---|---|---|---|
| 1 | `src/server/dienste/lege-lauf-an.ts` (Meldung der Rückweisung) | Rückweisungen bei anderen Feldern als den Namen haben unbrauchbare Meldungen. Ein falsches Land liefert den englischen Zod-Text »Invalid option: expected one of "DE"\|"AT"\|"CH"«. Ein Umsatz als Text (`"88"`) liefert »Das Feld »firma.umsatz_wert« fehlt.«, obwohl das Feld da ist. Ein Eintrag `null` oder `"abc"` in `vorschlaege` liefert `feld: ""` und »Das Feld »« fehlt.«. Architektur 9 verlangt deutsche Meldungen, die sagen, was zu tun ist. Der Grund: Die Prüfung `f.input === undefined` greift bei jedem Typfehler, nicht nur bei fehlenden Feldern. | Sollte | Lauf mit `firma.land:"Deutschland"`, `firma.umsatz_wert:"88"` und einem Eintrag `null` an `POST /api/v1/agent/laeufe` schicken und `zurueckgewiesen` ansehen |
| 2 | `src/server/dienste/lege-lauf-an.ts` (Prüfung des ganzen Laufs) | Ist `abdeckungsgrenzen` eine Zahl, meldet das Cockpit 400 »Der Lauf braucht eine Liste »vorschlaege«.« mit `feld: "vorschlaege"`. Das nennt das falsche Feld. | Sollte | `{"abdeckungsgrenzen":4,"vorschlaege":[]}` schicken |
| 3 | `src/gemeinsam/lauf.ts`, `src/server/dienste/lege-lauf-an.ts`, `src/server/daten/laeufe.ts` | Erlaubte Werte stehen außerhalb von `werte.ts`: Anrede `['Frau','Herr']`, Herkunft `'api' \| 'upload'` und `'ausgefuehrt'` und `'zu_pruefen'` als Text im SQL. Das widerspricht der Arbeitsregel in Architektur 9 (»Niemand schreibt sie an anderer Stelle als Text aus«). | Sollte | Dateien lesen und mit `src/gemeinsam/werte.ts` vergleichen (dort fehlen Anrede und Herkunft) |
| 4 | `docs/umsetzung/E2-S3.md`, »So prüft man es von Hand« | Die Schritte setzen das Datum nicht. Nach `npm run reset` steht die Uhr auf 2026-11-18, der Lauf bekommt also das Datum 18.11.2026, nicht wie in Kriterium 1 den 19.11. | Hinweis | Nach dem Zurücksetzen den curl-Aufruf aus der Notiz ausführen: Lauf 5 hat `datum` 2026-11-18 |
| 5 | Ablauf A1 Schritt 5 | Auch ein Lauf, in dem alle Vorschläge zurückgewiesen werden, wird als »ausgeführt« gespeichert und belegt den Tag. Ein korrigierter zweiter Versuch bekommt 409. Die Rückweisungen stehen nur in der Antwort, nirgends für Marco sichtbar. Das passt zu den Kriterien, sollte aber für E2-S5 und E2-S6 und für Marco bewusst entschieden werden. | Hinweis | Lauf mit `[null,"abc",{}]` → 201 mit `angelegt` 0, danach 409 |
| 6 | `vorschlag.fehlende_pflichtangaben` | Der Standardwert `[]` steht auch bei Albers, obwohl dort Betreff und Text leer sind. Das ist bis E3-S2 richtig (nicht enthalten), wirkt aber wie »nichts fehlt«. E3-S2 muss den Wert berechnen. | Hinweis | `SELECT fehlende_pflichtangaben FROM vorschlag WHERE id=3` |
| 7 | `src/gemeinsam/lauf.ts` | `daten` ist nicht »genau wie geliefert« (Architektur 4): Unbekannte Felder werden verworfen (gewollt für Kriterium 5) und Namen getrimmt. Ein Suchhinweis zur Person (Konzept 8: »LinkedIn-URL oder Suchhinweis«) ginge damit ohne Meldung verloren. Kriterium 2 verlangt ihn nicht. | Hinweis | Feld `person.suchhinweis` mitschicken, es fehlt danach in `daten` |
| 8 | `src/server/api/agent.ts` | Die Route gibt `req.body` ungeprüft an den Dienst weiter, die Prüfung gegen das Schema liegt im Dienst. Laut Architektur 3 prüft eigentlich `api` die Eingabe. Wegen der Wiederverwendung im Upload (E2-S5) und der Teilannahme aus Kriterium 4 ist das nachvollziehbar. `src/simulator/beispiel-lauf.json` (eigentlich E1-S3) liegt schon hier, wie in der Übergabe gemeldet. | Hinweis | Datei lesen |

## Nicht geprüft
- Keine Oberfläche, weil die Story keine hat. Den Lauf im Eingangskorb anzuzeigen ist E3-S1.
- Gleichzeitige Aufrufe am selben Tag nicht ausgelöst. Abgesichert ist das durch den eindeutigen Index `recherchelauf_ein_lauf_je_tag` im Schema, gelesen, nicht unter Last getestet.
- Dublettenprüfung (E2-S4), Pflichtangaben (E3-S2) und Zusammenspiel mit dem Laufauftrag (E2-S1) sind laut Story nicht enthalten.
