# Kernweg durchklicken

Stand: 19.11.2026 · Branch `story/E5-S3-versand` (enthält alle Stories des Kernwegs; #11 bis #13 sind noch nicht in `main`)

## Starten

```bash
git clone https://github.com/MarcoMess/cx-lead-cockpi.git
cd cx-lead-cockpi
git checkout story/E5-S3-versand
npm run einrichten     # einmalig: Pakete, .env mit neuem Sitzungsschlüssel, Startdaten
npm run dev            # Oberfläche auf http://localhost:5173
```

Voraussetzung: Node.js 22.22 oder neuer. Passwort: der Wert von `COCKPIT_PASSWORD` in `.env` (Beispielwert `cockpit-demo`). Die gelb gestreifte Vorführleiste oben gehört nicht zum Produkt; sie steuert Datum und den simulierten Agenten.

## Der Weg (etwa 5 Minuten)

1. **Anmelden.** Datum im Dummy: 18.11.2026.
2. **Vorführleiste »Nächster Werktag«** → 19.11.2026.
3. **Vorführleiste »Agent meldet sich«** → »Der Agent hat 4 Vorschläge geliefert.«
4. **Eingangskorb (S2):** Lauf vom 19.11.2026 mit vier Karten. Ammann trägt »Kein belastbarer aktueller Anlass« und den EUR-Gegenwert. Bei **Sabine Kortmann** »Freigeben«. (Albers lässt sich nicht freigeben: Sie steht schon mit demselben LinkedIn-Profil im Bestand.)
5. **Kontakte (S4):** Filter »Offene« – Kortmann ist neu dabei. Filter »Ohne Antwort geschlossen« → Ostermann, »Alle« → alle.
6. **Kontaktakte:** auf einen Namen klicken. Bei Dr. Katrin Albers: Statusschiene mit »Gespräch vereinbart«, Anlass mit Quelle und Hypothese, Verlauf InMail → Antwort positiv. Bei Ostermann: Endzustand und Suchhinweis statt LinkedIn-Link.
7. **Kortmann öffnen → »Ansprechen«** (oder über »Ansprache« in der Navigation):
   links Aufhänger, rechts Betreff und Nachricht mit Wortzähler (Zielkorridor 45–70). Text ändern – der Zähler zählt sofort.
8. **»Betreff kopieren«, »Nachricht kopieren«, »Profil öffnen«** – das Cockpit sendet nichts selbst (das Profil ist erfunden).
9. **»Gesendet als«** wählen (InMail, Vernetzungsanfrage mit Notiz, LinkedIn-Nachricht) → **»Als gesendet markieren«**.
   Die Akte zeigt »Angeschrieben«, den Eintrag im Verlauf und die Wiedervorlage am 30.11.2026.
10. **»Zurücksetzen«** in der Vorführleiste stellt den Ausgangszustand wieder her.

## Was noch nicht da ist (kommt mit späteren Stories)

Dashboard (S1), Firmen (S3), Wiedervorlagen (S6), SAP-Übergabe (S7), Einstellungen (S8), Agent-Steuerung (S9) zeigen einen Platzhalter. In der Akte fehlen noch die Aktionen Antwort erfassen, Schließen, Wieder öffnen, Sperren, Löschen, An SAP übergeben. In der Ansprache sind E-Mail und Nachfassen erkennbar deaktiviert.
