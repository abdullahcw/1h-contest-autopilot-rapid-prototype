# Contest State Fidelity — Chandru QA Findings + Backend Analysis

**Date:** 2026-07-01  
**Sources:** QA session with Chandru (lead tester), `contest-list.component.ts/html`, `add-contest-header.component.ts/html`, `faker.interceptor.ts`, `contest.factory.ts`, existing `contest-flow.md`.

---

## Overview

All issues below stem from two root causes in the faker mock:
1. **`is_editable: true` hardcoded for ALL contest states** — real backend sets this `false` for LIVE and CLOSED.
2. **Force-stop state transition** — real backend moves to `ENDED` (intermediate), not `CLOSED` directly.

---

## 1. Context Menu Visibility by State

### Spec (what the real backend enforces)

| State | Clone | Edit | Delete | Force Close | Move to Draft |
|-------|-------|------|--------|-------------|---------------|
| `DRAFT` | — | ✅ (`is_editable`) | ✅ (`is_editable`) | — | — |
| `READY` | ✅ (`can_clone`) | ✅ (`is_editable`) | ✅ (`is_editable`) | — | ✅ (`is_authorized`) |
| `LIVE` | ✅ (`can_clone`) | ❌ (`is_editable=false`) | ❌ (`is_editable=false`) | ✅ (`is_authorized`) | — |
| `CLOSED` | ✅ (`can_clone`) | ❌ (`is_editable=false`) | ❌ (`is_editable=false`) | — | — |
| `ENDED` | ✅ (`can_clone`) | ❌ | ❌ | — | — |

**Template gates** (`contest-list.component.html`):
- Edit: `*ngIf="selectedContest?.is_editable && selectedContest?.is_authorized"` (line 118)
- Delete: same gate (line 122)
- Force Close: `*ngIf="is_authorized && contest_state === 'LIVE'"` (line 129)
- Clone: `*ngIf="can_clone"` (line 114)
- Move to Draft: `*ngIf="is_authorized && contest_state === 'READY'"` (line 134)

The template is CORRECT. The faker is wrong.

### Chandru's findings
- "Live contests shouldn't be editable, but they're editable." ✅ Confirmed
- "Normal live contests — only clone & stop contest must be there. But edit & delete is there." ✅ Confirmed
- "Even closed state contests must not have edit & delete option." ✅ Confirmed

### Fix required
**`src/app/core/faker/contest.factory.ts`** — set `is_editable` based on state:
```ts
const editableStates = ['DRAFT', 'READY'];
is_editable: editableStates.includes(states[index]),
```

---

## 2. Force Close — State Transition and End Date

### Spec (real backend behavior)

When a LIVE contest is force-closed:
1. `contest_state` → **`ENDED`** immediately (NOT `CLOSED`)
2. `contest_end_date` → **updated to today's date** (time of force-close)
3. After 12–24 hours of backend processing: `contest_state` → `CLOSED`

The admin list template already handles `ENDED` state:
- `contest-list.component.html` line 85: shows `'ended_on'` label for `ENDED` or `CLOSED`
- The `ENDED` value is a valid state in the state filter dropdown

### Force Close dialog
`contest-list.component.ts` lines 254–255:
```ts
dialogRef.componentInstance.isCheckbox = true;
dialogRef.componentInstance.messageForCheckbox = 'confirm_declare_winner_for_contest';
```
- A **checkbox** ("Declare winner for this contest") is shown INSIDE the Force Close confirmation dialog.
- This is NOT a separate menu item — it is a field within the confirmation.
- The checkbox value is sent as `is_winner_declared: true/false` in the `PUT /contest/forced_close` payload.

### Chandru's findings
- "Its state will go to end state once force-stopped, but it's going to closed state." ✅ Confirmed (faker bug: goes to CLOSED; should go ENDED)
- "It will go to closed after 12 / 24 hours." ✅ Confirmed (two-phase transition)
- "Live contest games, if we force stop, the end-date will change from whenever to today." ✅ Confirmed (faker doesn't update end date)
- "In force stop menu, there's a 'declare winner' option." ✅ Confirmed — it's a checkbox in the dialog, not a separate menu item

### Fix required
**`src/app/core/interceptors/faker.interceptor.ts`** — `forced_close` stub:
```ts
if (url.includes('contest/forced_close')) {
  const c = this.contests.find(x => x.contest_id === body?.contest_id);
  if (c) {
    c.contest_state = 'ENDED';  // intermediate state (→ CLOSED after 12-24h in real backend)
    const today = new Date();
    c.contest_end_date = isoSpace(today);  // end date updated to force-close day
    c.force_closed_on = isoSpace(today);
  }
  return ok(null);
}
```

---

## 3. Contest Clone — Dates Reset to Today

### Spec (real backend behavior)

When a contest is cloned:
- `contest_state` → `DRAFT` ✅ (already correct in faker)
- `contest_start_date` → **today's date** (NOT the source contest's dates)
- `contest_end_date` → **today's date + 30 days** (or today, per spec)
- `contest_name` → `"{original name} (Copy)"`

