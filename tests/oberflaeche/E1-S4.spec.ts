import { expect, test } from '@playwright/test';
import { ECHT_BASIS } from '../../playwright.config';
import { anmelden } from './hilfen';

// Läuft gegen das Cockpit, das `scripts/echt.mjs` (npm run echt) mit einer eigenen, frischen Datenbank startet.
test.use({ baseURL: ECHT_BASIS });

const heute = () =>
  new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

test('E1-S4 #1 #2 Echtbetrieb: keine Vorführleiste, leerer Eingangskorb, Sperrliste mit fünf Einträgen', async ({
  page,
}) => {
  await anmelden(page, '/eingangskorb');
  await expect(page.getByRole('region', { name: 'Vorführleiste' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Läufe' })).toContainText('Der Agent hat noch keinen Lauf geliefert.');
  await page.goto('/einstellungen');
  await expect(page.getByRole('region', { name: 'Sperrliste' }).locator('tbody tr')).toHaveCount(5);
});

test('E1-S4 #2 Hochladen im Echtbetrieb ergibt einen Lauf mit dem echten Datum', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  await page
    .getByRole('region', { name: 'Läufe' })
    .getByLabel('Ergebnisdatei hochladen')
    .setInputFiles('tests/oberflaeche/dateien/beispiel-lauf.json');
  await expect(page.getByRole('region', { name: `Lauf vom ${heute()}` })).toBeVisible();
});
