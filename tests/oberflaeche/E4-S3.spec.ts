import { expect, test, type Page } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

const akte = (page: Page, name: string) => page.getByRole('article', { name: `Kontaktakte ${name}` });

async function oeffne(page: Page, name: string, filter = 'Offene') {
  await anmelden(page, '/kontakte');
  if (filter !== 'Offene') await page.getByLabel('Status').selectOption({ label: filter });
  await page.getByRole('region', { name: 'Kontaktliste' }).getByRole('link', { name }).click();
}

test('E4-S3 #1 #2 #3 Akte Albers: Stammdaten, Anlass, Statusschiene, Verlauf', async ({ page }) => {
  await oeffne(page, 'Dr. Katrin Albers');
  const a = akte(page, 'Dr. Katrin Albers');
  await expect(a).toContainText('Leiterin Customer Service & After-Sales');
  await expect(a.getByRole('link', { name: 'Nordwerk Fördertechnik GmbH' })).toHaveAttribute('href', '/firmen/1');
  await expect(a.getByRole('link', { name: 'linkedin.com/in/katrin-albers-beispiel' })).toHaveAttribute(
    'href',
    'https://linkedin.com/in/katrin-albers-beispiel',
  );
  await expect(a).toContainText('Pressemitteilung: neues Servicezentrum für Ersatzteile in Bremen (04.11.2026)');
  await expect(a.getByRole('link', { name: 'Quelle öffnen' })).toHaveAttribute('href', 'https://example.com/quelle-1');
  await expect(a.locator('.tag.hypothese')).toHaveText('Hypothese');

  const schiene = a.getByRole('list', { name: 'Statusschiene' }).getByRole('listitem');
  await expect(schiene).toHaveText([
    /Neu/,
    /Freigegeben/,
    /Angeschrieben/,
    /Nachgefasst/,
    /Antwort erhalten/,
    /Gespräch vereinbart/,
    /An SAP übergeben/,
  ]);
  await expect(a.locator('[aria-current="step"]')).toHaveText(/Gespräch vereinbart/);

  const verlauf = a.locator('.verlauf > li');
  await expect(verlauf).toHaveCount(2);
  await expect(verlauf.nth(0)).toContainText('Erstkontakt per InMail am 06.11.2026, 08:40 Uhr');
  await expect(verlauf.nth(1)).toContainText('Antwort: Positiv am 09.11.2026');
  await expect(verlauf.nth(1)).toContainText('Nächster Schritt: Kurzes Gespräch am 24.11.2026, 14:00 Uhr');
});

test('E4-S3 #4 #5 Akte Reinhardt: E-Mail-Grundlage, Direkt- und Firmenkontakt getrennt', async ({ page }) => {
  await oeffne(page, 'Tobias Reinhardt');
  const a = akte(page, 'Tobias Reinhardt');
  await expect(a.locator('.verlauf > li').first()).toContainText('Erstkontakt per E-Mail am 12.11.2026, 09:15 Uhr');
  await expect(a.locator('.verlauf > li').first()).toContainText('E-Mail-Grundlage: In HubSpot bekannt');
  const direkt = a.locator('dt', { hasText: 'Direktkontakt' }).locator('xpath=following-sibling::dd[1]');
  await expect(direkt).toContainText('E-Mail t.reinhardt@hansemarkt.example (von Marco eingetragen) – persönlich');
  const firma = a.locator('dt', { hasText: 'Firmenkontakt' }).locator('xpath=following-sibling::dd[1]');
  await expect(firma).toContainText('(allgemein, kein Direktkontakt)');
  await expect(firma).not.toContainText('t.reinhardt');
});

test('E4-S3 #6 #7 Akte Ostermann: Endzustand als Hinweis, Verlauf lesbar, Suchhinweis statt Link', async ({ page }) => {
  await oeffne(page, 'Markus Ostermann', 'Ohne Antwort geschlossen');
  const a = akte(page, 'Markus Ostermann');
  await expect(a.getByRole('note')).toHaveText(
    'Endzustand »Ohne Antwort geschlossen«. Verlauf, Anlässe und Nachrichten bleiben erhalten.',
  );
  await expect(a.getByRole('list', { name: 'Statusschiene' })).toHaveCount(0);
  await expect(a.locator('.verlauf > li')).toContainText(['Erstkontakt per InMail am 19.10.2026, 08:10 Uhr']);
  await expect(a).toContainText('Suchhinweis für den Sales Navigator: Markus Ostermann, Weserland Entsorgung GmbH');
  await expect(a.getByRole('link', { name: /linkedin/ })).toHaveCount(0);
});

test('E4-S3 unbekannter Kontakt zeigt einen Satz, der Filter bleibt beim Öffnen erhalten', async ({ page }) => {
  await anmelden(page, '/kontakte/999');
  await expect(page.getByText('Diesen Kontakt gibt es nicht. Wähle links einen anderen Kontakt.')).toBeVisible();
  await page.goto('/kontakte?status=alle');
  await page.getByRole('region', { name: 'Kontaktliste' }).getByRole('link', { name: 'Jana Wiesner' }).click();
  await expect(page).toHaveURL(/\/kontakte\/6\?status=alle$/);
  await expect(page.getByLabel('Status')).toHaveValue('alle');
});
