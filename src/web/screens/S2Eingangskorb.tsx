import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { LaufDetail, LaufZeile, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import { api, ApiFehler } from '../api';
import { useAktualisierung } from '../aktualisierung';
import { ANLASS_TYP_TEXT, STATUS_TEXT } from '../../gemeinsam/texte';
import { FRISTEN } from '../../gemeinsam/werte';
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

  const ohneAnlass = !anlass || anlass.typ === 'kein_anlass';
  return (
    <article className="box" aria-label={`Vorschlag ${personName(person)}`}>
      <div className="reihe">
        <h3>{personName(person)}</h3>
        <span>{person.funktion}</span>
        {v.zustand === 'freigegeben' && <Etikett art="ok">Freigegeben</Etikett>}
        {v.zustand === 'verworfen' && <Etikett art="aus">Verworfen</Etikett>}
        {v.zustand === 'zu_pruefen' && v.ist_dublette && <Etikett art="aus">Dublette</Etikett>}
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
      {v.zustand === 'zu_pruefen' && v.hinweis_zweiter_ansprechpartner && (
        <p className="note">{v.hinweis_zweiter_ansprechpartner}</p>
      )}
      {fehler && (
        <p className="hinweis fehler" role="alert">
          {fehler}
        </p>
      )}
      {v.zustand === 'zu_pruefen' && (
        <div className="aktionen">
          <button
            className="btn p"
            type="button"
            onClick={freigeben}
            disabled={v.ist_dublette}
            title={v.ist_dublette ? 'Eine Dublette lässt sich nicht freigeben.' : undefined}
          >
            Freigeben
          </button>
        </div>
      )}
    </article>
  );
}

const quelle = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);
