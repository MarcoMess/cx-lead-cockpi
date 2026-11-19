import { expect, test, type Page } from '@playwright/test';
import { anmelden } from './hilfen';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.beforeEach(async ({ request }) => {
  await request.post('/api/v1/anmeldung', { data: { passwort: 'test-passwort' } });
  await request.post('/api/v1/sim/zuruecksetzen');
});

/** Zählt jede Anfrage an LinkedIn und lässt sie nicht hinaus (Kriterium 4). */
async function linkedinZaehler(page: Page) {
  const anfragen: string[] = [];
  await page.context().route(/linkedin\.com/, (route) => {
    anfragen.push(route.request().url());
    return route.fulfill({ status: 200, body: 'Profil (Test)' });
  });
  return anfragen;
}
const zwischenablage = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

test('E5-S2 #1 #2 #4 Gruber: Betreff und Nachricht kopieren, Profil öffnen, keine Anfrage durch das Cockpit', async ({
  page,
}) => {
  const anfragen = await linkedinZaehler(page);
  await anmelden(page, '/ansprache/3');
  const rechts = page.getByRole('region', { name: 'Nachricht' });

  await rechts.getByRole('button', { name: 'Betreff kopieren' }).click();
  await expect(rechts.getByRole('status')).toHaveText('Betreff kopiert.');
  expect(await zwischenablage(page)).toBe('Kundenportal Netzanschlüsse 2027');

  await rechts.getByLabel('Nachricht').fill('Hallo Frau Gruber, geänderter Text.');
  await rechts.getByRole('button', { name: 'Nachricht kopieren' }).click();
  await expect(rechts.getByRole('status')).toHaveText('Nachricht kopiert.');
  expect(await zwischenablage(page)).toBe('Hallo Frau Gruber, geänderter Text.');
  expect(anfragen).toEqual([]);

  const [fenster] = await Promise.all([
    page.context().waitForEvent('page'),
    rechts.getByRole('link', { name: 'Profil öffnen' }).click(),
  ]);
  await fenster.waitForLoadState();
  expect(fenster.url()).toBe('https://linkedin.com/in/simone-gruber-beispiel');
  // Die einzige LinkedIn-Anfrage ist das von Marco geöffnete Profil im neuen Fenster, kein Senden und kein Auslesen.
  expect(anfragen).toEqual(['https://linkedin.com/in/simone-gruber-beispiel']);
});

test('E5-S2 #3 Ammann ohne verifizierte URL: kein »Profil öffnen«, Suchhinweis zum Kopieren', async ({
  page,
  request,
}) => {
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-19' } });
  const lauf = await (await request.post('/api/v1/sim/agent/meldung')).json();
  const detail = await (await request.get(`/api/v1/laeufe/${lauf.lauf_id}`)).json();
  const ammann = detail.vorschlaege.find(
    (v: { daten: { person: { nachname: string } } }) => v.daten.person.nachname === 'Ammann',
  );
  const frei = await (await request.post(`/api/v1/vorschlaege/${ammann.id}/freigabe`)).json();

  await anmelden(page, `/ansprache/${frei.ansprechpartner_id}`);
  const rechts = page.getByRole('region', { name: 'Nachricht' });
  await expect(rechts.getByRole('link', { name: 'Profil öffnen' })).toHaveCount(0);
  await expect(rechts.getByTestId('suchhinweis')).toHaveText('Reto Ammann, Seehotel-Gruppe Bodan AG');
  await rechts.getByRole('button', { name: 'Suchhinweis kopieren' }).click();
  await expect(rechts.getByRole('status')).toHaveText('Suchhinweis kopiert.');
  expect(await zwischenablage(page)).toBe('Reto Ammann, Seehotel-Gruppe Bodan AG');
});

test('E5-S2 #4 Kopieren ändert den Status nicht', async ({ page, request }) => {
  await anmelden(page, '/ansprache/3');
  await page.getByRole('button', { name: 'Nachricht kopieren' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'kopiert' })).toBeVisible();
  const akte = await (await request.get('/api/v1/kontakte/3')).json();
  expect(akte.status).toBe('freigegeben');
  expect(akte.verlauf).toEqual([]);
});
