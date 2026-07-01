# Contest Flow — Full Feature Analysis

**Sources:** `contest-core-service` (Spring Boot), `1huddle-admin-client-fresh` Angular source, `faker.interceptor.ts`, `contest.factory.ts`.

---

## 1. State Machine

### Backend states (`ContestStates` enum)
```
SCHEDULED → ASSIGNED → STARTED → STOPPED / STOPPED_NOW → ENDED → CLOSED
```

| Backend State | Admin UI Label | Meaning |
|---|---|---|
| `SCHEDULED` | `READY` | Contest created + players assigned, not yet started |
| `ASSIGNED` | `READY` | Assignment confirmed, games attached |
| `STARTED` | `LIVE` | Contest in progress |
| `STOPPED` | `LIVE` (transitioning) | Scheduled stop; still shows as live until ended |
| `STOPPED_NOW` | `LIVE` (force-closing) | Immediate stop triggered by admin |
| `ENDED` | `CLOSED` | Contest window has passed |
| `CLOSED` | `CLOSED` | Fully closed; winner declared or force-closed |

### Frontend display states (what the UI and `contest_state` field actually carry)

The admin client never uses backend enum strings directly. The API layer normalizes them. The UI template branches on these four values:

| Value | Color class | When |
|---|---|---|
| `DRAFT` | `.draft-color` | Just created, no assignment published |
| `READY` | `.ready-color` | Published (`contest/publish`), awaiting start date |
| `LIVE` | `.live-color` | Active between start and end datetime |
| `CLOSED` | `.closed-color` | Ended or force-closed |

The `ENDED` state also appears in the filter dropdown and the library card uses: `contest_state === 'ENDED' || contest_state === 'CLOSED'` for date display logic.

### State transitions visible in admin

```
DRAFT ──publish──► READY ──(auto at start_date)──► LIVE ──(auto/force-close)──► CLOSED
         ▲                                              │
         └──── move_to_draft ────────────────────────── ┘ (READY only)
```

- **DRAFT** → **READY**: `contest/publish` (POST). No validation gates on the frontend beyond date range check.
- **READY** → **DRAFT**: `contest/ready_to_draft` (PUT). Only available when `contest_state === 'READY'` and `is_authorized`.
- **LIVE** → **CLOSED**: `contest/forced_close` (PUT). Only available when `contest_state === 'LIVE'` and `is_authorized`. Admin picks whether to declare winner.
- **LIVE / READY / DRAFT** → **deleted**: `contest/delete` (DELETE). No blocking check on frontend for LIVE contests — backend handles any restriction.

---

## 2. Contest Library (List Screen)

**Route:** `/admin/contests`  
**Component:** `ContestListComponent`  
**API:** `contest/retrieve_contests` (GET)

### List endpoint params
```
sort_by=created_on&order=desc
&start_index=0&limit=10        (pagination)
&company_id=1
&contest_name=...              (filter — text search)
&contest_state=live|ready|draft|closed|ended
&owner_id=...                  (filter — manager ID)
&date_range=2026-06-01 - 2026-06-30   (filter — custom date)
```

### Response shape (per contest in list)
```json
{
  "contest_id": 100,
  "company_id": 1,
  "contest_name": "Contest 06.30.26",
  "contest_start_date": "2026-06-30T00:00:00",
  "contest_end_date": "2026-07-22T00:00:00",
  "created_on": "2026-06-30T00:00:00.000Z",
  "contest_image_url": "",
  "contest_state": "LIVE",
  "contest_timezone": "America/New_York",
  "trophy_url": "",
  "owner_firstname": "John",
  "owner_lastname": "Doe",
  "is_editable": true,
  "is_authorized": true,
  "can_clone": true,
  "force_closed_on": null,
  "polling_identifier": null,
  "is_new": false,
  "is_autopilot": false,
  "tz_id": "America/New_York"
}
```

### Card layout
- Contest name
- State badge (`contest_state`) with color
- Date: `contest_end_date` shown as `MM/dd/yyyy` (transformed from ISO string via `datePipe.transform`)
- Owner: `owner_firstname + owner_lastname`
- Autopilot badge: shown when `is_autopilot === true`
- "Copying" overlay: shown when `polling_identifier !== null`

### Context menu visibility gates

| Menu item | `*ngIf` condition |
|---|---|
| Clone | `can_clone` |
| Edit | `is_editable && is_authorized` |
| Delete | `is_editable && is_authorized` |
| Force Close | `is_authorized && contest_state === 'LIVE'` |
| Move to Draft | `is_authorized && contest_state === 'READY'` |

