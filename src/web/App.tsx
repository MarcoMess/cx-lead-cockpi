import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router';
import { SCREENS } from '../gemeinsam/screens';
import { api } from './api';
import { Anmeldung } from './screens/Anmeldung';
import { Platzhalter } from './screens/Platzhalter';
import { NichtGefunden } from './screens/NichtGefunden';
import { S2Eingangskorb } from './screens/S2Eingangskorb';
import type { ScreenId } from '../gemeinsam/screens';
import { Vorfuehrleiste, type VorfuehrZustand } from './teile/Vorfuehrleiste';

type Zustand = 'pruefe' | 'abgemeldet' | 'angemeldet';

export function App() {
  const [zustand, setZustand] = useState<Zustand>('pruefe');
  const [vorfuehrung, setVorfuehrung] = useState<VorfuehrZustand | null>(null);

  useEffect(() => {
    api('GET', '/ich').then(
      () => setZustand('angemeldet'),
      () => setZustand('abgemeldet'),
    );
  }, []);

  // Die Vorführleiste gibt es nur, wenn der Server die Vorführ-Adressen anbietet (COCKPIT_DEMO=1).
  const ladeVorfuehrung = () =>
    api<VorfuehrZustand>('GET', '/sim/zustand').then(
      (z) => setVorfuehrung(z),
      () => setVorfuehrung(null),
    );

  useEffect(() => {
    if (zustand === 'angemeldet') void ladeVorfuehrung();
  }, [zustand]);

  async function abmelden() {
    await api('POST', '/abmeldung').catch(() => undefined);
    setZustand('abgemeldet');
  }

  if (zustand === 'pruefe') return null;
  if (zustand === 'abgemeldet') return <Anmeldung angemeldet={() => setZustand('angemeldet')} />;

  return (
    <>
      {vorfuehrung && <Vorfuehrleiste zustand={vorfuehrung} neuLaden={ladeVorfuehrung} />}
      <div className="shell">
        <nav className="nav" aria-label="Hauptnavigation">
          <div className="marke">
            CX Lead Cockpit<span>Nagarro Customer Experience</span>
          </div>
          {SCREENS.map((s) => (
            <NavLink key={s.id} to={s.pfad} end={s.pfad === '/'}>
              <span>{s.name}</span>
              <small>{s.id}</small>
            </NavLink>
          ))}
          <button className="abmelden" type="button" onClick={abmelden}>
            Abmelden
          </button>
        </nav>
        <main>
          <Routes>
            {SCREENS.map((s) => (
              <Route key={s.id} path={s.pfad} element={screenFuer(s.id)} />
            ))}
            <Route path="/eingangskorb/:laufId" element={<S2Eingangskorb />} />
            <Route path="*" element={<NichtGefunden />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

/** Gebaute Screens; alle übrigen zeigen bis zu ihrer Story den Platzhalter. */
function screenFuer(id: ScreenId) {
  switch (id) {
    case 'S2':
      return <S2Eingangskorb />;
    default:
      return <Platzhalter id={id} />;
  }
}
