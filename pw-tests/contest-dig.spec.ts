import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:4202';
const errors: string[] = [];
const results: string[] = [];

async function log(msg: string) { results.push(msg); console.log(msg); }
async function err(msg: string) { errors.push(msg); console.error('ERR: ' + msg); }

async function waitLoad(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);
}

test('Contest Library + Editor deep dive', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', req => {
    err(`FAILED REQUEST: ${req.url()}`);
  });

  // ── 1. Load contest list ──────────────────────────────────────────────────
  await page.goto(BASE + '/admin/contests', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await log('PAGE: /admin/contests loaded');

  // Check dates render
  const dateText = await page.locator('.contest-date, .date-range, [class*="date"]').first().textContent().catch(() => '(no date el)');
  await log(`DATE TEXT SAMPLE: ${dateText}`);

  // Check invalid date error
  const invalidDateDialog = await page.locator('mat-dialog-container').filter({ hasText: /invalid date/i }).count();
  if (invalidDateDialog > 0) await err('Invalid Date dialog still present on /admin/contests');
  else await log('✅ No "Invalid Date" dialog on contest list');

  // Count contest cards
  const cards = await page.locator('.contest-card, [class*="contest-item"], mat-card').count();
  await log(`CONTEST CARDS: ${cards}`);

  // ── 2. Click a contest to open editor ─────────────────────────────────────
  const firstCard = page.locator('mat-card, .contest-card').first();
  await firstCard.click().catch(() => err('Could not click first card'));
  await waitLoad(page);
  await log(`EDITOR URL: ${page.url()}`);

  // Check for invalid date error in editor
  await page.waitForTimeout(1500);
  const editorInvalidDate = await page.locator('mat-dialog-container, .alert, .error').filter({ hasText: /invalid date/i }).count();
  if (editorInvalidDate > 0) await err('❌ Invalid Date dialog still present in editor');
  else await log('✅ No "Invalid Date" dialog in editor');

  // Capture editor date fields
  const editorDateInputs = await page.locator('input[type="date"], input[matinput], mat-datepicker-input').count();
  await log(`EDITOR DATE INPUTS: ${editorDateInputs}`);

  // ── 3. Try toolbar buttons ─────────────────────────────────────────────────
  // Assignment / Schedule Players icon
  const assignBtn = page.locator('button mat-icon').filter({ hasText: /assignment|person_add|schedule/i }).first();
  const assignCount = await assignBtn.count();
  if (assignCount > 0) {
    await assignBtn.click();
    await page.waitForTimeout(1500);
    const dlg = await page.locator('mat-dialog-container').count();
    if (dlg > 0) {
      await log('✅ Schedule Players dialog opened');
      const locationDrop = await page.locator('mat-select, .filter-dropdown').first().count();
      await log(`  Location dropdown present: ${locationDrop > 0}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      await err('❌ Schedule Players dialog did NOT open');
    }
  } else {
    await err('❌ Assignment/Schedule button not found');
  }

  // Reward icon (card_giftcard)
  const rewardBtn = page.locator('button mat-icon').filter({ hasText: /card_giftcard|redeem|reward/i }).first();
  if (await rewardBtn.count() > 0) {
    await rewardBtn.click();
    await page.waitForTimeout(1500);
    if (await page.locator('mat-dialog-container').count() > 0) {
      await log('✅ Reward dialog opened');
      const catOpts = await page.locator('mat-option').count();
      await log(`  Category options visible: ${catOpts}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else await err('❌ Reward dialog did NOT open');
  } else await err('❌ Reward button not found');

  // Notifications bell
  const notifBtn = page.locator('button mat-icon').filter({ hasText: /notifications|bell/i }).first();
  if (await notifBtn.count() > 0) {
    await notifBtn.click();
    await page.waitForTimeout(1200);
    if (await page.locator('mat-dialog-container').count() > 0) {
      await log('✅ Notifications dialog opened');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else await err('❌ Notifications dialog did NOT open');
  } else await err('⚠️ Notifications button not found (may not exist in this build)');

  // Trophy
  const trophyBtn = page.locator('button mat-icon').filter({ hasText: /emoji_events|trophy/i }).first();
  if (await trophyBtn.count() > 0) {
    await trophyBtn.click();
    await page.waitForTimeout(1200);
    if (await page.locator('mat-dialog-container').count() > 0) {
      await log('✅ Trophy dialog opened');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else await err('❌ Trophy dialog did NOT open');
  } else await err('⚠️ Trophy button not found');

  // Add Games "+" button
  const addGamesBtn = page.locator('button').filter({ hasText: /add game|^\+$/i }).first();
  const addGameIcon = page.locator('button mat-icon').filter({ hasText: /^add$/ }).first();
  const addTarget = (await addGamesBtn.count() > 0) ? addGamesBtn : addGameIcon;
  if (await addTarget.count() > 0) {
    await addTarget.click();
    await page.waitForTimeout(1500);
    const panelGames = await page.locator('.game-item, mat-list-item, [class*="game-row"]').count();
    if (panelGames > 0) await log(`✅ Add Games panel opened, ${panelGames} games listed`);
    else await err('❌ Add Games panel opened but no games visible');
  } else await err('⚠️ Add Games button not found');

  // SCHEDULE publish button
  const scheduleBtn = page.locator('button').filter({ hasText: /^schedule$/i }).first();
  if (await scheduleBtn.count() > 0) {
    await scheduleBtn.click();
    await page.waitForTimeout(1500);
    if (await page.locator('mat-dialog-container, [class*="config"], [class*="preview"]').count() > 0) {
      await log('✅ SCHEDULE/Publish flow opened');
      await page.keyboard.press('Escape');
    } else await err('❌ SCHEDULE button clicked but no dialog/preview appeared');
  } else await log('ℹ️ SCHEDULE button not found — may require contest to be in READY state');

  // ── 4. Create a Contest dialog ────────────────────────────────────────────
  await page.goto(BASE + '/admin/contests', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const fab = page.locator('button[mat-fab], button.mat-fab, .mat-fab, button').filter({ hasText: /add|create|\+/i }).last();
  if (await fab.count() > 0) {
    await fab.click();
    await page.waitForTimeout(1500);
    if (await page.locator('mat-dialog-container').count() > 0) {
      await log('✅ Create Contest dialog opened');

      // Look for Add Player section
      const addPlayerSection = page.locator('[class*="add-player"], [class*="filter"], mat-expansion-panel').filter({ hasText: /add player|player/i }).first();
      if (await addPlayerSection.count() > 0) {
        await addPlayerSection.click();
        await page.waitForTimeout(800);
        await log('  Add Player section expanded');
      }

      // Check location filter button
      const locationBtn = page.locator('button').filter({ hasText: /location|new york/i }).first();
      if (await locationBtn.count() > 0) {
        await locationBtn.click();
        await page.waitForTimeout(800);
        const opts = await page.locator('mat-option').count();
        await log(`  Location dropdown options: ${opts}`);
      } else {
        await log('  ℹ️ Location filter button not immediately visible');
      }

      await page.keyboard.press('Escape');
    } else await err('❌ Create Contest dialog did NOT open via FAB');
  } else await err('❌ FAB not found on /admin/contests');

  // ── 5. Summary ────────────────────────────────────────────────────────────
  console.log('\n\n=== RESULTS ===');
  results.forEach(r => console.log(r));
  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log(e));
  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrors.slice(0, 20).forEach(e => console.log(e));
});
