# Game Library — Full Feature Spec & Fidelity Analysis

**Date:** 2026-07-01  
**Sources:** QA session with Chandru (lead tester), `game-list.component.ts/html`, `schedule-game.component.ts`, `permissions.service.ts`, `faker.interceptor.ts`, `game.factory.ts`.

---

## 1. Game Types in Scope

| Type | Code | Demo Scope |
|------|------|-----------|
| Single-Player Game (SLG) | `game_type: 1` | ✅ Full demo coverage |
| Multi-Player Game (MLG) | `game_type: 3` | ❌ Out of scope — Chandru confirmed MLG does not need to work for this demo |

---

## 2. SLG Context Menu — Full Expected Options

Per Chandru and `game-list.component.html` analysis, the full context menu for an SLG should be:

| Menu Item | Condition | Status |
|-----------|-----------|--------|
| Schedule | `game_state === 'LIVE' && game_type === 1 && isEditable && !is_archived` OR `game_state === 'READY'` | ✅ Wired |
| Pin / Remove Pin | `game_type === 1`, limit check | ✅ Wired |
| **Clone** | `game_state !== 'DRAFT' && gamePermission?.clone && !is_archived` | 🔴 **Missing** — see §3 |
| Add to Companies | admin-only, non-DRAFT SLG | ✅ Wired (admin only) |
| Add to Shop | admin-only, non-DRAFT SLG | ✅ Wired (admin only) |
| Edit | `isEditable && !is_shop_game && !is_archived` | ⚠️ Bug — shows for LIVE (see §4) |
| Archive | `isEditable && !is_archived` | ✅ Wired |
| Delete | `isEditable` | ⚠️ Bug — shows for LIVE (see §4) |
| Move to Drafts | READY SLG or LIVE MP | ✅ Wired |
| Move to Ready | DRAFT SLG | ✅ Wired |
| Company Game URL | `game_type !== 3 && !is_archived` | ✅ Wired |

---

## 3. Clone Option Missing — Root Cause

### Symptom
Clone does not appear in the SLG context menu even for LIVE/READY games.

### Root cause
`game-list.component.html` line 206:
```html
*ngIf="selectedgameState != 'DRAFT' && gamePermission?.clone && !selectedGameId?.is_archived"
```

`gamePermission` is loaded from `permissionService.getPermissions(PermissionsKey.GAME)`.

`permissions.service.ts` line 67 (hardcoded for demo):
```ts
game: { list: true, create: true, update: true, delete: true, add: true, show_games: true, show_schedules: true }
```

**`clone` key is absent** → `gamePermission?.clone = undefined` → Clone hidden for all games.

### Fix required
**`src/app/services/permissions/permissions.service.ts`** — add `clone: true` to the game permission object.

### Secondary fix — faker stub shape
`game-list.component.ts` lines 960–963 read:
```ts
cloneGame = data.game_details;           // component expects { game_details: {...} }
cloneGame.polling_identifier = data.polling_identifier;
```

Current `faker.interceptor.ts` stub returns `{ game_id, game_name, polling_identifier }` — missing `game_details`. This would cause a crash on clone.

**Fix faker stub to return:**
```ts
if (url.includes('game/copy_game')) {
  const clone = { ...src, game_id: newId, game_name: src.game_name + ' (Copy)', game_state: 'DRAFT' };
  return ok({ game_details: clone, polling_identifier: `pgame-${newId}` });
}
```

---

## 4. Edit and Delete Visible for LIVE Games

### Symptom
Edit and Delete appear in the context menu for LIVE SLG games.

### Root cause
`game-list.component.html`:
- Edit: `*ngIf="isEditable && !is_shop_game && !is_archived"` — no state check
- Delete: `*ngIf="isEditable"` — no state check

The `isEditable` flag comes from the game object's `is_editable` field. If the real backend sets `is_editable = false` for LIVE games, these would be hidden. Our `game.factory.ts` currently sets no explicit `is_editable` field (it's likely truthy by default).

