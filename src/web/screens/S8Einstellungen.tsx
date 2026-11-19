import { useEffect, useState } from 'react';
import type { SperrZeile } from '../../gemeinsam/sperrliste';
import type { SperreArt } from '../../gemeinsam/werte';
import { api } from '../api';
import { useAktualisierung } from '../aktualisierung';
import { datum } from '../format';
import { ScreenKopf } from '../teile/ScreenKopf';

const ART_TEXT: Record<SperreArt, string> = { firma: 'Firma', person: 'Person' };

/** S8 Einstellungen – im ersten Schritt die Sperrliste (Story E10-S1). */
export function S8Einstellungen() {
  const stand = useAktualisierung();
  const [liste, setListe] = useState<SperrZeile[] | null>(null);
  const [name, setName] = useState('');
  const [art, setArt] = useState<SperreArt>('firma');
  const [grund, setGrund] = useState('');
  const [fehler, setFehler] = useState('');
  const [meldung, setMeldung] = useState('');

  useEffect(() => {
    let aktuell = true;
    api<SperrZeile[]>('GET', '/sperrliste').then(
      (l) => aktuell && setListe(l),
      (e: Error) => aktuell && setFehler(e.message),
    );
    return () => {
      aktuell = false;
    };
  }, [stand]);

  async function hinzufuegen(e: React.FormEvent) {
    e.preventDefault();
    setFehler('');
    setMeldung('');
    try {
      setListe(await api<SperrZeile[]>('POST', '/sperrliste', { art, name, grund }));
      setMeldung(`»${name.trim()}« steht jetzt auf der Sperrliste.`);
      setName('');
      setGrund('');
    } catch (x) {
      setFehler((x as Error).message);
    }
  }

  async function entfernen(z: SperrZeile) {
    setFehler('');
    setMeldung('');
    try {
      setListe(await api<SperrZeile[]>('DELETE', `/sperrliste/${z.id}`));
      setMeldung(`»${z.name}« steht nicht mehr auf der Sperrliste.`);
    } catch (x) {
      setFehler((x as Error).message);
    }
  }

  return (
    <>
      <ScreenKopf id="S8" titel="Einstellungen" untertitel="Sperrliste, Zugänge, Fristen und Export." />
      <section className="box" aria-label="Sperrliste">
        <h2>Sperrliste</h2>
        <p className="muted">Der Agent schlägt diese Firmen und Personen nicht vor.</p>
        {fehler && (
          <p className="hinweis fehler" role="alert">
            {fehler}
          </p>
        )}
        {meldung && (
          <p className="hinweis ok" role="status">
            {meldung}
          </p>
        )}
        <table>
          <thead>
            <tr>
              <th>Eintrag</th>
              <th>Art</th>
              <th>Grund</th>
              <th>Seit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {liste?.map((z) => (
              <tr key={z.id}>
                <td>
                  {z.name}
                  {z.firma_name && <span className="muted"> ({z.firma_name})</span>}
                </td>
                <td>{ART_TEXT[z.art]}</td>
                <td>
                  {z.herkunft === 'verworfen' ? `Verworfen: ${z.grund}` : z.grund}
                  {z.gesperrt_bis && <span className="muted"> – gesperrt bis {datum(z.gesperrt_bis)}</span>}
                </td>
                <td>{z.herkunft === 'startbestand' ? 'Startbestand' : datum(z.erstellt_am)}</td>
                <td className="rechts">
                  <button
                    type="button"
                    className="btn klein"
                    onClick={() => entfernen(z)}
                    aria-label={`${z.name} entfernen`}
                  >
                    Entfernen
                  </button>
                </td>
              </tr>
            ))}
            {liste && liste.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  Die Sperrliste ist leer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <form className="aktionen" onSubmit={hinzufuegen} aria-label="Eintrag hinzufügen">
          <input
            type="text"
            className="inl breit"
            placeholder="Firma oder Person"
            aria-label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select className="inl" aria-label="Art" value={art} onChange={(e) => setArt(e.target.value as SperreArt)}>
            <option value="firma">Firma</option>
            <option value="person">Person</option>
          </select>
          <input
            type="text"
            className="inl breit"
            placeholder="Grund"
            aria-label="Grund"
            value={grund}
            onChange={(e) => setGrund(e.target.value)}
          />
          <button type="submit" className="btn p">
            Eintrag hinzufügen
          </button>
        </form>
      </section>
    </>
  );
}
