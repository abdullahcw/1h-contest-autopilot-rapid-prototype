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
      contest_start_date: start.toISOString().slice(0, 19),
      contest_end_date: end.toISOString().slice(0, 19),
      created_on: start.toISOString(),
      contest_image_url: '',
      contest_state: states[index] || 'CLOSED',
      contest_rule: '',
      contest_timezone: 'America/New_York',
      trophy_url: '',
      owner_firstname: owner.first,
      owner_lastname: owner.last,
      is_editable: true,
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
      { game_contest_relation_id: 1, contest_id: contestId, game_id: 3361, game_name: 'Sales Fundamentals', game_logo: '', game_start_date: '2026-06-30T00:00:00', game_end_date: '2026-07-22T00:00:00', attempt_count: 2, attempt_type: 'TOTAL', game_state: 'LIVE', contest_timezone: 'America/New_York' },
      { game_contest_relation_id: 2, contest_id: contestId, game_id: 3360, game_name: 'Product Knowledge Q2', game_logo: '', game_start_date: '2026-06-30T00:00:00', game_end_date: '2026-07-22T00:00:00', attempt_count: 2, attempt_type: 'TOTAL', game_state: 'LIVE', contest_timezone: 'America/New_York' },
      { game_contest_relation_id: 3, contest_id: contestId, game_id: 3359, game_name: 'Objection Handling', game_logo: '', game_start_date: '2026-06-30T00:00:00', game_end_date: '2026-07-22T00:00:00', attempt_count: 2, attempt_type: 'TOTAL', game_state: 'LIVE', contest_timezone: 'America/New_York' },
    ];
  }
}
