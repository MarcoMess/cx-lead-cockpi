import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Ansprache } from '../../gemeinsam/ansprache';
import type { KontaktZeile } from '../../gemeinsam/kontakte';
import { ANLASS_TYP_TEXT, STATUS_TEXT } from '../../gemeinsam/texte';
import { LINKEDIN_WORTE } from '../../gemeinsam/werte';
import { api } from '../api';
import { useAktualisierung } from '../aktualisierung';
import { datum, personName } from '../format';
import { Etikett } from '../teile/Etikett';
import { ScreenKopf } from '../teile/ScreenKopf';

const mitSchema = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

/** Wortzähler – die einzige Regel, die die Oberfläche selbst rechnet (architektur.md, Abschnitt 3). */
export function zaehleWoerter(text: string): number {
  return (text.trim().match(/\S+/g) ?? []).length;
}

export function wortzahlText(n: number): string {
  const korridor = `${LINKEDIN_WORTE.von}–${LINKEDIN_WORTE.bis}`;
  const drin = n >= LINKEDIN_WORTE.von && n <= LINKEDIN_WORTE.bis;
  return `${n} ${n === 1 ? 'Wort' : 'Wörter'}, ${drin ? `im Zielkorridor ${korridor}` : `Zielkorridor für LinkedIn ist ${korridor}`}`;
}

/** S5 Ansprache: Warteschlangen oder die Ansprache eines Kontakts (A3 Schritt 1–2, Story E5-S1). */
export function S5Ansprache() {
  const { kontaktId } = useParams();
  return kontaktId ? <AnspracheKontakt id={kontaktId} /> : <Warteschlangen />;
}

function Warteschlangen() {
  const stand = useAktualisierung();
  const [erst, setErst] = useState<KontaktZeile[] | null>(null);
  const [nach, setNach] = useState<KontaktZeile[] | null>(null);
  useEffect(() => {
    api<KontaktZeile[]>('GET', '/kontakte?status=freigegeben').then(setErst, () => setErst([]));
    api<KontaktZeile[]>('GET', '/kontakte?status=angeschrieben').then(setNach, () => setNach([]));
  }, [stand]);

  return (
    <>
      <ScreenKopf
        id="S5"
        titel="Ansprache"
        untertitel="Nachricht fertigstellen, selbst senden, Versand protokollieren."
      />
      <div className="spalten gleich">
        <section className="box" aria-label="Erstkontakt offen">
          <h3>Erstkontakt offen</h3>
          <Liste
            zeilen={erst}
            aktion={(k) => (
              <Link className="btn klein" to={`/ansprache/${k.id}`}>
                Ansprechen
              </Link>
            )}
          />
        </section>
        <section className="box" aria-label="Angeschrieben, Nachfassen möglich">
          <h3>Angeschrieben, Nachfassen möglich</h3>
          <Liste
            zeilen={nach}
            aktion={() => (
              <button
                type="button"
                className="btn klein"
                disabled
                title="Das Nachfassen ist in diesem Stand noch nicht eingebaut."
              >
                Nachfassen
              </button>
            )}
          />
        </section>
      </div>
    </>
  );
}

