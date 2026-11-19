import { useState, type FormEvent } from 'react';
import { api, ApiFehler } from '../api';

/** Anmeldung mit dem Passwort aus .env (E1-S1). Ohne Anmeldung zeigt das Cockpit keine Daten. */
export function Anmeldung({ angemeldet }: { angemeldet: () => void }) {
  const [passwort, setPasswort] = useState('');
  const [fehler, setFehler] = useState('');

  async function absenden(e: FormEvent) {
    e.preventDefault();
    setFehler('');
    try {
      await api('POST', '/anmeldung', { passwort });
      angemeldet();
    } catch (err) {
      setFehler(err instanceof ApiFehler ? err.message : 'Die Anmeldung hat nicht geklappt.');
    }
  }

  return (
    <div className="anmeldung">
      <form className="box" onSubmit={absenden} aria-label="Anmeldung">
        <h1>CX Lead Cockpit</h1>
        <p className="muted">Melde dich mit deinem Passwort an.</p>
        <label className="feld">
          <span>Passwort</span>
          <input type="password" value={passwort} onChange={(e) => setPasswort(e.target.value)} autoFocus />
        </label>
        {fehler && (
          <p className="hinweis fehler" role="alert">
            {fehler}
          </p>
        )}
        <button className="btn p" type="submit">
          Anmelden
        </button>
      </form>
    </div>
  );
}