The options button itself is hidden when `polling_identifier !== null` (contest still copying) or when `contest_state === 'DRAFT' && accessType === 'MM'` (mid-manager can't act on drafts).

### Filters
- **By Name**: text input, `contest_name` query param
- **By State**: static list (`live`, `ready`, `draft`, `closed`, `ended`)
- **By Owner**: fetched from `game/owners` endpoint
- **By Date Range**: Today / This Week / Last Week / This Month / Last Month / Custom date picker → appended as `date_range` filter

### Pagination
- Default page size: `Paginations.DEFAULT_ITEM_PER_PAGE` (likely 10)
- `mat-paginator` controls; page event calls `getContestsOverPagination` → re-fetches with `start_index` + `limit`

---

## 3. Create Contest Flow

**Entry point:** "Create Contest" button opens `CreateContestComponent` (MatDialog).  
**Route after creation:** `/admin/contests/create-contest?id={contest_id}` (via `Route.CREATE_CONTEST`)

### Step 1: Get valid start date
On dialog open, immediately calls:
```
GET contest/get_valid_contest_date?company_id=1
→ { valid_start_date: "2026-07-01T00:00:00.000Z", tz_id: "America/New_York" }
```
Sets `validStartDate` and `timezoneId`. Default date range: `valid_start_date` to `valid_start_date + 30 days`. Max end date = start + 89 days.

### Step 2: Get timezone list
```
GET (some timezone endpoint)   ← not in faker yet
```

### Step 3: Set audience filters
Dialog shows audience filter panel (Location, Department, Custom Audience via `company/get_company_custom_fields`). Manager selects recipients.

Custom fields fetched:
```
GET company/get_company_custom_fields?company_id=1
→ { fields: [{ key_id: "location_ids", ... }, { key_id: "department_ids", ... }] }
```
Values for each filter:
```
POST company/get_company_custom_field_values
→ { values: [...] }
```
Custom audience:
```
GET custom_audience/retrieve_audience?company_id=1
→ { audiences: [...], total_count: N }
```

### Step 4: Submit — `addContest()`
```
POST contest/add
Body: {
  company_id: 1,
  contest_name: "Q3 Sales Sprint",
  contest_start_date: "2026-07-01 00:00:00",
  contest_end_date: "2026-07-31 23:59:59",
  tz_id: "America/New_York"
}
→ { success: true, data: { contest_id: 201, contest_name: "Q3 Sales Sprint" } }
```
On success: dialog closes, `contest_id` stored, navigate to `/admin/contests/create-contest?id=201`.

### Step 5 (parallel): `addAssignment()`
Immediately after `createContest` success, calls:
```
POST contest/add_assignment
Body: {
  company_id: 1,
  contest_id: 201,
  recipients: [{
    created_by: 1,
    recipient_type: "FIELDS_BASED" | "AUDIENCE_BASED",
    players: [
      { key_id: "location_ids", filter_key: "location_ids", is_all: false, values: [{ id: 5, text: "NYC" }] }
    ]
  }],
  disjunction_filter: false
}
→ { success: true, data: { assignment_id: "fa-201" } }
```

---

## 4. Contest Editor Screen (`add-contest`)

**Route:** `/admin/contests/create-contest?id={contest_id}`  
**Component:** `AddContestComponent` (wraps `ContestHeaderComponent` + game table + game picker overlay)

### On init
- `contestService.getContestDetails()` — reads contest from service state (set from list click)
- `addContest.component` delegates to `ContestHeaderComponent` via `@ViewChild('contestHeader')` for the contest-level fields (name, dates, etc.)

### Sub-screens

#### Games table
Columns: game logo, game name, attempt count (editable), date range (slider/date-picker), action (delete, edit only if editable).

**Load games:**
```
GET contest/retrieve_contest_games?contest_id=201&company_id=1&start_index=0&limit=1000
→ { success: true, data: { contest_games_list: [...] } }
```

Each game in list:
```json
{
  "game_contest_relation_id": 1,
  "contest_id": 201,
  "game_id": 3361,
  "game_name": "Sales Fundamentals",
  "game_logo": "",
  "game_start_date": "2026-07-01T00:00:00",
  "game_end_date": "2026-07-31T00:00:00",
  "attempt_count": 2,
  "attempt_type": "TOTAL",
  "game_state": "LIVE",
  "contest_timezone": "America/New_York"
}
```

**Update game dates / attempts:**
```
PUT contest/update_games_in_contest
Body: { company_id, contest_id, game_ids: [3361], game_start_date: "...", attempt_count: 3, attempt_type: "DAILY" }
→ { success: true, data: null }
```
`attempt_type` values: `TOTAL` | `DAILY` | `WEEKLY`

**Remove game from contest:**
```
POST contest/remove_games
Body: { company_id, contest_id, game_ids: [3361] }
→ { success: true, data: null }
```
Error code if game is live in MLG: `RESTRICT_GAME_DELETE_ON_CONTEST_MLG` → shows `AlertComponent`.

#### Game picker overlay
Triggered by `presentAddGamePopUp()`. Opens a filter-based game search.

**Fetch games for picker:**
```
POST contest/get_games_for_filter
Body (filters): game_state=READY,LIVE&game_type=1&game_mode=CONTEST&only_som=true&contest_id=201&game_name=...
                (+ owner_id if mid-manager/team-lead)
→ { success: true, data: { games: [...], total_games: N } }
```
Only SP games (`game_type=1`) that are `READY` or `LIVE` with `game_mode=CONTEST` are eligible.

**Add game to contest:**
```
POST contest/add_game_to_contest
Body: {
  company_id: 1,
  contest_id: 201,
  game_ids: [3361],
  game_start_date: "2026-07-01 00:00:00",
  game_end_date: "2026-07-31 23:59:59"
}
→ { success: true, data: null }
```
Error code if MLG restriction: `RESTRICT_GAME_DELETE_ON_CONTEST_MLG`.

On error (non-MLG): also calls `get_valid_contest_date` to refresh valid start date.

---

## 5. Publish Contest

Available from the contest editor header (in `ContestHeaderComponent`, not audited in full but called via `contestService.publishContest()`).

```
POST contest/publish
Body: { company_id: 1, contest_id: 201 }
→ { success: true, data: null }
```
On success: `contest_state` changes to `READY`. UI re-fetches contest or updates local state.

---

## 6. Rewards

Shown in the contest editor when the contest is in READY or LIVE state (accessed via a tab or section).

**Reward categories:**
```
GET contest/retrieve_contest_reward_category?
→ { success: true, data: { categories: [{ category_id: 1, category_name: "Gift Cards" }, ...] } }
```

**Rewards per category:**
```
GET contest/retrieve_contest_rewards?&category_id=1
→ { success: true, data: { rewards: [{ reward_id: 1, reward_name: "$25 Amazon Gift Card", ... }] } }
```

---

## 7. Contest Operations from Library

### Clone
```
POST contest/copy_contest   (v3.1 endpoint)
Body: { contest_id: 100, company_id: 1, created_by: 1 }
→ { success: true, data: {
    contest_details: { ...cloned contest with DRAFT state },
    polling_identifier: "poll-201"
  }
}
```
- Clone is inserted into list immediately (optimistic UI) with `polling_identifier` set → shows "Copying" overlay
- Client polls every 5000ms:
  ```
  GET mlg/copy_mlg_progress?polling_identifier=poll-201
  → { data: { question_copy_progress: 100 } }
  ```
  When `question_copy_progress === 100`: clears `polling_identifier` from the card → "Copying" overlay disappears

### Delete
```
DELETE contest/delete?company_id=1&contest_id=100
→ { success: true, data: null }
```
No frontend blocking for LIVE contests — backend enforces. On `!response.success` the frontend just swallows it (no error shown in `contest-list.deleteContest()`). On success: shows snackbar "Contest deleted" + refreshes list.

### Force Close
```
PUT contest/forced_close
Body: { company_id: 1, contest_id: 100, is_winner_declared: true/false }
→ { success: true, data: null }
```
Only shown for `LIVE` contests. Confirmation dialog has checkbox: "Declare winner for this contest".

### Move to Draft
```
PUT contest/ready_to_draft
Body: { company_id: 1, contest_id: 100 }
→ { success: true, data: null }
```
Only shown for `READY` contests. On error: shows snackbar from `ErrorCode[response.message_code]`.

---

## 8. Assignment / Audience (Advanced)

The `get_assignment` / `update_assignment` endpoints are used when editing an existing contest's audience targeting.

```
GET contest/get_assignment?company_id=1&contest_id=100&is_custom=false&is_company_with_custom_fields=true
→ { success: true, data: { recipients: [...] } }
```

```
PUT contest/update_assignment
Body: { company_id, contest_id, recipients: [...], disjunction_filter: false }
→ { success: true, data: { assignment_id: "..." } }
```

`recipient_type`:
- `FIELDS_BASED`: filtering by location/department/custom fields
- `AUDIENCE_BASED`: targeting a named custom audience (`key_id: 'custom_audience'`)

`players` array entry:
```json
{
  "key_id": "location_ids",
  "filter_key": "location_ids",
  "is_all": false,
  "values": [{ "id": 5, "text": "NYC Office" }]
}
```

---

## 9. Backend Architecture Notes

**Microservice:** `contest-core-service` (Spring Boot, REST on `/contests`)  
**DB entity:** `ContestDB` — maps to `sh_contests` or equivalent table

Backend controller operations:
| HTTP | Path | Action |
|---|---|---|
| GET | `/contests` | Get all |
| GET | `/contests/{company_id}/{contest_id}` | Get by ID (full description with games, players) |
| POST | `/contests` | Create |
| PUT | `/contests/stopContest/{company_id}/{contest_id}` | Stop (STOPPED state) |
| PUT | `/contests/stopContestNow/{company_id}/{contest_id}` | Force stop (STOPPED_NOW) |
| PUT | `/contests/unreadyContest/{company_id}/{contest_id}` | Move back from ASSIGNED → SCHEDULED |
| PUT | `/contests/readyAgainContest` | Re-ready a stopped contest |
| GET | `/contests/assignedPlayers/{company_id}/{contest_id}` | Get player list |

The frontend's contest endpoints are proxied through an API gateway and versioned differently — `contest/add` maps to the above microservice, not directly to `/contests`.

**Note on `ContestStatesLB`:** `STARTED`→`CONTINUING`, `ENDED`→`ENDED`, `CLOSED`→`CLOSED`. Used by leaderboard service, not directly visible in admin.

---

## 10. Faker Mock — Current Coverage vs. Gaps

### What's currently stubbed (faker.interceptor.ts, lines 287–405)

| Endpoint | Status | Notes |
|---|---|---|
| `contest/add_assignment` | ✅ | Returns `assignment_id` |
| `contest/update_assignment` | ✅ | Returns `assignment_id` |
| `contest/get_assignment` | ✅ | Returns empty `recipients` array |
| `contest/add_game_to_contest` | ✅ | Returns null (no stateful game tracking) |
| `contest/remove_games` | ✅ | Returns null (not stateful) |
| `contest/update_games_in_contest` | ✅ | Returns null (not stateful) |
| `contest/retrieve_contest_reward_category` | ✅ | 3 static categories |
| `contest/retrieve_contest_rewards` | ✅ | 3 static rewards |
| `contest/retrieve_contest_games` (GET) | ✅ | `ContestFactory.games()` — 3 hardcoded games |
| `contest/get_games_for_filter` | ✅ | Returns `this.games` (full game library) |
| `contest/retrieve_contests` | ✅ | Stateful `this.contests` array |
| `contest/contest_details` | ✅ | Looks up by `contest_id`, falls back to `[0]` |
| `get_valid_contest_date` | ✅ | Returns `new Date().toISOString()` |
| `contest/add` | ✅ | Stateful — pushes new contest, returns `contest_id` |
| `contest/delete` | ✅ | Stateful — removes from array |
| `contest/ready_to_draft` | ✅ | Stateful — sets `contest_state='DRAFT'` |
| `contest/forced_close` | ✅ | Stateful — sets `contest_state='CLOSED'` |
| `contest/copy_contest` | ✅ | Stateful — clones, sets `polling_identifier` |
| `mlg/copy_mlg_progress` | ✅ | Always returns 100% (contest clone progress reuses this) |
| `contest/publish` | ✅ | Stateful — sets `contest_state='READY'` |
| `contest/update` | ✅ | Returns null (catch-all update) |

### Gaps / known issues

| Issue | Priority | Detail |
|---|---|---|
| `contest/retrieve_contest_games` uses wrong key | 🔴 | Stub returns `contest_game_list` but API endpoint is `contest/retrieve_contest_games` while the component reads `response.data.contest_games_list` — key mismatch |
| `contest/get_assignment` returns empty always | 🟡 | Editor won't show any existing audience config; not blocking but makes audience editing tests impossible |
| Clone progress poll is for `mlg/` path | 🟡 | Works because `CONTEST_COPY_PROGRESS` resolves to `mlg/copy_mlg_progress` — this is intentional per api.service.ts comment |
| Force-close: no `is_winner_declared` handling | 🟡 | Stub ignores the checkbox value; always closes. Fine for smoke tests |
| No timezone endpoint stubbed | 🟡 | `getTimeZone()` in `create-contest.component.ts` presumably hits some endpoint — if it fails silently, no blocker |
| Delete no error path | 🟡 | If `!response.success` happens, frontend swallows it (no crash). Not needed for tests |
| Add-game filter returns full game library | 🟡 | Stub sends all 20 games; real backend filters to READY/LIVE SP games only. Visual difference but not a test blocker |
| `contest_end_date` format | 🔴 | Factory returns ISO string `"2026-07-22T00:00:00.000Z"` but list component does `item.contest_end_date.split(' ')` (space-split), expecting `"2026-07-22 00:00:00"` format. ISO strings have `T` not space → `dateOnly[0]` = `"2026-07-22T00:00:00.000Z"` → datePipe may return `Invalid Date` |
