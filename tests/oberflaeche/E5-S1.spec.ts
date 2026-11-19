import { expect, test } from '@playwright/test';
import { anmelden } from './hilfen';

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

test('E5-S1 #6 ohne gewählten Kontakt: »Erstkontakt offen« mit Gruber, »Angeschrieben, Nachfassen möglich« mit Reinhardt', async ({
  page,
}) => {
  await anmelden(page, '/ansprache');
  await expect(page.getByRole('region', { name: 'Erstkontakt offen' }).getByRole('row')).toHaveText([/Simone Gruber/]);
  await expect(page.getByRole('region', { name: 'Angeschrieben, Nachfassen möglich' }).getByRole('row')).toHaveText([
    /Tobias Reinhardt/,
  ]);
});

test('E5-S1 #1 #2 #3 #4 Gruber: Aufhänger links, Nachricht rechts, LinkedIn vorausgewählt, Wortzähler', async ({
  page,
}) => {
  await anmelden(page, '/ansprache');
  await page.getByRole('region', { name: 'Erstkontakt offen' }).getByRole('link', { name: 'Ansprechen' }).click();
  await expect(page).toHaveURL(/\/ansprache\/3$/);
  const links = page.getByRole('region', { name: 'Aufhänger' });
  await expect(links).toContainText('Geschäftsbericht: Kundenportal für Netzanschlüsse als Schwerpunkt 2027');
  await expect(links).toContainText('Datum: 15.09.2026');
  await expect(links.getByRole('link', { name: 'Quelle öffnen' })).toHaveAttribute(
    'href',
    'https://example.com/quelle-3',
  );
  await expect(links.locator('.tag.hypothese')).toHaveText('Hypothese');
  await expect(links).toContainText(
    'Hypothese Ein Kundenportal für Netzanschlüsse berührt Anfrage, Statusauskunft und Service zugleich.',
  );
  await expect(links).toContainText(
    'Gesprächsziel: Einordnen, welche Kundenprozesse rund um den Netzanschluss zuerst mitwachsen sollten.',
  );

  const rechts = page.getByRole('region', { name: 'Nachricht' });
  await expect(rechts.getByRole('button', { name: 'LinkedIn' })).toHaveAttribute('aria-pressed', 'true');
  await expect(rechts.getByLabel('Betreff')).toHaveValue('Kundenportal Netzanschlüsse 2027');
  await expect(rechts.getByLabel('Nachricht')).toHaveValue(/^Hallo Frau Gruber, im Geschäftsbericht/);
  await expect(rechts.locator('.wortzahl')).toHaveText('50 Wörter, im Zielkorridor 45–70');

  await rechts.getByLabel('Nachricht').fill('Hallo Frau Gruber, kurze Frage zum Kundenportal.');
  await expect(rechts.locator('.wortzahl')).toHaveText('7 Wörter, Zielkorridor für LinkedIn ist 45–70');
});

test('E5-S1 #7 Bernasconi ohne Anlass: Etikett statt Aufhänger; Einstieg aus der Kontaktakte', async ({
  page,
  request,
}) => {
  // Bernasconi steht auf »Nachgefasst«; für die Ansicht wird er über die Demo-Datenbank nicht verändert.
  // Geprüft wird die Anzeige an einem freigegebenen Kontakt ohne Anlass: Kortmann aus dem Lauf vom 19.11. hat einen Anlass,
  // Ammann keinen – er wird freigegeben und angesprochen.
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  const lauf = await (await request.post('/api/v1/sim/agent/meldung')).json();
  const detail = await (await request.get(`/api/v1/laeufe/${lauf.lauf_id}`)).json();
  const ammann = detail.vorschlaege.find(
    (v: { daten: { person: { nachname: string } } }) => v.daten.person.nachname === 'Ammann',
  );
  const frei = await (await request.post(`/api/v1/vorschlaege/${ammann.id}/freigabe`)).json();

  await anmelden(page, `/kontakte/${frei.ansprechpartner_id}`);
  await page.getByRole('link', { name: 'Ansprechen' }).click();
  const links = page.getByRole('region', { name: 'Aufhänger' });
  await expect(links.locator('.tag').first()).toHaveText('Kein belastbarer aktueller Anlass');
  await expect(links).not.toContainText('Datum:');
  await expect(links.getByRole('link', { name: 'Quelle öffnen' })).toHaveCount(0);
});

test('Reinhardt (angeschrieben) und Albers (Gespräch vereinbart) haben keine Erstansprache', async ({ page }) => {
  await anmelden(page, '/ansprache/1');
  await expect(page.getByText('Im Status »Gespräch vereinbart« ist keine Ansprache vorgesehen.')).toBeVisible();
  await page.goto('/ansprache/2');
  await expect(page.getByText('Dieser Kontakt ist angeschrieben.', { exact: false })).toBeVisible();
  await page.goto('/ansprache/999');
  await expect(page.getByText('Diesen Kontakt gibt es nicht.')).toBeVisible();
});
