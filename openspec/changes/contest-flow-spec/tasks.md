# Contest Flow — Implementation Tasks

Tracks faker mock fidelity for the Contest screens. Reference: `specs/contest-flow.md`, `specs/contest-state-fidelity.md`.

---

## Status

| # | Task | Priority | Status | Source |
|---|------|----------|--------|--------|
| 1 | Fix `contest_end_date` format in ContestFactory | 🔴 High | ✅ Done | Original spec |
| 2 | Fix `contest/retrieve_contest_games` response key | 🔴 High | ✅ Done | Original spec |
| 3 | Add Playwright tests for Contest Library | 🔴 High | ✅ Done (16/16) | Original spec |
| 4 | Fix contest clone progress URL (`copy_contest_progress`) | 🟡 Low | ✅ N/A (works via mlg path) | Original spec |
| 5 | Stub `contest/get_assignment` with real recipient data | 🟡 Low | ✅ Done (empty list) | Original spec |
| 6 | Narrow `contest/get_games_for_filter` to READY/LIVE SP games only | 🟡 Low | ✅ Done | Original spec |
| 7 | Stub timezone endpoint for Create Contest dialog | 🟡 Low | ✅ Done (`get_timezone` stubbed) | Original spec |
| **C-1** | **Set `is_editable: false` for LIVE + CLOSED in `contest.factory.ts`** | 🔴 High | ✅ Done | Chandru QA |
| **C-2** | **`forced_close` stub: state→ENDED, update `contest_end_date` to today** | 🔴 High | ✅ Done | Chandru QA |
| **C-3** | `copy_contest` stub: reset clone start/end dates to today / today+30 | 🟡 Med | ✅ Done | Chandru QA |
| **C-4** | Pre-populate `contest_rule` + `trophy_url` for LIVE contests in factory | 🟡 Med | ✅ Done | Chandru QA |
| **C-5** | **Guard `recipients[0]` in `create-contest.component.ts` `getRecipients()`** | 🔴 High | ✅ Done | Backend audit |
| **C-6** | Fix `category/retrieve_game_category`: id field → `game_cat_id` (Category Mgmt screen) | 🟡 Med | ✅ Done | Backend audit |
| **C-7** | Fix `game/game_categories` stub: add real data with `game_cat_id` (game library filter) | 🟡 Med | ✅ Done | Backend audit |
| **C-8** | **Add `trophy` object field to `contest.factory.ts` for LIVE contests (Trophy dialog crashes without it)** | 🔴 High | ✅ Done | Backend audit (deep read) |
| **C-9** | Add `rewards` object field to `contest.factory.ts` for LIVE contests | 🟡 Med | ✅ Done | Backend audit (deep read) |
| **C-10** | Remove debug console.log calls from `add-contest-header.component.ts` (~9 logs) and `create-contest.component.ts` (2 logs) | 🟢 Low | ✅ Done | Backend audit (deep read) |

---

## Task Details

### 1. Fix `contest_end_date` format in ContestFactory 🔴

**File:** `src/app/core/faker/contest.factory.ts`

**Problem:** `ContestListComponent.getContestsList()` parses `contest_end_date` with:
```ts
const dateOnly = item.contest_end_date.split(' ');
item.contest_end_date = this.getDateTime(dateOnly[0]);
```
It expects a space-separated datetime (`"2026-07-22 23:59:59"`), not an ISO-T string. With ISO format, `dateOnly[0]` = the full ISO string → `datePipe.transform` fails → `Invalid Date` shown on cards.

**Fix:** Change factory date format:
```ts
// in ContestFactory.one():
const end = new Date(start); end.setDate(end.getDate() + 22);
// change from:
contest_end_date: end.toISOString().slice(0, 19),
// to:
contest_end_date: end.toISOString().slice(0, 10).replace(/-/g, '-') + ' 23:59:59',
```

Same fix needed for `contest_start_date` if any component also expects space format.

---

### 2. Fix `contest/retrieve_contest_games` response key 🔴

**File:** `src/app/core/interceptors/faker.interceptor.ts`

**Problem:** Interceptor returns `{ contest_game_list: [...] }` but `AddContestComponent.getContestGames()` reads:
```ts
response.data.contest_games_list  // note: contest_gameS_list (plural)
```

**Fix:**
```ts
if (url.includes('contest/retrieve_contest_games'))
  return ok({ contest_games_list: ContestFactory.games() });
```

---

### 3. Playwright tests for Contest Library 🔴

**File:** `pw-tests/faker-smoke.spec.ts`

Current failing tests:
- `loads 16 cards, no Invalid Date dialog` — failing because of date format bug (Task 1)
- `contest editor opens without blocking dialog` — `create-contest` route not reached; interceptor may be missing something
- `clone contest appears at top of list` — menu item not found (menu button class is `button.contest-option`, menu items are `button.mat-menu-item.options-menu-item`)
- `delete contest removes it from list` — same menu issue

**Fixes needed in test selectors:**
- Contest tiles: `mat-grid-tile.contest-container` ✅ (already correct)
- Options button: `button.contest-option` (not `button[mat-icon-button]`)
- Menu items: `button.options-menu-item` with `hasText: /clone/i`, `/delete/i` etc. (they use `mat-icon` + `span`, so mat-icon text is prepended: e.g. `"file_copyClone"`)
- Use `/Clone/` not `/^clone$/i` — mat-icon text is included

**Create-contest route:** Confirm it's `/admin/contests/create-contest` not `/admin/create-contest`.

---

### 4. Fix contest clone progress URL 🟡

**Context:** `contestService.copyContestProgress()` uses `EndPoint.CONTEST_COPY_PROGRESS` which resolves to `mlg/copy_mlg_progress`. The interceptor stub uses the same URL so this already works. No code change needed — just document why.

If `copy_contest_progress` is ever extracted to its own endpoint, update the stub.

---

### 5. Stub `contest/get_assignment` with real recipient data 🟡

**Current:** Returns `{ recipients: [] }` — audience panel in contest editor shows blank.

**Improvement:** Return a realistic recipient based on the contest's `assignment_id`:
```ts
if (url.includes('contest/get_assignment'))
  return ok({ recipients: [{
    assignment_id: 'fa-1',
    recipient_type: 'FIELDS_BASED',
    players: [{ key_id: 'location_ids', filter_key: 'location_ids', is_all: true, values: [] }],
  }]});
```
Only needed if testing the audience editing UI.

---

### 6. Narrow game filter to READY/LIVE SP games only 🟡

**Current:** `contest/get_games_for_filter` returns `this.games` (all 20 games).

**Real behavior:** Only `game_type=1` (SP) games in `READY` or `LIVE` state.

**Fix:**
```ts
if (url.includes('contest/get_games_for_filter')) {
  const eligible = this.games.filter(g => g.game_type === '1' && ['READY', 'LIVE'].includes(g.game_state));
  return ok({ games: eligible, total_games: eligible.length });
}
```

---

### 7. Stub timezone endpoint 🟡

`CreateContestComponent.getTimeZone()` makes an HTTP call (exact URL unknown — check `api.service.ts` for `TIMEZONE` constant). If it fails silently (no `subscribe` error handling visible in code), the `timezoneId` stays undefined and gets sent as `undefined` in the contest payload. Probably harmless for mock.

Find the endpoint:
```bash
grep -n "TIMEZONE\|timezone\|time_zone" src/app/services/network/api.service.ts
```
Add a stub returning `[{ tz_id: 'America/New_York', tz_name: 'Eastern Time' }]` if needed.
