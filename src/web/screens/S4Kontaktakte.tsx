import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { KontaktAkte, VerlaufEintrag } from '../../gemeinsam/kontakte';
import {
  ANLASS_TYP_TEXT,
  EINORDNUNG_TEXT,
  EMAIL_GRUNDLAGE_TEXT,
  EMAIL_HERKUNFT_TEXT,
  KANAL_TEXT,
  KONTAKT_ART_TEXT,
  SCHIENE_TEXT,
  STATUS_TEXT,
} from '../../gemeinsam/texte';
import { STATUS_SCHIENE } from '../../gemeinsam/werte';
import { api } from '../api';
import { useAktualisierung } from '../aktualisierung';
import { datum, personName } from '../format';
import { Etikett } from '../teile/Etikett';
import { StatusEtikett } from '../teile/StatusEtikett';

const mitSchema = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

/** Kontaktakte in S4: Stammdaten, Anlass und vollständiger Verlauf (A4 Schritt 1, Story E4-S3). */
export function S4Kontaktakte({ id }: { id: string }) {
  const stand = useAktualisierung();
  const [akte, setAkte] = useState<KontaktAkte | null>(null);
  const [fehler, setFehler] = useState('');
  const gueltig = /^[1-9][0-9]*$/.test(id);

  useEffect(() => {
    if (!gueltig) return;
    let aktuell = true;
    api<KontaktAkte>('GET', `/kontakte/${id}`).then(
      (a) => {
        if (!aktuell) return;
        setAkte(a);
        setFehler('');
      },
      (e: Error) => {
        if (!aktuell) return;
        setAkte(null);
        setFehler(e.message);
      },
    );
    return () => {
      aktuell = false;
    };
  }, [id, gueltig, stand]);

  const meldung = !gueltig ? 'Diesen Kontakt gibt es nicht.' : fehler;
  if (meldung) return <p className="muted">{meldung} Wähle links einen anderen Kontakt.</p>;
  if (!akte || String(akte.id) !== id) return null;

  const name = personName(akte);
  const stelle = STATUS_SCHIENE.indexOf(akte.status as (typeof STATUS_SCHIENE)[number]);
  return (
    <article aria-label={`Kontaktakte ${name}`}>
      <div className="aktionen kopf">
        <h2>{name}</h2>
        <StatusEtikett status={akte.status} antwortArt={akte.antwort_art} />
      </div>
      <p className="unterzeile">
        {akte.funktion}, <Link to={`/firmen/${akte.firma.id}`}>{akte.firma.name}</Link>
      </p>
      {akte.erlaubte_aktionen.includes('ansprechen') && (
        <div className="aktionen">
          <Link className="btn p" to={`/ansprache/${akte.id}`}>
            Ansprechen
          </Link>
        </div>
      )}

      {akte.endzustand ? (
        <p className="note" role="note">
          Endzustand »{STATUS_TEXT[akte.status]}«. Verlauf, Anlässe und Nachrichten bleiben erhalten.
        </p>
      ) : (
        <ol className="schiene" aria-label="Statusschiene">
          {STATUS_SCHIENE.map((s, i) => (
            <li
              key={s}
              className={i < stelle ? 'erledigt' : i === stelle ? 'aktuell' : undefined}
              aria-current={i === stelle ? 'step' : undefined}
            >
              {SCHIENE_TEXT[s]}
            </li>
          ))}
        </ol>
      )}

      <dl className="kv">
        <dt>LinkedIn</dt>
        <dd>
          {akte.linkedin_url ? (
            <a href={mitSchema(akte.linkedin_url)} target="_blank" rel="noopener noreferrer">
              {akte.linkedin_url}
            </a>
          ) : (
            <>
              <Etikett art="warn">keine verifizierte URL</Etikett> Suchhinweis für den Sales Navigator: {akte.vorname}{' '}
              {akte.nachname}, {akte.firma.name}
            </>
          )}
        </dd>
        <dt>Direktkontakt</dt>
        <dd>
          {akte.email || akte.telefon ? (
            <>
              {akte.email && (
                <>
                  E-Mail {akte.email}
                  {akte.email_herkunft && (
                    <span className="muted"> ({EMAIL_HERKUNFT_TEXT[akte.email_herkunft] ?? akte.email_herkunft})</span>
                  )}
                </>
              )}
              {akte.email && akte.telefon && <br />}
              {akte.telefon && <>Telefon {akte.telefon}</>}
              <span className="muted"> – persönlich</span>
            </>
          ) : (
            <Etikett art="warn">keine berufliche E-Mail hinterlegt</Etikett>
          )}
        </dd>
        <dt>Firmenkontakt</dt>
        <dd>
          {akte.firma.firmenkontakt ?? <Etikett art="warn">nicht belegt</Etikett>}{' '}
          <span className="muted">(allgemein, kein Direktkontakt)</span>
        </dd>
        {akte.gespraech_termin && (
          <>
            <dt>Gespräch</dt>
            <dd>{akte.gespraech_termin}</dd>
          </>
        )}
        <dt>SAP</dt>
        <dd>
          {akte.sap_lead_id ? (
            <>
              <Etikett art="ok">Account {akte.firma.sap_account_id}</Etikett>{' '}
              <Etikett art="ok">Kontakt {akte.sap_kontakt_id}</Etikett>{' '}
              <Etikett art="ok">Lead {akte.sap_lead_id}</Etikett>
            </>
          ) : (
            'noch nicht übergeben'
          )}
        </dd>
      </dl>

      <h3>Anlass</h3>
      {akte.anlaesse.length === 0 && <p className="muted">Für diesen Kontakt ist kein Anlass erfasst.</p>}
      {akte.anlaesse.map((a, i) => (
        <div key={i} className="anlass">
          <p>
            <Etikett art={a.ereignis_datum ? 'neutral' : 'warn'}>{ANLASS_TYP_TEXT[a.typ] ?? a.typ}</Etikett>{' '}
            {a.beschreibung}
            {a.ereignis_datum && <> ({datum(a.ereignis_datum)})</>}
            {a.quelle_url && (
              <>
                {' '}
                <a href={mitSchema(a.quelle_url)} target="_blank" rel="noopener noreferrer">
                  Quelle öffnen
                </a>
              </>
            )}
          </p>
          {a.hypothese && (
            <p>
              <Etikett art="hypothese">Hypothese</Etikett> {a.hypothese}
            </p>
          )}
          {a.gespraechsziel && <p className="muted">Gesprächsziel: {a.gespraechsziel}</p>}
        </div>
      ))}

      <h3>Verlauf</h3>
      {akte.verlauf.length === 0 ? (
        <p className="muted">Noch kein Kontaktversuch.</p>
      ) : (
        <ul className="verlauf">
          {akte.verlauf.map((e, i) => (
            <Eintrag key={i} e={e} />
          ))}
        </ul>
      )}
    </article>
  );
}

