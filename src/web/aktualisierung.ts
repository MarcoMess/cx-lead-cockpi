// Signal »Daten haben sich geändert« (z. B. nach Zurücksetzen oder neuem Vorführdatum).
// Screens nehmen den Zähler in die Abhängigkeiten ihres Ladens auf und laden dann neu.
import { useEffect, useState } from 'react';

const EREIGNIS = 'cockpit-aktualisieren';

export function meldeAenderung(): void {
  window.dispatchEvent(new Event(EREIGNIS));
}

export function useAktualisierung(): number {
  const [stand, setStand] = useState(0);
  useEffect(() => {
    const neu = () => setStand((n) => n + 1);
    window.addEventListener(EREIGNIS, neu);
    return () => window.removeEventListener(EREIGNIS, neu);
  }, []);
  return stand;
}
