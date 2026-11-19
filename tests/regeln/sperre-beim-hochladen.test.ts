// Regel »Hochladen der Ergebnisdatei (1.3)«: Sperrliste beim Hochladen (Konzept Abschnitt 9, Story E2-S5).
import { describe, expect, it } from 'vitest';
import type { VorschlagDaten } from '../../src/gemeinsam/lauf';
import { firmaGesperrt, personenSchluessel, sperreFuer, type Sperre } from '../../src/server/regeln/ausschluss';

const vorschlag = (firma: string, vorname: string, nachname: string) =>
  ({ firma: { name: firma }, person: { vorname, nachname } }) as VorschlagDaten;
const firma = (name: string): Sperre => ({
  art: 'firma',
  name,
  firma_name: null,
  grund: 'Startbestand',
  gesperrt_bis: null,
});
const person = (name: string, firma_name: string | null, gesperrt_bis: string | null): Sperre => ({
  art: 'person',
  name,
  firma_name,
  grund: 'Anlass zu schwach',
  gesperrt_bis,
});

describe('Sperrliste beim Hochladen', () => {
  it('Firmeneintrag trifft gleichen Namen ohne Rechtsform und Namen, die mit dem Eintrag beginnen', () => {
    expect(firmaGesperrt('Seehotel-Gruppe Bodan AG', 'Seehotel-Gruppe Bodan')).toBe(true);
    expect(firmaGesperrt('HORNBACH', 'HORNBACH Baumarkt AG')).toBe(true);
    expect(firmaGesperrt('BOBST', 'Bobst Group SA')).toBe(true);
    expect(firmaGesperrt('Energie Steiermark', 'Energie Steiermark AG')).toBe(true);
    expect(firmaGesperrt('Horn', 'Hornbach Baumarkt AG')).toBe(false);
    expect(firmaGesperrt('HORNBACH Baumarkt AG', 'HORNBACH Holding AG & Co. KGaA')).toBe(false);
  });

  it('Personeneintrag ohne Anrede und Titel, auch bei zerlegten Umlauten', () => {
    expect(personenSchluessel('Dr. Katrin Albers')).toBe('katrin albers');
    expect(personenSchluessel('Herr Reto Ammann')).toBe('reto ammann');
    expect(personenSchluessel('Frau Prof. Dr.-Ing. Jana Weiß')).toBe('jana weiß');
    expect(personenSchluessel('Jürgen Müller'.normalize('NFD'))).toBe('jürgen müller');
    expect(personenSchluessel('Dr Müller')).toBe('dr müller');
  });

  it('sperreFuer: Firma ohne Ablauf, Person bis einschließlich »gesperrt bis« und nur bei passender Firma', () => {
    const sperren = [firma('HORNBACH'), person('Herr Reto Ammann', 'Seehotel-Gruppe Bodan AG', '2027-05-19')];
    expect(sperreFuer(vorschlag('HORNBACH Baumarkt AG', 'Lea', 'Berg'), sperren, '2026-11-19')?.art).toBe('firma');
    const ammann = vorschlag('Seehotel-Gruppe Bodan AG', 'Reto', 'Ammann');
    expect(sperreFuer(ammann, sperren, '2027-05-19')?.art).toBe('person');
    expect(sperreFuer(ammann, sperren, '2027-05-20')).toBeNull();
    expect(sperreFuer(vorschlag('Andere AG', 'Reto', 'Ammann'), sperren, '2026-11-19')).toBeNull();
    expect(sperreFuer(vorschlag('Kranbau Oberhavel GmbH', 'Sabine', 'Kortmann'), sperren, '2026-11-19')).toBeNull();
  });
});
