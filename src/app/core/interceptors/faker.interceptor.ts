import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ContestFactory } from '../faker/contest.factory';
import { GameFactory } from '../faker/game.factory';

@Injectable({ providedIn: 'root' })
export class FakerInterceptor implements HttpInterceptor {
  private contests = ContestFactory.list(16);
  private games = GameFactory.list(20);
  private nextId = 200;
  private slgAssignments: Record<string, any[]> = (() => {
    // ponytail: seed assignments for first 3 LIVE games so they reflect real backend state
    const seed: Record<string, any[]> = {};
    [0, 1, 2].forEach((i, idx) => {
      const gid = String(3361 - i);
      seed[gid] = [{
        assignment_id: `slg-seed-${idx + 1}`,
        recipient_type: 'FIELDS_BASED',
        attempt_details: { start_date: '2026-06-01 00:00:00', end_date: '2026-07-31 00:00:00', max_attempts: 3, attempts_type: 'TOTAL' },
        players: [{ key_id: 'location_ids', filter_key: 'location_ids', is_all: true, values: [], text: 'All Locations' }],
      }];
    });
    return seed;
  })();

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const url = req.url;
    const body = req.body || {};
    const ok = (data: any) => of(new HttpResponse({ status: 200, body: { success: true, message_code: 0, data } })).pipe(delay(0));

    // ── Auth / user ──────────────────────────────────────────────────────────
    if (url.includes('users/get_user_information') || url.includes('get_user_info'))
      return ok({ manager_id: 42, first_name: 'John', last_name: 'Doe', email: 'john.doe@1huddle.co', access_type: 'A', company_id: 1 });
    if (url.includes('auth/get_permissions'))
      return ok({ actions_permitted: {} });
    if (url.includes('resources/config'))
      return ok({});

    // ── Games ─────────────────────────────────────────────────────────────────
    if (url.includes('game/get_icon_game_list'))
      return ok({ game_icon: [] });
    // Task 2: pin limit is 10 per backend source
    if (url.includes('game/retrieve_games') || url.includes('game/retrieve_game'))
      return ok({ game_list: this.games.map(g => ({...g})), total_game: this.games.length, pin_game_limit_reached: this.games.filter(g => g.is_pinned).length >= 10 });

    // GET pinned games — returns live list
    if (url.includes('game/get_pinned_games'))
      return ok({ pinned_games: this.games.filter(g => g.is_pinned).map(g => ({...g})) });

    // PIN / UNPIN — stateful mutation, enforces 6-game limit; blocks multiplayer games
    if (url.includes('pinned_games/pin_unpin')) {
      const gameId = body?.game_id;
      const isPinned = body?.is_pinned;
      const game = this.games.find(g => g.game_id === gameId);
      if (game && +game.game_type !== 1)
        return of(new HttpResponse({ status: 200, body: { success: false, message_code: 'UNABLE_TO_PIN_MULTIPLAYER_GAMES', data: null } })).pipe(delay(0));
      if (isPinned && this.games.filter(g => g.is_pinned).length >= 10)
        return of(new HttpResponse({ status: 200, body: { success: false, message_code: 'pin_game_limit_reached', data: null } })).pipe(delay(0));
      if (game) { game.is_pinned = isPinned; }
      return ok({ pinned_games: this.games.filter(g => g.is_pinned).map(g => ({...g})) });
    }
    // ponytail: game library Category filter reads game_cat_id (not category_id) — game-list.component.ts line 846
    if (url.includes('game/game_categories') || url.includes('game_categories'))
      return ok({ game_category_list: [
        { game_cat_id: 1, category_name: 'Sales' },
        { game_cat_id: 2, category_name: 'Product Knowledge' },
        { game_cat_id: 3, category_name: 'Compliance' },
      ]});
    if (url.includes('manager/retrieve_game_owners') || url.includes('retrieve_game_owners'))
      return ok({ owner_list: [{ manager_id: 42, owner_id: 42, first_name: 'John', last_name: 'Doe' }] });
    if (url.includes('get/help/videos') || url.includes('GET_VIDEOS'))
      return ok({ videos: ['', '', '', '', '', '', '', '', '', ''] });
    if (url.includes('game_schedule/get_limits'))
      return ok({ game_schedule_list: [] });
    if (url.includes('game_schedule/get_custom_managers'))
      return ok({ manager_list: [{ manager_id: 42, first_name: 'John', last_name: 'Doe' }] });
    // MOVE GAME STATE — stateful; real failure shape: { success:false, data:{ game_is_valid:false, error_list:[] } }
    if (url.includes('game/update_game_state')) {
      const g = this.games.find(g => g.game_id === body?.game_id);
      if (g) {
        g.game_state = body?.game_state;
        if (body?.game_mode) { g.game_mode = body.game_mode; }
        if (body?.game_state === 'LIVE') { g.game_mode = g.game_mode || 'CONTEST'; }
      }
      return ok({ game_state: body?.game_state, game_is_valid: true });
    }

