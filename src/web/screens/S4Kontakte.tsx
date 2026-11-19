import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import { KONTAKT_FILTER, type KontaktFilter, type KontaktZeile } from '../../gemeinsam/kontakte';
import { STATUS_TEXT } from '../../gemeinsam/texte';
import { api } from '../api';
import { useAktualisierung } from '../aktualisierung';
import { personName } from '../format';
import { ScreenKopf } from '../teile/ScreenKopf';
import { StatusEtikett } from '../teile/StatusEtikett';
import { S4Kontaktakte } from './S4Kontaktakte';

function filterText(f: KontaktFilter): string {
  if (f === 'offene') return 'Offene';
  if (f === 'alle') return 'Alle';
  return STATUS_TEXT[f];
}

/** S4 Kontakte: Liste mit Statusfilter (E4-S2) und Kontaktakte (E4-S3). */
export function S4Kontakte() {
  const { kontaktId } = useParams();
  const meldung = (useLocation().state as { meldung?: string } | null)?.meldung;
  const stand = useAktualisierung();
  const [suche, setSuche] = useSearchParams();
  const roh = suche.get('status') ?? 'offene';
  const filter: KontaktFilter = (KONTAKT_FILTER as readonly string[]).includes(roh) ? (roh as KontaktFilter) : 'offene';
  const [kontakte, setKontakte] = useState<KontaktZeile[] | null>(null);
  const [fehler, setFehler] = useState('');

  useEffect(() => {
    let aktuell = true; // Antworten zu einem nicht mehr gewählten Filter verwerfen (Prüfung E4-S2, Sollte 1).
    api<KontaktZeile[]>('GET', `/kontakte?status=${filter}`).then(
      (k) => {
        if (!aktuell) return;
        setKontakte(k);
        setFehler('');
      },
      (e: Error) => {
        if (aktuell) setFehler(e.message);
      },
    );
    return () => {
      aktuell = false;
    };
  }, [filter, stand]);

  return (
    <>
      <ScreenKopf id="S4" titel="Kontakte" untertitel="Pipeline und Kontaktakte." />
      {meldung && (
        <p className="hinweis ok" role="status">
          {meldung}
        </p>
      )}
      {fehler && (
        <p className="hinweis fehler" role="alert">
          {fehler}
        </p>
      )}
      <div className="spalten zwei">
        <section className="box" aria-label="Kontaktliste">
          <div className="aktionen oben">
            <label>
              Status{' '}
              <select
                className="inl"
                value={filter}
                onChange={(e) => setSuche(e.target.value === 'offene' ? {} : { status: e.target.value })}
              >
                {KONTAKT_FILTER.map((f) => (
                  <option key={f} value={f}>
                    {filterText(f)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Firma</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {kontakte?.map((k) => (
                <tr key={k.id} className={String(k.id) === kontaktId ? 'gewaehlt' : undefined}>
                  <td>
                    <Link to={{ pathname: `/kontakte/${k.id}`, search: suche.toString() }} className="zeilenlink">
                      {personName(k)}
                    </Link>
                    <br />
                    <span className="muted">{k.funktion}</span>
                  </td>
                  <td>{k.firma_name}</td>
                  <td>
                    <StatusEtikett status={k.status} antwortArt={k.antwort_art} />
                  </td>
                </tr>
              ))}
              {kontakte && kontakte.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    Kein Kontakt passt zu diesem Filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="box" aria-label="Kontaktakte">
          {kontaktId ? (
            <S4Kontaktakte id={kontaktId} />
          ) : (
            <p className="muted">Wähle links einen Kontakt, um Verlauf, Anlässe und Aktionen zu sehen.</p>
          )}
        </section>
      </div>
    </>
  );
}
