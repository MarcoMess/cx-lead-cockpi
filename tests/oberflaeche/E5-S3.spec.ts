import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
});

test('E5-S3 #1 #2 #3 #4 Gruber: Vernetzungsanfrage markieren, danach Kontaktakte mit neuem Eintrag', async ({
  page,
}) => {
  await anmelden(page, '/ansprache/3');
  const auswahl = page.getByLabel('Gesendet als');
  await expect(auswahl.locator('option')).toHaveText(['InMail', 'Vernetzungsanfrage mit Notiz', 'LinkedIn-Nachricht']);
  await auswahl.selectOption({ label: 'Vernetzungsanfrage mit Notiz' });
  await page.getByRole('button', { name: 'Als gesendet markieren' }).click();

  await expect(page).toHaveURL(/\/kontakte\/3$/);
  await expect(page.getByRole('status').filter({ hasText: 'Versand protokolliert' })).toHaveText(
    'Versand protokolliert: Erstkontakt per Vernetzungsanfrage mit Notiz. Status »Angeschrieben«, Wiedervorlage »Nachfassen, keine Antwort« am 30.11.2026.',
  );
  const akte = page.getByRole('article', { name: 'Kontaktakte Simone Gruber' });
  await expect(akte.locator('.tag').first()).toHaveText('Angeschrieben');
  const eintrag = akte.locator('.verlauf > li');
  await expect(eintrag).toHaveCount(1);
  await expect(eintrag).toContainText(/Erstkontakt per Vernetzungsanfrage mit Notiz am 19\.11\.2026, \d{2}:\d{2} Uhr/);
  await expect(eintrag).toContainText('Betreff: Kundenportal Netzanschlüsse 2027');
  await expect(eintrag).toContainText('Hallo Frau Gruber, im Geschäftsbericht');
});

test('E5-S3 #6 leere Nachricht: das Cockpit verweigert mit Hinweis, der Status bleibt', async ({ page, request }) => {
  await anmelden(page, '/ansprache/3');
  await page.getByRole('textbox', { name: 'Nachricht' }).fill('');
  await page.getByRole('button', { name: 'Als gesendet markieren' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Die Nachricht ist leer. Schreib oder füge den gesendeten Text ein, bevor du markierst.',
  );
  await expect(page).toHaveURL(/\/ansprache\/3$/);
  expect((await (await request.get('/api/v1/kontakte/3')).json()).status).toBe('freigegeben');
});

test('E5-S3 #5 Kopieren und Profil öffnen ändern den Status nicht – nur das Markieren', async ({ page, request }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.context().route(/linkedin\.com/, (r) => r.fulfill({ status: 200, body: 'Profil (Test)' }));
  await anmelden(page, '/ansprache/3');
  await page.getByRole('button', { name: 'Betreff kopieren' }).click();
  await page.getByRole('button', { name: 'Nachricht kopieren' }).click();
  const [fenster] = await Promise.all([
    page.context().waitForEvent('page'),
    page.getByRole('link', { name: 'Profil öffnen' }).click(),
  ]);
  await fenster.close();
  expect((await (await request.get('/api/v1/kontakte/3')).json()).status).toBe('freigegeben');
  await page.getByRole('button', { name: 'Als gesendet markieren' }).click();
  await expect(page).toHaveURL(/\/kontakte\/3$/);
  expect((await (await request.get('/api/v1/kontakte/3')).json()).status).toBe('angeschrieben');
  await page
    .getByRole('navigation', { name: 'Hauptnavigation' })
    .getByRole('link', { name: /Ansprache/ })
    .click();
  await expect(page.getByRole('region', { name: 'Erstkontakt offen' })).toContainText('Niemand in dieser Liste.');
  await expect(page.getByRole('region', { name: 'Angeschrieben, Nachfassen möglich' })).toContainText('Simone Gruber');
});
