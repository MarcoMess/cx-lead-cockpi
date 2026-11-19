import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test('E1-S1 #1 ohne Anmeldung erscheint die Anmeldung und keine Daten', async ({ page }) => {
  for (const pfad of ['/', '/firmen', '/kontakte', '/einstellungen']) {
    await page.goto(pfad);
    await expect(page.getByRole('form', { name: 'Anmeldung' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toHaveCount(0);
    await expect(page.getByTestId('screen-id')).toHaveCount(0);
  }
});

test('E1-S1 #2 nach der Anmeldung Dashboard S1 und neun Bereiche in der Navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Passwort').fill('falsch');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByRole('alert')).toHaveText('Das Passwort stimmt nicht.');

  await anmelden(page);
  await expect(page.getByTestId('screen-id')).toHaveText('S1');
  const links = page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('link');
  await expect(links).toHaveText([
    /Dashboard/,
    /Eingangskorb/,
    /Firmen/,
    /Kontakte/,
    /Ansprache/,
    /Wiedervorlagen/,
    /SAP-Übergabe/,
    /Agent-Steuerung/,
    /Einstellungen/,
  ]);

  await page.reload();
  await expect(page.getByTestId('screen-id')).toHaveText('S1');

  await page.getByRole('button', { name: 'Abmelden' }).click();
  await expect(page.getByRole('form', { name: 'Anmeldung' })).toBeVisible();
});
