import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  // Ausgangszustand über die Vorführ-Adresse (verlangt eine Anmeldung).
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

test('E1-S2 #4 Vorführleiste mit Datum, Screen-ID, Nächster Werktag und Zurücksetzen', async ({ page }) => {
  await anmelden(page);
  const leiste = page.getByRole('region', { name: 'Vorführleiste' });
  await expect(leiste).toBeVisible();
  await expect(leiste).toContainText('gehört nicht zum Produkt');
  await expect(page.getByTestId('vorfuehrdatum')).toHaveText('18.11.2026');
  await expect(page.getByTestId('vorfuehr-screen')).toHaveText('Screen S1');

  await page.getByRole('link', { name: /Firmen/ }).click();
  await expect(page.getByTestId('vorfuehr-screen')).toHaveText('Screen S3');
  await page.getByRole('link', { name: /Agent-Steuerung/ }).click();
  await expect(page.getByTestId('vorfuehr-screen')).toHaveText('Screen S9');

  await leiste.getByRole('button', { name: 'Nächster Werktag' }).click();
  await expect(page.getByTestId('vorfuehrdatum')).toHaveText('19.11.2026');
  await leiste.getByRole('button', { name: 'Nächster Werktag' }).click();
  await leiste.getByRole('button', { name: 'Nächster Werktag' }).click();
  await expect(page.getByTestId('vorfuehrdatum')).toHaveText('23.11.2026');

  await leiste.getByRole('button', { name: 'Zurücksetzen' }).click();
  await expect(page.getByTestId('vorfuehrdatum')).toHaveText('18.11.2026');
});

test('E1-S2 #5 ohne Vorführ-Adressen erscheint keine Vorführleiste', async ({ page }) => {
  // Der Testserver läuft mit COCKPIT_DEMO=1; hier antwortet die Adresse so wie ohne Vorführmodus.
  await page.route('**/api/v1/sim/zustand', (route) =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: '{"fehler":{"code":"nicht_gefunden","meldung":"-"}}',
    }),
  );
  await anmelden(page);
  await expect(page.getByTestId('screen-id')).toHaveText('S1');
  await expect(page.getByRole('region', { name: 'Vorführleiste' })).toHaveCount(0);
});
