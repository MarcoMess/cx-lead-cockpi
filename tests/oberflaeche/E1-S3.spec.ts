import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

test('E1-S3 #1 und #5 »Agent meldet sich« in der Vorführleiste legt den Lauf an', async ({ page, request }) => {
  await anmelden(page);
  const leiste = page.getByRole('region', { name: 'Vorführleiste' });
  await leiste.getByRole('button', { name: 'Agent meldet sich' }).click();
  await expect(leiste.getByRole('status')).toHaveText('Der Agent hat 4 Vorschläge geliefert.');
  await leiste.getByRole('button', { name: 'Agent meldet sich' }).click();
  await expect(leiste.getByRole('status')).toContainText('schon einen ausgeführten Recherchelauf');
  const datei = await request.get('/api/v1/sim/agent/ergebnisdatei');
  expect(datei.status()).toBe(404);
});

test('E1-S3 #4 Schalter »API für den Agenten gestört«', async ({ page, request }) => {
  await anmelden(page);
  const leiste = page.getByRole('region', { name: 'Vorführleiste' });
  await leiste.getByLabel('API für den Agenten gestört').check();
  await expect(leiste.getByLabel('API für den Agenten gestört')).toBeChecked();
  await leiste.getByRole('button', { name: 'Agent meldet sich' }).click();
  await expect(leiste.getByRole('status')).toContainText('Ergebnisdatei liegt zum Hochladen bereit');
  const datei = await request.get('/api/v1/sim/agent/ergebnisdatei');
  expect((await datei.json()).vorschlaege).toHaveLength(4);
  await leiste.getByRole('button', { name: 'Zurücksetzen' }).click();
  await expect(leiste.getByLabel('API für den Agenten gestört')).not.toBeChecked();
});
