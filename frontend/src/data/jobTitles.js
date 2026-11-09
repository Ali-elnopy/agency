/* Curated job titles shown when creating or editing a person.
   Other directory titles stay in the database for existing accounts but are
   not offered for new assignments anymore. */

export const PREFERRED_JOB_TITLES = [
  'Graphic Designer',
  'Content Creator',
  'Social Media Specialist',
  'Media Buyer',
];

/* Value used by the job title selects to reveal a free-text field. It is
   deliberately not a real title so it can never collide with stored data. */
export const OTHER_JOB_TITLE = '__other__';

export function isOtherJobTitle(value) {
  return String(value ?? '') === OTHER_JOB_TITLE;
}

/* Always renders the curated list, using the database entry when the title
   exists and a placeholder option otherwise. The placeholder keeps the local
   demo usable when there is no metadata endpoint to read from. */
export function orderJobTitles(titles = []) {
  const byName = new Map(
    titles.map((title) => [String(title.name ?? '').toLowerCase(), title]),
  );

  return PREFERRED_JOB_TITLES.map(
    (name) => byName.get(name.toLowerCase()) ?? { id: `preferred:${name}`, name },
  );
}

/* Keeps an account's existing title selectable even when it is no longer in
   the curated list, so editing other fields does not silently drop it. */
export function jobTitleOptions(titles = [], currentTitle = '') {
  const ordered = orderJobTitles(titles);
  const current = String(currentTitle ?? '').trim();

  if (!current || current.toLowerCase() === 'system admin') return ordered;

  if (ordered.some((title) => title.name.toLowerCase() === current.toLowerCase())) {
    return ordered;
  }

  const match = titles.find(
    (title) => String(title.name ?? '').toLowerCase() === current.toLowerCase(),
  );

  return match ? [match, ...ordered] : [{ id: `legacy:${current}`, name: current }, ...ordered];
}

/* Maps a selected title name onto the payload the API expects. Titles that are
   not in the database yet are sent by name so the API can create/reuse them. */
export function resolveJobTitle(titles = [], name = '') {
  const selected = String(name ?? '').trim();

  if (!selected) return {};

  const match = titles.find(
    (title) => String(title.name ?? '').toLowerCase() === selected.toLowerCase(),
  );

  if (match && Number.isInteger(match.id)) return { jobTitleId: match.id };

  return { customJobTitle: selected };
}
