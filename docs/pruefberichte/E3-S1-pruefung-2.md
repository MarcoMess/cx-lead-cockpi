# E3-S1 – Eingangskorb zeigt Läufe und Vorschläge: Prüfung 2

Branch: story/E3-S1-eingangskorb (Stand `5b9ecf0`, verglichen mit Runde 1 `a030b0a`) · Datum: 19.11.2026 · **Urteil: Bestanden**

Das ist eine Nachprüfung. Geprüft wurde, ob die Befunde 1, 3 und 4 aus Runde 1 behoben sind. Außerdem wurden alle Tests neu ausgeführt und alle fünf Kriterien noch einmal am laufenden System geprüft, weil sich die Oberfläche geändert hat. Die mitgemergte Nachbesserung von Pflege 1 (Bausteingrenzen in ESLint, Uhr-Simulator) habe ich nur darauf geprüft, ob sie E3-S1 stört.

## Tests
Ausgeführt: 78 · Bestanden: 78 · Befehl: `PLAYWRIGHT_CHANNEL=chrome TEST_API_PORT=3900 TEST_WEB_PORT=5974 npm test`

- `tsc --noEmit` und `eslint .` laufen ohne Meldung.
- Vitest: 12 Dateien, 63 Tests bestanden. Neu ist `tests/regeln/grenzen.test.ts` mit 20 Fällen aus Pflege 1.
- Playwright: 15 Tests bestanden, einer mehr als in Runde 1: `E3-S1 unbekannter Lauf …`.
- Ich habe den Lauf zweimal ausgeführt, beide Male alles grün.

Beurteilung der Änderungen an den Tests (`git diff a030b0a..5b9ecf0 -- tests`):
- Gelöscht wurden nur sieben Zeilen. Davon sind vier Umstellungen von `new Uhr(db)` auf `erstelleUhr(db)` aus Pflege 1. Der erwartete Wert `2026-11-18` bleibt gleich. Die übrigen drei sind die alten Erwartungen für die Laufliste in E3-S1 #1. Sie wurden **verschärft**: Jede Zeile muss jetzt mit »Abdeckungsgrenzen: …« enden, und der 09.11. muss nach »8 freigegeben« enden (`$`). Fehlt die Grenze in der Liste, schlägt der Test fehl.
- `tests/api/E1-S3.test.ts` prüft zusätzlich `ergebnisdatei_bereit === false` nach dem gelungenen Lauf (Befund 4).
- Im Repository steht kein `.skip`, `.only`, `.todo` oder `fixme`. Kein Test wurde gelockert.

## Nachprüfung der Befunde aus Runde 1
| Befund R1 | Ergebnis | Beleg |
|---|---|---|
| 1 (Blockiert) Abdeckungsgrenzen fehlen in der Liste | **behoben** | In der Laufliste steht unter den Zählern eine dritte, gedämpfte Zeile. Seitentext der Zeilen: »16.11.2026 / 10 Vorschläge, 7 freigegeben / Abdeckungsgrenzen: 2 Profile ohne verifizierte URL«, »12.11.2026 / 8 Vorschläge, 6 freigegeben / Abdeckungsgrenzen: Nur 8 belegte Treffer, Lücke benannt«, »09.11.2026 / 10 Vorschläge, 8 freigegeben« (ohne Grenze, also ohne Zeile). Bildschirmfoto `01-start`. Auch der neue Lauf vom 19.11. zeigt seine Grenze in der Liste. Der Kopf des gewählten Laufs zeigt die Grenze weiterhin, beim 09.11. als »–«. |
| 3 (Sollte) leere rechte Spalte bei unbekanntem Lauf | **weitgehend behoben**, Rest siehe Befund 1 unten | Den Satz »Diesen Recherchelauf gibt es nicht. Wähle links einen anderen Lauf.« zeigen `/eingangskorb/999`, `/abc`, `/4` (übersprungener Lauf) und `/-1`. Ebenso `/eingangskorb/5` nach »Zurücksetzen«: Netz `404 /api/v1/laeufe/5`, danach steht der Satz in der Spalte. Ein Klick auf einen Lauf links stellt die normale Ansicht wieder her. |
| 4 (Sollte) Ergebnisdatei bleibt nach gelungenem Lauf bereit | **behoben** | Über die API, Szenario aus Runde 1: Zurücksetzen, Werktag, Störung an, Meldung → `api_gestoert`, `ergebnisdatei_bereit: true`, Datei 200 mit 4 Vorschlägen. Dann Störung aus, Meldung → `lauf_angelegt, lauf_id 5, angelegt 4`. Danach liefert `GET /sim/zustand` → `ergebnisdatei_bereit: false`, und `GET /sim/agent/ergebnisdatei` → 404 `keine_ergebnisdatei`. Eine erneute Meldung am selben Tag ergibt 409 `bereits_gelaufen`. Während der Störung bleibt die Datei bereit (keine Verschlechterung). |

