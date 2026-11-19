# CX Lead Cockpit – Architektur

Abgeleitet aus: konzept.md Version 1.2, stories.md vom 19.11.2026 · Stand: Freigegeben (Marco, 19.11.2026), Version 1.3

Eine Datei `technik-vorgaben.md` lag nicht vor. Die Technik hat Marco am 18.11.2026 gewählt: »TypeScript schlank«. Die Qualitätsstufe ebenfalls: »Prototyp, simuliert«.

## 1. Ziel und Qualitätsstufe

Gebaut wird ein lauffähiger Prototyp des ersten Wurfs: alle neun Screens, alle 43 Stories, geladen mit den Beispieldaten aus Abschnitt 8 des Konzepts. Er läuft auf einem Rechner, für einen Nutzer.

Ausdrücklich nicht gebaut werden:

- die echte Anbindung an die SAP Sales Cloud V2. Die Übergabe geht gegen einen Simulator hinter derselben Schnittstelle.
- die echte geplante Claude-Aufgabe. Ein Agenten-Simulator spielt den Agenten über die echte Agenten-API des Cockpits. Geliefert wird zusätzlich der Prompt für die spätere Claude-Aufgabe als Datei.
- Betrieb, Hosting, Datensicherung, Unternehmens-Anmeldung, Lastfähigkeit, mehrere Nutzer.
- alles aus »Später« und »Bewusst nicht« im Konzept.

## 2. Technik

| Bereich | Wahl | Quelle | Begründung |
|---|---|---|---|
| Sprache | TypeScript 5, überall | Marcos Wahl | Eine Sprache für Oberfläche, Logik und Tests; Typen werden zwischen beiden Seiten geteilt |
| Laufzeit | Node.js 22 LTS, mindestens 22.22 | Marcos Wahl, Version von Marco am 19.11.2026 bestätigt | Langzeit-Version; React Router 8 verlangt mindestens 22.22 |
| Oberfläche | React 19.3 mit Vite 8 und React Router 8 | Marcos Wahl | Kleinste verbreitete Kombination für neun Screens; kein Framework darüber |
| Gestaltung | Eigenes CSS mit den Farb- und Schriftwerten aus `clickdummy.html`; keine Komponentenbibliothek | Abgeleitet aus dem freigegebenen Clickdummy | Der Dummy ist die Vorlage; eine Bibliothek würde ein anderes Aussehen erzwingen |
| Server | Fastify 5.12 | Marcos Wahl (Node.js-Server) | Schlank, eingebaute Testschnittstelle ohne Netzwerk |
| Eingabeprüfung | Zod 4.6, Schemas in `src/gemeinsam` | Ergänzung | Dieselben Schemas prüfen am Server und typisieren die Oberfläche |
| Datenhaltung | SQLite, eine Datei `data/cockpit.sqlite`, Zugriff über das in Node.js eingebaute `node:sqlite` (`DatabaseSync`) mit handgeschriebenem SQL; Transaktionen über `transaktion()` in `src/server/daten/db.ts` | Marcos Wahl; Ausweichweg aus Abschnitt 11 seit 19.11.2026 | Kein Datenbankserver und keine Kompilierung bei der Installation; ein Nutzer, kleine Datenmengen |
| Anmeldung | Ein Nutzer, Passwort aus der Umgebungsvariable `COCKPIT_PASSWORD`, verschlüsseltes Sitzungs-Cookie (`@fastify/secure-session` 8, Schlüssel aus `COCKPIT_SESSION_SECRET`) | `[Annahme]` für den Prototyp | Erfüllt E1-S1 ohne Abhängigkeit von der IT |
| Tests Logik und Schnittstelle | Vitest 5, Aufrufe über `fastify.inject` | Ergänzung | Schnell, ohne Browser, jede Regel einzeln prüfbar |
| Tests Oberfläche | Playwright 1.65 mit Chromium; ist `PLAYWRIGHT_CHANNEL=chrome` gesetzt, wird ein installiertes Chrome genutzt | Ergänzung | Klickt die Akzeptanzkriterien wörtlich nach |
| Werkzeuge | npm (ein Paket, keine Workspaces), TypeScript 5.9, tsx zum Starten des Servers, concurrently, ESLint 10 mit typescript-eslint, Prettier | Ergänzung | Ein Befehl zum Starten, ein Befehl zum Testen |
| Ablage | Git, GitHub; ein Branch je Story | Pipeline-Vorgabe | Passt zu Umsetzung und Prüfung je Story |

Die Versionen wurden am 19.11.2026 im npm-Verzeichnis geprüft. TypeScript bleibt bewusst bei 5.9, weil typescript-eslint Version 7 noch nicht unterstützt. Die genauen Versionsnummern legt die Grundgerüst-Story in `package.json` und `package-lock.json` fest. Ab dann gelten sie für alle Stories; keine Story aktualisiert Abhängigkeiten nebenbei.

## 3. Bausteine

| Baustein | Aufgabe | Kennt | Kennt nicht |
|---|---|---|---|
| `web` | Die neun Screens, Navigation, Vorführleiste | `gemeinsam`, die HTTP-Schnittstelle | Datenbank, Regeln, Anbindungen |
| `gemeinsam` | Typen, Zod-Schemas, Listen erlaubter Werte | nichts | alles andere |
| `api` | HTTP-Routen, Anmeldung, Eingabeprüfung, Fehlerformat | `dienste`, `gemeinsam` | SQL, Regeln im Detail |
| `dienste` | Ein Anwendungsfall je Funktion: lädt Daten, wendet Regeln an, speichert, ruft Anbindungen | `regeln`, `daten`, `anbindungen`, `gemeinsam` | HTTP, React |
| `regeln` | Alle Regeln aus Abschnitt 9 des Konzepts als reine Funktionen | `gemeinsam` | Datenbank, HTTP, Uhrzeit des Systems |
| `daten` | Schema, Zugriff je Tabelle, Startdaten | `gemeinsam` | Regeln, HTTP |
| `anbindungen` | Schnittstelle zu SAP und zur Uhr, samt Simulatoren | `gemeinsam`, `daten` (nur der Simulator) | Regeln, React |
| `simulator` | Vorführ-Routen und Agenten-Simulator | Vorführ-Routen (`sim-routen.ts`): `dienste` wie eine Routen-Datei in `api`. Agenten-Simulator (`agent.ts`): nur die Agenten-API, für den eigenen Zustand `daten/einstellungen` | `regeln`, Interna der Dienste |

Was wo auf keinen Fall hingehört:

- `web`: keine Regel. Die Oberfläche fragt den Server, ob eine Aktion möglich ist, und rechnet weder Fristen noch Status selbst. Einzige Ausnahme ist der Wortzähler.
- `gemeinsam`: kein Code mit Wirkung, nur Typen, Schemas und Konstanten.
- `api`: keine Fachlogik. Eine Route prüft die Eingabe, ruft genau einen Dienst und formt die Antwort.
- `dienste`: kein SQL und keine Datumsarithmetik. Beides liegt in `daten` und `regeln`.
- `regeln`: kein Zugriff auf Datenbank, Netz oder Systemzeit. »Heute« wird immer als Parameter übergeben.
- `daten`: keine Entscheidung. Hier steht nur, wie gelesen und geschrieben wird.
- `anbindungen`: keine Annahme darüber, wann übergeben werden darf. Das entscheidet `regeln`.
- `simulator`: kein direkter Schreibzugriff auf Fachtabellen. Das Zurücksetzen läuft über den Dienst `setzeZurueck()`. Der Agenten-Simulator nutzt die Agenten-API wie ein Fremder.

Die Grenzen prüft ESLint (`no-restricted-imports` in `eslint.config.js`) bei jedem `npm test`. Ein verbotener Import lässt den Testlauf scheitern.

## 4. Datenmodell

Benennung: Fachbegriffe deutsch wie im Konzept, ohne Umlaute, in `snake_case`. Alle Tabellen haben `id INTEGER PRIMARY KEY`. Datumswerte sind Text `JJJJ-MM-TT`, Zeitpunkte Text `JJJJ-MM-TT HH:MM`, jeweils in Ortszeit Europe/Berlin. Listen stehen als JSON-Text. »Pflicht« heißt `NOT NULL`.

**firma**

| Feld | Typ | Pflicht | Hinweis |
|---|---|---|---|
| name | Text | ja | wie geliefert, z. B. »Nordwerk Fördertechnik GmbH« |
| name_norm | Text | ja | für die Dublettenprüfung: klein, ohne Rechtsform, eindeutig |
| domain | Text | nein | |
| branche, land | Text | ja | land: DE, AT, CH |
| anschrift, firmenkontakt | Text | nein | leer wird als »nicht belegt« gezeigt |
| umsatz_wert | Zahl | ja | in Millionen der Währung |
| umsatz_waehrung | Text | ja | EUR, CHF |
| umsatz_jahr | Ganzzahl | ja | |
| umsatz_bezug | Text | ja | konzern, einzelgesellschaft |
| umsatz_quelle_url | Text | ja | |
| wechselkurs, wechselkurs_quelle_url, umsatz_eur | Zahl, Text, Zahl | bei Fremdwährung | umsatz_eur ist der geprüfte Gegenwert |
| status | Text | ja | aktiv, gesperrt |
| sap_account_id | Text | nein | |
| besitzer | Text | ja | immer »marco« |

**ansprechpartner** (gehört zu genau einer firma)

| Feld | Typ | Pflicht | Hinweis |
|---|---|---|---|
| firma_id | Verweis | ja | |
| anrede | Text | ja | Frau, Herr |
| titel | Text | nein | z. B. »Dr.« |
| vorname, nachname, funktion | Text | ja | |
| rolle | Text | ja | einer der acht Werte aus dem Rechercheprofil |
| quelle_url | Text | ja | Beleg für Name und Funktion |
| linkedin_url | Text | nein | eindeutig, wenn gesetzt |
| email, telefon | Text | nein | |
| email_herkunft | Text | nein | veroeffentlicht, von_marco |
| sprache | Text | ja | Vorgabe »de« |
| status | Text | ja | freigegeben, angeschrieben, nachgefasst, antwort_erhalten, gespraech_vereinbart, an_sap_uebergeben, kein_interesse, ohne_antwort_geschlossen, gesperrt |
| antwort_art | Text | nein | positiv, neutral_spaeter, kein_interesse |
| gespraech_termin | Text | nein | freier Text, z. B. »24.11.2026, 14:00 Uhr« |
| geschlossen_am | Datum | nein | Beginn der 6-Monats-Sperre |
| sap_kontakt_id, sap_lead_id | Text | nein | |
| besitzer | Text | ja | immer »marco« |

»Neu« und »Verworfen« aus der Statusliste des Konzepts sind Zustände eines Vorschlags, nicht eines Ansprechpartners.

**anlass** (beliebig viele je ansprechpartner; der neueste gilt): typ (eigener_beitrag, unternehmensanlass, kein_anlass; Pflicht), beschreibung, ereignis_datum, veroeffentlicht_am, quelle_url, hypothese, gespraechsziel, erstellt_am (Pflicht).

**nachricht** (Entwürfe; höchstens eine je ansprechpartner, kanal und art): kanal (linkedin, email), art (erstkontakt, nachfassen), betreff, text, sprache, fassung (agent, von_marco_geaendert, vorlage). Alle Pflicht außer betreff beim Nachfassen.

**kontaktversuch**: ansprechpartner_id, kanal (inmail, vernetzungsanfrage, linkedin_nachricht, email), art (erstkontakt, nachfassen), zeitpunkt, betreff, text (alle Pflicht außer betreff), email_grundlage (in_hubspot_bekannt, hat_geantwortet, andere; Pflicht bei kanal email), email_grundlage_notiz (Pflicht bei andere).

**antwort**: ansprechpartner_id, datum, einordnung (positiv, neutral_spaeter, kein_interesse, nicht_mehr_kontaktieren; Pflicht), wortlaut, naechster_schritt.

**wiedervorlage**: ansprechpartner_id, faellig_am, grund (alle Pflicht), art (nachfassen, schliessen_vorschlag, frei; Pflicht), erledigt (0/1).

**rechercheprofil** (genau eine Zeile): name, status (aktiv, pausiert), lauftage (Liste aus mo, di, mi, do, fr), anzahl, branchen, laender, mindestumsatz_mio_eur, rollen, obergrenze, zusatzlauf_vorgemerkt (0/1). Alle Pflicht.

**sperrzeit**: von, bis, bezeichnung. Alle Pflicht, bis nicht vor von.

**recherchelauf**: datum, ergebnis (ausgefuehrt, uebersprungen, uebertragung_fehlgeschlagen), grund (pausiert, sperrzeit, obergrenze), grund_text, anzahl_vorschlaege, anzahl_freigegeben, abdeckungsgrenzen, zielbild (JSON), herkunft (api, upload). Höchstens ein ausgeführter Lauf je Datum. Die beiden Zähler werden geführt, weil die drei Beispielläufe keine Vorschläge mitbringen.

