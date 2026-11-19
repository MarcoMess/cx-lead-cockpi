import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  await request.post('/api/v1/sim/agent/meldung');
});

test('E3-S2 #1 Kortmann: alle Angaben mit Herkunft, Hypothese mit Etikett', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const karte = page.getByRole('article', { name: 'Vorschlag Sabine Kortmann' });
  await karte.getByRole('button', { name: 'Angaben und Quellen prüfen' }).click();
  const angaben = karte.locator('dl.angaben');
  await expect(angaben.locator('dt')).toHaveText([
    'Umsatzquelle',
    'Funktion belegt durch',
    'LinkedIn-Profil',
    'Berufliche E-Mail',
    'Relevanzhypothese',
    'Gesprächsziel',
    'Betreff',
    'LinkedIn-Nachricht',
  ]);
  await expect(angaben.getByRole('link', { name: 'example.com' }).first()).toHaveAttribute(
    'href',
    'https://example.com/geschaeftsbericht-kranbau-oberhavel',
  );
  await expect(angaben).toContainText('Bezugsjahr 2025');
  await expect(angaben.locator('dd').nth(1).getByRole('link')).toHaveAttribute(
    'href',
    'https://example.com/team-sabine-kortmann',
  );
  await expect(angaben.locator('dd').nth(4).locator('.tag.hypothese')).toHaveText('Hypothese');
  for (const i of [0, 1, 2, 4, 5, 6, 7]) await expect(angaben.locator('dd').nth(i)).toContainText('(Agent)');
  await expect(karte.getByRole('button', { name: 'Freigeben' })).toBeEnabled();
});

test('E3-S2 #2 #5 Ammann: Profil nicht belegt mit Suchhinweis, Wechselkurs mit Quelle, freigebbar', async ({
  page,
}) => {
  await anmelden(page, '/eingangskorb');
  const karte = page.getByRole('article', { name: 'Vorschlag Reto Ammann' });
  await expect(karte).toContainText('88 Mio. CHF, 2025, Konzern (rund 93 Mio. EUR, Beispielkurs 1,06)');
  await karte.getByRole('button', { name: 'Angaben und Quellen prüfen' }).click();
  const angaben = karte.locator('dl.angaben');
  const profil = angaben.locator('dt', { hasText: 'LinkedIn-Profil' }).locator('xpath=following-sibling::dd[1]');
  await expect(profil).toHaveText('nicht belegt Suchhinweis: Reto Ammann, Seehotel-Gruppe Bodan AG');
  const kurs = angaben.locator('dt', { hasText: 'Wechselkurs' }).locator('xpath=following-sibling::dd[1]');
  await expect(kurs).toContainText('1,06');
  await expect(kurs.getByRole('link')).toHaveAttribute('href', 'https://example.com/wechselkurs-chf-eur');
  await expect(karte.getByRole('button', { name: 'Freigeben' })).toBeEnabled();
});

test('E3-S2 #3 #7 fehlende Pflichtangaben sperren »Freigeben« mit Hinweis (Albers ohne Nachricht)', async ({
  page,
}) => {
  await anmelden(page, '/eingangskorb');
  const karte = page.getByRole('article', { name: /Vorschlag .*Katrin Albers/ });
  await expect(karte.getByRole('note', { name: 'Fehlende Pflichtangaben' })).toHaveText(
    'Freigeben ist gesperrt: Betreff fehlt; Nachricht fehlt.',
  );
  await expect(karte.getByRole('button', { name: 'Freigeben' })).toBeDisabled();
});

test('E3-S2 #4 nur fehlende Pflichtangaben (keine Dublette) sperren »Freigeben«', async ({ page, request }) => {
  await request.post('/api/v1/sim/zuruecksetzen');
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  const v = {
    firma: {
      name: 'Beispiel Antriebe GmbH',
      branche: 'Maschinenbau',
      land: 'DE',
      umsatz_wert: 40,
      umsatz_waehrung: 'EUR',
      umsatz_jahr: 2025,
      umsatz_bezug: 'konzern',
      umsatz_quelle_url: 'https://example.com/bericht',
    },
    person: {
      anrede: 'Frau',
      vorname: 'Erika',
      nachname: 'Beispiel',
      funktion: 'Leiterin Service',
      rolle: 'Service',
      quelle_url: 'https://example.com/team',
    },
    anlass: { typ: 'unternehmensanlass', beschreibung: 'Neues Werk', ereignis_datum: '2026-11-01' },
    nachricht: { betreff: 'Neues Werk', text: 'Hallo Frau Beispiel' },
  };
  const r = await request.post('/api/v1/agent/laeufe', {
    headers: { authorization: 'Bearer test-agent-schluessel' },
    data: { vorschlaege: [v] },
  });
  expect(r.status()).toBe(201);
  await anmelden(page, '/eingangskorb');
  const karte = page.getByRole('article', { name: 'Vorschlag Erika Beispiel' });
  await expect(karte.getByRole('note', { name: 'Fehlende Pflichtangaben' })).toHaveText(
    'Freigeben ist gesperrt: unter Mindestumsatz (40 Mio. EUR, mindestens 50 Mio. EUR).',
  );
  await expect(karte.locator('.tag').filter({ hasText: 'Dublette' })).toHaveCount(0);
  await expect(karte.getByRole('button', { name: 'Freigeben' })).toBeDisabled();
});