    // COPY GAME — stateful; component reads data.game_details (not data.game_id)
    // ponytail: polling_identifier must be set ON the game object so the "Duplicating..." overlay shows
    if (url.includes('game/copy_game')) {
      const src = this.games.find(g => g.game_id === body?.game_id) || this.games[0];
      const id = this.nextId++;
      const pollId = `poll-${id}`;
      const clone = { ...src, game_id: id, game_name: src.game_name + ' (Copy)', game_state: 'DRAFT', is_pinned: false, is_editable: true, polling_identifier: pollId };
      this.games.unshift(clone);
      return ok({ game_details: clone, polling_identifier: pollId });
    }

    // GAME COPY PROGRESS — clears overlay when complete; endpoint name may vary by backend version
    if (url.includes('game/copy_questions_progress') || url.includes('game/copy_game_progress')) {
      // ponytail: req.params empty for URL-string query params — parse from URL
      const pollMatch = url.match(/polling_identifier=([^&]+)/);
      const pollId = pollMatch ? decodeURIComponent(pollMatch[1]) : (req.params.get('polling_identifier') || body?.polling_identifier);
      const game = this.games.find(g => g.polling_identifier === pollId);
      if (game) { game.polling_identifier = null; }
      return ok({ question_copy_progress: 100 });
    }

    // ADD GAME — stateful: full field set matching real backend INSERT + side effects
    if (url.includes('game/add')) {
      const id = this.nextId++;
      const gameType = String(body?.game_type || '1');
      const newGame: any = {
        game_id: id, company_id: body?.company_id || 1,
        game_name: `New Game ${id}`,
        game_state: 'DRAFT',
        game_type: gameType,
        game_mode: null,
        game_logo: '', game_image_url: '',
        game_icon_id: 9,
        game_category_id: 1, game_category: 'General',
        game_limit_type: 'NA',
        default_lang_id: 1,
        is_different_category: body?.is_different_category || 0,
        is_default_game_category: false,
        is_mini_game: body?.is_mini_game || 0,
        is_practice_game: 0,
        is_pinned: false, is_archived: false, is_deleted: false,
        is_editable: true, is_shop_game: false, is_multilang: false,
        source: null, pathway_ids: [], langs: '',
        owner_id: 42, owner_first_name: 'John', owner_last_name: 'Doe',
        access_type: 'A',
        win_rate: null,
        game_hash_id: `hash-${id}`, game_share_url: '',
        polling_identifier: null, top_players: [],
      };
      this.games.unshift(newGame);
      return ok(newGame);
    }

    // UPDATE GAME — stateful: mutate matching game
    if (url.includes('game/update')) {
      const g = this.games.find(g => g.game_id === (body?.game_id || body?.game_id));
      if (g) { Object.assign(g, body); }
      return ok(null);
    }

