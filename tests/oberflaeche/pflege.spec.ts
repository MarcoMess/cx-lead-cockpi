import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test('Pflege #9 unbekannte Adresse zeigt einen Satz statt einer leeren Fläche (Prüfung E1-S0, Befund 4)', async ({
  page,
}) => {
  await anmelden(page, '/gibt-es-nicht');
  await expect(page.getByRole('heading', { name: 'Diese Seite gibt es nicht' })).toBeVisible();
  await page.getByRole('link', { name: 'Zum Dashboard' }).click();
  await expect(page.getByTestId('screen-id')).toHaveText('S1');
});

test('Pflege #10 der Entwicklungsserver liefert Datenbank und .env nicht aus (Prüfung E1-S1, Befund 1)', async ({
  request,
}) => {
  const wurzel = process.cwd();
  for (const datei of ['data/test.sqlite', '.env', '.env.example']) {
    const r = await request.get(`/@fs${wurzel}/${datei}`);
    expect(r.status(), datei).toBe(403);
  }
});
