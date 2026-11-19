import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

const zeilen = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: 'Sperrliste' }).locator('tbody tr');

test('E10-S1 #1 #5 Startbestand mit Art, Grund und Datum', async ({ page }) => {
  await anmelden(page, '/einstellungen');
  await expect(zeilen(page)).toHaveCount(5);
  await expect(zeilen(page).first()).toContainText('Windmöller & Hölscher');
  await expect(zeilen(page).first().locator('td')).toHaveText([
    'Windmöller & Hölscher',
    'Firma',
    'In früherer Ausgabe genannt',
    'Startbestand',
    'Entfernen',
  ]);
});

test('E10-S1 #2 #3 #4 hinzufügen, leeren Namen verweigern, entfernen', async ({ page, request }) => {
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-24' } });
  await anmelden(page, '/einstellungen');
  const form = page.getByRole('form', { name: 'Eintrag hinzufügen' });
  await form.getByRole('button', { name: 'Eintrag hinzufügen' }).click();
  await expect(page.getByRole('alert')).toHaveText('Gib den Namen der Firma oder Person ein.');
  await expect(zeilen(page)).toHaveCount(5);

  await form.getByLabel('Name').fill('Erika Beispiel');
  await form.getByLabel('Art').selectOption('person');
  await form.getByLabel('Grund').fill('Wird von Kollegen betreut');
  await form.getByRole('button', { name: 'Eintrag hinzufügen' }).click();
  await expect(page.getByRole('status')).toHaveText('»Erika Beispiel« steht jetzt auf der Sperrliste.');
  await expect(zeilen(page).last().locator('td')).toHaveText([
    'Erika Beispiel',
    'Person',
    'Wird von Kollegen betreut',
    '24.11.2026',
    'Entfernen',
  ]);

  await page.getByRole('button', { name: 'HORNBACH entfernen' }).click();
  await expect(page.getByRole('status')).toHaveText('»HORNBACH« steht nicht mehr auf der Sperrliste.');
  await expect(zeilen(page).filter({ hasText: 'HORNBACH' })).toHaveCount(0);
  await page.reload();
  await expect(zeilen(page)).toHaveCount(5);
  await expect(zeilen(page).filter({ hasText: 'HORNBACH' })).toHaveCount(0);
  await expect(zeilen(page).filter({ hasText: 'Erika Beispiel' })).toHaveCount(1);
});
