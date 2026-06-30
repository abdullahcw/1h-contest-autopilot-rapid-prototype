const GAME_NAMES = [
  'Airmac Game', 'New Game 3361 new', 'New Game 3361', 'New Game 3360',
  'New Game 3359', 'Test compressed video', 'New Game 3357', 'New Game 3356',
  'New Game 3355', 'New Game 3354', 'New Game 3353', 'SLG',
  'Product Knowledge Quiz', 'Sales Playbook Essentials', 'Customer Service Mastery',
  'Safety & Procedures', 'Compliance 101', 'Leadership Essentials',
  'Onboarding Basics', 'Technical Skills 101',
];
const CATEGORIES = ['General', 'Archive', 'Leadership', 'Uncategorized', 'Codewalla Games', '1 Category'];
const OWNERS = [
  { first: 'CW', last: 'sha' }, { first: 'Test_ddaff', last: 'Manager' },
  { first: 'Srishti', last: 'K' }, { first: 'Abdullah', last: 'Sheriff' },
];

export class GameFactory {
  static one(index = 0): any {
    const owner = OWNERS[index % OWNERS.length];
    const state = index < 8 ? 'LIVE' : index < 14 ? 'READY' : 'DRAFT';
    return {
      game_id: 3361 - index,
      company_id: 1,
      game_name: GAME_NAMES[index % GAME_NAMES.length],
      game_logo: '',
      game_image_url: '',
      game_state: state,
      game_type: '1',
      game_mode: state === 'LIVE' ? 'CONTEST' : null,
      game_category: CATEGORIES[index % CATEGORIES.length],
      win_rate: index === 0 ? 20 : 0,
      owner_first_name: owner.first,
      owner_last_name: owner.last,
      owner_firstname: owner.first,
      owner_lastname: owner.last,
      created_on: new Date(2026, 5, 1 - index).toISOString(),
      is_pinned: index < 2,
      is_archived: false,
      is_editable: true,
      is_shop_game: false,
      is_multilang: false,
      langs: '',
      polling_identifier: null,
      game_share_url: '',
    };
  }

  static list(n = 20): any[] {
    return Array.from({ length: n }, (_, i) => GameFactory.one(i));
  }
}
