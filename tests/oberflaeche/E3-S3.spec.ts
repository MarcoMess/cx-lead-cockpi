import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  await request.post('/api/v1/sim/agent/meldung');
});

test('E3-S3 #1 #4 Freigeben im Eingangskorb: Rückmeldung, Etikett, Zähler', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const kortmann = page.getByRole('article', { name: 'Vorschlag Sabine Kortmann' });
  await kortmann.getByRole('button', { name: 'Freigeben' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'freigegeben' })).toHaveText(
    'Sabine Kortmann freigegeben. Firma und Ansprechpartner sind angelegt, der Kontakt steht in der Ansprache.',
  );
  await expect(kortmann).toContainText('Freigegeben');
  await expect(kortmann.getByRole('button', { name: 'Freigeben' })).toHaveCount(0);
  const ersteZeile = page.getByRole('region', { name: 'Läufe' }).getByRole('row').first();
  await expect(ersteZeile).toContainText('3 offen');
  await expect(ersteZeile).toContainText('4 Vorschläge, 1 freigegeben');
  await expect(page.getByRole('region', { name: 'Lauf vom 19.11.2026' })).toContainText(/Freigegeben\s*1/);
});