**vorschlag** (gehört zu einem recherchelauf): zustand (zu_pruefen, freigegeben, verworfen), daten (JSON mit firma, person, anlass, nachricht genau wie geliefert), ist_dublette (0/1), ist_wiederansprache (0/1), bezug_ansprechpartner_id, fehlende_pflichtangaben (Liste), verwerf_grund, ansprechpartner_id (nach Freigabe). Der Hinweis »Zweiter Ansprechpartner« wird beim Lesen berechnet, nicht gespeichert.

**sperreintrag**: art (firma, person), name, firma_name (bei Person), grund (Text), herkunft (startbestand, verworfen, opt_out, von_marco, geloescht), gesperrt_bis (leer heißt dauerhaft), erstellt_am.

**sap_uebergabe**: ansprechpartner_id, zeitpunkt, erfolg (0/1), ergebnis (JSON-Liste je Objekt: objekt, ergebnis angelegt/verknuepft/fehler, sap_id, meldung).

**einstellung** (Schlüssel und Wert): signatur, agent_schluessel_hash, agent_schluessel_endung, sap_basis_url, sap_nutzer, sap_passwort, sap_letzter_test, heute_override.

Die Startdaten in `src/server/daten/startdaten.ts` enthalten wörtlich die Datensätze aus Abschnitt 8 des Konzepts sowie die ausformulierten Nachrichten, Hypothesen, Profil-Links und Adressen aus `clickdummy.html`. Der Lauf vom 19.11.2026 mit seinen vier Vorschlägen gehört nicht zu den Startdaten; ihn liefert der Agenten-Simulator.

## 5. Schnittstelle zwischen Oberfläche und Logik

Alle Adressen beginnen mit `/api/v1`. Ein- und Ausgabe sind JSON mit den Feldnamen des Datenmodells. Die Oberfläche meldet sich mit Sitzungs-Cookie an, der Agent mit `Authorization: Bearer <Schlüssel>`. Das Konzept nennt in Abschnitt 11 englische Pfade als Entwurf; sie werden durch die deutschen hier ersetzt (siehe Abschnitt 12).

Fehler haben immer diese Form und einen passenden Statuscode; eine unbekannte Adresse liefert 404 mit dem Code `nicht_gefunden`:

```json
{ "fehler": { "code": "grundlage_fehlt", "meldung": "Für E-Mail fehlt die geprüfte Grundlage.", "feld": "email_grundlage" } }
```

| Code | Bedeutung |
|---|---|
| 400 | Eingabe passt nicht zum Schema |
| 401 | nicht angemeldet oder Schlüssel ungültig |
| 403 | Rolle darf das nicht (z. B. Agent will freigeben) |
| 404 | Datensatz gibt es nicht |
| 409 | Zustand lässt die Aktion nicht zu (z. B. Übergabe im Status »Freigegeben«) |
| 422 | Fachregel verletzt (z. B. Pflichtangabe fehlt) |
| 502 | Fremdsystem meldet Fehler oder ist nicht erreichbar |

**Agent (nur mit Schlüssel)**

| Zweck | Adresse | Eingabe | Ausgabe | Fehler |
|---|---|---|---|---|
| Laufauftrag | `GET /agent/laufauftrag` | – | laufen, grund, grund_text, datum, zielbild | 401 |
| Ausschlussliste | `GET /agent/ausschlussliste` | – | firmen, personen | 401 |
| Lauf anlegen | `POST /agent/laeufe` | abdeckungsgrenzen, vorschlaege | lauf_id, angelegt, zurueckgewiesen | 400, 401, 409 (heute schon ein Lauf) |

Beispiel Laufauftrag am 19.11.2026:

```json
{ "laufen": true, "grund": null, "datum": "2026-11-19",
  "zielbild": { "anzahl": 10, "laender": ["DE","AT","CH"], "mindestumsatz_mio_eur": 50,
    "branchen": ["Maschinen-/Anlagenbau","Retail","Großhandel/technischer Handel","Utilities","Entsorgung","Infrastruktur","Technische Dienstleistungen","Hospitality"],
    "rollen": ["CIO/IT-Leitung","Digitalisierung/CDO","Customer Experience","Service/After-Sales","Vertrieb","CRM","E-Commerce","Kundenbindung"] } }
```

Am 20.11.2026: `{ "laufen": false, "grund": "kein_lauftag", "grund_text": "kein Lauftag", "datum": "2026-11-20" }`. Mögliche Gründe in dieser Reihenfolge: pausiert, kein_lauftag, sperrzeit, obergrenze; dazu bereits_gelaufen.

Beispiel Lauf anlegen (gekürzt auf einen Vorschlag); dieselbe Struktur ist das Format der Ergebnisdatei für den Upload:

```json
{ "abdeckungsgrenzen": "Nur 4 belegte Treffer statt 10, Lücke benannt; 1 Profil ohne verifizierte URL",
  "vorschlaege": [ {
    "firma": { "name": "Kranbau Oberhavel GmbH", "branche": "Maschinenbau", "land": "DE", "umsatz_wert": 121, "umsatz_waehrung": "EUR", "umsatz_jahr": 2025, "umsatz_bezug": "konzern", "umsatz_quelle_url": "https://example.com/geschaeftsbericht" },
    "person": { "anrede": "Frau", "titel": "", "vorname": "Sabine", "nachname": "Kortmann", "funktion": "Leiterin After-Sales Service", "rolle": "Service/After-Sales", "quelle_url": "https://example.com/unternehmensseite", "linkedin_url": "linkedin.com/in/sabine-kortmann-beispiel" },
    "anlass": { "typ": "unternehmensanlass", "beschreibung": "Pressemitteilung: Kundenportal für Ersatzteile angekündigt", "ereignis_datum": "2026-11-12", "quelle_url": "https://example.com/quelle", "hypothese": "…", "gespraechsziel": "…" },
    "nachricht": { "betreff": "Ersatzteilportal und Serviceprozesse", "text": "Hallo Frau Kortmann, …", "sprache": "de" } } ] }
```

Antwort: `{ "lauf_id": 5, "angelegt": 4, "zurueckgewiesen": [] }`.

**Oberfläche (nur mit Sitzung)**

