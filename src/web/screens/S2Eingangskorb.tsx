import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { LaufDetail, LaufZeile, VorschlagKarte } from '../../gemeinsam/eingangskorb';
import { api } from '../api';
import { useAktualisierung } from '../aktualisierung';
import { ANLASS_TYP_TEXT, datum, personName, umsatz } from '../format';
import { Etikett } from '../teile/Etikett';
import { ScreenKopf } from '../teile/ScreenKopf';

/** S2 Eingangskorb: Rechercheläufe und ihre Vorschläge (A2 Schritt 1, Story E3-S1). */
export function S2Eingangskorb() {
  const { laufId } = useParams();
  const stand = useAktualisierung();
  const [laeufe, setLaeufe] = useState<LaufZeile[] | null>(null);
  const [lauf, setLauf] = useState<LaufDetail | null>(null);
  const [laufFehler, setLaufFehler] = useState('');

  useEffect(() => {
    api<LaufZeile[]>('GET', '/laeufe').then(setLaeufe, () => setLaeufe([]));
  }, [stand]);

  const gewaehlt = laufId ? Number(laufId) : laeufe?.[0]?.id;
  useEffect(() => {
    if (!gewaehlt) return;
    api<LaufDetail>('GET', `/laeufe/${gewaehlt}`).then(
      (l) => {
        setLauf(l);
        setLaufFehler('');
      },
      (e: Error) => {
        setLauf(null);
        setLaufFehler(e.message);
      },
    );
  }, [gewaehlt, stand]);

  return (
    <>
      <ScreenKopf
        id="S2"
        titel="Eingangskorb"
        untertitel="Rechercheläufe des Agenten prüfen, freigeben oder verwerfen."
      />
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
          {laufId && !Number.isInteger(Number(laufId)) && (
            <section className="box">
              <p className="muted">Diesen Recherchelauf gibt es nicht. Wähle links einen anderen Lauf.</p>
            </section>
          )}
          {laufFehler && !lauf && (
            <section className="box">
              <p className="muted">{laufFehler} Wähle links einen anderen Lauf.</p>
            </section>
          )}
          {lauf && lauf.id === gewaehlt && (
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
                <Karte key={v.id} v={v} />
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

function Karte({ v }: { v: VorschlagKarte }) {
  const { firma, person, anlass } = v.daten;
  const ohneAnlass = !anlass || anlass.typ === 'kein_anlass';
  return (
    <article className="box" aria-label={`Vorschlag ${personName(person)}`}>
      <div className="reihe">
        <h3>{personName(person)}</h3>
        <span>{person.funktion}</span>
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
    </article>
  );
}

const quelle = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);
