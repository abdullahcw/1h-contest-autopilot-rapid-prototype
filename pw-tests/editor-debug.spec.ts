import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:4202';

test('debug: what text renders in contest editor', async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('ERROR:', msg.text().slice(0, 200));
  });

  await page.goto(`${BASE}/admin/contests`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await expect(page.locator('mat-grid-tile.contest-container').first()).toBeVisible({ timeout: 8000 });

  // Click first contest tile
  await page.locator('.contest-wrapper').first().click();
  await page.waitForTimeout(3000);

  console.log('URL:', page.url());

  // Get all text content in the game table area
  const tableText = await page.locator('table.responsive-table, mat-table, .container-card').first().innerText().catch(() => 'NOT FOUND');
  console.log('Table text:', tableText.slice(0, 500));

  // Get all td.game-name-holder text
  const gameNameCells = await page.locator('td.game-name-holder').allTextContents();
  console.log('game-name-holder cells:', gameNameCells);

  // Get all .game-row count
  const gameRowCount = await page.locator('tr.game-row').count();
  console.log('tr.game-row count:', gameRowCount);

  // Get no_messages div if shown
  const noMsg = await page.locator('.no_messages').textContent().catch(() => 'N/A');
  console.log('no_messages:', noMsg?.trim());

  // Get is_addGame check — look for app-add-games-in-contest
  const addGamesVisible = await page.locator('app-add-games-in-contest').isVisible().catch(() => false);
  console.log('is_addGame (add-games-in-contest visible):', addGamesVisible);

  // Get property icon holders
  const iconHolders = await page.locator('div.property-icon-holder').count();
  console.log('Property icon holders:', iconHolders);

  // Full body snippet — first 1000 chars
  const bodyText = await page.locator('body').innerText();
  console.log('Body text (first 800 chars):', bodyText.replace(/\s+/g, ' ').slice(0, 800));
});