| Zweck | Adresse | Eingabe | Ausgabe | Fehler |
|---|---|---|---|---|
| Lebenszeichen (ohne Anmeldung) | `GET /gesundheit` | – | `{ "ok": true }` | – |
| Anmelden, Abmelden, Wer bin ich | `POST /anmeldung`, `POST /abmeldung`, `GET /ich` | passwort | nutzer | 401 |
| Dashboard »Heute« | `GET /dashboard/heute` | – | neue_laeufe, freigegebene, wiedervorlagen_faellig, naechste_wiedervorlage, agent | – |
| Kennzahlen | `GET /kennzahlen?tage=30` | tage: 7, 30, 90 | vorschlaege, freigegeben, angeschrieben, antworten, positive, gespraeche, sap_uebergaben, median_tage, ueberfaellige, quoten (leer unter 20) | 400 |
| Aufschlüsselung | `GET /kennzahlen/aufschluesselung?tage=30&merkmal=kanal` | merkmal: branche, land, rolle, kanal, email_grundlage, aufhaenger | zeilen mit wert, angeschrieben, antworten, gespraeche | 400 |
| Läufe | `GET /laeufe`, `GET /laeufe/:id` | – | Lauf mit Vorschlägen samt Hinweisen und fehlenden Pflichtangaben | 404 |
| Ergebnisdatei hochladen | `POST /laeufe/upload` | Datei im Format von »Lauf anlegen« | wie »Lauf anlegen« | 400, 422 |
| Freigeben | `POST /vorschlaege/:id/freigabe` | – | ansprechpartner_id | 409 (schon geprüft), 422 (Dublette, Pflichtangabe) |
| Verwerfen | `POST /vorschlaege/:id/verwerfung` | grund (einer der fünf) | sperreintrag | 400, 409 |
| Firmen | `GET /firmen?suche=&branche=`, `GET /firmen/:id` | – | Liste, Detail mit Ansprechpartnern | 404 |
| Firma pflegen | `PATCH /firmen/:id` | anschrift, firmenkontakt | Firma | 400 |
| Firma sperren, löschen | `POST /firmen/:id/sperre`, `DELETE /firmen/:id` | – | – | 409 (hat noch Ansprechpartner) |
| Kontakte | `GET /kontakte?status=offene&merkmal=&wert=&tage=` | status: offene, alle oder ein Statuswert | Liste | 400 |
| Kontaktakte | `GET /kontakte/:id` | – | Stammdaten, Anlässe, Verlauf, erlaubte_aktionen | 404 |
| Ansprache laden | `GET /kontakte/:id/ansprache` | – | modus (erstkontakt, nachfassen, keine), aufhaenger, nachricht, erste_nachricht | 404 |
| E-Mail-Fassung erzeugen | `POST /kontakte/:id/email-fassung` | betreff, text | betreff, text | 422 (Text leer) |
| Versand protokollieren | `POST /kontakte/:id/kontaktversuche` | kanal, betreff, text, email_grundlage, email_grundlage_notiz, empfaenger | kontaktversuch, status, wiedervorlage | 409, 422 |
| Antwort erfassen | `POST /kontakte/:id/antworten` | einordnung, wortlaut, wiedervorlage_am | status, naechster_schritt | 409, 422 |
| Gespräch eintragen | `POST /kontakte/:id/gespraech` | termin | status | 409, 422 |
| Schließen, wieder öffnen | `POST /kontakte/:id/schliessung`, `POST /kontakte/:id/wiederoeffnung` | – | status | 409 |
| Kontakt sperren, löschen | `POST /kontakte/:id/sperre`, `DELETE /kontakte/:id` | – | – | 404 |
| Wiedervorlagen | `GET /wiedervorlagen`, `POST /kontakte/:id/wiedervorlagen`, `PATCH /wiedervorlagen/:id` | faellig_am, grund; erledigt oder faellig_am | Liste mit Kennzeichen ueberfaellig, heute, geplant | 400 |
| SAP-Vorschau | `GET /kontakte/:id/sap-vorschau` | – | zuordnung (drei Zeilen), account_treffer | 409 |
| SAP-Übergabe | `POST /kontakte/:id/sap-uebergabe` | – | erfolg, ergebnis je Objekt | 409, 502 |
| Übergabeprotokoll | `GET /sap/uebergaben` | – | Liste, neueste zuerst; dazu bereit_zur_uebergabe | – |
| Agent-Steuerung | `GET /agent-steuerung` | – | profil, sperrzeiten, naechster_lauf, laufprotokoll, hinweis_obergrenze | – |
| Profil speichern | `PUT /agent-steuerung/profil` | alle Profilfelder | profil, naechster_lauf | 400 |
| Pausieren, aktivieren, Zusatzlauf | `POST /agent-steuerung/pause`, `/aktivierung`, `/zusatzlauf` | – | profil, naechster_lauf | 409 |
| Sperrzeiten | `POST /sperrzeiten`, `DELETE /sperrzeiten/:id` | von, bis, bezeichnung | sperrzeiten, naechster_lauf | 422 |
| Sperrliste | `GET /sperrliste`, `POST /sperrliste`, `DELETE /sperrliste/:id` | art, name, grund | Liste | 422 |
| Einstellungen | `GET /einstellungen`, `PUT /einstellungen/signatur` | signatur | fristen, signatur, agent_schluessel_endung, sap (ohne Passwort) | 400 |
| Agenten-Schlüssel erneuern | `POST /einstellungen/agent-schluessel` | – | schluessel (einmalig im Klartext) | – |
| SAP-Zugang, Test | `PUT /einstellungen/sap`, `POST /einstellungen/sap/test` | basis_url, nutzer, passwort | erfolg, meldung, geprueft_am | 502 |
| CSV-Export | `GET /export/kontakte.csv` | – | Datei, Semikolon, UTF-8 mit BOM | – |

`GET /firmen`, `GET /kontakte` und `GET /kennzahlen` nehmen zusätzlich den Agenten-Schlüssel an, nur lesend (Story E10-S5).

Beispiel Versand protokollieren für Simone Gruber am 19.11.2026:

```json
// POST /api/v1/kontakte/3/kontaktversuche
{ "kanal": "vernetzungsanfrage", "betreff": "Kundenportal Netzanschlüsse 2027", "text": "Hallo Frau Gruber, …" }
// Antwort 201
{ "kontaktversuch": { "art": "erstkontakt", "zeitpunkt": "2026-11-19 08:45" },
  "status": "angeschrieben",
  "wiedervorlage": { "faellig_am": "2026-11-30", "grund": "Nachfassen, keine Antwort" } }
```

Beispiel Antwort für Peter Hollenstein: `{ "einordnung": "nicht_mehr_kontaktieren" }` ergibt `{ "status": "gesperrt", "naechster_schritt": "Gesperrt, Eintrag auf der Sperrliste" }`.

Beispiel SAP-Übergabe für Dr. Katrin Albers, erster Versuch im Simulator mit eingestelltem Fehler (Statuscode 502):

```json
{ "erfolg": false, "ergebnis": [ { "objekt": "account", "ergebnis": "fehler", "meldung": "Pflichtfeld »Land« fehlt" } ] }
```

