// Vorführdatum setzen (E1-S2): direkt als Datum oder um eine Zahl von Werktagen weiter.
import type { Uhr } from '../anbindungen/uhr';
import { setzeVorfuehrdatum } from '../anbindungen/uhr';
import type { Datenbank } from '../daten/db';
import { FachFehler } from '../fehler';
import { istDatum, plusWerktage } from '../regeln/fristen';

const HOECHSTENS_WERKTAGE = 30;

export function aendereVorfuehrdatum(
  db: Datenbank,
  uhr: Uhr,
  eingabe: { heute?: unknown; plus_werktage?: unknown },
): string {
  let neu: string;
  if (eingabe.heute !== undefined) {
    if (!istDatum(eingabe.heute)) {
      throw new FachFehler(400, 'datum_ungueltig', 'Bitte ein gültiges Datum im Format JJJJ-MM-TT angeben.', 'heute');
    }
    neu = eingabe.heute;
  } else {
    const n = eingabe.plus_werktage;
    if (!Number.isInteger(n) || (n as number) < 1 || (n as number) > HOECHSTENS_WERKTAGE) {
      throw new FachFehler(
        400,
        'datum_ungueltig',
        `Bitte »heute« oder »plus_werktage« (ganze Zahl von 1 bis ${HOECHSTENS_WERKTAGE}) angeben.`,
        'plus_werktage',
      );
    }
    neu = plusWerktage(uhr.heute(), n as number);
    if (!istDatum(neu)) throw new FachFehler(400, 'datum_ungueltig', 'Das neue Datum liegt außerhalb des Kalenders.');
  }
  setzeVorfuehrdatum(db, neu);
  return neu;
}
