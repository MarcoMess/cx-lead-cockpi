import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

test('E3-S1 #1 Laufliste mit den drei Beispielläufen, der neueste zuerst', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const liste = page.getByRole('region', { name: 'Läufe' });
  await expect(liste.getByRole('row')).toHaveText([
    /16\.11\.2026\s*10 Vorschläge, 7 freigegeben/,
    /12\.11\.2026\s*8 Vorschläge, 6 freigegeben/,
    /09\.11\.2026\s*10 Vorschläge, 8 freigegeben/,
  ]);
  const kopf = page.getByRole('region', { name: 'Lauf vom 16.11.2026' });
  await expect(kopf).toContainText('2 Profile ohne verifizierte URL');
  await liste.getByRole('link', { name: '12.11.2026' }).click();
  await expect(page.getByRole('region', { name: 'Lauf vom 12.11.2026' })).toContainText(
    'Nur 8 belegte Treffer, Lücke benannt',
  );
});

test('E3-S1 #2 #3 #4 Lauf vom 19.11.2026 mit vier Karten, »4 offen« und Etikett ohne Anlass', async ({
  page,
  request,
}) => {
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  await request.post('/api/v1/sim/agent/meldung');
  await anmelden(page, '/eingangskorb');
  const liste = page.getByRole('region', { name: 'Läufe' });
  await expect(liste.getByRole('row').first()).toContainText('19.11.2026');
  await expect(liste.getByRole('row').first()).toContainText('4 offen');

  const kortmann = page.getByRole('article', { name: 'Vorschlag Sabine Kortmann' });
  await expect(kortmann).toContainText('Leiterin After-Sales Service');
  await expect(kortmann).toContainText('Kranbau Oberhavel GmbH, Maschinenbau / DE, Umsatz 121 Mio. EUR, 2025, Konzern');
  await expect(kortmann).toContainText('Pressemitteilung: Kundenportal für Ersatzteile angekündigt (12.11.2026)');
  await expect(kortmann.getByRole('link', { name: 'Quelle öffnen' })).toHaveAttribute(
    'href',
    'https://example.com/quelle-kranbau-ersatzteilportal',
  );
  await expect(page.getByRole('article', { name: 'Vorschlag Miriam Voss' })).toContainText(
    'Umsatz 1,4 Mrd. EUR, 2025, Konzern',
  );
  await expect(page.getByRole('article', { name: 'Vorschlag Dr. Katrin Albers' })).toBeVisible();

  const ammann = page.getByRole('article', { name: 'Vorschlag Reto Ammann' });
  await expect(ammann).toContainText('Kein belastbarer aktueller Anlass');
  await expect(ammann).toContainText('Hospitality / CH, Umsatz 88 Mio. CHF, 2025, Konzern');
  await expect(ammann.getByRole('link', { name: 'Quelle öffnen' })).toHaveCount(0);
});

test('E3-S1 #5 Lauf ohne offene Vorschläge und Lauf ohne Vorschläge haben einen Hinweis', async ({ page, request }) => {
  await anmelden(page, '/eingangskorb');
  await expect(page.getByText('Alle Vorschläge dieses Laufs sind geprüft.')).toBeVisible();
  await request.post('/api/v1/sim/agent/meldung');
  await request.post('/api/v1/sim/datum', { data: { plus_werktage: 1 } });
  await request.post('/api/v1/sim/agent/meldung');
  await page.reload();
  await expect(page.getByRole('region', { name: 'Lauf vom 19.11.2026' })).toBeVisible();
  await expect(page.getByText('Dieser Lauf hat keine Vorschläge geliefert.')).toBeVisible();
});

test('E3-S1 nach »Agent meldet sich« in der Vorführleiste lädt der Eingangskorb neu', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  await page.getByRole('region', { name: 'Vorführleiste' }).getByRole('button', { name: 'Agent meldet sich' }).click();
  await expect(page.getByRole('region', { name: 'Läufe' }).getByRole('row').first()).toContainText('4 offen');
});
