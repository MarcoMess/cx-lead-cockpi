-- Schema des CX Lead Cockpits (architektur.md, Abschnitt 4).
-- Datumswerte: Text JJJJ-MM-TT, Zeitpunkte: Text JJJJ-MM-TT HH:MM, jeweils Ortszeit Europe/Berlin.
-- Listen stehen als JSON-Text. Der Prototyp kennt keine Migrationen: `npm run reset` baut neu.

PRAGMA foreign_keys = ON;

CREATE TABLE firma (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  name_norm TEXT NOT NULL UNIQUE,
  domain TEXT,
  branche TEXT NOT NULL,
  land TEXT NOT NULL CHECK (land IN ('DE', 'AT', 'CH')),
  anschrift TEXT,
  firmenkontakt TEXT,
  umsatz_wert REAL NOT NULL,
  umsatz_waehrung TEXT NOT NULL CHECK (umsatz_waehrung IN ('EUR', 'CHF')),
  umsatz_jahr INTEGER NOT NULL,
  umsatz_bezug TEXT NOT NULL CHECK (umsatz_bezug IN ('konzern', 'einzelgesellschaft')),
  umsatz_quelle_url TEXT NOT NULL,
  wechselkurs REAL,
  wechselkurs_quelle_url TEXT,
  umsatz_eur REAL,
  status TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'gesperrt')),
  sap_account_id TEXT,
  besitzer TEXT NOT NULL DEFAULT 'marco'
);

CREATE TABLE ansprechpartner (
  id INTEGER PRIMARY KEY,
  firma_id INTEGER NOT NULL REFERENCES firma(id),
  anrede TEXT NOT NULL CHECK (anrede IN ('Frau', 'Herr')),
  titel TEXT,
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  funktion TEXT NOT NULL,
  rolle TEXT NOT NULL,
  quelle_url TEXT NOT NULL,
  linkedin_url TEXT UNIQUE,
  email TEXT,
  telefon TEXT,
  email_herkunft TEXT CHECK (email_herkunft IN ('veroeffentlicht', 'von_marco')),
  sprache TEXT NOT NULL DEFAULT 'de',
  status TEXT NOT NULL CHECK (status IN ('freigegeben', 'angeschrieben', 'nachgefasst', 'antwort_erhalten',
    'gespraech_vereinbart', 'an_sap_uebergeben', 'kein_interesse', 'ohne_antwort_geschlossen', 'gesperrt')),
  antwort_art TEXT CHECK (antwort_art IN ('positiv', 'neutral_spaeter', 'kein_interesse')),
  gespraech_termin TEXT,
  geschlossen_am TEXT,
  sap_kontakt_id TEXT,
  sap_lead_id TEXT,
  besitzer TEXT NOT NULL DEFAULT 'marco'
);

CREATE TABLE anlass (
  id INTEGER PRIMARY KEY,
  ansprechpartner_id INTEGER NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
  typ TEXT NOT NULL CHECK (typ IN ('eigener_beitrag', 'unternehmensanlass', 'kein_anlass')),
  beschreibung TEXT,
  ereignis_datum TEXT,
  veroeffentlicht_am TEXT,
  quelle_url TEXT,
  hypothese TEXT,
  gespraechsziel TEXT,
  erstellt_am TEXT NOT NULL
);

CREATE TABLE nachricht (
  id INTEGER PRIMARY KEY,
  ansprechpartner_id INTEGER NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
  kanal TEXT NOT NULL CHECK (kanal IN ('linkedin', 'email')),
  art TEXT NOT NULL CHECK (art IN ('erstkontakt', 'nachfassen')),
  betreff TEXT,
  text TEXT NOT NULL,
  sprache TEXT NOT NULL DEFAULT 'de',
  fassung TEXT NOT NULL CHECK (fassung IN ('agent', 'von_marco_geaendert', 'vorlage')),
  UNIQUE (ansprechpartner_id, kanal, art)
);

CREATE TABLE kontaktversuch (
  id INTEGER PRIMARY KEY,
  ansprechpartner_id INTEGER NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
  kanal TEXT NOT NULL CHECK (kanal IN ('inmail', 'vernetzungsanfrage', 'linkedin_nachricht', 'email')),
  art TEXT NOT NULL CHECK (art IN ('erstkontakt', 'nachfassen')),
  zeitpunkt TEXT NOT NULL,
  betreff TEXT,
  text TEXT NOT NULL,
  email_grundlage TEXT CHECK (email_grundlage IN ('in_hubspot_bekannt', 'hat_geantwortet', 'andere')),
  email_grundlage_notiz TEXT,
  CHECK (kanal <> 'email' OR email_grundlage IS NOT NULL),
  CHECK (email_grundlage IS NOT 'andere' OR email_grundlage_notiz IS NOT NULL)
);