Zweiter Versuch (200):

```json
{ "erfolg": true, "ergebnis": [
  { "objekt": "account", "ergebnis": "angelegt", "sap_id": "1000482" },
  { "objekt": "kontaktperson", "ergebnis": "angelegt", "sap_id": "2000913" },
  { "objekt": "lead", "ergebnis": "angelegt", "sap_id": "3000127" } ] }
```

Beispiel Kennzahlen am 18.11.2026 für 30 Tage:

```json
{ "vorschlaege": 28, "freigegeben": 21, "angeschrieben": 6, "antworten": 3, "positive": 1, "gespraeche": 1,
  "sap_uebergaben": 0, "median_tage": 3, "ueberfaellige": 0, "quoten": null }
```

## 6. Anbindungen und Simulation

| Fremdsystem | Was wir brauchen | Schnittstelle | Verhalten des Simulators | Wie man Ereignisse auslöst |
|---|---|---|---|---|
| SAP Sales Cloud V2 | Verbindung testen; Account per Name suchen; Account, Kontaktperson und Lead anlegen | `SapClient` in `src/server/anbindungen/sap.ts` mit `teste()`, `sucheAccount(name)`, `legeAccountAn()`, `legeKontaktpersonAn()`, `legeLeadAn()`. Gewählt über `SAP_MODE=simulated` | `SapSimulator` hält angelegte Objekte in der Tabelle `sim_sap_objekt`, vergibt IDs (Account 10…, Kontaktperson 20…, Lead 30…), findet Accounts per normalisiertem Namen. Gültiger Zugang: Nutzer `cockpit-api`, Passwort `simulator`; alles andere scheitert beim Test | `PUT /api/v1/sim/sap` mit `naechster_fehler`: `pflichtfeld_land`, `lead_fehler`, `nicht_erreichbar` oder leer; mit `bestehende_accounts` lässt sich ein Treffer vorbereiten |
| Recherche-Agent (geplante Claude-Aufgabe) | Werktäglich um 6:30 Uhr Laufauftrag abfragen, Ausschlussliste holen, Lauf anlegen | Die Agenten-API aus Abschnitt 5; der Agent ist ein Fremder mit Schlüssel | `src/simulator/agent.ts` ruft genau diese drei Adressen über HTTP auf. Erster Lauf: die vier Beispielvorschläge aus dem Konzept. Weitere Läufe: null Vorschläge mit Abdeckungsgrenze. Lässt aus, was auf der Ausschlussliste steht | `POST /api/v1/sim/agent/meldung` (oder die Schaltfläche in der Vorführleiste). Mit `{"api_gestoert": true}` in `PUT /api/v1/sim/agent` legt er keinen Lauf an, sondern hinterlegt die Ergebnisdatei unter `GET /api/v1/sim/agent/ergebnisdatei` für den Upload |
| Uhr | »Heute« für Fristen, Lauftage, Wiedervorlagen | `Uhr` in `src/server/anbindungen/uhr.ts` mit `heute()` und `jetzt()` | Liest `heute_override` aus den Einstellungen; ohne Wert das echte Datum. Nach dem Zurücksetzen steht sie auf 2026-11-18 | `POST /api/v1/sim/datum` mit `heute` oder `plus_werktage`; die Vorführleiste bietet »Nächster Werktag« |
| Mailprogramm | Entwurf mit Empfänger, Betreff, Text öffnen | Link `mailto:` in der Oberfläche, Werte URL-kodiert | kein Simulator nötig; der Test prüft die Adresse des Links | Klick auf »E-Mail-Entwurf öffnen« |
| LinkedIn / Sales Navigator | Profil in neuem Fenster öffnen | gewöhnlicher Link auf die hinterlegte URL | kein Simulator; es gibt keine Schnittstelle und keine Automatisierung | Klick auf »Profil öffnen« |
| HubSpot | nichts im ersten Wurf | – | – | – |

Die Simulator-Routen unter `/api/v1/sim` und die Vorführleiste gibt es nur, wenn `COCKPIT_DEMO=1` gesetzt ist. Die Vorführleiste ist optisch abgesetzt wie im Clickdummy und bietet: Zurücksetzen, Nächster Werktag, Agent meldet sich, API für den Agenten gestört, SAP-Fehler wählen.

Erweiterungspunkt für später: Eine Klasse `SapV2Client` mit derselben Schnittstelle ersetzt den Simulator, gewählt über `SAP_MODE=real`. Sie wird im Prototyp nicht angelegt.

## 7. Projektstruktur

```
cx-lead-cockpit/
├── package.json              ein Paket, alle Befehle
├── .env.example              Vorlage für Port, Datenbankpfad, Passwort, Modus (im Repository vorhanden)
├── docs/                     konzept.md, stories.md, architektur.md, status.md, clickdummy/ (clickdummy.html, notizen.md), umsetzung/, pruefberichte/
├── agent/
│   └── claude-aufgabe.md     Prompt für die spätere geplante Claude-Aufgabe
├── data/                     SQLite-Dateien, nicht im Repository
├── src/
│   ├── gemeinsam/            Typen, Zod-Schemas, erlaubte Werte, Texte der Statusnamen
│   ├── server/
│   │   ├── start.ts          baut den Server zusammen und startet ihn
│   │   ├── reset.ts          `npm run reset`: Datei neu anlegen, dann `setzeZurueck()`
│   │   ├── api/              eine Datei je Bereich: agent, laeufe, kontakte, ansprache, wiedervorlagen, sap, agent-steuerung, kennzahlen, einstellungen, anmeldung
│   │   ├── dienste/          ein Anwendungsfall je Datei, benannt nach der Aktion
│   │   ├── regeln/           status, fristen (auch Werktag- und Datumsrechnung), laufentscheidung, dubletten, pflichtangaben, kanal, ausschluss, kennzahlen, sap-zuordnung, zugang
│   │   ├── daten/            schema.sql, db.ts (öffnen, transaktion), ein Zugriffsmodul je Tabelle (z. B. einstellungen.ts, laeufe.ts), startdaten.ts, leeren.ts
│   │   └── anbindungen/      sap.ts, sap-simulator.ts, uhr.ts, uhr-simulator.ts
│   ├── simulator/            sim-routen.ts, agent.ts, beispiel-lauf.json
│   └── web/
│       ├── main.tsx, App.tsx Einstieg, Navigation, Routen
│       ├── api.ts            einziger Ort für Aufrufe an den Server
│       ├── screens/          S1Dashboard.tsx bis S9AgentSteuerung.tsx
│       ├── teile/            wiederverwendete Teile: Statusleiste, Etikett, Hinweis, Vorführleiste
│       └── stil/             tokens.css mit den Werten aus dem Clickdummy, cockpit.css
└── tests/
    ├── regeln/               Vitest, eine Datei je Regel-Modul
    ├── api/                  Vitest über fastify.inject, eine Datei je Story
    └── oberflaeche/          Playwright, eine Datei je Story mit Oberfläche
```

