import { expect, test } from '@playwright/test';

const NAVIGATION = [
  ['Dashboard', 'S1'],
  ['Eingangskorb', 'S2'],
  ['Firmen', 'S3'],
  ['Kontakte', 'S4'],
  ['Ansprache', 'S5'],
  ['Wiedervorlagen', 'S6'],
  ['SAP-Übergabe', 'S7'],
  ['Agent-Steuerung', 'S9'],
  ['Einstellungen', 'S8'],
];

test('E1-S0 #2 Oberfläche ist erreichbar und startet auf dem Dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('screen-id')).toHaveText('S1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');
});

test('E1-S0 #3 Navigation in der Reihenfolge des Clickdummys, jeder Screen zeigt ID und Namen', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('link');
  await expect(links).toHaveCount(9);
  for (let i = 0; i < NAVIGATION.length; i++) {
    const [name, id] = NAVIGATION[i];
    await expect(links.nth(i)).toContainText(name);
    await links.nth(i).click();
    await expect(page.getByTestId('screen-id')).toHaveText(id);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
  }
});
