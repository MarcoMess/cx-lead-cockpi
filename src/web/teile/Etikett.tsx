import type { ReactNode } from 'react';

/** Kleines Etikett wie im Clickdummy. Art: neutral, ok, warn (gelb), fehler (rot), hypothese (violett), aus (grau). */
export function Etikett({
  art = 'neutral',
  children,
}: {
  art?: 'neutral' | 'ok' | 'warn' | 'fehler' | 'hypothese' | 'aus';
  children: ReactNode;
}) {
  return <span className={`tag ${art}`}>{children}</span>;
}
