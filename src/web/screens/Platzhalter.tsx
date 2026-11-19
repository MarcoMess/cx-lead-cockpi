import { SCREENS, type ScreenId } from '../../gemeinsam/screens';
import { ScreenKopf } from '../teile/ScreenKopf';

/** Leerer Screen aus dem Grundgerüst; die Inhalte bauen die jeweiligen Stories. */
export function Platzhalter({ id }: { id: ScreenId }) {
  const s = SCREENS.find((x) => x.id === id)!;
  return (
    <>
      <ScreenKopf id={id} titel={s.name} />
      <div className="box">
        <p className="muted">Dieser Bereich wird in einer der nächsten Stories gebaut.</p>
      </div>
    </>
  );
}