### Chandru's finding
"If you clone a game, its start & end date will be set to today regardless of the game."

### Current faker behavior
Clone spreads `...src` which copies the source dates as-is. This is incorrect.

### Fix required
**`src/app/core/interceptors/faker.interceptor.ts`** — `copy_contest` stub:
```ts
const today = new Date();
const cloneEnd = new Date(today); cloneEnd.setDate(cloneEnd.getDate() + 30);
const clone = {
  ...src,
  contest_id: id,
  contest_name: src.contest_name + ' (Copy)',
  contest_state: 'DRAFT',
  contest_start_date: isoSpace(today),
  contest_end_date: isoSpace(cloneEnd),
  is_new: true,
  polling_identifier: `poll-${id}`,
};
```

---

## 4. Contest State and Date Display — List vs. Editor

### Spec

**List card** — `contest_state` field drives badge color. The UI does NOT recalculate state from dates. If the backend says `LIVE`, it shows `LIVE`.

**Editor** — no state badge exists. The SCHEDULE (publish) button is hidden when `isContestEditable = false`. For a LIVE contest, `is_editable = false` → the editor opens in view-only mode (inputs disabled, SCHEDULE button hidden). No "LIVE" label is shown in the editor — this is by design.

**"Ready only if assigned to a future date"** — this is backend-side validation. When `contest/publish` is called with a past start date, the backend rejects it. The frontend shows an error from `ErrorCode[message_code]`. No client-side gate.

### Chandru's findings
- "Outside, end date shows July 15 for contest, but when we go inside it's not showing that." — The editor uses a date-range slider that recomputes from contest dates. If the slider start/end are set correctly (via `isoSpace` format), dates should match. Verify `contest_start_date` and `contest_end_date` are space-separated in the detail response.
- "Start date was 30th June, but when we go inside, it should show live, but it's not showing live." — The editor has no LIVE indicator. This is an existing design gap; the header shows the contest name and date slider, not the state.
- "It should only be in ready state if it's assigned to a future date." — Backend enforced. Not a faker issue.

---

## 5. Live Contest — Property Dialog Editability

### Spec

For a LIVE contest (`is_editable = false`, `isContestEditable = false`):
- The game table row actions (delete game, edit game) should be hidden/disabled.
- Property icon dialogs (Rules, Rewards, Add Players / Scheduling) are NOT gated by `isContestEditable` at the icon level — they open regardless.
- Inside each dialog, the viewMode flag (`[viewMode]="!contestService.isContestEditable"`) controls whether fields are editable. The `app-search` component (Add Players) respects `[viewMode]="true"` to show read-only mode.

### Chandru's finding
"For live games: Rules, Rewards, Scheduling is not there, but it can't be live without those things."

This is not a code bug — it means the **demo data** (faker) has a LIVE contest that never had Rules/Rewards/Scheduling configured. The faker should pre-populate contest `contest_rule` and `trophy_url` for LIVE contests to demonstrate they had been set up before going live.

The actual editability of these dialogs during LIVE is intentionally permitted (admins CAN adjust rules/rewards for an ongoing contest). The "shouldn't be editable" note from Chandru may refer to the prototype showing Edit in the **context menu** for LIVE contests (addressed in §1 above), not to the property dialogs themselves.

---

## 6. Contest Property Dialogs — Deeper Audit Findings

### 6a. Trophy Dialog — Save Is a No-Op

`contest-trophy.component.ts` line 28:
```ts
save() {
  this.cancel();  // closes dialog without any API call
}
```

**Spec:** The trophy dialog is effectively read-only. Any `trophy_url` / trophy `name` / `description` displayed is already on the contest object from the list/detail API. There is no edit-and-save flow wired in the prototype.

**Implication:** The "Trophy" property icon fill state (`property-icon-filled`) is hardcoded `true` in the editor template and does NOT reflect actual presence of trophy data. To demo the icon as filled, the factory must pre-populate `trophy_url` and related fields on LIVE/READY contests.

