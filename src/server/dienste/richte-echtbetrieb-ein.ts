// Anwendungsfall »Echtbetrieb einrichten« (Story E1-S4): legt den Grundbestand nur in einer leeren Datenbank an.
import { transaktion, type Datenbank } from '../daten/db';
import { istEingerichtet, ladeGrundbestand } from '../daten/startdaten';
import { setzeAgentSchluessel } from './zugang';

export function richteEchtbetriebEin(db: Datenbank, heute: string, agentSchluessel?: string): { neu: boolean } {
  return transaktion(db, () => {
    if (istEingerichtet(db)) return { neu: false };
    ladeGrundbestand(db, heute);
    if (agentSchluessel) setzeAgentSchluessel(db, agentSchluessel);
    return { neu: true };
  });
}
