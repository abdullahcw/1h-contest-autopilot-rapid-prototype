const OWNERS = [
  { first: 'John', last: 'Doe' },
  { first: 'Sarah', last: 'Lee' },
  { first: 'Marcus', last: 'Chen' },
];

function contestDate(offsetWeeks: number): string {
  const d = new Date(2026, 5, 30); // June 30 2026
  d.setDate(d.getDate() - offsetWeeks * 7);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  return `Contest ${mm}.${dd}.${yy}`;
}

// convertDateForRangeSlider splits on /-|\s|:/ — T-separator gives date[2]='30T00'
// → Number('30T00')=NaN → Invalid Date. Must use space format.
function isoSpace(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 00:00:00`;
}

export class ContestFactory {
  static one(index = 0): any {
    const owner = OWNERS[index % OWNERS.length];
    const states = ['LIVE', 'READY', 'CLOSED', 'DRAFT', 'CLOSED', 'CLOSED', 'CLOSED', 'DRAFT', 'CLOSED', 'CLOSED', 'CLOSED', 'CLOSED', 'CLOSED', 'CLOSED', 'CLOSED', 'CLOSED'];
    const start = new Date(2026, 5, 30 - index * 7);
    const end = new Date(start); end.setDate(end.getDate() + 22);
    return {
      contest_id: 100 + index,
      company_id: 1,
      created_by: 1,
      contest_name: contestDate(index),
      contest_start_date: isoSpace(start),
      contest_end_date: isoSpace(end),
      created_on: start.toISOString(),
      contest_image_url: '',
      contest_state: states[index] || 'CLOSED',
      contest_rule: states[index] === 'LIVE' ? 'Top 3 players by total wins take the prize.' : '',
      contest_timezone: 'America/New_York',
      trophy_url: states[index] === 'LIVE' ? 'https://fake-static.s3.amazonaws.com/trophy.png' : '',
      // ponytail: ContestTrophyComponent reads data.contestTrophy.name — needs object, not trophy_url string
      trophy: states[index] === 'LIVE' ? {
        contest_id: 100 + index,
        name: 'Sales Champion Trophy',
        description: 'Top 3 players by total wins take the prize.',
        img_url: 'https://fake-static.s3.amazonaws.com/trophy.png',
      } : null,
      rewards: states[index] === 'LIVE' ? {
        reward_id: 1, category_id: 1,
        reward_name: '$50 Amazon Gift Card',
        reward_desc: '$50 Amazon Gift Card',
      } : null,
      owner_firstname: owner.first,
      owner_lastname: owner.last,
      is_editable: (states[index] || 'CLOSED') === 'DRAFT',
      is_authorized: true,
      can_clone: true,
      force_closed_on: null,
      tz_id: 'America/New_York',
      is_new: false,
      polling_identifier: null,
      is_autopilot: index <= 1,
    };
  }

  static list(n = 16): any[] {
    return Array.from({ length: n }, (_, i) => ContestFactory.one(i));
  }

  static games(contestId = 100): any[] {
    return [
      { game_contest_relation_id: 1, contest_id: contestId, game_id: 3361, game_name: 'Sales Fundamentals', game_logo: '', game_start_date: '2026-06-30 00:00:00', game_end_date: '2026-07-22 23:59:59', attempt_count: 2, attempt_type: 'TOTAL', game_state: 'LIVE', contest_timezone: 'America/New_York' },
      { game_contest_relation_id: 2, contest_id: contestId, game_id: 3360, game_name: 'Product Knowledge Q2', game_logo: '', game_start_date: '2026-06-30 00:00:00', game_end_date: '2026-07-22 23:59:59', attempt_count: 2, attempt_type: 'TOTAL', game_state: 'LIVE', contest_timezone: 'America/New_York' },
      { game_contest_relation_id: 3, contest_id: contestId, game_id: 3359, game_name: 'Objection Handling', game_logo: '', game_start_date: '2026-06-30 00:00:00', game_end_date: '2026-07-22 23:59:59', attempt_count: 2, attempt_type: 'TOTAL', game_state: 'LIVE', contest_timezone: 'America/New_York' },
    ];
  }
}