## Akzeptanzkriterien
Alle fünf habe ich in Chrome (Playwright, `channel: chrome`) gegen `npm run dev` mit `PORT=3800` und `WEB_PORT=5874` geprüft, nach `npm run reset`.

| Kriterium | Ergebnis (erfüllt · nicht erfüllt · nicht prüfbar) | Beleg |
|---|---|---|
| 1 Läufe 16.11., 12.11., 09.11. mit Datum, Vorschlägen (10, 8, 10), Freigaben (7, 6, 8) und Abdeckungsgrenzen in der Liste, neueste zuerst | erfüllt | Die Zeilen der Region »Läufe« zeigen genau das, siehe die Nachprüfung von Befund 1 oben. Die Reihenfolge ist 16.11. → 12.11. → 09.11., der übersprungene Lauf vom 05.11. fehlt zu Recht. Bildschirmfoto `01-start`. |
| 2 Lauf vom 19.11.2026: jede Karte mit Person, Funktion, Firma, Branche/Land, Umsatz, Anlass mit Datum, klickbarem Quellenlink | erfüllt | Vorführleiste: »Nächster Werktag«, dann »Agent meldet sich« → »Der Agent hat 4 Vorschläge geliefert.« Die vier Karten: Kortmann (Leiterin After-Sales Service, Kranbau Oberhavel GmbH, Maschinenbau / DE, 121 Mio. EUR, 2025, Konzern, Pressemitteilung … (12.11.2026)), Voss (Hansemarkt Handels SE, Retail / DE, 1,4 Mrd. EUR …, 10.11.2026), Albers (Nordwerk Fördertechnik GmbH, Maschinenbau / DE, 182 Mio. EUR …, 04.11.2026) und Ammann (siehe #3). Alle drei Links »Quelle öffnen« haben `https://example.com/…`, `target=_blank` und `rel=noopener noreferrer`. Ein Klick öffnet einen neuen Tab. Bildschirmfoto `02-lauf-1911`. |
| 3 Reto Ammann trägt das Etikett »Kein belastbarer aktueller Anlass« | erfüllt | Die Karte Ammann (Leiter Gästeservice & CRM, Seehotel-Gruppe Bodan AG, Hospitality / CH, 88 Mio. CHF) zeigt das Etikett sichtbar und hat 0 Links. |
| 4 Laufliste zeigt »4 offen« | erfüllt | Erste Zeile: »19.11.2026 4 offen / 4 Vorschläge, 0 freigegeben / Abdeckungsgrenzen: Nur 4 belegte Treffer statt 10, Lücke benannt; 1 Profil ohne verifizierte URL«. Probe in der Datenbank: Bei 2 freigegebenen Vorschlägen steht »2 offen«, bei 0 offenen gibt es kein Etikett. |
| 5 Lauf mit lauter geprüften Vorschlägen: Hinweis | erfüllt | Der 16.11. zeigt »Alle Vorschläge dieses Laufs sind geprüft. Die freigegebenen Kontakte findest du unter Kontakte (S4).« Nachgestellt in der Datenbank: Alle vier Vorschläge vom 19.11. auf freigegeben bzw. verworfen gesetzt. Danach steht derselbe Hinweis unter den Karten, und in der Liste gibt es kein »offen« mehr (Bildschirmfoto `03-alle-geprueft`). Anschließend habe ich die Daten zurückgesetzt. |

## Befunde
| Nr. | Stelle | Befund | Schwere | So nachvollziehen |
|---|---|---|---|---|
| 1 | `src/web/screens/S2Eingangskorb.tsx`, rechte Spalte | **Rest von R1-Befund 3.** (a) Unter `/eingangskorb/0` und `/eingangskorb/%20` bleibt die rechte Spalte weiterhin ohne Satz. `Number('0')` und `Number(' ')` ergeben 0, `if (!gewaehlt) return` fragt dann nicht ab, und die Prüfung auf `Number.isInteger` schlägt nicht an. (b) Unter `/eingangskorb/1.5` steht der Satz **zweimal**. Der Ganzzahl-Zweig greift, und zugleich kommt die 404 von `/laeufe/1.5`. Doppelt steht er auch beim Wechsel innerhalb der Anwendung von `/eingangskorb/999` nach `/eingangskorb/abc`, weil `laufFehler` stehen bleibt, wenn keine Abfrage läuft. Die Arbeitsregel »Leere Zustände haben immer einen Satz« (architektur.md §9) ist damit nur fast erfüllt. Diese Adressen erreicht Marco nur durch Eintippen. | Sollte | Angemeldet `http://localhost:5874/eingangskorb/0` und `/eingangskorb/1.5` öffnen. Zum Wechsel in der Anwendung: `/eingangskorb/999` öffnen, dann per `history.pushState` und `popstate` nach `/eingangskorb/abc`. |
| 2 | wie 1 | `/eingangskorb/1e0` (ebenso z. B. `01`) zeigt und markiert Lauf 1 (16.11.), weil `Number()` großzügig umwandelt. Das ist harmlos. | Hinweis | `/eingangskorb/1e0` öffnen. |
| 3 | `docs/umsetzung/E3-S1.md`, Abschnitt »Nachbesserung 1« | Laut Übergabe sind R1-Befund 2 (Gegenwert in EUR bei Fremdwährung, Konzept §8/§9) und R1-Befund 5 (Anzeigenamen in `texte.ts`, ein Anwendungsfall je Dienstdatei) »in docs/status.md als offene Punkte vermerkt«. In `docs/status.md` auf dem Branch (`5b9ecf0`) steht dazu nichts, nur die Zeile »E3-S1 … In Prüfung«. Beide Sollte-Befunde sind weiter offen und brauchen einen festen Platz (status.md oder Pflege 2), sonst gehen sie verloren. | Hinweis | `grep -niE "gegenwert|texte\.ts" docs/status.md` liefert nichts. |
| 4 | `S2Eingangskorb.tsx` (zwei `useEffect`) | R1-Hinweis 8 besteht weiter, jetzt mit sichtbarer Folge. »Zurücksetzen« auf `/eingangskorb` ohne Lauf-ID fragt noch den alten Lauf ab. Beobachtet: `200 /laeufe`, `404 /laeufe/5`, `200 /laeufe/1`. Kommt die 404 als letzte an, steht seit der Nachbesserung statt des 16.11. der Satz »Diesen Recherchelauf gibt es nicht.« in der Spalte. Im Prüflauf kam die richtige Reihenfolge, die Ansicht war korrekt. | Hinweis | Auf `/eingangskorb` Lauf anlegen, »Zurücksetzen« klicken und die Netzwerkanfragen beobachten. |

Zahl der Befunde dieser Runde: Blockiert 0 · Sollte 1 · Hinweis 3. Die R1-Hinweise 6, 7 und 9 gelten unverändert weiter und sind hier nicht neu gezählt.

### Auswirkung der Nachbesserung Pflege 1 auf E3-S1
- Die Uhr ist umgebaut (`erstelleUhr`, `uhr-simulator.ts`). Vorführdatum und »Nächster Werktag« funktionieren weiter (18.11. → 19.11.), der Lauf erhält das Datum 19.11.2026, »Zurücksetzen« stellt den 18.11. wieder her.
- `daten/laeufe.ts` hat nur `satisfies`-Typprüfungen der Statuswerte erhalten. Das SQL ist unverändert, und die Laufliste liefert dieselben Werte wie in Runde 1.
- `api/zugang.ts` geht jetzt über `dienste/zugang.ts`. Anmeldung, 401 ohne Sitzung (beobachtet bei einer Anfrage ohne Anmeldung) und der Zugang zu den Simulator-Routen funktionieren.
- Die strengeren ESLint-Grenzen melden für die E3-S1-Dateien nichts.
- Stichproben früherer Stories: Anmeldung (E1-S1), Vorführleiste mit Werktag und Zurücksetzen (E1-S2), »Agent meldet sich« und Störungsschalter (E1-S3) sowie der doppelte Lauf am selben Tag mit 409 (E2-S3) funktionieren. Dashboard S1 zeigt den Platzhalter.

Umfang und Sicherheit: Die Nachbesserung ändert in E3-S1 nur `S2Eingangskorb.tsx` (+28 Zeilen), `agent.ts` (+2) und die Tests. Neue Funktionen sind nicht hinzugekommen, Abhängigkeiten unverändert. Im Diff stehen keine Zugangsdaten.

## Nicht geprüft
- Den Zustand »alle gespeicherten Vorschläge geprüft« (Kriterium 5) kann die Oberfläche erst mit E3-S3/E3-S4 herbeiführen. Ich habe ihn wie in Runde 1 über `vorschlag.zustand` in der Prüfdatenbank nachgestellt und danach mit `npm run reset` zurückgesetzt.
- Ob die Quellenlinks auf eine echte Seite führen, ließ sich nicht prüfen, weil die Sandbox `example.com` nicht erreicht (der neue Tab zeigt eine Chrome-Fehlerseite). Die Adresse im Link stimmt.
- Die Nachbesserung von Pflege 1 selbst (Vollständigkeit der Bausteingrenzen) gehört nicht zu dieser Prüfung, sie wird separat geprüft.

Server beendet (Ports 3800, 5874, 3900 und 5974 frei), Startdaten mit `npm run reset` zurückgesetzt: 7 Firmen, 7 Ansprechpartner, 4 Läufe, 5 Sperreinträge, Vorführdatum 2026-11-18.
Bildschirmfotos (nicht im Repository): `/tmp/e3s1-r2/01-start.png`, `02-lauf-1911.png`, `03-alle-geprueft.png`, `04-unbekannt.png`, `05-nach-reset.png`.
