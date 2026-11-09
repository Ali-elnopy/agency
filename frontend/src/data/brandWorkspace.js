/* Shared vocabulary for the brand workspace: platforms, file categories,
   brief questions and the review states used by strategies / plan directions. */

export const PLATFORM_PRESETS = [
  { name: 'Instagram', short: 'IG', tone: 'is-pink' },
  { name: 'Facebook', short: 'FB', tone: 'is-blue' },
  { name: 'TikTok', short: 'TT', tone: 'is-gray' },
  { name: 'LinkedIn', short: 'IN', tone: 'is-blue' },
  { name: 'YouTube', short: 'YT', tone: 'is-red' },
  { name: 'X (Twitter)', short: 'X', tone: 'is-gray' },
  { name: 'Snapchat', short: 'SC', tone: 'is-amber' },
  { name: 'Pinterest', short: 'PT', tone: 'is-pink' },
  { name: 'Threads', short: 'TH', tone: 'is-purple' },
  { name: 'Google Business', short: 'GB', tone: 'is-green' },
];

export const CONTENT_KINDS = [
  'Static posts',
  'Carousels',
  'Reels',
  'Stories',
  'Videos',
  'Short-form video',
  'Articles',
  'Live sessions',
];

export const ASSET_CATEGORIES = [
  { id: 'logo', label: 'Logo', icon: '#i-briefcase' },
  { id: 'identity', label: 'Visual Identity', icon: '#i-layers' },
  { id: 'video', label: 'Videos', icon: '#i-camera' },
  { id: 'design', label: 'Designs', icon: '#i-crop' },
  { id: 'other', label: 'Other Files', icon: '#i-file' },
];

export const ASSET_CATEGORY_LABEL = ASSET_CATEGORIES.reduce((labels, category) => {
  labels[category.id] = category.label;
  return labels;
}, {});

export const BRIEF_FIELDS = [
  {
    id: 'overview',
    label: 'Brand overview',
    hint: 'Who the brand is, what it sells and what makes it different.',
    placeholder: 'A telehealth platform connecting patients with primary and specialist care…',
  },
  {
    id: 'audience',
    label: 'Target audience',
    hint: 'Who the content is speaking to, and what they care about.',
    placeholder: 'Working professionals aged 28–45 who manage their family’s healthcare…',
  },
  {
    id: 'goals',
    label: 'Goals for this brand',
    hint: 'What the content should achieve this quarter.',
    placeholder: 'Grow qualified leads by 20% and lift engagement on Instagram…',
  },
  {
    id: 'messages',
    label: 'Key messages',
    hint: 'The ideas every piece of content should reinforce.',
    placeholder: 'Care that fits your day. Doctors you can reach in minutes…',
  },
  {
    id: 'tone',
    label: 'Tone of voice',
    hint: 'How the brand sounds across channels.',
    placeholder: 'Warm, reassuring, plain-spoken — never clinical or pushy.',
  },
  {
    id: 'competitors',
    label: 'Competitors & references',
    hint: 'Brands to watch, and references the team should learn from.',
    placeholder: 'Competitor A (strong social), competitor B (strong retention)…',
  },
  {
    id: 'dos',
    label: 'Do’s',
    hint: 'Non-negotiables for every deliverable.',
    placeholder: 'Always show real patients. Use the approved palette. Keep captions short.',
  },
  {
    id: 'donts',
    label: 'Don’ts',
    hint: 'Things that must never appear in the content.',
    placeholder: 'No medical claims, no stock photography, no fear-based hooks.',
  },
];

export const STRATEGY_STATUSES = [
  { id: 'draft', label: 'Draft', tone: 'is-gray' },
  { id: 'in_review', label: 'In review', tone: 'is-amber' },
  { id: 'approved', label: 'Approved', tone: 'is-green' },
  { id: 'changes_requested', label: 'Changes requested', tone: 'is-red' },
];

export const STRATEGY_STATUS_LABEL = STRATEGY_STATUSES.reduce((labels, status) => {
  labels[status.id] = status.label;
  return labels;
}, {});

export const STRATEGY_STATUS_TONE = STRATEGY_STATUSES.reduce((tones, status) => {
  tones[status.id] = status.tone;
  return tones;
}, {});

export const PLAN_DIRECTION_STATUSES = [
  { id: 'draft', label: 'Draft', tone: 'is-gray' },
  { id: 'active', label: 'Active', tone: 'is-green' },
  { id: 'archived', label: 'Archived', tone: 'is-amber' },
];

export const PLAN_DIRECTION_STATUS_LABEL = PLAN_DIRECTION_STATUSES.reduce(
  (labels, status) => {
    labels[status.id] = status.label;
    return labels;
  },
  {},
);

export const PLAN_DIRECTION_STATUS_TONE = PLAN_DIRECTION_STATUSES.reduce((tones, status) => {
  tones[status.id] = status.tone;
  return tones;
}, {});

export function platformShort(name = '') {
  const preset = PLATFORM_PRESETS.find(
    (item) => item.name.toLowerCase() === String(name).toLowerCase(),
  );

  if (preset) return preset.short;

  return String(name)
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function platformTone(name = '') {
  const preset = PLATFORM_PRESETS.find(
    (item) => item.name.toLowerCase() === String(name).toLowerCase(),
  );

  return preset?.tone ?? 'is-orange';
}

export function monthOptions(count = 18) {
  const options = [];
  const now = new Date();

  for (let index = 0; index < count; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    options.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  return options;
}
