import { Link } from 'react-router';

/** Unbekannte Adresse in der Oberfläche – leere Zustände haben immer einen Satz (architektur.md, Abschnitt 9). */
export function NichtGefunden() {
  return (
    <div className="box">
      <h1>Diese Seite gibt es nicht</h1>
      <p className="muted">
        Die Adresse gehört zu keinem Bereich des Cockpits. <Link to="/">Zum Dashboard</Link>
      </p>
    </div>
  );
}
