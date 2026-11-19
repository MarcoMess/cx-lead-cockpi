import type { ScreenId } from '../../gemeinsam/screens';

/** Kopf jedes Screens mit ID, Namen und Untertitel (Arbeitsregel: jeder Screen zeigt seine ID). */
export function ScreenKopf({ id, titel, untertitel }: { id: ScreenId; titel: string; untertitel?: string }) {
  return (
    <div className="kopf">
      <span className="id" data-testid="screen-id">
        {id}
      </span>
      <h1>{titel}</h1>
      {untertitel && <p>{untertitel}</p>}
    </div>
  );
}