### Expected behavior (per Chandru and backend)
- **LIVE SLG**: Edit and Delete should be hidden (server-side: `PUT game/update` and `DELETE game/delete` would be rejected).
- The backend returns `LIVE_GAME_DELETE_RESTRICTION` error on delete of a LIVE game — but the UI doesn't pre-hide the Delete option.
- The spec is that the UI should hide these proactively via `is_editable = false` from the API.

### Fix required
**`src/app/core/faker/game.factory.ts`** — set `is_editable: false` for LIVE games:
```ts
is_editable: game_state !== 'LIVE',
```

---

## 5. Game LIVE State Without Schedule — "Airmac" Issue

### Symptom
Airmac game (index 0 in factory) shows as `LIVE` but has no SLG assignment.

### Real backend rule
A game can only be in `LIVE` state if it has at least one active SLG scheduling assignment (`slg/retrieve_game_limit` returns at least one active entry). An unscheduled game cannot be LIVE.

### Current faker behavior
`game.factory.ts` hardcodes indices 0–7 as `'LIVE'` without corresponding SLG assignments in the interceptor's `this.slgAssignments` array.

### Fix required
Either:
- Change game states: only set `LIVE` for games that have a corresponding entry in `this.slgAssignments`
- Or: seed `this.slgAssignments` for each LIVE game

Recommended: Treat the first 3 LIVE games as having pre-seeded SLG assignments. Add entries to `slgAssignments` for game_ids 1–3.

---

## 6. SLG Schedule Screen — Live Game Behavior

### Spec (confirmed correct by Chandru)

For a **LIVE SLG**:
- ✅ You CAN edit attempt count (`slg/edit_game_attempts`)
- ✅ You CAN edit / update the schedule (`slg/edit_game_limit`)
- ✅ You CAN delete the schedule assignment (`slg/delete_game_limit`)
  - On delete of last assignment → game transitions from `LIVE` → `READY` (backend-enforced)
  - The frontend does NOT update `game_state` locally after delete; state reflects on next list refresh

### Current status
The `schedule-game.component` has no state-based editability gates. All edit/delete/add buttons are shown regardless of game state — **this is correct design for LIVE SLGs**.

No changes needed here. The faker stubs for SLG mutations (`slg/add_game_limit`, `slg/edit_game_limit`, `slg/delete_game_limit`, `slg/edit_game_attempts`) should exist. Check current coverage:

| Endpoint | Faker status |
|----------|-------------|
| `slg/retrieve_game_limit` | ✅ Stubbed |
| `slg/add_game_limit` | ⬜ Check |
| `slg/edit_game_limit` | ⬜ Check |
| `slg/delete_game_limit` | ⬜ Check |
| `slg/edit_game_attempts` | ⬜ Check |

---

## 7. Search Filters — "Add a Filter" in Game Library

### Filters defined in `game-list.component.ts` (lines 87–123)

| Filter Name | Type | Data Source | Faker Status |
|------------|------|-------------|-------------|
| Game Name | Text search | None (local) | ✅ Works |
| Win Rate | List search | Static local options | ✅ Works |
| Display Win Rate By | Multi-option | `company/get_company_custom_fields` + location/dept | ⚠️ Depends on custom fields fix |
| Type | List search | Static `gameType` array | ✅ Works |
| State | List search | Static `gameState` array | ✅ Works |
| Category | List search | `category/retrieve_game_category` | 🔴 Empty (stub returns `[]`) |
| Pathway | List search | `pathways/get` | 🔴 Empty (stub returns `[]`) |
| Owner | List search | `manager/retrieve_game_owners` | ✅ 1 owner stubbed |
| Archive | Toggle | None (local flag) | ✅ Works |

### Category filter — TWO different endpoints (important)

The game library uses **two different category services** for two different contexts:

| Context | Service | Endpoint | Response key expected |
|---------|---------|----------|-----------------------|
| Game Library sidebar filter | `gamesService.getGameCategories()` | `game/game_categories` | `game_category_list[].{ game_cat_id, category_name }` |
| Add Games in Contest sidebar | `gameCategoryService.getGameCategory()` | `category/retrieve_game_category` | `category_list[].{ game_cat_id, category_name }` |