## 8. Starten und Testen

| Zweck | Befehl |
|---|---|
| Einrichten (einmalig) | `npm run einrichten` |
| Starten | `npm run dev` |
| Alle Tests | `npm test` |
| Startdaten zurücksetzen | `npm run reset` |

- `npm run einrichten` führt `npm install`, `npx playwright install chromium`, das Anlegen von `.env` aus `.env.example` und `npm run reset` aus.
- `npm run dev` startet den Server auf Port 3000 und die Oberfläche auf http://localhost:5173, mit `COCKPIT_DEMO=1`. Anmeldung mit dem Passwort aus `.env`.
- `npm test` führt nacheinander aus: Typprüfung (`tsc --noEmit`), ESLint, Vitest, Playwright. Der Befehl endet mit Fehler, sobald ein Teil scheitert.
- `npm run reset` löscht die Datenbank unter `DATABASE_PATH` (Vorgabe `./data/cockpit.sqlite`), legt das Schema an, lädt die Startdaten und stellt die Uhr auf 2026-11-18.

| Art Test | Prüft | Womit |
|---|---|---|
| Regeln | Jede Regel aus Abschnitt 9 des Konzepts mit den Beispielwerten, ohne Datenbank | Vitest, `tests/regeln` |
| Schnittstelle | Akzeptanzkriterien am Server: Statuswechsel, Sperren, Laufauftrag, Übergabe, Fehlerfälle | Vitest mit `fastify.inject`, SQLite im Speicher, frische Startdaten je Datei |
| Oberfläche | Akzeptanzkriterien, die man sehen muss: Listen, Hinweise, gesperrte Schaltflächen, Link ins Mailprogramm | Playwright gegen `data/test.sqlite`; vor jeder Datei `POST /api/v1/sim/zuruecksetzen` |

Jeder Test trägt die Story und die Nummer des Kriteriums im Namen, zum Beispiel `E5-S3 #2 Wiedervorlage 7 Werktage`.

## 9. Arbeitsregeln für die Umsetzung

- **Eine Story, ein Branch**, benannt `story/E5-S3-versand-protokollieren`, Pull Request gegen `main` (Regel aus `CLAUDE.md`). Übergabenotiz unter `docs/umsetzung/<ID>.md`, Prüfbericht unter `docs/pruefberichte/<ID>-pruefung-<n>.md`. Zusammengeführt wird erst nach bestandener unabhängiger Prüfung. Keine Story ändert Verhalten einer anderen, ohne deren Tests grün zu halten.
- **Benennung:** Fachbegriffe deutsch ohne Umlaute (ansprechpartner, wiedervorlage), technische Begriffe englisch. Dateien in `kebab-case`, React-Komponenten in `PascalCase`, Funktionen als Verb (`protokolliereVersand`). Umgebungsvariablen englisch wie in `.env.example`: `PORT`, `DATABASE_PATH`, `SAP_MODE`, `COCKPIT_PASSWORD`, `COCKPIT_SESSION_SECRET`, `COCKPIT_DEMO`.
- **Erlaubte Werte** (Status, Kanäle, Gründe, Merkmale) stehen einmal in `src/gemeinsam/werte.ts`. Niemand schreibt sie an anderer Stelle als Text aus. Die angezeigten deutschen Namen stehen daneben in `texte.ts`.
- **Ort der Regeln:**

| Regel im Konzept | Modul in `src/server/regeln` |
|---|---|
| Statuswechsel, erlaubte Aktionen, Endzustände, Wieder öffnen | `status.ts` |
| 7 Werktage, 21 Tage, 6 Monate, Werktag-Rechnung | `fristen.ts` |
| Laufentscheidung, nächster Lauf, Zusatzlauf, Protokollpflicht | `laufentscheidung.ts` |
| Dublettenprüfung, Namensnormalisierung, zweiter Ansprechpartner, Wiederansprache | `dubletten.ts` |
| Pflichtangaben für die Freigabe, Mindestumsatz in EUR | `pflichtangaben.ts` |
| Kanalwahl, E-Mail-Fassung per Vorlage, Grundlage, Wortzahl | `kanal.ts` |
| Ausschlussliste, Sperrfolgen von Verwerfen, Kein Interesse, Opt-out | `ausschluss.ts` |
| Kennzahlen, Bezugsgrößen, Schwelle 20, Aufschlüsselung | `kennzahlen.ts` |
| Feldzuordnung zur SAP Sales Cloud | `sap-zuordnung.ts` |

- **Erlaubte Aktionen kommen vom Server.** `GET /kontakte/:id` liefert `erlaubte_aktionen`; die Oberfläche zeigt oder sperrt Schaltflächen danach und wiederholt keine Bedingung.
- **Fehler:** Dienste werfen `FachFehler(code, meldung, feld)`. Ein zentraler Handler in `api` macht daraus das Fehlerformat. Die Oberfläche zeigt `meldung` als Hinweis; Meldungen sind deutsch, in Du-Form, und sagen, was zu tun ist.
- **Zeit:** Niemand ruft `new Date()` außerhalb von `uhr.ts` auf.
- **Datenbank:** Schemaänderungen nur in `schema.sql`; der Prototyp kennt keine Migrationen, `npm run reset` baut neu. Schreibende Dienste laufen in `transaktion()`. Sie ist verschachtelbar (Sicherungspunkte) und nur für synchrone Funktionen. SQL steht nur in `daten`, auch für Einstellungen (`daten/einstellungen.ts`).
- **Oberfläche:** Jeder Screen zeigt seine ID (S1 bis S9) im Kopf. Texte, Reihenfolge und Etiketten folgen dem Clickdummy; wo das Konzept 1.2 vom Dummy abweicht, gilt das Konzept. Leere Zustände haben immer einen Satz.
- **Keine neuen Abhängigkeiten** ohne Eintrag in Abschnitt 12 dieser Datei.
- **Fertig ist eine Story, wenn:** jedes Akzeptanzkriterium einen benannten Test hat, `npm test` grün ist, `npm run reset` und `npm run dev` funktionieren und nichts außerhalb der Story gebaut wurde.

## 10. Zuordnung der Stories