    // DELETE GAME — stateful; blocked if LIVE (real backend gate)
    // game_id arrives as a query-string param so req.params is empty; parse from URL directly
    if (url.includes('game/delete')) {
      const m = url.match(/game_id=(\d+)/);
      const gid = m ? +m[1] : (body?.game_id ? +body.game_id : NaN);
      const target = this.games.find(g => g.game_id === gid);
      if (target?.game_state === 'LIVE')
        return of(new HttpResponse({ status: 200, body: { success: false, message_code: 'LIVE_GAME_DELETE_RESTRICTION', data: null } })).pipe(delay(0));
      this.games = this.games.filter(g => g.game_id !== gid);
      return ok(null);
    }

    // ARCHIVE / UNARCHIVE — stateful
    if (url.includes('game/archive')) {
      const g = this.games.find(g => g.game_id === body?.game_id);
      if (g) { g.game_state = 'ARCHIVED'; }
      return ok(null);
    }
    if (url.includes('game/unarchive')) {
      const g = this.games.find(g => g.game_id === body?.game_id);
      if (g) { g.game_state = 'DRAFT'; }
      return ok(null);
    }

    if (url.includes('game/pin'))
      return ok(null);
    if (url.includes('game_schedule/add_limits') || url.includes('game_schedule/edit_limits') ||
        url.includes('game_schedule/delete_limits'))
      return ok(null);

    // VALIDATE GAME READINESS
    if (url.includes('game/validate_game_readyness') || url.includes('game/validate_game_readiness'))
      return ok({ is_ready: true, question_count: 5, error_list: [] });

    // QUESTION CATEGORIES (must be before generic game_categories)
    if (url.includes('game/game_question_categories'))
      return ok({ question_categories: [] });

    // CATEGORY CRUD (question categories & game categories share same URL patterns)
    if (url.includes('category/add_category'))
      return ok({ category_id: this.nextId++ });
    if (url.includes('category/delete'))
      return ok(null);
    if (url.includes('category/update_category'))
      return ok(null);
    if (url.includes('category/move_questions'))
      return ok(null);
    if (url.includes('category/copy_questions_progress'))
      return ok({ progress: 100 });
    if (url.includes('category/copy_questions'))
      return ok({ polling_identifier: `poll-${this.nextId++}` });

    // QUESTION TIME/POINTS RESET
    if (url.includes('question/reset_questions_points_and_time'))
      return ok(null);

    // MLG ADD — stub (multiplayer game builder)
    if (url.includes('mlg/add'))
      return ok({ mlg_id: this.nextId++, game_name: '', game_state: 'DRAFT', company_id: body?.company_id || 1 });

    // Game detail / editor pages — return flat data; component reads res.data.question_categories
    if (url.includes('game/game_details') || url.includes('retrieve_game_details')) {
      const gid = req.params.get('game_id');
      const found = gid ? this.games.find(g => String(g.game_id) === String(gid)) || this.games[0] : this.games[0];
      return ok({ ...found, question_categories: (found as any).question_categories || [], pin_game_limit_reached: this.games.filter(g => g.is_pinned).length >= 6 });
    }
    if (url.includes('question/retrieve_question'))
      return ok({ question_list: [], total_question: 0 });
    if (url.includes('game/get_localisation_progress'))
      return ok({ progress: 100, is_complete: true });
    if (url.includes('game/get_lang_preference'))
      return ok({ lang_id: 1, lang_name: 'English' });

