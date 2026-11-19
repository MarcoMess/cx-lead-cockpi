import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  await request.post('/api/v1/sim/agent/meldung');
});

test('E3-S4 #1 #2 #5 Ammann verwerfen: Gründe, Sperrliste, Karte »Verworfen«', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const karte = page.getByRole('article', { name: 'Vorschlag Reto Ammann' });
  await karte.getByRole('button', { name: 'Verwerfen', exact: true }).click();
  const gruppe = karte.getByRole('group', { name: 'Verwerfen' });
  await expect(gruppe.getByLabel('Grund').locator('option')).toHaveText([
    'passt nicht ins Zielbild',
    'Kontakt nicht belegt',
    'bereits bekannt',
    'Anlass zu schwach',
    'wird von Kollegen betreut',
  ]);
  await gruppe.getByLabel('Grund').selectOption('passt nicht ins Zielbild');
  await gruppe.getByRole('button', { name: 'Verwerfen bestätigen' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'verworfen' })).toHaveText(
    'Reto Ammann verworfen (passt nicht ins Zielbild). Die Firma Seehotel-Gruppe Bodan AG ist für den Agenten gesperrt.',
  );
  await expect(karte.locator('.tag').filter({ hasText: 'Verworfen' })).toHaveText(
    'Verworfen: passt nicht ins Zielbild',
  );
  await expect(karte.getByRole('button', { name: 'Freigeben' })).toHaveCount(0);

  await page
    .getByRole('navigation', { name: 'Hauptnavigation' })
    .getByRole('link', { name: /Einstellungen/ })
    .click();
  const zeile = page.getByRole('region', { name: 'Sperrliste' }).locator('tbody tr').filter({ hasText: 'Seehotel' });
  await expect(zeile.locator('td')).toHaveText([
    'Seehotel-Gruppe Bodan AG',
    'Firma',
    'Verworfen: passt nicht ins Zielbild',
    '19.11.2026',
    'Entfernen',
  ]);
});

test('E3-S4 #4 Kortmann »Anlass zu schwach«: Person bis 19.05.2027 gesperrt', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const karte = page.getByRole('article', { name: 'Vorschlag Sabine Kortmann' });
  await karte.getByRole('button', { name: 'Verwerfen', exact: true }).click();
  await karte.getByLabel('Grund').selectOption('Anlass zu schwach');
  await karte.getByRole('button', { name: 'Verwerfen bestätigen' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'verworfen' })).toHaveText(
    'Sabine Kortmann verworfen (Anlass zu schwach). Sabine Kortmann ist bis 19.05.2027 für den Agenten gesperrt.',
  );
  await page.goto('/einstellungen');
  const zeile = page.getByRole('region', { name: 'Sperrliste' }).locator('tbody tr').filter({ hasText: 'Kortmann' });
  await expect(zeile.locator('td')).toHaveText([
    'Sabine Kortmann (Kranbau Oberhavel GmbH)',
    'Person',
    'Verworfen: Anlass zu schwach – gesperrt bis 19.05.2027',
    '19.11.2026',
    'Entfernen',
  ]);
});

test('Prüfung E3-S4 Runde 2: schon gesperrte Person – die Rückmeldung nennt den vorhandenen Eintrag', async ({
  page,
  request,
}) => {
  await request.post('/api/v1/sperrliste', { data: { art: 'person', name: 'Sabine Kortmann' } });
  await anmelden(page, '/eingangskorb');
  const karte = page.getByRole('article', { name: 'Vorschlag Sabine Kortmann' });
  await karte.getByRole('button', { name: 'Verwerfen', exact: true }).click();
  const gruppe = karte.getByRole('group', { name: 'Verwerfen' });
  await gruppe.getByLabel('Grund').selectOption('Anlass zu schwach');
  await gruppe.getByRole('button', { name: 'Verwerfen bestätigen' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'verworfen' })).toHaveText(
    'Sabine Kortmann verworfen (Anlass zu schwach). Sabine Kortmann war schon auf der Sperrliste.',
  );
});
