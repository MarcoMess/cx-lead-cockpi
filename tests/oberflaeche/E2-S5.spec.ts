import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { anmelden } from './hilfen';

const BEISPIEL = 'tests/oberflaeche/dateien/beispiel-lauf.json';
const beispiel = () => JSON.parse(readFileSync(BEISPIEL, 'utf8'));
const datei = (name: string, inhalt: string | Buffer) => ({
  name,
  mimeType: 'application/json',
  buffer: typeof inhalt === 'string' ? Buffer.from(inhalt, 'utf8') : inhalt,
});

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
  await expect(page.getByRole('status').filter({ hasText: 'eingelesen' })).toHaveText(
    'Ergebnisdatei eingelesen: 4 Vorschläge liegen zum Prüfen bereit.',
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

test('E2-S5 #3 dieselbe Datei am nächsten Tag: kein zweiter Lauf, die Meldung nennt jeden Vorschlag', async ({
  page,
  request,
}) => {
  await anmelden(page, '/eingangskorb');
  const laeufe = page.getByRole('region', { name: 'Läufe' });
  await laeufe.getByLabel('Ergebnisdatei hochladen').setInputFiles(BEISPIEL);
  await expect(page.getByRole('status').filter({ hasText: 'eingelesen' })).toBeVisible();
  await request.post('/api/v1/sim/datum', { data: { heute: '2026-11-20' } });
  await laeufe.getByLabel('Ergebnisdatei hochladen').setInputFiles(BEISPIEL);
  const alarm = laeufe.getByRole('alert');
  await expect(alarm).toContainText('Es wurde kein Lauf angelegt:');
  await expect(alarm).toContainText(
    'Nr. 1 (Sabine Kortmann, Kranbau Oberhavel GmbH) nicht noch einmal angelegt: liegt schon ungeprüft im Lauf vom 19.11.2026.',
  );
  await expect(alarm).toContainText('Nr. 4 (Reto Ammann, Seehotel-Gruppe Bodan AG) nicht noch einmal angelegt');
  // Erfolg und Fehler stehen nicht gleichzeitig da (Prüfung E2-S5, Hinweis 12).
  await expect(page.getByRole('status').filter({ hasText: 'eingelesen' })).toHaveCount(0);
  await expect(laeufe.locator('tbody tr')).toHaveCount(4);
});

test('E2-S5 Prüfung 1, Befunde 1 und 4: doppelt und zurückgewiesen stehen am Lauf unter »Beim Einlesen«', async ({
  page,
}) => {
  const lauf = beispiel();
  const [kortmann, voss] = lauf.vorschlaege;
  delete voss.person.nachname;
  kortmann.firma.land = 'Deutschland'; // wird geglättet, nicht zurückgewiesen
  kortmann.firma.umsatz_jahr = '2025';
  lauf.vorschlaege = [kortmann, { ...kortmann }, voss];
  await anmelden(page, '/eingangskorb');
  await page
    .getByRole('region', { name: 'Läufe' })
    .getByLabel('Ergebnisdatei hochladen')
    .setInputFiles(datei('teilweise.json', '```json\n' + JSON.stringify(lauf) + '\n```'));
  await expect(page.getByRole('status').filter({ hasText: 'eingelesen' })).toHaveText(
    'Ergebnisdatei eingelesen: 1 Vorschlag liegt zum Prüfen bereit. 1 Vorschlag war schon im Eingangskorb und wurde nicht noch einmal angelegt. 1 Vorschlag zurückgewiesen. Die Gründe stehen am Lauf unter »Beim Einlesen«.',
  );
  await expect(page.getByRole('list', { name: 'Beim Einlesen' }).getByRole('listitem')).toHaveText([
    'Nr. 3 (Miriam, Hansemarkt Handels SE) zurückgewiesen: Das Feld »person.nachname« fehlt.',
    'Nr. 2 (Sabine Kortmann, Kranbau Oberhavel GmbH) nicht noch einmal angelegt: steht weiter oben in derselben Datei.',
  ]);
  await page.reload();
  await expect(page.getByRole('list', { name: 'Beim Einlesen' }).getByRole('listitem')).toHaveCount(2);
});

test('E2-S5 Prüfung 1, Befund 5: eine Datei in Latin-1 wird mit Grund abgewiesen', async ({ page }) => {
  await anmelden(page, '/eingangskorb');
  const laeufe = page.getByRole('region', { name: 'Läufe' });
  await laeufe
    .getByLabel('Ergebnisdatei hochladen')
    .setInputFiles(datei('latin1.json', Buffer.from(readFileSync(BEISPIEL, 'utf8'), 'latin1')));
  await expect(laeufe.getByRole('alert')).toHaveText(
    'Die Datei »latin1.json« ist nicht in UTF-8 gespeichert. Speichere sie als UTF-8 und lade sie erneut hoch.',
  );
  await expect(laeufe.locator('tbody tr')).toHaveCount(3);
});

test('E2-S5 Prüfung 1, Befund 6: Vorführweg »API gestört« → Ergebnisdatei herunterladen und hochladen', async ({
  page,
}) => {
  await anmelden(page, '/eingangskorb');
  const leiste = page.getByRole('region', { name: 'Vorführleiste' });
  await leiste.getByLabel('API für den Agenten gestört').check();
  await leiste.getByRole('button', { name: 'Agent meldet sich' }).click();
  await expect(leiste.getByRole('status')).toContainText('Die Ergebnisdatei liegt zum Hochladen bereit.');
  const laden = page.waitForEvent('download');
  await leiste.getByRole('link', { name: 'Ergebnisdatei herunterladen' }).click();
  const pfad = await (await laden).path();
  await page.getByRole('region', { name: 'Läufe' }).getByLabel('Ergebnisdatei hochladen').setInputFiles(pfad);
  await expect(page.getByRole('status').filter({ hasText: 'eingelesen' })).toHaveText(
    'Ergebnisdatei eingelesen: 4 Vorschläge liegen zum Prüfen bereit.',
  );
  await expect(page.getByRole('article')).toHaveCount(4);
});
