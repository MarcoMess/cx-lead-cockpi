import { useState } from 'react';
import { useLocation } from 'react-router';
import { SCREENS } from '../../gemeinsam/screens';
import { api, ApiFehler } from '../api';
import { meldeAenderung } from '../aktualisierung';

export interface VorfuehrZustand {
  heute: string;
  agent: { api_gestoert: boolean; ergebnisdatei_bereit: boolean };
}

/** Vorführleiste wie im Clickdummy – gehört nicht zum Produkt und erscheint nur bei COCKPIT_DEMO=1 (E1-S2, E1-S3). */
export function Vorfuehrleiste({ zustand, neuLaden }: { zustand: VorfuehrZustand; neuLaden: () => Promise<void> }) {
  const ort = useLocation();
  const screen = SCREENS.find((s) => (s.pfad === '/' ? ort.pathname === '/' : ort.pathname.startsWith(s.pfad)));
  const [meldung, setMeldung] = useState('');

  async function ausfuehren(methode: string, pfad: string, body?: unknown) {
    try {
      const r = await api<{ meldung?: string }>(methode, pfad, body);
      setMeldung(r?.meldung ?? '');
    } catch (e) {
      setMeldung(e instanceof ApiFehler ? e.message : 'Die Aktion hat nicht geklappt.');
    }
    await neuLaden();
    meldeAenderung();
  }

  return (
    <div className="vorfuehrleiste" role="region" aria-label="Vorführleiste">
      <div className="zeile">
        <b>Vorführleiste</b>
        <span>gehört nicht zum Produkt</span>
        <span>
          Datum im Dummy: <span data-testid="vorfuehrdatum">{anzeige(zustand.heute)}</span>
        </span>
        <span className="sid" data-testid="vorfuehr-screen">
          Screen {screen?.id ?? '–'}
        </span>
        <button type="button" onClick={() => ausfuehren('POST', '/sim/zuruecksetzen')}>
          Zurücksetzen
        </button>
      </div>
      <div className="zeile">
        <span>Ereignisse:</span>
        <button type="button" onClick={() => ausfuehren('POST', '/sim/datum', { plus_werktage: 1 })}>
          Nächster Werktag
        </button>
        <button type="button" onClick={() => ausfuehren('POST', '/sim/agent/meldung')}>
          Agent meldet sich
        </button>
        <label>
          {/* Ungesteuert, damit der Haken sofort sitzt; der Schlüssel übernimmt den Stand des Servers nach dem Neuladen. */}
          <input
            key={String(zustand.agent.api_gestoert)}
            type="checkbox"
            defaultChecked={zustand.agent.api_gestoert}
            onChange={(e) => void ausfuehren('PUT', '/sim/agent', { api_gestoert: e.target.checked })}
          />
          API für den Agenten gestört
        </label>
        {meldung && (
          <span className="meldung" role="status">
            {meldung}
          </span>
        )}
      </div>
    </div>
  );
}

function anzeige(d: string) {
  const [j, m, t] = d.split('-');
  return `${t}.${m}.${j}`;
}