| Story | Betroffene Bausteine | Hinweis |
|---|---|---|
| E1-S0 Grundgerüst | alle | Projekt nach Abschnitt 7, Schema mit allen Tabellen aus Abschnitt 4, Startdaten, vier Befehle, leere Screens S1–S9, Fehlerformat, `GET /gesundheit` |
| E1-S1 Zugang | api, web, daten | Passwort aus `.env`, Agenten-Schlüssel als Hash; Rollenprüfung zentral als Fastify-Hook |
| E1-S2 Vorführdatum, Zurücksetzen, Vorführleiste | anbindungen (Uhr), simulator, web | nur bei `COCKPIT_DEMO=1` |
| E1-S3 Agenten-Simulator | simulator | legt über die Agenten-API den Beispiel-Lauf an; den vollen Ablauf mit Laufauftrag und Ausschlussliste ergänzt E2-S6 |
| E2-S1 Laufauftrag | api, dienste, regeln, anbindungen | `laufentscheidung.ts`; schreibt beim Abruf Protokolleinträge für entfallene Lauftage |
| E2-S2 Ausschlussliste | api, dienste, regeln | `ausschluss.ts`; 6-Monats-Frist über die Uhr |
| E2-S3 Lauf anlegen | api, dienste, daten, gemeinsam | Schema des Laufs in `gemeinsam`; wird vom Upload wiederverwendet |
| E2-S4 Dubletten | regeln, dienste | `dubletten.ts`; läuft im Dienst von E2-S3 |
| E2-S5 Upload | api, dienste, web, simulator | gleicher Dienst wie E2-S3 mit `herkunft: upload` |
| E2-S6 Claude-Aufgabe | simulator, agent/ | erweitert den Agenten-Simulator aus E1-S3 um Laufauftrag und Ausschlussliste; Kriterien 1–4 und 6 werden gegen den Agenten-Simulator geprüft, Kriterium 5 durch Durchsicht von `agent/claude-aufgabe.md`. Die echte Aufgabe richtet Marco später ein |
| E3-S1 Eingangskorb | web, api, dienste | Screen S2 |
| E3-S2 Angaben und Pflichtangaben | regeln, dienste, web | `pflichtangaben.ts`; Ergebnis steht am Vorschlag |
| E3-S3 Freigeben | dienste, regeln, daten, web | legt Firma und Ansprechpartner in einer Transaktion an; Wiederansprache öffnet den Bestand |
| E3-S4 Verwerfen | dienste, regeln, web | `ausschluss.ts` bestimmt Firma oder Person |
| E4-S1 Firmen | web, api, dienste, daten | Screen S3 |
| E4-S2 Kontaktliste | web, api, dienste | Screen S4, Filter am Server |
| E4-S3 Kontaktakte | web, api, dienste, regeln | `erlaubte_aktionen` aus `status.ts` |
| E4-S4 Sperren und Löschen | dienste, regeln, web | Rückfrage als eigener Dialog in der Oberfläche |
| E5-S1 Ansprache-Ansicht | web, api, dienste | Screen S5; Wortzähler in der Oberfläche |
| E5-S2 Kopieren, Profil | web | Zwischenablage nur im Klick; Playwright mit Berechtigung |
| E5-S3 Versand protokollieren | dienste, regeln, daten, web | `status.ts`, `fristen.ts` |
| E5-S4 E-Mail-Fassung | regeln, api, web | `kanal.ts`, reine Funktion |
| E5-S5 Grundlage und Entwurf | web, dienste, regeln | `mailto:` in der Oberfläche; Grundlage wird am Server erzwungen |
| E6-S1 Antwort erfassen | dienste, regeln, web | vier Einordnungen in `status.ts` |
| E6-S2 Gespräch | dienste, regeln, web | |
| E6-S3 Wiedervorlagen | web, api, dienste | Screen S6; Kennzeichen am Server berechnet |
| E6-S4 Nachfassen | dienste, regeln, web | |
| E6-S5 Schließen, wieder öffnen | dienste, regeln, web | Der 21-Tage-Vorschlag entsteht schon beim Erstkontakt als Wiedervorlage der Art `schliessen_vorschlag` |
| E7-S1 SAP-Verbindung | anbindungen, api, web | baut `SapClient` und `SapSimulator`; Passwort wird nie zurückgegeben |
| E7-S2 Vorschau | dienste, regeln, anbindungen, web | `sap-zuordnung.ts`; Screen S7 |
| E7-S3 Übergabe | dienste, anbindungen, daten | Account, Kontaktperson, Lead nacheinander; IDs werden nach jedem Schritt gespeichert |
| E7-S4 Fehlerfall, Protokoll | dienste, anbindungen, simulator, web | baut den Fehlerschalter `PUT /api/v1/sim/sap`; Wiederholung überspringt bereits angelegte Objekte |
| E8-S1 Rechercheprofil | web, api, dienste, regeln | Screen S9 |
| E8-S2 Pausieren | dienste, web | |
| E8-S3 Sperrzeiten | dienste, regeln, web | |
| E8-S4 Zusatzlauf | dienste, regeln, web | |
| E8-S5 Obergrenze | regeln, dienste, web | Hinweis kommt aus `GET /agent-steuerung` und `GET /dashboard/heute` |
| E8-S6 Laufprotokoll | web, dienste, regeln | geplanter Lauf wird berechnet, nicht gespeichert |
| E9-S1 Dashboard »Heute« | web, api, dienste | Screen S1 |
| E9-S2 Kennzahlen | regeln, dienste, web | `kennzahlen.ts` |
| E9-S3 Aufschlüsselung | regeln, dienste, web | Klick setzt Filter in S4 |
| E10-S1 Sperrliste | web, api, dienste, daten | Screen S8; Startbestand in den Startdaten |
| E10-S2 Agenten-Schlüssel | dienste, api, web | |
| E10-S3 Fristen, Signatur | web, api, dienste | Fristen sind Konstanten in `gemeinsam` |
| E10-S4 CSV-Export | api, dienste, web | |
| E10-S5 Lese-API | api | nutzt die vorhandenen Lese-Dienste, zusätzlich mit Schlüssel |

**Erste Story:** E1-S0 Grundgerüst. Die Wegbereiter E1-S0, E1-S2 und E1-S3 hat Marco am 19.11.2026 in `stories.md` aufnehmen lassen. Der SAP-Simulator entsteht mit E7-S1, sein Fehlerschalter mit E7-S4.

## 11. Risiken und Annahmen