**Current faker state:**
- `game/game_categories` → returns `{ game_category_list: [] }` — stub exists but empty, and items should use `game_cat_id` not `category_id`
- `category/retrieve_game_category` → returns `{ game_category_list: [...] }` — **wrong response key** (`game_category_list` vs `category_list`) AND `category_id` vs `game_cat_id`

**Fix for game library filter (`game/game_categories`):**
```ts
if (url.includes('game/game_categories') || url.includes('game_categories'))
  return ok({ game_category_list: [
    { game_cat_id: 1, category_name: 'Sales', game_count: 5 },
    { game_cat_id: 2, category_name: 'Product Knowledge', game_count: 8 },
    { game_cat_id: 3, category_name: 'Compliance', game_count: 3 },
  ]});
```

**Fix for Add Games in Contest (`category/retrieve_game_category`):**
```ts
if (url.includes('category/retrieve_game_category'))
  return ok({ category_list: [
    { game_cat_id: 1, category_name: 'Sales', game_count: 5 },
    { game_cat_id: 2, category_name: 'Product Knowledge', game_count: 8 },
    { game_cat_id: 3, category_name: 'Compliance', game_count: 3 },
  ]});
```

### Pathway filter — status

`pathways/get` is already stubbed in `faker.interceptor.ts`:
```ts
return ok({ pathways: [
  { pathway_id: 1, pathway_name: 'Onboarding Track' },
  { pathway_id: 2, pathway_name: 'Sales Certification' },
]});
```
✅ No change needed.

### Search filter interaction pattern — important note
All `is_list_search` filter options (Category, Pathway, Owner) use `(mouseenter)` to load sub-data — NOT `(click)`. `callTochiprequest()` in `search.component.ts` fires on `mouseenter` with an 800ms debounce (`window.setTimeout(..., 800)`). Playwright tests using `click()` on these options will not trigger the data load. Tests must use `page.mouse.move()` + wait ≥ 1000ms, or test via API call assertions rather than UI content.

---

## 8. Summary of Faker / Code Fixes Required

| # | File | Change | Priority | Status | Chandru finding |
|---|------|--------|----------|--------|-----------------|
| G-1 | `permissions.service.ts` | Add `clone: true` to game permissions | 🔴 | ✅ Done | "Missing Clone option" |
| G-2 | `faker.interceptor.ts` | Fix `game/copy_game` stub shape → `{ game_details: {...} }` | 🔴 | ✅ Done | Clone crash |
| G-3 | `game.factory.ts` | `is_editable: false` for LIVE games | 🟡 | ✅ Done | Edit/Delete visible for live |
| G-4 | `game.factory.ts` / `faker.interceptor.ts` | Seed SLG assignments for LIVE game indices | 🟡 | ✅ Done | "Airmac is live but not scheduled" |
| G-5a | `faker.interceptor.ts` | `game/game_categories` → real data with `game_cat_id` | 🟡 | ✅ Done | "Search filters must work" |
| G-5b | `faker.interceptor.ts` | `category/retrieve_game_category` → fix key to `category_list`, use `game_cat_id` | 🟡 | ✅ Done | Category empty in Add Games |
| G-6 | `faker.interceptor.ts` | Pathway stub with real data | 🟡 | ✅ Done | "Search filters must work" |
| G-7 | `faker.interceptor.ts` | SLG mutation stubs | 🟡 | ✅ Done | "Edit attempts + schedule while live" |
| G-8 | `faker.interceptor.ts` | `game/copy_questions_progress` stub — missing stub caused network error on clone polling | 🔴 | ✅ Done | Backend audit |
| G-9 | `faker.interceptor.ts` | Clone: set `polling_identifier` on game in `this.games` array (overlay watches game object, not response) | 🔴 | ✅ Done | Backend audit |

---

## 9. Game Card Layout — Fields Displayed

Each game card in the library shows:

