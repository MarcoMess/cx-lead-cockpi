import { NavLink, Route, Routes } from 'react-router';
import { SCREENS } from '../gemeinsam/screens';
import { Platzhalter } from './screens/Platzhalter';

export function App() {
  return (
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
      </nav>
      <main>
        <Routes>
          {SCREENS.map((s) => (
            <Route key={s.id} path={s.pfad} element={<Platzhalter id={s.id} />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}
