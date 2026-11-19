// Zeitliche Ordnung des Verlaufs einer Kontaktakte (Story E4-S3).
import type { VerlaufEintrag } from '../../gemeinsam/kontakte';

/** Sortierschlüssel: Kontaktversuche nach Zeitpunkt; eine Antwort zählt ans Ende ihres Tages. */
const schluessel = (e: VerlaufEintrag) => (e.art === 'kontaktversuch' ? e.zeitpunkt : `${e.datum} 99:99`);

export function ordneVerlauf(eintraege: VerlaufEintrag[]): VerlaufEintrag[] {
  return [...eintraege].sort((a, b) => (schluessel(a) < schluessel(b) ? -1 : schluessel(a) > schluessel(b) ? 1 : 0));
}