| Field | Source | Notes |
|-------|--------|-------|
| Game name | `game_name` | Truncated if long |
| Game logo | `game_logo` / `game_image_url` | Falls back to default icon if empty |
| State badge | `game_state` | LIVE / READY / DRAFT / ARCHIVED |
| Category | `game_category` | String name, not id |
| Owner | `owner_first_name + owner_last_name` | Hidden if MM owns it and viewing own games |
| Win rate | `win_rate` | Shown as percentage; null = `--` |
| Pinned indicator | `is_pinned` | Pin icon overlay if true |
| Autopilot badge | Not applicable to games | N/A |
| "Duplicating..." overlay | `polling_identifier !== null` | Shown while clone is in progress |

**Factory fields required:** `game_name`, `game_state`, `game_category` (string), `owner_first_name`, `owner_last_name`, `win_rate`, `is_pinned`, `game_logo`, `game_type`.

---

## 10. Pin / Unpin — Full Behavior

**Endpoint:** `POST pinned_games/pin_unpin`
**Body:** `{ game_id, is_pinned: true/false }`
**Response:** `{ pinned_games: [...] }` — full list of currently pinned games

**Limit:** 10 pinned games per company maximum.
- If limit reached and `is_pinned: true`: backend returns `{ success: false, message_code: 'pin_game_limit_reached' }` → UI shows limit-exceeded alert.
- Only SLG games (`game_type === 1`) can be pinned. Attempt to pin MP (`game_type === 3`) → `{ success: false, message_code: 'UNABLE_TO_PIN_MULTIPLAYER_GAMES' }`.
- `pin_game_limit_reached` flag on `game/retrieve_games` response controls whether the Pin option is shown at all (even for non-pinned games).

**Faker behavior:** Stateful — `is_pinned` flag toggled on game object; limit enforced at 10; MP block enforced.

---

## 11. Archive / Unarchive — Full Flow

**Archive endpoint:** `POST game/archive`  
**Body:** `{ game_id }`  
**Effect:** `game_state → 'ARCHIVED'`, `is_archived → true`

**Unarchive (Move to Library):** `POST game/unarchive`  
**Body:** `{ game_id }`  
**Effect:** `game_state` reverts to previous state (typically `READY`), `is_archived → false`

**Context menu behavior:**
- When `is_archived: false`: shows "Archive" (`isEditable && !is_archived`)
- When `is_archived: true`: shows "Move to Library" (`isEditable && is_archived`); hides Schedule, Pin, Clone, Edit, Delete, Add to Companies, Add to Shop
- Archived games are NOT shown in the default game list. Shown only when the "Archived" toggle filter is applied.

**Faker behavior:** Stateful — `game_state` set to `'ARCHIVED'`, `is_archived` toggled. The archived filter (`is_archived` query param on `game/retrieve_games`) filters the list.

---

## 12. Move to Drafts / Move to Ready — Full Flow

**Move to Drafts:**
- Shown for: READY SLG (`game_state === 'READY' && game_type === 1`) OR LIVE MP (`game_state === 'LIVE' && game_type !== 1`)
- Endpoint: `POST game/update_game_state` with `{ game_id, game_state: 'DRAFT' }`
- Response shape (on failure): `{ success: false, data: { game_is_valid: false, error_list: [...] } }` — errors shown in a dialog listing what's wrong with the game

**Move to Ready:**
- Shown for: DRAFT SLG (`game_state === 'DRAFT' && game_type === 1`)
- Endpoint: `POST game/update_game_state` with `{ game_id, game_state: 'LIVE', game_mode: 'CONTEST' }`
- Same error response pattern

**Faker behavior:** Stateful — `game.game_state` updated. Returns `{ game_state: newState, game_is_valid: true }` for success.

---

## 13. Admin-Only Context Menu Items

These items appear ONLY when `access_type === 'A'` (admin role, not MM):

### Add to Companies
- Shown for non-DRAFT, non-archived SLG when user is admin
- Opens a dialog to share the game across multiple companies
- Endpoint: `POST game/add_to_companies` with `{ game_id, company_ids: [...] }`
- Faker stub needed: `return ok({ success: true })`
- Not required for standard demo (MM role not tested)

