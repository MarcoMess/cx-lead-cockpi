// Startdaten = Beispieldaten aus Abschnitt 8 des Konzepts (Version 1.2), ergänzt um die ausformulierten
// Nachrichten, Hypothesen, Profil-Links und Adressen aus dem freigegebenen Clickdummy.
// Alle Personen und Firmen sind erfunden. Quellen zeigen auf example.com.
import { BRANCHEN, ROLLEN } from '../../gemeinsam/werte';
import type { SQLInputValue } from 'node:sqlite';
import { oeffneDatenbank, transaktion, type Datenbank } from './db';

const GRUSS = '\nBeste Grüße\nMarco';
const ALTBESTAND = '(Wortlaut im Altbestand nicht erfasst)';
const SIGNATUR = 'Beste Grüße\nMarco Messinger\nDirector Customer Experience & Innovation\nNagarro';
// Erstkontakt Reinhardt lief per E-Mail: E-Mail-Fassung der LinkedIn-Nachricht (Vorlage aus Konzept 1.2, Abschnitt 8).
const EMAIL_REINHARDT =
  'Guten Tag Herr Reinhardt,\n\nin Ihrem Interview vom 28.10. beschreiben Sie die Zusammenführung von Kundenkarte und Onlineshop. Ich verantworte bei Nagarro Customer Experience & Innovation und würde gern mit Ihnen einordnen, wo Kundenbindung und Commerce dabei zusammenlaufen müssen. Ist das ein Thema für ein kurzes Gespräch?\n\n' +
  SIGNATUR;