    // ── SLG (Schedule Game) — stateful per-game assignment storage ───────────
    if (url.includes('slg/retrieve_game_limit')) {
      // ponytail: req.params empty when game_id embedded as URL string — parse from URL
      const slgGameIdMatch = url.match(/game_id=(\d+)/);
      if (slgGameIdMatch) {
        const gid = slgGameIdMatch[1];
        return ok({ recipients: this.slgAssignments[gid] || [] });
      }
      return ok({ game_limit: 100, used_limit: this.games.length });
    }
    if (url.includes('slg/add_game_limit')) {
      const gid = String(body?.game_id);
      if (!this.slgAssignments[gid]) { this.slgAssignments[gid] = []; }
      const recipientsIn: any[] = body?.recipients || [];
      const lastId = `slg-${this.nextId}`;
      recipientsIn.forEach((r: any) => {
        const aid = `slg-${this.nextId++}`;
        this.slgAssignments[gid].push({
          assignment_id: aid,
          attempt_details: { start_date: r.start_date, end_date: r.end_date, max_attempts: r.max_attempts, attempts_type: r.attempts_type },
          players: r.players || [],
          recipient_type: r.recipient_type || 'FIELDS_BASED',
        });
      });
      return ok({ assignment_id: lastId });
    }
    if (url.includes('slg/edit_game_limit')) {
      const gid = String(body?.game_id);
      const assignments = this.slgAssignments[gid] || [];
      const aid = body?.assignment_id;
      const idx = assignments.findIndex((a: any) => a.assignment_id === aid);
      const recipientsIn: any[] = body?.recipients || [];
      if (idx >= 0 && recipientsIn.length) {
        const r = recipientsIn[0];
        assignments[idx] = { ...assignments[idx],
          attempt_details: { start_date: r.start_date, end_date: r.end_date, max_attempts: r.max_attempts, attempts_type: r.attempts_type },
          players: r.players || assignments[idx].players,
          recipient_type: r.recipient_type || assignments[idx].recipient_type,
        };
      }
      return ok({ assignment_id: aid });
    }
    if (url.includes('slg/edit_game_attempts')) {
      const gid = String(body?.game_id);
      const aids: string[] = body?.assignment_ids || [];
      (this.slgAssignments[gid] || []).forEach((a: any) => {
        if (aids.includes(a.assignment_id)) {
          a.attempt_details = { ...a.attempt_details,
            ...(body.start_date && { start_date: body.start_date }),
            ...(body.end_date && { end_date: body.end_date }),
            ...(body.max_attempts && { max_attempts: body.max_attempts }),
            ...(body.attempts_type && { attempts_type: body.attempts_type }),
          };
        }
      });
      return ok(null);
    }
    if (url.includes('slg/delete_game_limit')) {
      const gid = String(body?.game_id);
      const aids: string[] = body?.assignment_ids || [];
      if (this.slgAssignments[gid]) {
        this.slgAssignments[gid] = this.slgAssignments[gid].filter((a: any) => !aids.includes(a.assignment_id));
      }
      return ok(null);
    }

    // ── Timezones ─────────────────────────────────────────────────────────────
    if (url.includes('get_timezone'))
      return ok({ timezone_list: [
        { tz_id: 'America/New_York', tz_name: 'Eastern Time', tz_unit: 'UTC-5' },
        { tz_id: 'America/Chicago', tz_name: 'Central Time', tz_unit: 'UTC-6' },
        { tz_id: 'America/Denver', tz_name: 'Mountain Time', tz_unit: 'UTC-7' },
        { tz_id: 'America/Los_Angeles', tz_name: 'Pacific Time', tz_unit: 'UTC-8' },
      ]});

    // ── Locations / Departments / Audiences ───────────────────────────────────
    if (url.includes('location/retrieve_location'))
      return ok({ location_list: [
        { location_id: 1, location_name: 'New York Office', manager_id: 42 },
        { location_id: 2, location_name: 'Los Angeles Office', manager_id: 42 },
        { location_id: 3, location_name: 'Chicago Office', manager_id: 42 },
      ], total_location: 3 });

    if (url.includes('department/get_department_by_locations') || url.includes('department/retrieve_department'))
      return ok({ department_list: [
        { department_id: 1, department_name: 'Sales', location_id: 1 },
        { department_id: 2, department_name: 'Marketing', location_id: 1 },
        { department_id: 3, department_name: 'Operations', location_id: 2 },
      ], total_department: 3 });

    if (url.includes('custom_audience/retrieve_audience'))
      return ok({ audiences: [
        { audience_id: 1, audience_name: 'Q2 Sales Team', audience_count: 45 },
        { audience_id: 2, audience_name: 'New Hires 2026', audience_count: 12 },
      ], total_count: 2 });

    // ── Contests — specific patterns first (ordering matters) ─────────────────