### Add to Shop
- Shown for non-DRAFT, non-archived SLG when user is admin
- Makes the game available in the game shop for other companies to discover
- Endpoint: `POST game/add_to_shop` with `{ game_id }`
- Faker stub: `return ok(null)`

Both items are already wired in `game-list.component.html` but hidden for the demo's `access_type: 'A'` user... actually — the user IS admin (`access_type: 'A'`), so these WILL appear. Both endpoints need stubs to avoid network errors.

---

## 14. Company Game URL

**Shown for:** `game_type !== 3 && !is_archived` (all non-archived SP games and most others)

**Behavior:** Copies a shareable URL to the clipboard. The URL format:
```
{base_url}/game/{game_hash_id}
```
Where `game_hash_id` is from the game object (e.g. `hash-123` in the faker).

**No API call** — purely client-side clipboard write. Uses `navigator.clipboard.writeText()` or a legacy `document.execCommand('copy')` fallback.

**Faker requirement:** `game_hash_id` field must be present on game objects. `GameFactory` already sets `game_hash_id: 'hash-{game_id}'`.

---

## 15. Delete LIVE Game — Error Handling

When a LIVE game is deleted via the context menu:
1. Client calls `DELETE game/delete?game_id={id}&company_id=1`
2. Backend (and faker) returns: `{ success: false, message_code: 'LIVE_GAME_DELETE_RESTRICTION', data: null }`
3. `game-list.component.ts` checks `!response.success` → opens `AlertComponent` dialog with the localized error message for `LIVE_GAME_DELETE_RESTRICTION`
4. Game remains in list

The faker correctly enforces this: LIVE games are blocked, non-LIVE games are removed. The `is_editable: false` fix (G-3) hides the Delete option for LIVE games before this error path is even reachable — but the backend gate remains as a double guard.

---

## 16. `game_schedule` Endpoints — Custom Schedule for Games

`game_schedule/get_limits` and `game_schedule/get_custom_managers` are called by the schedule-game screen when loading the scheduling UI for certain game types.

| Endpoint | Purpose | Current stub |
|----------|---------|-------------|
| `game_schedule/get_limits` | Loads existing schedules in custom schedule view | Returns `{ game_schedule_list: [] }` ✅ |
| `game_schedule/get_custom_managers` | Loads manager list for assigning schedules | Returns 1 manager ✅ |

These are already stubbed with correct shapes. Document only.

---

## 17. Win Rate "Display By" Filter — Behavior

The "Display Win Rate By" filter in the game library sidebar is a **multi-option menu** that changes how win rate is broken down in the game detail view (not the list card — the list card always shows `win_rate` as a flat percentage).

Options available depend on `company/get_company_custom_fields`:
- Location (`location_ids` key)
- Department (`department_ids` key)
- Any custom fields

This filter does NOT call an additional API when selected — it updates a local state variable (`displayWinRateBy`) that affects how the game detail/leaderboard page groups win rate data when navigated to.

For the game LIST view, this filter has no visible effect since win rate breakdown is only shown on the game detail page (not built in this prototype). Safe to leave as-is.

---

## 18. Role-Based Access in Game Library

| Feature | Admin (`A`) | Mid-Manager (`MM`) |
|---------|-------------|---------------------|
| See all company games | ✅ | ✅ |
| Create game | ✅ | ✅ (if `create: true` in permissions) |
| Clone game | ✅ (with `clone: true` permission) | ✅ (same gate) |
| Add to Companies | ✅ | ❌ — admin check in template |
| Add to Shop | ✅ | ❌ — admin check in template |
| Schedule game | ✅ | ✅ |
| Delete game | ✅ | ✅ (if `is_editable`) |
| Archive game | ✅ | ✅ (if `is_editable`) |
| Pin game | ✅ | ✅ |

The faker sets `access_type: 'A'` → Add to Companies and Add to Shop ARE shown. Both need stubs (see §13).