export const STARTDATEN = {
  firmen: [
    {
      id: 1,
      name: 'Nordwerk Fördertechnik GmbH',
      name_norm: 'nordwerk fördertechnik',
      branche: 'Maschinenbau',
      land: 'DE',
      umsatz_wert: 182,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'konzern',
    },
    {
      id: 2,
      name: 'Alpenstrom Netze AG',
      name_norm: 'alpenstrom netze',
      branche: 'Utilities',
      land: 'AT',
      umsatz_wert: 640,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'konzern',
    },
    {
      id: 3,
      name: 'Rheintal Technikhandel AG',
      name_norm: 'rheintal technikhandel',
      branche: 'Technischer Handel',
      land: 'CH',
      umsatz_wert: 96,
      umsatz_waehrung: 'CHF',
      umsatz_jahr: 2025,
      umsatz_bezug: 'einzelgesellschaft',
      wechselkurs: 1.06,
      umsatz_eur: 101.8,
    },
    {
      id: 4,
      name: 'Hansemarkt Handels SE',
      name_norm: 'hansemarkt handels',
      branche: 'Retail',
      land: 'DE',
      umsatz_wert: 1400,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'konzern',
    },
    {
      id: 5,
      name: 'Weserland Entsorgung GmbH',
      name_norm: 'weserland entsorgung',
      branche: 'Entsorgung',
      land: 'DE',
      umsatz_wert: 74,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'einzelgesellschaft',
    },
    {
      id: 6,
      name: 'Bergland Sport Handels AG',
      name_norm: 'bergland sport handels',
      branche: 'Retail',
      land: 'AT',
      umsatz_wert: 310,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'konzern',
    },
    {
      id: 7,
      name: 'Stadtwerke Lindental GmbH',
      name_norm: 'stadtwerke lindental',
      branche: 'Utilities',
      land: 'DE',
      umsatz_wert: 228,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'einzelgesellschaft',
    },
  ],
  ansprechpartner: [
    {
      id: 1,
      firma_id: 1,
      anrede: 'Frau',
      titel: 'Dr.',
      vorname: 'Katrin',
      nachname: 'Albers',
      funktion: 'Leiterin Customer Service & After-Sales',
      rolle: 'Service/After-Sales',
      status: 'gespraech_vereinbart',
      antwort_art: 'positiv',
      gespraech_termin: '24.11.2026, 14:00 Uhr',
      linkedin_url: 'linkedin.com/in/katrin-albers-beispiel',
    },
    {
      id: 2,
      firma_id: 4,
      anrede: 'Herr',
      vorname: 'Tobias',
      nachname: 'Reinhardt',
      funktion: 'Head of CRM & E-Commerce',
      rolle: 'CRM',
      status: 'angeschrieben',
      linkedin_url: 'linkedin.com/in/tobias-reinhardt-beispiel',
      email: 't.reinhardt@hansemarkt.example',
      email_herkunft: 'von_marco',
    },
    {
      id: 3,
      firma_id: 2,
      anrede: 'Frau',
      vorname: 'Simone',
      nachname: 'Gruber',
      funktion: 'Chief Digital Officer',
      rolle: 'Digitalisierung/CDO',
      status: 'freigegeben',
      linkedin_url: 'linkedin.com/in/simone-gruber-beispiel',
    },
    {
      id: 4,
      firma_id: 3,
      anrede: 'Herr',
      vorname: 'Luca',
      nachname: 'Bernasconi',
      funktion: 'Leiter Vertrieb Innendienst',
      rolle: 'Vertrieb',
      status: 'nachgefasst',
      linkedin_url: 'linkedin.com/in/luca-bernasconi-beispiel',
    },
    {
      id: 5,
      firma_id: 5,
      anrede: 'Herr',
      vorname: 'Markus',
      nachname: 'Ostermann',
      funktion: 'Leiter Service',
      rolle: 'Service/After-Sales',
      status: 'ohne_antwort_geschlossen',
      geschlossen_am: '2026-11-09',
    },
    {
      id: 6,
      firma_id: 6,
      anrede: 'Frau',
      vorname: 'Jana',
      nachname: 'Wiesner',
      funktion: 'Leiterin E-Commerce',
      rolle: 'E-Commerce',
      status: 'kein_interesse',
      antwort_art: 'kein_interesse',
      geschlossen_am: '2026-11-04',
    },
    {
      id: 7,
      firma_id: 7,
      anrede: 'Herr',
      vorname: 'Peter',
      nachname: 'Hollenstein',
      funktion: 'CIO',
      rolle: 'CIO/IT-Leitung',
      status: 'antwort_erhalten',
      antwort_art: 'neutral_spaeter',
      email: 'p.hollenstein@stadtwerke-lindental.example',
      email_herkunft: 'von_marco',
    },
  ],
  anlaesse: [
    {
      ansprechpartner_id: 1,
      typ: 'unternehmensanlass',
      beschreibung: 'Pressemitteilung: neues Servicezentrum für Ersatzteile in Bremen',
      ereignis_datum: '2026-11-04',
      hypothese:
        'Mit dem neuen Servicezentrum ändern sich vermutlich Abläufe rund um Ersatzteilanfragen und Serviceeinsätze.',
      gespraechsziel: 'Einordnen, welche Kundenprozesse im Service mitwachsen sollten.',
    },
    {
      ansprechpartner_id: 2,
      typ: 'eigener_beitrag',
      beschreibung: 'Interview im Fachmagazin zur Zusammenführung von Kundenkarte und Onlineshop',
      ereignis_datum: '2026-10-28',
      hypothese:
        'Wenn Kundenkarte und Onlineshop zusammenwachsen, greifen Kundenbindung und Commerce auf dieselben Kundendaten zu.',
      gespraechsziel: 'Prüfen, ob das Zusammenspiel von Kundenbindung und Commerce ein Gesprächsthema ist.',
    },
    {
      ansprechpartner_id: 3,
      typ: 'unternehmensanlass',
      beschreibung: 'Geschäftsbericht: Kundenportal für Netzanschlüsse als Schwerpunkt 2027',
      ereignis_datum: '2026-09-15',
      hypothese: 'Ein Kundenportal für Netzanschlüsse berührt Anfrage, Statusauskunft und Service zugleich.',
      gespraechsziel: 'Einordnen, welche Kundenprozesse rund um den Netzanschluss zuerst mitwachsen sollten.',
    },
    {
      ansprechpartner_id: 4,
      typ: 'kein_anlass',
      beschreibung: 'Kein belastbarer aktueller Anlass gefunden',
      ereignis_datum: null,
      hypothese: 'Keine anlassbezogene Hypothese. Die Ansprache stützt sich nur auf die Rolle.',
      gespraechsziel: 'Relevanz prüfen.',
    },
  ],
  nachrichten: [
    {
      ansprechpartner_id: 1,
      betreff: 'Servicezentrum Bremen und Kundenprozesse',
      text:
        'Hallo Frau Dr. Albers, mit dem neuen Servicezentrum für Ersatzteile in Bremen ändern sich vermutlich auch Abläufe rund um Anfragen und Einsätze Ihrer Kunden. Ich verantworte bei Nagarro Customer Experience & Innovation und würde gern mit Ihnen einordnen, welche Kundenprozesse dabei mitwachsen sollten. Wäre ein kurzes Gespräch dazu für Sie interessant?' +
        GRUSS,
    },
    {
      ansprechpartner_id: 2,
      betreff: 'Kundenkarte und Onlineshop zusammenführen',
      text:
        'Hallo Herr Reinhardt, in Ihrem Interview vom 28.10. beschreiben Sie die Zusammenführung von Kundenkarte und Onlineshop. Ich verantworte bei Nagarro Customer Experience & Innovation und würde gern mit Ihnen einordnen, wo Kundenbindung und Commerce dabei zusammenlaufen müssen. Ist das ein Thema für ein kurzes Gespräch?' +
        GRUSS,
    },
    {
      ansprechpartner_id: 3,
      betreff: 'Kundenportal Netzanschlüsse 2027',
      text:
        'Hallo Frau Gruber, im Geschäftsbericht nennt Alpenstrom das Kundenportal für Netzanschlüsse als Schwerpunkt für 2027. Ich verantworte bei Nagarro Customer Experience & Innovation und würde gern mit Ihnen einordnen, welche Kundenprozesse rund um den Netzanschluss dabei zuerst mitwachsen sollten. Wäre ein kurzes Gespräch dazu für Sie relevant?' +
        GRUSS,
    },
    {
      ansprechpartner_id: 4,
      betreff: 'Vertriebsinnendienst im technischen Handel',
      text:
        'Hallo Herr Bernasconi, als Leiter Vertrieb Innendienst bei Rheintal Technikhandel verantworten Sie viele Kundenkontakte im Tagesgeschäft. Ich verantworte bei Nagarro Customer Experience & Innovation und würde gern mit Ihnen prüfen, ob es dazu ein Thema gibt, bei dem ein kurzes Gespräch für Sie nützlich wäre. Wäre das für Sie interessant?' +
        GRUSS,
    },
  ],
  kontaktversuche: [
    { ansprechpartner_id: 1, kanal: 'inmail', art: 'erstkontakt', zeitpunkt: '2026-11-06 08:40', nachricht_von: 1 },
    {
      ansprechpartner_id: 2,
      kanal: 'email',
      art: 'erstkontakt',
      zeitpunkt: '2026-11-12 09:15',
      nachricht_von: 2,
      text: EMAIL_REINHARDT,
      email_grundlage: 'in_hubspot_bekannt',
    },
    { ansprechpartner_id: 4, kanal: 'inmail', art: 'erstkontakt', zeitpunkt: '2026-11-03 17:05', nachricht_von: 4 },
    { ansprechpartner_id: 4, kanal: 'linkedin_nachricht', art: 'nachfassen', zeitpunkt: '2026-11-12 08:20' },
    { ansprechpartner_id: 5, kanal: 'inmail', art: 'erstkontakt', zeitpunkt: '2026-10-19 08:10' },
    { ansprechpartner_id: 6, kanal: 'inmail', art: 'erstkontakt', zeitpunkt: '2026-11-02 08:30' },
    {
      ansprechpartner_id: 7,
      kanal: 'email',
      art: 'erstkontakt',
      zeitpunkt: '2026-11-10 09:05',
      email_grundlage: 'andere',
      email_grundlage_notiz: 'Kontakt vom Stadtwerke-Webinar',
    },
  ],
  antworten: [
    {
      ansprechpartner_id: 1,
      datum: '2026-11-09',
      einordnung: 'positiv',
      naechster_schritt: 'Kurzes Gespräch am 24.11.2026, 14:00 Uhr',
    },
    { ansprechpartner_id: 6, datum: '2026-11-04', einordnung: 'kein_interesse', naechster_schritt: 'Geschlossen' },
    {
      ansprechpartner_id: 7,
      datum: '2026-11-13',
      einordnung: 'neutral_spaeter',
      naechster_schritt: 'Wiedervorlage 15.01.2027',
    },
  ],
  wiedervorlagen: [
    { ansprechpartner_id: 2, faellig_am: '2026-11-23', grund: 'Nachfassen, keine Antwort', art: 'nachfassen' },
    { ansprechpartner_id: 4, faellig_am: '2026-11-24', grund: 'Ohne Antwort schließen?', art: 'schliessen_vorschlag' },
    { ansprechpartner_id: 1, faellig_am: '2026-11-24', grund: 'Gespräch vorbereiten', art: 'frei' },
    { ansprechpartner_id: 7, faellig_am: '2027-01-15', grund: 'Nach Jahreswechsel erneut melden', art: 'frei' },
  ],
  rechercheprofil: {
    name: 'DACH Kernbranchen',
    status: 'aktiv',
    lauftage: ['mo', 'do'],
    anzahl: 10,
    branchen: [...BRANCHEN],
    laender: ['DE', 'AT', 'CH'],
    mindestumsatz_mio_eur: 50,
    rollen: [...ROLLEN],
    obergrenze: 20,
  },
  sperrzeiten: [
    { von: '2026-12-21', bis: '2027-01-03', bezeichnung: 'Weihnachtsurlaub' },
    { von: '2027-02-15', bis: '2027-02-19', bezeichnung: 'Skiurlaub' },
    { von: '2026-11-24', bis: '2026-11-24', bezeichnung: 'Webinartag' },
  ],
  rechercheLaeufe: [
    {
      datum: '2026-11-16',
      ergebnis: 'ausgefuehrt',
      anzahl_vorschlaege: 10,
      anzahl_freigegeben: 7,
      abdeckungsgrenzen: '2 Profile ohne verifizierte URL',
    },
    {
      datum: '2026-11-12',
      ergebnis: 'ausgefuehrt',
      anzahl_vorschlaege: 8,
      anzahl_freigegeben: 6,
      abdeckungsgrenzen: 'Nur 8 belegte Treffer, Lücke benannt',
    },
    {
      datum: '2026-11-09',
      ergebnis: 'ausgefuehrt',
      anzahl_vorschlaege: 10,
      anzahl_freigegeben: 8,
      abdeckungsgrenzen: null,
    },
    {
      datum: '2026-11-05',
      ergebnis: 'uebersprungen',
      grund: 'pausiert',
      grund_text: 'pausiert',
      anzahl_vorschlaege: 0,
      anzahl_freigegeben: 0,
      abdeckungsgrenzen: null,
    },
  ],
  sperreintraege: ['Windmöller & Hölscher', 'BOBST', 'Haberkorn', 'HORNBACH', 'Energie Steiermark'],
  signatur: SIGNATUR,
} as const;