**No code fix needed** in the dialog itself — this is by design (save UI was cut). Factory fix F-5 covers the data side.

---

### 6b. Notification Dialog — No API Wired

`contest-notification.component.ts` line 24:
```ts
saveNotification() {
  console.log(this.notification);  // stub only
}
```

**Spec:** The notification dialog is a prototype placeholder. No notification API endpoint is called. The property icon for notifications is not present in the contest editor (no `notification` property icon in the current template). No fix needed — out of scope for demo.

---

### 6c. Configuration Preview — Game Count Shows as Empty

When `publishContest()` succeeds, `add-contest-header.component.ts` line 423:
```ts
const configPreview = this.dialog.open(ConfigurationPreviewComponent, {
  data: this.contest
});
```

`this.contest` here is `contestService.getContestDetails()` — the contest object. This object does NOT have a `game_details` array. The template reads:
```html
{{data?.game_details?.length}}   <!-- shows nothing -->
{{data?.rewards?.reward_desc}}   <!-- shows nothing unless rewards set in contest obj -->
```

**Real behavior:** The publish response returns the full updated contest including game count and reward summary.

**Fix needed in faker:** The `contest/publish` stub should return a contest object with `game_details: [...]` (the current games list) and `rewards: { reward_desc: '...' }`. The header component then passes the publish response data (not just `this.contest`) to the dialog.

Actually — re-reading the header code, it passes `this.contest` (the in-memory object), not the publish API response. So if `this.contest.rewards` and `this.contest.game_details` are set from earlier calls, they'd show. The root cause is that the contest object used for the preview only has what was initially loaded — `game_details` is never added to `this.contest` since `getContestGames()` stores to a separate component property.

**Fix:** Either update the header to enrich `this.contest` before opening the preview, or accept blank game count / reward in the demo. Low priority — preview dialog is a success confirmation, not a data view.

---

### 6d. Create Contest — Crash on Empty Audience (No Filters Applied)

`create-contest.component.ts` `getRecipients()` lines 239–241:
```ts
recipients = this.preparePayloadForCustomFields(uniqueFilters, limit, recipients);
payload['recipients'] = [{
  'recipient_type': recipients[0].key_id === 'custom_audience' ? 'AUDIENCE_BASED' : 'FIELDS_BASED',
```

If `appliedFilters` is empty (user clicked "Create Contest" without selecting any audience filter), then `uniqueFilters` is empty, `recipients = []`, and `recipients[0]` is `undefined` → TypeError crash.

**Spec / Real behavior:** The real backend accepts an empty recipients array (creates a contest with no audience), handled gracefully. The prototype crashes before the API call.

**Fix:** Guard in `getRecipients()`:
```ts
const recipientType = recipients.length > 0
  ? (recipients[0].key_id === 'custom_audience' ? 'AUDIENCE_BASED' : 'FIELDS_BASED')
  : 'FIELDS_BASED';
```

**Priority:** 🔴 — crashes the Create Contest flow if the tester does not select a player filter.

---

## 7. Add Games In Contest — Category Filter Key Mismatch

`add-games-in-contest.component.ts` line 155:
```ts
this.gameCategory = response.data.category_list;
```

The faker stub for `category/retrieve_game_category` returns:
```ts
{ game_category_list: [...] }
```

The component reads `category_list` (not `game_category_list`) → `this.gameCategory` stays undefined → the category sidebar in "Add Games" dialog is blank.

Additionally, the stub uses `category_id` as the item key, but the filter payload at line 209 reads:
```ts
game_category_ids: this.filterIdsFromArrayOfObjects(this.selectedCategory, 'game_cat_id')
```

So items need `game_cat_id` not `category_id`.

**Fix in `faker.interceptor.ts`:**
```ts
if (url.includes('category/retrieve_game_category'))
  return ok({ category_list: [
    { game_cat_id: 1, category_name: 'Sales', game_count: 5 },
    { game_cat_id: 2, category_name: 'Product Knowledge', game_count: 8 },
    { game_cat_id: 3, category_name: 'Compliance', game_count: 3 },
  ]});
```

**Priority:** 🟡 — categories show empty in Add Games modal; doesn't block adding games.

---

## 8. Summary of Faker Fixes Required

