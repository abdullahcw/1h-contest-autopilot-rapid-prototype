# Game Library — Implementation Tasks

Tracks faker mock fidelity and code fixes for the Game Library screen. Reference: `specs/game-library.md`.

---

## Status

| # | Task | Priority | Status | Chandru finding |
|---|------|----------|--------|-----------------|
| G-1 | Add `clone: true` to `permissions.service.ts` game permission object | 🔴 High | ✅ Done | "Clone option missing" |
| G-2 | Fix `game/copy_game` faker stub — wrong shape, component reads `data.game_details` | 🔴 High | ✅ Done | Clone crash |
| G-3 | Set `is_editable: false` for LIVE games in `game.factory.ts` | 🟡 Med | ✅ Done | Edit/Delete visible for LIVE |
| G-4 | Seed SLG assignments for LIVE game indices (games that are "live" should have schedules) | 🟡 Med | ✅ Done | "Airmac is live but not scheduled" |
| G-5 | Fix `game/game_categories` stub — game library Category filter reads `game_cat_id` not `category_id` | 🟡 Med | ✅ Done | "Search filters must work" |
| G-5b | Fix `category/retrieve_game_category` stub — id field is `game_cat_id` not `category_id` (Category Mgmt screen) | 🟡 Med | ✅ Done | Category Management screen |
| G-6 | Add Pathway filter stub (`pathways/get`) with 2 pathways | 🟡 Med | ✅ Done | "Search filters must work" |
| G-7 | Verify SLG mutation stubs: add/edit/delete_game_limit, edit_game_attempts | 🟡 Med | ✅ Done | "Edit attempts + schedule while live" |
| G-8 | `game/copy_questions_progress` stub (no stub → network error during clone progress polling) | 🔴 High | ✅ Done | Backend audit — clone polling crash |
| G-9 | Set `polling_identifier` ON cloned game in `this.games` (component watches game object, not response) | 🔴 High | ✅ Done | Backend audit — "Duplicating..." overlay never showed |

---

## Task Details

### G-1. Add `clone: true` to game permissions 🔴

**File:** `src/app/services/permissions/permissions.service.ts`

**Problem:** `game-list.component.html` line 206 gates Clone on `gamePermission?.clone`. The hardcoded permissions object has no `clone` key → undefined → Clone hidden for all games.

**Fix:**
```ts
game: {
  list: true, create: true, update: true, delete: true, add: true,
  show_games: true, show_schedules: true,
  clone: true,   // ← add this
},
```

---

### G-2. Fix `game/copy_game` faker stub shape 🔴

**File:** `src/app/core/interceptors/faker.interceptor.ts`

**Problem:** Component reads `data.game_details` but stub returns `{ game_id, game_name, polling_identifier }` — crash on clone.

**Fix:**
```ts
if (url.includes('game/copy_game')) {
  const srcId = body?.game_id || this.games[0].game_id;
  const src = this.games.find(g => g.game_id === srcId) || this.games[0];
  const newId = this.games.length ? Math.max(...this.games.map(g => g.game_id)) + 1 : 9000;
  const clone = { ...src, game_id: newId, game_name: src.game_name + ' (Copy)', game_state: 'DRAFT', is_editable: true };
  this.games.unshift(clone);
  return ok({ game_details: clone, polling_identifier: `pgame-${newId}` });
}
```

---

### G-3. `is_editable: false` for LIVE games 🟡

**File:** `src/app/core/faker/game.factory.ts`

**Problem:** LIVE game shows Edit and Delete in context menu. Backend sets `is_editable = false` for LIVE games.

**Fix:** In `GameFactory.one()`:
```ts
is_editable: game_state !== 'LIVE',
```

---

### G-4. Seed SLG assignments for LIVE games 🟡

**File:** `src/app/core/interceptors/faker.interceptor.ts`

**Problem:** `game.factory.ts` marks indices 0–7 as LIVE but `this.slgAssignments` starts empty — inconsistent with real backend where LIVE = has active schedule.

**Fix:** In `FakerInterceptor` constructor, pre-seed assignments for first 3 LIVE games:
```ts
this.slgAssignments = [
  { assignment_id: 'slg-1', game_id: this.games[0].game_id, /* start/end/attempts */ },
  { assignment_id: 'slg-2', game_id: this.games[1].game_id },
  { assignment_id: 'slg-3', game_id: this.games[2].game_id },
];
```

---

### G-5. Category filter stub 🟡

**File:** `src/app/core/interceptors/faker.interceptor.ts`

**Problem:** `category/retrieve_game_category` returns `{ game_category_list: [] }` — Category filter shows empty.

**Fix:**
```ts
if (url.includes('category/retrieve_game_category'))
  return ok({ game_category_list: [
    { category_id: 1, category_name: 'Sales' },
    { category_id: 2, category_name: 'Product Knowledge' },
    { category_id: 3, category_name: 'Compliance' },
  ]});
```

---

### G-6. Pathway filter stub 🟡

**File:** `src/app/core/interceptors/faker.interceptor.ts`

**Problem:** `pathways/get` returns `{ pathways: [] }` — Pathway filter shows empty.

**Fix:**
```ts
if (url.includes('pathways/get') || url.includes('pathway/retrieve'))
  return ok({ pathways: [
    { pathway_id: 1, pathway_name: 'Onboarding Track' },
    { pathway_id: 2, pathway_name: 'Sales Certification' },
  ]});
```

---

### G-7. Verify SLG mutation stubs 🟡

Check that these stubs exist and return valid shapes:

| Endpoint | Expected response |
|----------|------------------|
| `slg/add_game_limit` | `{ assignment_id: 'slg-new' }` |
| `slg/edit_game_limit` | `{ assignment_id: body.assignment_id }` |
| `slg/delete_game_limit` | `null` |
| `slg/edit_game_attempts` | `null` |

If missing, add them before the catch-all in `faker.interceptor.ts`.