const slug = (s: string) =>
  s
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Schreibt die Startdaten in eine leere Datenbank mit fertigem Schema. */
export function ladeStartdaten(db: Datenbank): void {
  const d = STARTDATEN;
  transaktion(db, () => {
    const firma = db.prepare(
      `INSERT INTO firma (id, name, name_norm, branche, land, umsatz_wert, umsatz_waehrung, umsatz_jahr, umsatz_bezug,
        umsatz_quelle_url, wechselkurs, wechselkurs_quelle_url, umsatz_eur) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    );
    for (const f of d.firmen) {
      const kurs = 'wechselkurs' in f ? f.wechselkurs : null;
      firma.run(
        f.id,
        f.name,
        f.name_norm,
        f.branche,
        f.land,
        f.umsatz_wert,
        f.umsatz_waehrung,
        f.umsatz_jahr,
        f.umsatz_bezug,
        `https://example.com/geschaeftsbericht-${slug(f.name)}`,
        kurs,
        kurs ? 'https://example.com/wechselkurs-chf-eur' : null,
        'umsatz_eur' in f ? f.umsatz_eur : f.umsatz_waehrung === 'EUR' ? f.umsatz_wert : null,
      );
    }
    const ap = db.prepare(
      `INSERT INTO ansprechpartner (id, firma_id, anrede, titel, vorname, nachname, funktion, rolle, quelle_url, linkedin_url,
        email, email_herkunft, status, antwort_art, gespraech_termin, geschlossen_am) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    );
    for (const a of d.ansprechpartner) {
      const x = a as unknown as Record<string, SQLInputValue | undefined>;
      ap.run(
        a.id,
        a.firma_id,
        a.anrede,
        x.titel ?? null,
        a.vorname,
        a.nachname,
        a.funktion,
        a.rolle,
        `https://example.com/team-${slug(a.vorname + ' ' + a.nachname)}`,
        x.linkedin_url ?? null,
        x.email ?? null,
        x.email_herkunft ?? null,
        a.status,
        x.antwort_art ?? null,
        x.gespraech_termin ?? null,
        x.geschlossen_am ?? null,
      );
    }
    const anlass = db.prepare(
      `INSERT INTO anlass (ansprechpartner_id, typ, beschreibung, ereignis_datum, quelle_url, hypothese, gespraechsziel, erstellt_am)
        VALUES (?,?,?,?,?,?,?,?)`,
    );
    for (const a of d.anlaesse) {
      anlass.run(
        a.ansprechpartner_id,
        a.typ,
        a.beschreibung,
        a.ereignis_datum,
        a.ereignis_datum ? `https://example.com/quelle-${a.ansprechpartner_id}` : null,
        a.hypothese,
        a.gespraechsziel,
        '2026-11-01',
      );
    }
    const nachricht = db.prepare(
      `INSERT INTO nachricht (ansprechpartner_id, kanal, art, betreff, text, fassung) VALUES (?, 'linkedin', 'erstkontakt', ?, ?, 'agent')`,
    );
    for (const n of d.nachrichten) nachricht.run(n.ansprechpartner_id, n.betreff, n.text);
    const kv = db.prepare(
      `INSERT INTO kontaktversuch (ansprechpartner_id, kanal, art, zeitpunkt, betreff, text, email_grundlage, email_grundlage_notiz)
        VALUES (?,?,?,?,?,?,?,?)`,
    );
    for (const k of d.kontaktversuche) {
      const x = k as unknown as Record<string, SQLInputValue | undefined>;
      const n = d.nachrichten.find((m) => m.ansprechpartner_id === x.nachricht_von);
      kv.run(
        k.ansprechpartner_id,
        k.kanal,
        k.art,
        k.zeitpunkt,
        n?.betreff ?? null,
        (x.text as string | undefined) ?? n?.text ?? ALTBESTAND,
        x.email_grundlage ?? null,
        x.email_grundlage_notiz ?? null,
      );
    }
    const antwort = db.prepare(
      `INSERT INTO antwort (ansprechpartner_id, datum, einordnung, naechster_schritt) VALUES (?,?,?,?)`,
    );
    for (const a of d.antworten) antwort.run(a.ansprechpartner_id, a.datum, a.einordnung, a.naechster_schritt);
    const wv = db.prepare(`INSERT INTO wiedervorlage (ansprechpartner_id, faellig_am, grund, art) VALUES (?,?,?,?)`);
    for (const w of d.wiedervorlagen) wv.run(w.ansprechpartner_id, w.faellig_am, w.grund, w.art);
    const p = d.rechercheprofil;
    db.prepare(
      `INSERT INTO rechercheprofil (id, name, status, lauftage, anzahl, branchen, laender, mindestumsatz_mio_eur, rollen, obergrenze)
        VALUES (1,?,?,?,?,?,?,?,?,?)`,
    ).run(
      p.name,
      p.status,
      JSON.stringify(p.lauftage),
      p.anzahl,
      JSON.stringify(p.branchen),
      JSON.stringify(p.laender),
      p.mindestumsatz_mio_eur,
      JSON.stringify(p.rollen),
      p.obergrenze,
    );
    const sz = db.prepare(`INSERT INTO sperrzeit (von, bis, bezeichnung) VALUES (?,?,?)`);
    for (const z of d.sperrzeiten) sz.run(z.von, z.bis, z.bezeichnung);
    const lauf = db.prepare(
      `INSERT INTO recherchelauf (datum, ergebnis, grund, grund_text, anzahl_vorschlaege, anzahl_freigegeben, abdeckungsgrenzen, herkunft)
        VALUES (?,?,?,?,?,?,?,?)`,
    );
    for (const l of d.rechercheLaeufe) {
      const x = l as unknown as Record<string, SQLInputValue | undefined>;
      lauf.run(
        l.datum,
        l.ergebnis,
        x.grund ?? null,
        x.grund_text ?? null,
        l.anzahl_vorschlaege,
        l.anzahl_freigegeben,
        l.abdeckungsgrenzen,
        l.ergebnis === 'ausgefuehrt' ? 'api' : null,
      );
    }
    const sp = db.prepare(
      `INSERT INTO sperreintrag (art, name, grund, herkunft, erstellt_am) VALUES ('firma', ?, 'In früherer Ausgabe genannt', 'startbestand', '2026-11-18')`,
    );
    for (const n of d.sperreintraege) sp.run(n);
    db.prepare(`INSERT INTO einstellung (schluessel, wert) VALUES ('signatur', ?)`).run(d.signatur);
  });
}

/** Leere Datenbank mit Schema und Startdaten – für Tests im Speicher. */
export function erstelleStartdatenbank(pfad = ':memory:'): Datenbank {
  const db = oeffneDatenbank(pfad);
  ladeStartdaten(db);
  return db;
}
