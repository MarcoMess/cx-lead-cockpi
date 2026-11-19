import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

const liste = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Kontaktliste' });
const zeilen = (page: import('@playwright/test').Page) => liste(page).locator('tbody tr');

test('E4-S2 #1 #4 S4 zeigt mit »Offene« fünf Kontakte mit Funktion, Firma und Status', async ({ page }) => {
  await anmelden(page, '/kontakte');
  await expect(page.getByLabel('Status')).toHaveValue('offene');
  await expect(zeilen(page)).toHaveCount(5);
  for (const name of ['Albers', 'Reinhardt', 'Gruber', 'Bernasconi', 'Hollenstein']) {
    await expect(liste(page)).toContainText(name);
  }
  await expect(liste(page)).not.toContainText('Ostermann');
  await expect(liste(page)).not.toContainText('Wiesner');
  const hollenstein = zeilen(page).filter({ hasText: 'Hollenstein' });
  await expect(hollenstein.locator('.tag')).toHaveText('Antwort erhalten (neutral/später)');
  const albers = zeilen(page).filter({ hasText: 'Albers' });
  await expect(albers.locator('td').nth(1)).not.toBeEmpty();
  await expect(albers.locator('.muted')).not.toBeEmpty();
});

test('E4-S2 #2 #3 #5 Filter »Ohne Antwort geschlossen«, »Alle« und ohne Treffer', async ({ page }) => {
  await anmelden(page, '/kontakte');
  await page.getByLabel('Status').selectOption({ label: 'Ohne Antwort geschlossen' });
  await expect(zeilen(page)).toHaveCount(1);
  await expect(liste(page)).toContainText('Markus Ostermann');
  await page.getByLabel('Status').selectOption({ label: 'Alle' });
  await expect(zeilen(page)).toHaveCount(7);
  await page.getByLabel('Status').selectOption({ label: 'Gesperrt' });
  await expect(zeilen(page)).toHaveText(['Kein Kontakt passt zu diesem Filter.']);
});

test('E4-S2 freigegebener Vorschlag steht danach in der Kontaktliste', async ({ page, request }) => {
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  await request.post('/api/v1/sim/agent/meldung');
  await anmelden(page, '/eingangskorb');
  await page
    .getByRole('article', { name: 'Vorschlag Sabine Kortmann' })
    .getByRole('button', { name: 'Freigeben' })
    .click();
  await expect(page.getByRole('status').filter({ hasText: 'freigegeben' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Hauptnavigation' })
    .getByRole('link', { name: /Kontakte/ })
    .click();
  const k = zeilen(page).filter({ hasText: 'Sabine Kortmann' });
  await expect(k).toContainText('Kranbau Oberhavel GmbH');
  await expect(k.locator('.tag')).toHaveText('Freigegeben');
});