    // assignment ops (must be before contest/add)
    if (url.includes('contest/add_assignment'))
      return ok({ assignment_id: `fa-${body?.contest_id || 1}` });
    if (url.includes('contest/update_assignment'))
      return ok({ assignment_id: `fa-${body?.contest_id || 1}` });
    // empty list = no existing players; populated shape crashes on recipient.text.charAt(0)
    if (url.includes('contest/get_assignment'))
      return ok({ recipients: [] });

    // game-in-contest operations (before contest/add_game catches contest/add)
    if (url.includes('contest/add_game_to_contest'))
      return ok(null);
    if (url.includes('contest/remove_games'))
      return ok(null);
    if (url.includes('contest/update_games_in_contest'))
      return ok(null);

    // read-only contest sub-resources — fixed response keys
    if (url.includes('contest/retrieve_contest_reward_category'))
      return ok({ categories: [
        { category_id: 1, category_name: 'Gift Cards' },
        { category_id: 2, category_name: 'Experiences' },
        { category_id: 3, category_name: 'Company Swag' },
      ]});
    if (url.includes('contest/retrieve_contest_rewards'))
      return ok({ rewards: [
        { reward_id: 1, reward_name: '$25 Amazon Gift Card', reward_desc: '', category_id: 1 },
        { reward_id: 2, reward_name: '$50 Amazon Gift Card', reward_desc: '', category_id: 1 },
        { reward_id: 3, reward_name: 'Team Lunch', reward_desc: '', category_id: 2 },
        { reward_id: 99, reward_name: 'Custom', reward_desc: '', category_id: 1 },
      ]});
    if (url.includes('contest/retrieve_contest_games'))
      return ok({ contest_games_list: ContestFactory.games() });
    if (url.includes('contest/get_games_for_filter')) {
      const eligible = this.games.filter(g => g.game_type === '1' && ['READY', 'LIVE'].includes(g.game_state));
      return ok({ games: eligible, total_games: eligible.length });
    }

    // true = keep Custom Audience as a selectable filter type alongside Location + Department
    if (url.includes('custom_audience/audience_exists'))
      return ok({ audience_exists: true });

    // list — shallow-clone each contest so the list component's in-place date mutations
    // (item.contest_end_date = datePipe.transform(...)) don't corrupt this.contests
    if (url.includes('contest/retrieve_contests'))
      return ok({ contest_list: this.contests.map(c => ({...c})), total_contest: this.contests.length });

    // details — game_details dates must stay as ISO strings; header's changeGameDateFormat converts them
    // ponytail: delay(50) ensures getValidContestDate (delay(0)) resolves first — prevents isDateRangeValid()
    // firing with stale validStartDate=today before the valid-start-date response sets it to 2026-01-01
    if (url.includes('contest/contest_details')) {
      // ponytail: req.params is empty when contest_id is embedded in the URL string (not HttpParams) — parse from URL
      const idFromUrl = url.match(/contest_id=(\d+)/);
      const id = idFromUrl ? idFromUrl[1] : req.params.get('contest_id');
      const found = this.contests.find(c => String(c.contest_id) === String(id)) || this.contests[0];
      return of(new HttpResponse({ status: 200, body: { success: true, message_code: 0, data: { contest_description: { ...found, game_details: ContestFactory.games(found.contest_id) } } } })).pipe(delay(50));
    }

    if (url.includes('get_valid_contest_date'))
      // ponytail: must be before factory's earliest contest date (June 30 - 15*7 weeks ≈ March 2026)
      return ok({ valid_start_date: '2026-01-01 00:00:00', tz_id: 'America/New_York' });

    // CREATE — stateful: pushes new contest, returns real id/name
    if (url.includes('contest/add')) {
      const id = this.nextId++;
      const newContest: any = {
        contest_id: id,
        company_id: body.company_id || 1,
        contest_name: body.contest_name || 'New Contest',
        contest_start_date: body.contest_start_date || '',
        contest_end_date: body.contest_end_date || '',
        contest_state: 'DRAFT',
        is_editable: true, is_authorized: true, can_clone: true,
        is_autopilot: false, is_new: true,
        owner_firstname: 'John', owner_lastname: 'Doe',
        contest_image_url: '', tz_id: body.tz_id || 'America/New_York',
        force_closed_on: null, polling_identifier: null,
      };
      this.contests.unshift(newContest);
      return ok({ contest_id: id, contest_name: newContest.contest_name });
    }

