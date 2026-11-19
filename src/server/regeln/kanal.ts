// Regeln zu Ansprache und Kanal (Konzept, Abschnitt 9 »Kanalwahl«; Ablauf A3). Die Wortzahl zählt die Oberfläche (architektur.md §3).
import type { AnsprechpartnerStatus, AnspracheModus, NachrichtFassung } from '../../gemeinsam/werte';
import { erlaubteAktionen } from './status';

/** Erstkontakt, wenn »ansprechen« erlaubt ist, Nachfassen, wenn »nachfassen« erlaubt ist, sonst keine (eine Quelle: status.ts). */
export function anspracheModus(status: AnsprechpartnerStatus): AnspracheModus {
  const erlaubt = erlaubteAktionen(status, null);
  if (erlaubt.includes('ansprechen')) return 'erstkontakt';
  if (erlaubt.includes('nachfassen')) return 'nachfassen';
  return 'keine';
}

/** Hat Marco Betreff oder Text gegenüber der Fassung des Agenten geändert, gilt sie als »von Marco geändert«. */
export function fassungNachVersand(
  agent: { betreff: string | null; text: string },
  gesendet: { betreff: string | null; text: string },
): NachrichtFassung {
  const gleich = (a: string | null, b: string | null) => (a ?? '').trim() === (b ?? '').trim();
  return gleich(agent.betreff, gesendet.betreff) && gleich(agent.text, gesendet.text) ? 'agent' : 'von_marco_geaendert';
}
