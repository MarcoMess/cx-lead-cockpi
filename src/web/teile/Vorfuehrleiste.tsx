import { useLocation } from 'react-router';
import { SCREENS } from '../../gemeinsam/screens';
import { api } from '../api';
import { meldeAenderung } from '../aktualisierung';

/** Vorführleiste wie im Clickdummy – gehört nicht zum Produkt und erscheint nur bei COCKPIT_DEMO=1 (E1-S2). */
export function Vorfuehrleiste({ heute, setHeute }: { heute: string; setHeute: (d: string) => void }) {
  const ort = useLocation();
  const screen = SCREENS.find((s) => (s.pfad === '/' ? ort.pathname === '/' : ort.pathname.startsWith(s.pfad)));

  async function ausfuehren(pfad: string, body?: unknown) {
    const r = await api<{ heute: string }>('POST', pfad, body);
    setHeute(r.heute);
    meldeAenderung();
  }

  return (
    <div className="vorfuehrleiste" role="region" aria-label="Vorführleiste">
      <b>Vorführleiste</b>
      <span>gehört nicht zum Produkt</span>
      <span>
        Datum im Dummy: <span data-testid="vorfuehrdatum">{anzeige(heute)}</span>
      </span>
      <button type="button" onClick={() => ausfuehren('/sim/datum', { plus_werktage: 1 })}>
        Nächster Werktag
      </button>
      <span className="sid" data-testid="vorfuehr-screen">
        Screen {screen?.id ?? '–'}
      </span>
      <button type="button" onClick={() => ausfuehren('/sim/zuruecksetzen')}>
        Zurücksetzen
      </button>
    </div>
  );
}

function anzeige(d: string) {
  const [j, m, t] = d.split('-');
  return `${t}.${m}.${j}`;
}
