import type { AnsprechpartnerStatus } from '../../gemeinsam/werte';
import { statusText } from '../../gemeinsam/texte';
import { Etikett } from './Etikett';

const ABGESCHLOSSEN: AnsprechpartnerStatus[] = ['kein_interesse', 'ohne_antwort_geschlossen', 'gesperrt'];

/** Status eines Ansprechpartners als Etikett, Farben wie im Clickdummy. */
export function StatusEtikett({ status, antwortArt }: { status: AnsprechpartnerStatus; antwortArt?: string | null }) {
  const art =
    status === 'gespraech_vereinbart' || status === 'an_sap_uebergeben'
      ? 'ok'
      : status === 'antwort_erhalten'
        ? 'hypothese'
        : ABGESCHLOSSEN.includes(status)
          ? 'aus'
          : status === 'freigegeben'
            ? 'warn'
            : 'neutral';
  return <Etikett art={art}>{statusText(status, antwortArt)}</Etikett>;
}