function Eintrag({ e }: { e: VerlaufEintrag }) {
  if (e.art === 'antwort') {
    return (
      <li className="antwort">
        <b>Antwort: {EINORDNUNG_TEXT[e.einordnung]}</b> am {datum(e.datum)}
        {e.wortlaut && <div className="nachricht">{e.wortlaut}</div>}
        {e.naechster_schritt && (
          <>
            <br />
            Nächster Schritt: {e.naechster_schritt}
          </>
        )}
      </li>
    );
  }
  const grundlage =
    e.email_grundlage &&
    (e.email_grundlage === 'andere' && e.email_grundlage_notiz
      ? `${EMAIL_GRUNDLAGE_TEXT.andere}: ${e.email_grundlage_notiz}`
      : EMAIL_GRUNDLAGE_TEXT[e.email_grundlage]);
  return (
    <li>
      <b>
        {KONTAKT_ART_TEXT[e.kontakt_art]} per {KANAL_TEXT[e.kanal]}
      </b>{' '}
      am {datum(e.zeitpunkt)}
      {grundlage && (
        <>
          <br />
          E-Mail-Grundlage: <Etikett>{grundlage}</Etikett>
        </>
      )}
      {e.text && (
        <div className="nachricht">
          {e.betreff && `Betreff: ${e.betreff}\n\n`}
          {e.text}
        </div>
      )}
    </li>
  );
}
