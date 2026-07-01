const GAME_NAMES = [
  'Airmac Game', 'New Game 3361 new', 'New Game 3361', 'New Game 3360',
  'New Game 3359', 'Test compressed video', 'New Game 3357', 'New Game 3356',
  'New Game 3355', 'New Game 3354', 'New Game 3353', 'SLG',
  'Product Knowledge Quiz', 'Sales Playbook Essentials', 'Customer Service Mastery',
  'Safety & Procedures', 'Compliance 101', 'Leadership Essentials',
  'Onboarding Basics', 'Technical Skills 101',
];
const CATEGORIES = ['General', 'Archive', 'Leadership', 'Uncategorized', 'Codewalla Games', '1 Category'];
const CATEGORY_IDS = [1, 2, 3, 4, 5, 6];
const OWNERS = [
  { first: 'CW', last: 'sha' }, { first: 'Test_ddaff', last: 'Manager' },
  { first: 'Srishti', last: 'K' }, { first: 'Abdullah', last: 'Sheriff' },
];

// win_rate: library template shows 'no_gameplay' when === 0; floor at 20 for games with plays
const WIN_RATES = [82, 67, 45, 91, 73, 55, 88, 61, 0, 38, 77, 0, 84, 0, 52, 69, 0, 43, 79, 0];

// game_type: 1=SP, 2=MP — indices 6 & 7 are MP for testing MP-specific flows
const GAME_TYPES: Record<number, string> = { 6: '2', 7: '2' };

export class GameFactory {
  static one(index = 0): any {
    const owner = OWNERS[index % OWNERS.length];
    const state = index < 8 ? 'LIVE' : index < 14 ? 'READY' : 'DRAFT';
    const gameType = GAME_TYPES[index] || '1';
    const rawWinRate = WIN_RATES[index];
    // Backend floors win_rate at 20 for games with plays; 0 = zero gameplay (library template checks !== 0)
    const winRate = rawWinRate > 0 ? Math.max(20, rawWinRate) : 0;
    const catIndex = index % CATEGORIES.length;
    return {
      game_id: 3361 - index,
      company_id: 1,
      game_name: GAME_NAMES[index % GAME_NAMES.length],
      game_logo: '',
      game_image_url: '',
      game_state: state,
      game_type: gameType,
      game_mode: state === 'LIVE' ? 'CONTEST' : null,
      game_category_id: CATEGORY_IDS[catIndex],
      game_category: CATEGORIES[catIndex],
      game_limit_type: 'NA',
      default_lang_id: 1,
      is_different_category: 0,
      is_mini_game: 0,
      source: null,
      is_deleted: false,
      pathway_ids: [],
      win_rate: winRate,
      top_players: index < 3 ? [
        { profile_image_url: '' },
        { profile_image_url: '' },
        { profile_image_url: '' },
      ] : [],
      owner_first_name: owner.first,
      owner_last_name: owner.last,
      owner_firstname: owner.first,
      owner_lastname: owner.last,
      access_type: 'A',
      created_on: new Date(2026, 5, 1 - index).toISOString(),
      is_pinned: index < 2,
      is_archived: false,
      is_editable: true,
      is_shop_game: false,
      is_multilang: false,
      langs: '',
      polling_identifier: null,
      game_share_url: '',
      game_hash_id: `hash-${3361 - index}`,
    };
  }

  static list(n = 20): any[] {
    return Array.from({ length: n }, (_, i) => GameFactory.one(i));
  }
}