function Liste({ zeilen, aktion }: { zeilen: KontaktZeile[] | null; aktion: (k: KontaktZeile) => React.ReactNode }) {
  if (!zeilen) return null;
  if (zeilen.length === 0) return <p className="muted">Niemand in dieser Liste.</p>;
  return (
    <table>
      <tbody>
        {zeilen.map((k) => (
          <tr key={k.id}>
            <td>
              {personName(k)}
              <br />
              <span className="muted">
                {k.funktion}, {k.firma_name}
              </span>
            </td>
            <td className="rechts">{aktion(k)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AnspracheKontakt({ id }: { id: string }) {
  const [a, setA] = useState<Ansprache | null>(null);
  const [fehler, setFehler] = useState('');
  const [betreff, setBetreff] = useState('');
  const [text, setText] = useState('');
  const gueltig = /^[1-9][0-9]*$/.test(id);

  useEffect(() => {
    if (!gueltig) return;
    let aktuell = true;
    api<Ansprache>('GET', `/kontakte/${id}/ansprache`).then(
      (x) => {
        if (!aktuell) return;
        setA(x);
        setFehler('');
        setBetreff(x.nachricht?.betreff ?? '');
        setText(x.nachricht?.text ?? '');
      },
      (e: Error) => {
        if (!aktuell) return;
        setA(null);
        setFehler(e.message);
      },
    );
    return () => {
      aktuell = false;
    };
  }, [id, gueltig]);

  const meldung = !gueltig ? 'Diesen Kontakt gibt es nicht.' : fehler;
  if (meldung) {
    return (
      <>
        <ScreenKopf id="S5" titel="Ansprache" />
        <section className="box">
          <p className="muted">{meldung}</p>
          <Link to="/ansprache">Zur Übersicht der Ansprache</Link>
        </section>
      </>
    );
  }
  if (!a || String(a.kontakt.id) !== id) return null;

  const k = a.kontakt;
  const name = personName(k);
  const akte = (
    <Link className="btn" to={`/kontakte/${k.id}`}>
      Zur Kontaktakte
    </Link>
  );
  if (a.modus !== 'erstkontakt') {
    return (
      <>
        <ScreenKopf id="S5" titel="Ansprache" untertitel={`${name}, ${k.firma_name}`} />
        <section className="box">
          <p>
            {a.modus === 'nachfassen'
              ? 'Dieser Kontakt ist angeschrieben. Das Nachfassen ist in diesem Stand noch nicht eingebaut.'
              : `Im Status »${STATUS_TEXT[k.status]}« ist keine Ansprache vorgesehen.`}
          </p>
          <div className="aktionen">{akte}</div>
        </section>
      </>
    );
  }

  const an = a.aufhaenger;
  const ohneAnlass = !an || an.typ === 'kein_anlass';
  return (
    <>
      <ScreenKopf id="S5" titel="Ansprache" untertitel={`${name}, ${k.funktion}, ${k.firma_name}`} />
      <div className="spalten zwei">
        <section className="box aufhaenger" aria-label="Aufhänger">
          <h3>Aufhänger</h3>
          {ohneAnlass ? (
            <p>
              <Etikett art="warn">Kein belastbarer aktueller Anlass</Etikett>
            </p>
          ) : (
            <>
              <p>
                <Etikett>{ANLASS_TYP_TEXT[an.typ] ?? an.typ}</Etikett>
              </p>
              <p>
                {an.beschreibung}
                <br />
                <span className="muted">Datum: {datum(an.ereignis_datum)}</span>{' '}
                {an.quelle_url && (
                  <a href={mitSchema(an.quelle_url)} target="_blank" rel="noopener noreferrer">
                    Quelle öffnen
                  </a>
                )}
              </p>
            </>
          )}
          {an?.hypothese && (
            <p>
              <Etikett art="hypothese">Hypothese</Etikett> {an.hypothese}
            </p>
          )}
          {an?.gespraechsziel && (
            <p>
              <b>Gesprächsziel:</b> {an.gespraechsziel}
            </p>
          )}
        </section>
        <section className="box" aria-label="Nachricht">
          <div className="aktionen kopf" role="group" aria-label="Kanal">
            <h3>Kanal</h3>
            <button type="button" className="btn p" aria-pressed="true">
              LinkedIn
            </button>
            <button
              type="button"
              className="btn"
              aria-pressed="false"
              disabled
              title="Die E-Mail-Fassung ist in diesem Stand noch nicht eingebaut."
            >
              E-Mail
            </button>
          </div>
          <label className="feld">
            <span>Betreff</span>
            <input type="text" value={betreff} onChange={(e) => setBetreff(e.target.value)} />
          </label>
          <label className="feld">
            <span>Nachricht</span>
            <textarea className="nachricht-feld" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <p className="muted wortzahl" aria-live="polite">
            {wortzahlText(zaehleWoerter(text))}
          </p>
          <p className="muted">Du sendest selbst in LinkedIn oder im Sales Navigator. Das Cockpit sendet nichts.</p>
          <div className="aktionen">{akte}</div>
        </section>
      </div>
    </>
  );
}
