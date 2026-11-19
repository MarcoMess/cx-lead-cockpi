import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { LaufDetail, LaufZeile, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import type { LaufAngelegt } from '../../gemeinsam/lauf';
import { api, ApiFehler } from '../api';
import { useAktualisierung } from '../aktualisierung';
import { ANLASS_TYP_TEXT, STATUS_TEXT } from '../../gemeinsam/texte';
import type { Verworfen } from '../../gemeinsam/verwerfen';
import { FRISTEN, VERWERF_GRUENDE, type VerwerfGrund } from '../../gemeinsam/werte';
import { datum, personName, umsatz } from '../format';
import { Etikett } from '../teile/Etikett';
import { ScreenKopf } from '../teile/ScreenKopf';

/** S2 Eingangskorb: Rechercheläufe und ihre Vorschläge (A2 Schritt 1, Story E3-S1). */
export function S2Eingangskorb() {
  const { laufId } = useParams();
  const stand = useAktualisierung();
  const [laeufe, setLaeufe] = useState<LaufZeile[] | null>(null);
  const [lauf, setLauf] = useState<LaufDetail | null>(null);
  const [neuLaden, setNeuLaden] = useState(0);
  const [meldung, setMeldung] = useState('');
  const [laufFehler, setLaufFehler] = useState('');

  useEffect(() => {
    api<LaufZeile[]>('GET', '/laeufe').then(setLaeufe, () => setLaeufe([]));
  }, [stand, neuLaden]);

  // Nur positive ganze Zahlen sind Lauf-Nummern; alles andere gibt es nicht (Prüfung E3-S1, Runde 2).
  const idGueltig = !laufId || /^[1-9][0-9]*$/.test(laufId);
  const gewaehlt = laufId ? (idGueltig ? Number(laufId) : undefined) : laeufe?.[0]?.id;
  useEffect(() => {
    if (!gewaehlt) return;
    let aktuell = true; // Spätere Antworten zu einem nicht mehr gewählten Lauf verwerfen.
    api<LaufDetail>('GET', `/laeufe/${gewaehlt}`).then(
      (l) => {
        if (!aktuell) return;
        setLauf(l);
        setLaufFehler('');
      },
      (e: Error) => {
        if (!aktuell) return;
        setLauf(null);
        setLaufFehler(e.message);
      },
    );
    return () => {
      aktuell = false;
    };
  }, [gewaehlt, stand, neuLaden]);
  const spaltenFehler = !idGueltig
    ? 'Diesen Recherchelauf gibt es nicht.'
    : !lauf || lauf.id !== gewaehlt
      ? laufFehler
      : '';

  const navigate = useNavigate();
  function geaendert(text: string) {
    setMeldung(text);
    setNeuLaden((n) => n + 1);
  }

  return (
    <>
      <ScreenKopf
        id="S2"
        titel="Eingangskorb"
        untertitel="Rechercheläufe des Agenten prüfen, freigeben oder verwerfen."
      />
      {meldung && (
        <p className="hinweis ok" role="status">
          {meldung}
        </p>
      )}
      <div className="spalten links-schmal">
        <section className="box" aria-label="Läufe">
          <h3>Läufe</h3>
          {laeufe && laeufe.length === 0 && <p className="muted">Der Agent hat noch keinen Lauf geliefert.</p>}
          <table>
            <tbody>
              {laeufe?.map((l) => (
                <tr key={l.id} className={l.id === gewaehlt ? 'gewaehlt' : undefined}>
                  <td>
                    <Link to={`/eingangskorb/${l.id}`} className="zeilenlink">
                      {datum(l.datum)}
                    </Link>{' '}
                    {l.offen > 0 && <Etikett art="warn">{l.offen} offen</Etikett>}
                    <br />
                    <span className="muted">
                      {l.anzahl_vorschlaege} Vorschläge, {l.anzahl_freigegeben} freigegeben
                    </span>
                    {l.abdeckungsgrenzen && (
                      <>
                        <br />
                        <span className="muted">Abdeckungsgrenzen: {l.abdeckungsgrenzen}</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Hochladen
            fertig={(r, text) => {
              geaendert(text);
              navigate(`/eingangskorb/${r.lauf_id}`);
            }}
          />
        </section>
        <div>
          {spaltenFehler && (
            <section className="box">
              <p className="muted">{spaltenFehler} Wähle links einen anderen Lauf.</p>
            </section>
          )}
          {!spaltenFehler && lauf && lauf.id === gewaehlt && (
            <>
              <section className="box" aria-label={`Lauf vom ${datum(lauf.datum)}`}>
                <h2>Lauf vom {datum(lauf.datum)}</h2>
                <dl className="kv">
                  <dt>Vorschläge</dt>
                  <dd>{lauf.anzahl_vorschlaege}</dd>
                  <dt>Freigegeben</dt>
                  <dd>{lauf.anzahl_freigegeben}</dd>
                  <dt>Abdeckungsgrenzen</dt>
                  <dd>{lauf.abdeckungsgrenzen || '–'}</dd>
                </dl>
              </section>
              {lauf.vorschlaege.map((v) => (
                <Karte key={v.id} v={v} geaendert={geaendert} />
              ))}
              {lauf.vorschlaege.length === 0 || lauf.offen === 0 ? (
                <div className="box">
                  <p className="muted">
                    {lauf.anzahl_vorschlaege === 0
                      ? 'Dieser Lauf hat keine Vorschläge geliefert.'
                      : 'Alle Vorschläge dieses Laufs sind geprüft. Die freigegebenen Kontakte findest du unter Kontakte (S4).'}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Karte({ v, geaendert }: { v: VorschlagKarte; geaendert: (meldung: string) => void }) {
  const { firma, person, anlass } = v.daten;
  const [fehler, setFehler] = useState('');
  const [offen, setOffen] = useState(false);
  const [verwerfen, setVerwerfen] = useState(false);
  const [grund, setGrund] = useState<VerwerfGrund>(VERWERF_GRUENDE[0]);
  const gesperrt = v.ist_dublette || !!v.gesperrt || v.fehlende_pflichtangaben.length > 0;

  async function freigeben() {
    setFehler('');
    try {
      await api('POST', `/vorschlaege/${v.id}/freigabe`);
      geaendert(
        `${personName(person)} freigegeben. Firma und Ansprechpartner sind angelegt, der Kontakt steht in der Ansprache.`,
      );
    } catch (e) {
      setFehler(e instanceof ApiFehler ? e.message : 'Die Freigabe hat nicht geklappt.');
    }
  }

  async function verwerfenBestaetigen() {
    setFehler('');
    try {
      const r = await api<Verworfen>('POST', `/vorschlaege/${v.id}/verwerfung`, { grund });
      const s = r.sperreintrag;
      const sperre =
        s.art === 'firma'
          ? `Die Firma ${s.name} ist für den Agenten gesperrt.`
          : `${s.name} ist bis ${datum(s.gesperrt_bis)} für den Agenten gesperrt.`;
      geaendert(
        `${personName(person)} verworfen (${grund}). ${
          s.neu
            ? sperre
            : s.verlaengert
              ? `Die Sperre von ${s.name} gilt jetzt bis ${datum(s.gesperrt_bis)}.`
              : `${s.name} war schon auf der Sperrliste${s.gesperrt_bis ? ` (bis ${datum(s.gesperrt_bis)})` : ''}.`
        }`,
      );
    } catch (e) {
      setFehler(e instanceof ApiFehler ? e.message : 'Das Verwerfen hat nicht geklappt.');
    }
  }

  const ohneAnlass = !anlass || anlass.typ === 'kein_anlass';
  return (
    <article className="box" aria-label={`Vorschlag ${personName(person)}`}>
      <div className="reihe">
        <h3>{personName(person)}</h3>
        <span>{person.funktion}</span>
        {v.zustand === 'freigegeben' && <Etikett art="ok">Freigegeben</Etikett>}
        {v.zustand === 'verworfen' && <Etikett art="aus">Verworfen: {v.verwerf_grund}</Etikett>}
        {v.zustand === 'zu_pruefen' && v.ist_dublette && <Etikett art="aus">Dublette</Etikett>}
        {v.zustand === 'zu_pruefen' && v.gesperrt && <Etikett art="aus">Gesperrt</Etikett>}
        {v.zustand === 'zu_pruefen' && v.ist_wiederansprache && <Etikett art="hypothese">Wiederansprache</Etikett>}
      </div>
      <p className="eng">
        <b>{firma.name}</b>, {firma.branche ?? 'Branche nicht belegt'} / {firma.land ?? '–'}, Umsatz {umsatz(firma)}
      </p>
      <p className="eng">
        {ohneAnlass ? (
          <Etikett art="warn">Kein belastbarer aktueller Anlass</Etikett>
        ) : (
          <>
            <Etikett>{ANLASS_TYP_TEXT[anlass.typ ?? ''] ?? 'Anlass'}</Etikett> {anlass.beschreibung}
            {anlass.ereignis_datum && ` (${datum(anlass.ereignis_datum)})`}{' '}
            {anlass.quelle_url && (
              <a href={quelle(anlass.quelle_url)} target="_blank" rel="noopener noreferrer">
                Quelle öffnen
              </a>
            )}
          </>
        )}
      </p>
      {v.zustand === 'zu_pruefen' && v.bestehende_firma && (
        <p className="eng muted">Bestehende Firma: {v.bestehende_firma.name}</p>
      )}
      {v.zustand === 'zu_pruefen' && v.ist_dublette && v.bezug && (
        <p className="note fehler">
          Dublette: Diese Person ist bereits im Cockpit ({v.bezug.name}, Status »{STATUS_TEXT[v.bezug.status]}«). Der
          Vorschlag kann nicht freigegeben werden.
        </p>
      )}
      {v.zustand === 'zu_pruefen' && v.ist_wiederansprache && v.bezug && (
        <p className="note">
          Wiederansprache: {v.bezug.name} wurde am {datum(v.bezug.geschlossen_am)} ohne Antwort geschlossen, die Sperre
          von {FRISTEN.sperreNachSchliessenMonate} Monaten ist abgelaufen und es gibt einen neuen Anlass.
        </p>
      )}
      {v.zustand === 'zu_pruefen' && v.gesperrt && (
        <p className="note fehler">
          Gesperrt: {v.gesperrt.art === 'firma' ? 'Die Firma' : ''} {v.gesperrt.name} steht auf der Sperrliste (
          {v.gesperrt.grund}
          {v.gesperrt.gesperrt_bis ? `, bis ${datum(v.gesperrt.gesperrt_bis)}` : ''}). Der Vorschlag kann nicht
          freigegeben werden.
        </p>
      )}
      {v.zustand === 'zu_pruefen' && v.hinweis_zweiter_ansprechpartner && (
        <p className="note">{v.hinweis_zweiter_ansprechpartner}</p>
      )}
      {v.zustand === 'zu_pruefen' && v.fehlende_pflichtangaben.length > 0 && (
        <div className="note" role="note" aria-label="Fehlende Pflichtangaben">
          Freigeben ist gesperrt: {v.fehlende_pflichtangaben.join('; ')}.
        </div>
      )}
      {offen && <Angaben v={v} />}
      {fehler && (
        <p className="hinweis fehler" role="alert">
          {fehler}
        </p>
      )}
      {verwerfen && v.zustand === 'zu_pruefen' ? (
        <div className="aktionen" role="group" aria-label="Verwerfen">
          <label>
            Grund{' '}
            <select
              className="inl"
              aria-label="Grund"
              value={grund}
              onChange={(e) => setGrund(e.target.value as VerwerfGrund)}
            >
              {VERWERF_GRUENDE.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <button className="btn d" type="button" onClick={verwerfenBestaetigen}>
            Verwerfen bestätigen
          </button>
          <button className="btn" type="button" onClick={() => setVerwerfen(false)}>
            Abbrechen
          </button>
          <span className="muted">
            »passt nicht ins Zielbild« und »wird von Kollegen betreut« sperren die Firma, die anderen Gründe nur die
            Person für 6 Monate.
          </span>
        </div>
      ) : (
        <div className="aktionen">
          <button className="btn klein" type="button" aria-expanded={offen} onClick={() => setOffen(!offen)}>
            {offen ? 'Angaben ausblenden' : 'Angaben und Quellen prüfen'}
          </button>
          {v.zustand === 'zu_pruefen' && (
            <>
              <button
                className="btn p"
                type="button"
                onClick={freigeben}
                disabled={gesperrt}
                title={
                  v.ist_dublette
                    ? 'Eine Dublette lässt sich nicht freigeben.'
                    : v.gesperrt
                      ? 'Der Vorschlag steht auf der Sperrliste.'
                      : gesperrt
                        ? 'Es fehlen Pflichtangaben.'
                        : undefined
                }
              >
                Freigeben
              </button>
              <button className="btn" type="button" onClick={() => setVerwerfen(true)}>
                Verwerfen
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

/** »Ergebnisdatei hochladen« (Story E2-S5): liest die Datei im Browser und schickt den Lauf an den Server. */
function Hochladen({ fertig }: { fertig: (r: LaufAngelegt, text: string) => void }) {
  const [fehler, setFehler] = useState('');
  async function gewaehlt(e: React.ChangeEvent<HTMLInputElement>) {
    const datei = e.target.files?.[0];
    e.target.value = '';
    if (!datei) return;
    setFehler('');
    let inhalt: unknown;
    try {
      inhalt = JSON.parse(await datei.text());
    } catch {
      setFehler(`Die Datei »${datei.name}« lässt sich nicht lesen: Sie enthält kein gültiges JSON.`);
      return;
    }
    try {
      const r = await api<LaufAngelegt>('POST', '/laeufe/upload', inhalt);
      const zurueck = r.zurueckgewiesen.length
        ? ` ${r.zurueckgewiesen.length} zurückgewiesen: ${r.zurueckgewiesen.map((z) => `Nr. ${z.index + 1} ${z.meldung}`).join(' ')}`
        : '';
      fertig(r, `Ergebnisdatei hochgeladen: ${r.angelegt} Vorschläge im Eingangskorb.${zurueck}`);
    } catch (x) {
      setFehler(x instanceof ApiFehler ? x.message : 'Das Hochladen hat nicht geklappt.');
    }
  }
  return (
    <div className="aktionen">
      <label className="btn">
        Ergebnisdatei hochladen
        <input type="file" accept=".json,application/json" className="versteckt" onChange={gewaehlt} />
      </label>
      {fehler && (
        <p className="hinweis fehler" role="alert">
          {fehler}
        </p>
      )}
    </div>
  );
}

const quelle = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

/** Kurzform einer Quelle für die Anzeige: der Host ohne »www.«. */
const host = (url: string) => {
  try {
    return new URL(quelle(url)).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** Alle Angaben eines Vorschlags mit Herkunft (A2 Schritt 2, Story E3-S2). */
function Angaben({ v }: { v: VorschlagKarte }) {
  const { firma: f, person: p, anlass: a, nachricht: n } = v.daten;
  const nichtBelegt = <Etikett art="warn">nicht belegt</Etikett>;
  const link = (url: string | null | undefined) =>
    url?.trim() ? (
      <>
        <a href={quelle(url)} target="_blank" rel="noopener noreferrer">
          {host(url)}
        </a>{' '}
        <span className="muted">(Agent)</span>
      </>
    ) : (
      nichtBelegt
    );
  return (
    <dl className="kv angaben" aria-label="Angaben und Quellen">
      <dt>Umsatzquelle</dt>
      <dd>
        {link(f.umsatz_quelle_url)}
        {f.umsatz_jahr != null && <span className="muted"> · Bezugsjahr {f.umsatz_jahr}</span>}
      </dd>
      {f.umsatz_waehrung && f.umsatz_waehrung !== 'EUR' && (
        <>
          <dt>Wechselkurs</dt>
          <dd>
            {f.wechselkurs != null ? (
              <>
                {f.wechselkurs.toLocaleString('de-DE', { maximumFractionDigits: 4 })} {link(f.wechselkurs_quelle_url)}
              </>
            ) : (
              nichtBelegt
            )}
          </dd>
        </>
      )}
      <dt>Funktion belegt durch</dt>
      <dd>{link(p.quelle_url)}</dd>
      <dt>LinkedIn-Profil</dt>
      <dd>
        {p.linkedin_url?.trim() ? (
          link(p.linkedin_url)
        ) : (
          <>
            {nichtBelegt} Suchhinweis: {p.vorname} {p.nachname}, {f.name}
          </>
        )}
      </dd>
      <dt>Berufliche E-Mail</dt>
      <dd>
        {p.email ? (
          <>
            {p.email} <span className="muted">(Agent)</span>
          </>
        ) : (
          nichtBelegt
        )}
      </dd>
      {a?.hypothese && (
        <>
          <dt>Relevanzhypothese</dt>
          <dd>
            <Etikett art="hypothese">Hypothese</Etikett> {a.hypothese} <span className="muted">(Agent)</span>
          </dd>
        </>
      )}
      {a?.gespraechsziel && (
        <>
          <dt>Gesprächsziel</dt>
          <dd>
            {a.gespraechsziel} <span className="muted">(Agent)</span>
          </dd>
        </>
      )}
      <dt>Betreff</dt>
      <dd>
        {n?.betreff ? (
          <>
            {n.betreff} <span className="muted">(Agent)</span>
          </>
        ) : (
          nichtBelegt
        )}
      </dd>
      <dt>LinkedIn-Nachricht</dt>
      <dd>
        {n?.text?.trim() ? (
          <>
            <div className="nachricht">{n.text}</div>
            <span className="muted">(Agent)</span>
          </>
        ) : (
          nichtBelegt
        )}
      </dd>
    </dl>
  );
}