CREATE TABLE antwort (
  id INTEGER PRIMARY KEY,
  ansprechpartner_id INTEGER NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
  datum TEXT NOT NULL,
  einordnung TEXT NOT NULL CHECK (einordnung IN ('positiv', 'neutral_spaeter', 'kein_interesse', 'nicht_mehr_kontaktieren')),
  wortlaut TEXT,
  naechster_schritt TEXT
);

CREATE TABLE wiedervorlage (
  id INTEGER PRIMARY KEY,
  ansprechpartner_id INTEGER NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
  faellig_am TEXT NOT NULL,
  grund TEXT NOT NULL,
  art TEXT NOT NULL CHECK (art IN ('nachfassen', 'schliessen_vorschlag', 'frei')),
  erledigt INTEGER NOT NULL DEFAULT 0 CHECK (erledigt IN (0, 1))
);

CREATE TABLE rechercheprofil (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('aktiv', 'pausiert')),
  lauftage TEXT NOT NULL,
  anzahl INTEGER NOT NULL CHECK (anzahl >= 1),
  branchen TEXT NOT NULL,
  laender TEXT NOT NULL,
  mindestumsatz_mio_eur REAL NOT NULL,
  rollen TEXT NOT NULL,
  obergrenze INTEGER NOT NULL CHECK (obergrenze >= 1),
  zusatzlauf_vorgemerkt INTEGER NOT NULL DEFAULT 0 CHECK (zusatzlauf_vorgemerkt IN (0, 1))
);

CREATE TABLE sperrzeit (
  id INTEGER PRIMARY KEY,
  von TEXT NOT NULL,
  bis TEXT NOT NULL,
  bezeichnung TEXT NOT NULL,
  CHECK (bis >= von)
);

CREATE TABLE recherchelauf (
  id INTEGER PRIMARY KEY,
  datum TEXT NOT NULL,
  ergebnis TEXT NOT NULL CHECK (ergebnis IN ('ausgefuehrt', 'uebersprungen', 'uebertragung_fehlgeschlagen')),
  grund TEXT CHECK (grund IN ('pausiert', 'sperrzeit', 'obergrenze')),
  grund_text TEXT,
  anzahl_vorschlaege INTEGER NOT NULL DEFAULT 0,
  anzahl_freigegeben INTEGER NOT NULL DEFAULT 0,
  abdeckungsgrenzen TEXT,
  zielbild TEXT,
  herkunft TEXT CHECK (herkunft IN ('api', 'upload'))
);
CREATE UNIQUE INDEX recherchelauf_ein_lauf_je_tag ON recherchelauf (datum) WHERE ergebnis = 'ausgefuehrt';

CREATE TABLE vorschlag (
  id INTEGER PRIMARY KEY,
  recherchelauf_id INTEGER NOT NULL REFERENCES recherchelauf(id),
  zustand TEXT NOT NULL DEFAULT 'zu_pruefen' CHECK (zustand IN ('zu_pruefen', 'freigegeben', 'verworfen')),
  daten TEXT NOT NULL,
  ist_dublette INTEGER NOT NULL DEFAULT 0,
  ist_wiederansprache INTEGER NOT NULL DEFAULT 0,
  bezug_ansprechpartner_id INTEGER REFERENCES ansprechpartner(id) ON DELETE SET NULL,
  fehlende_pflichtangaben TEXT NOT NULL DEFAULT '[]',
  verwerf_grund TEXT,
  ansprechpartner_id INTEGER REFERENCES ansprechpartner(id) ON DELETE SET NULL
);

CREATE TABLE sperreintrag (
  id INTEGER PRIMARY KEY,
  art TEXT NOT NULL CHECK (art IN ('firma', 'person')),
  name TEXT NOT NULL,
  firma_name TEXT,
  grund TEXT NOT NULL,
  herkunft TEXT NOT NULL CHECK (herkunft IN ('startbestand', 'verworfen', 'opt_out', 'von_marco', 'geloescht')),
  gesperrt_bis TEXT,
  erstellt_am TEXT NOT NULL
);

CREATE TABLE sap_uebergabe (
  id INTEGER PRIMARY KEY,
  ansprechpartner_id INTEGER NOT NULL REFERENCES ansprechpartner(id) ON DELETE CASCADE,
  zeitpunkt TEXT NOT NULL,
  erfolg INTEGER NOT NULL CHECK (erfolg IN (0, 1)),
  ergebnis TEXT NOT NULL
);

CREATE TABLE einstellung (
  schluessel TEXT PRIMARY KEY,
  wert TEXT
);
