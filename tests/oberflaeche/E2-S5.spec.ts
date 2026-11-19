import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
});

test('E2-S5 #1 #2 Datei hochladen: unlesbar mit Grund, Beispiellauf mit vier Vorschlägen', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const laeufe = page.getByRole('region', { name: 'Läufe' });
  await laeufe.getByLabel('Ergebnisdatei hochladen').setInputFiles('tests/oberflaeche/dateien/kaputt.json');
  await expect(laeufe.getByRole('alert')).toHaveText(
    'Die Datei »kaputt.json« lässt sich nicht lesen: Sie enthält kein gültiges JSON.',
  );
  await laeufe.getByLabel('Ergebnisdatei hochladen').setInputFiles('tests/oberflaeche/dateien/beispiel-lauf.json');
  await expect(page.getByRole('status').filter({ hasText: 'hochgeladen' })).toHaveText(
    'Ergebnisdatei hochgeladen: 4 Vorschläge im Eingangskorb.',
  );
  await expect(page.getByRole('region', { name: 'Lauf vom 19.11.2026' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(4);
  await expect(page.getByRole('article', { name: /Katrin Albers/ }).locator('.tag')).toContainText(['Dublette']);
});

test('E2-S5 #4 gesperrte Firma: Karte »Gesperrt« mit Grund, »Freigeben« deaktiviert', async ({ page, request }) => {
  await request.post('/api/v1/sperrliste', {
    data: { art: 'firma', name: 'Seehotel-Gruppe Bodan AG', grund: 'wird von Kollegen betreut' },
  });
  await anmelden(page, '/eingangskorb');
  await page
    .getByRole('region', { name: 'Läufe' })
    .getByLabel('Ergebnisdatei hochladen')
    .setInputFiles('tests/oberflaeche/dateien/beispiel-lauf.json');
  const ammann = page.getByRole('article', { name: 'Vorschlag Reto Ammann' });
  await expect(ammann.locator('.tag').filter({ hasText: 'Gesperrt' })).toHaveText('Gesperrt');
  await expect(ammann).toContainText(
    'Gesperrt: Die Firma Seehotel-Gruppe Bodan AG steht auf der Sperrliste (wird von Kollegen betreut). Der Vorschlag kann nicht freigegeben werden.',
  );
  await expect(ammann.getByRole('button', { name: 'Freigeben' })).toBeDisabled();
});
