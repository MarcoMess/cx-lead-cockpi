import { expect, type Page } from '@playwright/test';

export const TEST_PASSWORT = 'test-passwort';

/** Meldet Marco über die Anmeldemaske an und wartet auf das Dashboard. */
export async function anmelden(page: Page, pfad = '/') {
  await page.goto(pfad);
  await page.getByLabel('Passwort').fill(TEST_PASSWORT);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
}
