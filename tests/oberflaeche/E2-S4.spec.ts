import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  await request.post('/api/v1/sim/agent/meldung');
});

test('E2-S4 #1 #4 Eingangskorb: Albers als Dublette gesperrt, Voss mit Hinweis freigebbar', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const albers = page.getByRole('article', { name: /Vorschlag .*Katrin Albers/ });
  await expect(albers.locator('.tag')).toContainText(['Dublette']);
  await expect(albers).toContainText(
    'Dublette: Diese Person ist bereits im Cockpit (Dr. Katrin Albers, Status »Gespräch vereinbart«). Der Vorschlag kann nicht freigegeben werden.',
  );
  await expect(albers.getByRole('button', { name: 'Freigeben' })).toBeDisabled();

  const voss = page.getByRole('article', { name: 'Vorschlag Miriam Voss' });
  await expect(voss).toContainText('Bestehende Firma: Hansemarkt Handels SE');
  await expect(voss).toContainText(
    'Zweiter Ansprechpartner, dort läuft eine Ansprache (Tobias Reinhardt, Angeschrieben)',
  );
  await voss.getByRole('button', { name: 'Freigeben' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Miriam Voss freigegeben' })).toBeVisible();

  const kortmann = page.getByRole('article', { name: 'Vorschlag Sabine Kortmann' });
  await expect(kortmann.locator('.note')).toHaveCount(0);
  await expect(kortmann.getByRole('button', { name: 'Freigeben' })).toBeEnabled();
});