| Annahme | Auswirkung, wenn falsch | Wie prüfen |
|---|---|---|
| Marcos Rechner hat Node.js 22.22 oder neuer | `npm run einrichten` bricht ab | `node -v` vor dem ersten Start |
| `node:sqlite` bleibt in Node.js 22 nutzbar; es meldet sich beim Start als experimentell | Warnung im Terminal; bei einer Änderung der Schnittstelle Anpassung in `db.ts` | Seit Node.js 22.13 ohne Schalter verfügbar; Zugriff nur über `db.ts` und die Zugriffsmodule |
| Anmeldung mit einem Passwort reicht für den Prototyp | Nagarro-IT verlangt Unternehmens-Anmeldung schon zum Vorführen | Marco bestätigt mit der Freigabe |
| Der Prototyp läuft nur lokal | Die echte Claude-Aufgabe in der Cloud erreicht ein lokales Cockpit nicht | Vor dem Echtbetrieb entscheiden: Cockpit erreichbar betreiben oder die Aufgabe lokal laufen lassen |
| Der SAP-Simulator bildet die echte Schnittstelle ausreichend ab | Beim Tausch gegen die echte Anbindung ändern sich Pflichtfelder und Fehlerbilder | Mit dem API-Nutzer je Objekt einen Datensatz lesen und einen Testdatensatz anlegen, bevor `SapV2Client` gebaut wird |
| Das SAP-Passwort darf im Prototyp unverschlüsselt in der lokalen Datenbank liegen | Sicherheitsvorgaben verletzt | Im Prototyp nur Simulator-Zugang verwenden; echte Zugangsdaten erst mit geklärter Ablage |
| Ortszeit Europe/Berlin für alle Daten | Falsche Fälligkeiten bei Nutzung in anderer Zeitzone | Für einen Nutzer in Deutschland unkritisch |
| Der Lauf vom 19.11.2026 kommt vom Simulator, nicht aus den Startdaten | Stories, die ihn voraussetzen, finden ihn nicht | Tests lösen `POST /sim/agent/meldung` aus, bevor sie ihn brauchen |
| Zähler am Recherchelauf statt gespeicherter Altvorschläge | Die drei Beispielläufe lassen sich nicht öffnen und zeigen nur den Satz »alles geprüft« | So im Clickdummy freigegeben |

## 12. Entscheidungen

| Entscheidung | Verworfene Alternative | Grund |
|---|---|---|
| TypeScript mit React, Fastify und SQLite | SAP CAP mit SAPUI5; Spring Boot mit Angular | Von Marco gewählt; kleinste Lösung für einen Ein-Nutzer-Prototyp. Ein Hausstandard lag nicht vor, eine Abweichung davon lässt sich daher nicht benennen |
| Prototyp mit Simulatoren für SAP und Agent | Echte SAP-Anbindung von Anfang an | Von Marco gewählt; Tests bleiben wiederholbar, die echte Anbindung tauscht nur eine Klasse |
| Fachbegriffe deutsch in Tabellen, JSON und Pfaden | Englische Pfade aus dem Entwurf in Abschnitt 11 des Konzepts | Ein Begriff je Sache vom Konzept bis zum Code; die Stories nennen dieselben Wörter. Der Entwurf im Konzept war als Annahme markiert |
| Handgeschriebenes SQL über `node:sqlite` | ORM wie Drizzle oder Prisma; better-sqlite3 (im Grundgerüst zuerst genutzt, braucht bei jeder Installation Build-Werkzeuge, Befund der Prüfung E1-S0) | Zwölf kleine Tabellen; weniger Schichten, in denen einzeln arbeitende Agenten auseinanderlaufen |
| Ein npm-Paket | Getrennte Pakete für Server und Oberfläche | Ein Befehl zum Starten und Testen, geteilte Typen ohne Veröffentlichung |
| Eigenes CSS nach dem Clickdummy | Komponentenbibliothek | Der freigegebene Dummy ist die Vorlage |
| Regeln als reine Funktionen mit »heute« als Parameter | Regeln in den Routen oder in der Oberfläche | Jede Regel ist einzeln und ohne Datenbank prüfbar; Vorführdatum möglich |
| Uhr mit Vorführdatum, nach Zurücksetzen 18.11.2026 | Echtes Datum | Die Akzeptanzkriterien nennen feste Daten aus dem November 2026 |
| Ergebnisdatei hat dasselbe JSON-Format wie »Lauf anlegen« | Eigenes Dateiformat | Ein Schema, ein Dienst, zwei Wege |
| Vorschläge behalten die gelieferten Daten als JSON, Firma und Ansprechpartner entstehen erst bei der Freigabe | Sofort als Firma und Ansprechpartner im Status »Neu« speichern | Verworfene Vorschläge verschmutzen den Bestand nicht; Dublettenprüfung bleibt einfach |
| Der 21-Tage-Vorschlag wird beim Erstkontakt als Wiedervorlage angelegt | Täglicher Hintergrundlauf | Kein Zeitplaner im Prototyp nötig |
| Passwort-Anmeldung, ein Nutzer | Microsoft Entra ID | Prototyp ohne Abhängigkeit von der IT |
| Agenten-Simulator ruft die echte Agenten-API über HTTP | Simulator schreibt direkt in die Datenbank | Prüft dieselbe Schnittstelle, die später die Claude-Aufgabe nutzt |
| Bausteingrenzen per ESLint erzwungen; Vorführ-Routen dürfen Dienste rufen (Architektur 1.3) | Grenzen nur als Text; Simulator ohne Dienste | Dieselbe Grenzverletzung fiel in den Prüfungen von E1-S0, E1-S1 und E1-S2 auf. Das Zurücksetzen und das Setzen des Datums sind keine Agenten-Aktionen und brauchen einen Dienst |
| Node.js 22 statt 24 | Node.js 24 | In der Arbeitsumgebung vorhanden; beide sind Langzeit-Versionen. Von Marco am 19.11.2026 bestätigt |
| Aktuelle Hauptversionen (Vite 8, React Router 8, Vitest 5), TypeScript 5.9 | Die im Entwurf genannten älteren Hauptversionen; TypeScript 7 | Stand des npm-Verzeichnisses am 19.11.2026; TypeScript 7 wird von typescript-eslint noch nicht unterstützt |
| Namen und Pfade aus dem Repository übernommen (`.env.example`, `data/`, PR gegen `main`, `docs/`) | Die im Entwurf genannten deutschen Namen | Das Repository brachte mit `CLAUDE.md`, `.env.example` und `.gitignore` bereits Regeln mit |
| Unbekannte Adresse liefert 404 `nicht_gefunden`; `GET /gesundheit` ohne Anmeldung | Kein Lebenszeichen | Braucht das Grundgerüst für den ersten Schnittstellentest |
