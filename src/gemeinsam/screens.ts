// Die neun Screens aus Abschnitt 7 des Konzepts, in der Reihenfolge der Navigation im Clickdummy.
export const SCREENS = [
  { id: 'S1', name: 'Dashboard', pfad: '/' },
  { id: 'S2', name: 'Eingangskorb', pfad: '/eingangskorb' },
  { id: 'S3', name: 'Firmen', pfad: '/firmen' },
  { id: 'S4', name: 'Kontakte', pfad: '/kontakte' },
  { id: 'S5', name: 'Ansprache', pfad: '/ansprache' },
  { id: 'S6', name: 'Wiedervorlagen', pfad: '/wiedervorlagen' },
  { id: 'S7', name: 'SAP-Übergabe', pfad: '/sap-uebergabe' },
  { id: 'S9', name: 'Agent-Steuerung', pfad: '/agent-steuerung' },
  { id: 'S8', name: 'Einstellungen', pfad: '/einstellungen' },
] as const;
export type ScreenId = (typeof SCREENS)[number]['id'];