| # | File | Change | Priority |
|---|------|--------|----------|
| F-1 | `contest.factory.ts` | `is_editable: false` for LIVE and CLOSED states | 🔴 |
| F-2 | `faker.interceptor.ts` | `forced_close` → state=`ENDED`, update `contest_end_date` to today | 🔴 |
| F-6 | `create-contest.component.ts` | Guard `recipients[0]` access when `appliedFilters` is empty | 🔴 |
| F-3 | `faker.interceptor.ts` | `copy_contest` → reset clone start/end dates to today / today+30 | 🟡 |
| F-4 | `faker.interceptor.ts` | `forced_close` → set `force_closed_on` to today | 🟡 |
| F-5 | `contest.factory.ts` | Pre-populate `contest_rule` / `trophy_url` for LIVE contests | 🟡 |
| F-7 | `faker.interceptor.ts` | `category/retrieve_game_category` → return `category_list` with `game_cat_id` | 🟡 |

No component code changes needed for F-1 through F-7 — all are faker data-fidelity fixes.

---

## 9. Trophy Dialog — Crash When Opening (Factory Shape Mismatch)

**Root cause:** `add-contest-header.component.ts` opens `ContestTrophyComponent` with:
```ts
data: { 'property': property, 'contestTrophy': this.contest.trophy }
```

The `contest-trophy.component.html` then accesses:
```html
{{trophyDetails.name}}   <!-- trophyDetails set from data.contestTrophy -->
```

`this.contest` is populated from `contest/contest_details` → `res.data.contest_description` → the factory object. The factory has `trophy_url` (a string) but **no `trophy` field** (an object). So `this.contest.trophy = undefined` → `trophyDetails = undefined` → Angular template crash: `Cannot read properties of undefined (reading 'name')`.

**Expected shape:**
```ts
trophy: {
  contest_id: 100,
  name: 'Sales Champion',
  description: 'Awarded to top 3 players',
  img_url: 'https://fake-static.s3.amazonaws.com/trophy.png'
}
```

**Fix in `contest.factory.ts`:**
```ts
trophy: states[index] === 'LIVE' ? {
  contest_id: 100 + index,
  name: 'Sales Champion Trophy',
  description: 'Top 3 players by total wins take the prize.',
  img_url: 'https://fake-static.s3.amazonaws.com/trophy.png'
} : null,
```

**Priority:** 🔴 — crashes when clicking the Trophy property icon on a LIVE contest.

| # | File | Change | Priority |
|---|------|--------|----------|
| F-8 | `contest.factory.ts` | Add `trophy` object field with `{name, description, img_url, contest_id}` for LIVE contests | 🔴 |

---

## 10. Rewards — Pre-Population for LIVE Contests

**Root cause:** `add-contest-header.component.ts` opens `ContestRewardComponent` with `this.contest.rewards`. The factory has no `rewards` field. The component falls back gracefully to `{}`, so no crash — but LIVE contests open the Rewards dialog with all fields blank, which looks broken in demo.

**Expected shape:**
```ts
rewards: {
  reward_id: 1,
  category_id: 1,
  reward_name: '$50 Amazon Gift Card',
  reward_desc: '$50 Amazon Gift Card'
}
```

**Fix in `contest.factory.ts`:**
```ts
rewards: states[index] === 'LIVE' ? {
  reward_id: 1, category_id: 1,
  reward_name: '$50 Amazon Gift Card',
  reward_desc: '$50 Amazon Gift Card'
} : null,
```

**Priority:** 🟡 — no crash, but demo looks incomplete.

| # | File | Change | Priority |
|---|------|--------|----------|
| F-9 | `contest.factory.ts` | Add `rewards` object field for LIVE contests | 🟡 |

---

## 11. Debug Console.log Cleanup

Found during audit of `add-contest-header.component.ts` and `create-contest.component.ts`:

- `add-contest-header.component.ts` lines 135, 176, 179, 181, 183, 191, 463, 464, 479: 9 `console.log()` statements left from development
- `create-contest.component.ts` lines 218, 635: 2 `console.log()` statements

None affect behavior but clutter the browser console during demo. Low priority cleanup.

| # | File | Change | Priority |
|---|------|--------|----------|
| F-10 | `add-contest-header.component.ts` | Remove ~9 debug console.log statements | 🟢 Low |
| F-11 | `create-contest.component.ts` | Remove 2 debug console.log statements | 🟢 Low |

---

## 12. Contest Card Flags — `is_new` and `is_autopilot`

Found in `contest-list.component.html` and `contest.factory.ts`:

### `is_new`
- Set to `true` on freshly-cloned contests immediately after creation.
- Drives a **"NEW" badge** overlay on the contest card.
- Cleared by the backend asynchronously (when the clone copy job completes, `is_new` goes `false`).
- In the faker, `copy_contest` sets `is_new: true`; `mlg/copy_mlg_progress` returns 100 → client clears `polling_identifier`, but `is_new` remains until the next full list refresh.