    // DELETE — stateful: removes from array (params sent as raw query string, not HttpParams)
    if (url.includes('contest/delete')) {
      const match = url.match(/contest_id=(\d+)/);
      const id = match ? +match[1] : 0;
      this.contests = this.contests.filter(c => c.contest_id !== id);
      return ok(null);
    }

    // MOVE TO DRAFT — stateful
    if (url.includes('contest/ready_to_draft')) {
      const c = this.contests.find(c => c.contest_id == body?.contest_id);
      if (c) { c.contest_state = 'DRAFT'; }
      return ok(null);
    }

    // FORCE CLOSE — stateful; real backend goes ENDED first (→ CLOSED after 12-24h)
    if (url.includes('contest/forced_close')) {
      const c = this.contests.find(c => c.contest_id == body?.contest_id);
      if (c) {
        c.contest_state = 'ENDED';
        const today = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())} 00:00:00`;
        c.contest_end_date = todayStr;
        c.force_closed_on = todayStr;
        c.is_editable = false;
      }
      return ok(null);
    }

    // CLONE — stateful; clone dates always reset to today/today+30 (Chandru spec)
    if (url.includes('contest/copy_contest')) {
      const src = this.contests.find(c => c.contest_id == body?.contest_id) || this.contests[0];
      const id = this.nextId++;
      const pad = (n: number) => String(n).padStart(2, '0');
      const t = new Date();
      const te = new Date(t); te.setDate(te.getDate() + 30);
      const isoSp = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 00:00:00`;
      const clone = { ...src, contest_id: id, contest_name: src.contest_name + ' (Copy)',
        contest_state: 'DRAFT', is_new: true, is_editable: true,
        contest_start_date: isoSp(t), contest_end_date: isoSp(te),
        contest_rule: '', trophy_url: '', force_closed_on: null,
        polling_identifier: `poll-${id}` };
      this.contests.unshift(clone);
      return ok({ contest_details: clone, polling_identifier: clone.polling_identifier });
    }

    // CLONE PROGRESS — always instant complete
    if (url.includes('mlg/copy_mlg_progress'))
      return ok({ question_copy_progress: 100 });

    // PUBLISH
    if (url.includes('contest/publish')) {
      const c = this.contests.find(c => c.contest_id == body?.contest_id);
      if (c) { c.contest_state = 'READY'; }
      return ok(null);
    }

    // generic contest updates
    if (url.includes('contest/update'))
      return ok(null);

    // ── Company / settings ────────────────────────────────────────────────────
    if (url.includes('company/check_metric_limit') || url.includes('check_usage_limit'))
      return ok({ is_limit_exceeded: false, limit: 100, used: this.games.length });

    if (url.includes('company/get_company_branding'))
      return ok({ image: [], sound: [], theme: { background_color: '#ffffff', text_color: '#000000' } });

    // company_details — must be before generic retrieve_compan catch
    if (url.includes('company/company_details'))
      return ok({ company_details: {
        company_id: 1, company_name: '1Huddle Demo', company_logo: '',
        is_custom: false, is_sso_company: false, is_company_with_custom_fields: false,
        scheduling_filters: false, paywall_status: 'ACTIVE',
      }});

    // ponytail: custom_fields must be before the company/get_company wildcard — get_company_custom_fields matches that pattern
    if (url.includes('company/get_company_custom_fields'))
      return ok({ fields: [
        { key_id: 'location_ids', title: 'Location', filter_key: 'location_ids', allow_multiselection: true },
        { key_id: 'department_ids', title: 'Department', filter_key: 'department_ids', allow_multiselection: true },
      ]});

    if (url.includes('retrieve_compan') || url.includes('company/get_company'))
      return ok({ company_list: [{ company_id: 1, company_name: '1Huddle Demo', company_logo: '' }], total_companies: 1 });
    if (url.includes('company/company_settings') || url.includes('company/settings') || url.includes('company/get_settings') || url.includes('get_company_settings'))
      return ok({ settings: { permission: {
        games: { has_manager_pinned: false, has_manager_set_limits: false },
        multi_level_game: { has_manager_set_limits: false },
        shop_games: { has_manager_shopped: false },
      }, role: [] } });
    if (url.includes('company/get_company_custom_field_values')) {
      const keyMatch = url.match(/key_id=([^&]+)/);
      const key = keyMatch ? keyMatch[1] : '';
      if (key === 'location_ids')
        return ok({ values: [
          { id: 1, text: 'New York Office' },
          { id: 2, text: 'Los Angeles Office' },
          { id: 3, text: 'Chicago Office' },
        ]});
      if (key === 'department_ids')
        return ok({ values: [
          { id: 1, text: 'Sales' },
          { id: 2, text: 'Marketing' },
          { id: 3, text: 'Operations' },
        ]});
      return ok({ values: [] });
    }

    if (url.includes('game_schedule/get_fields'))
      return ok({ fields: [] });

    // ponytail: add-games-in-contest reads response.data.category_list (line 156), id field is game_cat_id
    if (url.includes('category/retrieve_game_category'))
      return ok({ category_list: [
        { game_cat_id: 1, category_name: 'Sales', game_count: 5 },
        { game_cat_id: 2, category_name: 'Product Knowledge', game_count: 8 },
        { game_cat_id: 3, category_name: 'Compliance', game_count: 3 },
      ]});
    if (url.includes('pathways/get'))
      return ok({ pathways: [
        { pathway_id: 1, pathway_name: 'Onboarding Track' },
        { pathway_id: 2, pathway_name: 'Sales Certification' },
      ]});

    // ── Managers / locations / dashboard ─────────────────────────────────────
    if (url.includes('manager/get_managers_locations_and_departments'))
      return ok({ location_list: [], department_list: [], manager_list: [] });
    if (url.includes('reportee/get_reportee_hierarchy'))
      return ok({ hierarchy: [] });
    // ── Dashboard pinned games (Feature #5) ──────────────────────────────────
    // get_all_slg_games — powers the "add game" search in the pinned-game-on-dashboard dialog
    if (url.includes('get_all_slg_games'))
      return ok({ all_slg_games: this.games.filter(g => g.game_state === 'LIVE' || g.game_state === 'READY').map(g => ({
        game_id: g.game_id, game_name: g.game_name, game_logo: g.game_logo, win_rate: g.win_rate,
      })) });
    // Task 3: dashboard uses game_image_url; exact shape from CompanyPinnedGameList.java
    if (url.includes('team/get_company_pinned_games'))
      return ok({ company_pinned_games: {
        overall_win_rate: 72,
        company_pinned_game_list: this.games.filter(g => g.is_pinned).map((g, i) => ({
          game_id: g.game_id,
          game_name: g.game_name,
          game_image_url: g.game_image_url || '',
          win_rate: (g.win_rate !== null && g.win_rate > 0) ? g.win_rate : -1,
          position: i + 1,
        })),
      }});
    // save_company_pinned_game body: { company_id, manager_id, game_ids: [{ game_id, position }] }
    if (url.includes('team/save_company_pinned_game'))
      return ok(null);

    if (url.includes('report/'))
      return ok({ data: [], total: 0, game_list: [], player_list: [] });

    // Admin-only game operations (Add to Companies, Add to Shop, Company Game URL)
    if (url.includes('game/add_to_companies') || url.includes('game/add_companies'))
      return ok(null);
    if (url.includes('game/add_to_shop') || url.includes('shop/add_game'))
      return ok(null);

    // Owner filter for contest list
    if (url.includes('game/owners') || url.includes('contest/owners'))
      return ok({ owner_list: [{ manager_id: 42, first_name: 'John', last_name: 'Doe' }] });

    return next.handle(req);
  }
}
