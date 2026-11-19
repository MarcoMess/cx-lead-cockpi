// Regeln zu Ansprache und Kanal (Konzept, Abschnitt 9 »Kanalwahl«; Ablauf A3). Die Wortzahl zählt die Oberfläche (architektur.md §3).
import type { AnsprechpartnerStatus, AnspracheModus, NachrichtFassung } from '../../gemeinsam/werte';

/** Erstkontakt aus »Freigegeben«, Nachfassen aus »Angeschrieben« (höchstens ein Nachfassen), sonst keine Ansprache. */
export function anspracheModus(status: AnsprechpartnerStatus): AnspracheModus {
  if (status === 'freigegeben') return 'erstkontakt';
  if (status === 'angeschrieben') return 'nachfassen';
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