### `is_autopilot`
- Set `true` for contests created through the **Autopilot** flow (a different creation dialog not present in this admin prototype).
- Drives an **"Autopilot" badge** on the contest card (displayed alongside the state badge).
- Autopilot contests follow the same state machine (DRAFT → READY → LIVE → CLOSED) but have additional autopilot-specific settings (repeat cadence, auto-publish).
- In the prototype, `is_autopilot: true` is set on the first 2 contests in the factory to make the badge visible.

### `polling_identifier`
- Non-null while a contest is being cloned (background copy job running).
- While non-null: the options menu (⋮) is hidden entirely — no context menu for in-progress clones.
- The "Duplicating..." spinner overlay appears on the card.
- Client polls `GET mlg/copy_mlg_progress?polling_identifier=poll-{id}` every 5 seconds.
- When `question_copy_progress === 100`: client clears `polling_identifier` on that contest → overlay disappears, menu re-appears.

---

## 13. Role-Based Access — MM vs Admin

The access type (`access_type` field from `users/get_user_information`) controls several contest list behaviors:

| Feature | Admin (`A`) | Mid-Manager (`MM`) |
|---------|-------------|---------------------|
| See all company contests | ✅ | ❌ — only sees contests they own (`owner_id = manager_id`) |
| Create contest | ✅ | ✅ (via FAB) |
| Clone any contest | ✅ | ❌ — `can_clone` may be false for contests not owned |
| Force Close | ✅ (`is_authorized`) | ❌ — `is_authorized` is false for MM |
| Move to Draft | ✅ | ❌ — same gate |
| Options menu on DRAFT when MM | ❌ — hidden entirely | N/A |
| Add Games filter | shows all games | only shows games owned by MM |

The faker currently sets `access_type: 'A'` (admin) in the user stub — MM-specific restrictions are untested in the prototype.

---

## 14. Contest List — Filter Endpoints

The contest list "Add a filter" chip supports these filter dimensions:

| Filter | Type | API / Behavior |
|--------|------|---------------|
| Contest Name | Text | `contest_name` query param on `contest/retrieve_contests` |
| State | Static list | `contest_state` values: live / ready / draft / closed / ended |
| Owner | List search | `GET game/owners?company_id=1` → `{ owner_list: [{manager_id, first_name, last_name}] }` |
| Date Range | Date picker | Today / This Week / This Month / Last Month / Custom → `date_range` param |

**Owner filter endpoint:** `game/owners` (not `manager/retrieve_game_owners`). The faker has `manager/retrieve_game_owners` stubbed but not `game/owners`. If the contest list owner filter shows empty, this is why.

**Fix needed:**
```ts
if (url.includes('game/owners') || url.includes('contest/owners'))
  return ok({ owner_list: [{ manager_id: 42, first_name: 'John', last_name: 'Doe' }] });
```

---

## 15. Error Code Handling — Contest Operations

The frontend uses `ErrorCode[response.message_code]` to look up human-readable error text. Key codes that surface in snackbars / alert dialogs:

| Code | When triggered | UI response |
|------|---------------|-------------|
| `CONTEST_GAME_LIVE_RESTRICTION` | Delete game from contest while game is LIVE | `AlertComponent` dialog |
| `RESTRICT_GAME_DELETE_ON_CONTEST_MLG` | Remove game that's in an MLG contest | `AlertComponent` dialog |
| `CONTEST_NAME_ALREADY_EXISTS` | Creating contest with duplicate name | Snackbar error |
| `CONTEST_DATE_RANGE_INVALID` | Publishing with past start date | Alert dialog (blocks publish) |
| `VALID_START_DATE_NOT_REACHED` | `validStartDate` check before editor loads | Alert dialog |

The faker returns `success: true` for all operations — none of these error paths are exercised. For demo robustness, this is acceptable. For a more complete prototype, stub specific failure cases.

---

## 16. `scheduling_filters` Company Flag

`contest-list.component.html` line 85 (schedule-contest template line 28):
```html
<div class="scheduling-filters" *ngIf="storedCompany.scheduling_filters">
```

If `storedCompany.scheduling_filters === true`, an additional scheduling filter panel appears in the Add Players dialog, allowing "Disjunction" vs "Conjunction" player matching.

The faker's company stub sets `scheduling_filters: false` → this panel is hidden. This is correct for the standard demo. If a company has this feature enabled, it reveals a radio-button UI for AND/OR filter logic.

No fix needed — document only.
