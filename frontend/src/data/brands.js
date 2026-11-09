/* ==========================================================================
   Brands workspace seed data + shared helpers.
   The workspace currently runs on the client. These fixtures are the first
   paint for the local brand store and are replaced by anything the user
   creates or edits in the browser.
   ========================================================================== */

export const BRAND_STATUSES = [
  { id: 'active', label: 'Active' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'paused', label: 'Paused' },
  { id: 'archived', label: 'Archived' },
];

export const BRAND_STATUS_LABEL = BRAND_STATUSES.reduce((labels, status) => {
  labels[status.id] = status.label;
  return labels;
}, {});

export const COUNTRIES = [
  {
    name: 'United States',
    timezone: 'America/New_York',
    timezoneLabel: 'ET · UTC−5',
  },
  {
    name: 'United Kingdom',
    timezone: 'Europe/London',
    timezoneLabel: 'GMT · UTC+0',
  },
  {
    name: 'Germany',
    timezone: 'Europe/Berlin',
    timezoneLabel: 'CET · UTC+1',
  },
  {
    name: 'France',
    timezone: 'Europe/Paris',
    timezoneLabel: 'CET · UTC+1',
  },
  {
    name: 'Spain',
    timezone: 'Europe/Madrid',
    timezoneLabel: 'CET · UTC+1',
  },
  {
    name: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
    timezoneLabel: 'GST · UTC+4',
  },
  {
    name: 'Saudi Arabia',
    timezone: 'Asia/Riyadh',
    timezoneLabel: 'AST · UTC+3',
  },
  {
    name: 'Egypt',
    timezone: 'Africa/Cairo',
    timezoneLabel: 'EET · UTC+2',
  },
  {
    name: 'Japan',
    timezone: 'Asia/Tokyo',
    timezoneLabel: 'JST · UTC+9',
  },
  {
    name: 'Singapore',
    timezone: 'Asia/Singapore',
    timezoneLabel: 'SGT · UTC+8',
  },
  {
    name: 'Canada',
    timezone: 'America/Toronto',
    timezoneLabel: 'ET · UTC−5',
  },
  {
    name: 'Australia',
    timezone: 'Australia/Sydney',
    timezoneLabel: 'AEDT · UTC+11',
  },
];

export const TIMEZONES = Array.from(
  new Map(
    COUNTRIES.map((country) => [
      country.timezone,
      { value: country.timezone, label: `${country.timezoneLabel} · ${country.timezone}` },
    ]),
  ).values(),
);

export const INDUSTRIES = [
  'HealthTech & Telehealth',
  'EV Automotive & Fleet',
  'Organic Cosmetics',
  'Enterprise AI SaaS',
  'Industrial Automation',
  'Hospitality Franchise',
  'Renewable Energy',
  'Aerospace Engineering',
  'Fashion & Apparel',
  'Food & Beverage',
  'Fintech & Payments',
  'Real Estate & PropTech',
  'Education & Learning',
  'Travel & Leisure',
  'Media & Entertainment',
  'Retail & E-commerce',
];

export const CONTENT_TYPES = [
  { id: 'post', label: 'Post', icon: '#i-file' },
  { id: 'reel', label: 'Reel', icon: '#i-camera' },
];

export const CONTENT_TYPE_LABEL = CONTENT_TYPES.reduce((labels, type) => {
  labels[type.id] = type.label;
  return labels;
}, {});

export const CONTENT_STATUSES = [
  { id: 'planned', label: 'Planned' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'delayed', label: 'Delayed' },
];

export const CONTENT_STATUS_LABEL = CONTENT_STATUSES.reduce((labels, status) => {
  labels[status.id] = status.label;
  return labels;
}, {});

export const TOV_OPTIONS = [
  'Warm & empathetic',
  'Bold & confident',
  'Informative & clear',
  'Playful & witty',
  'Premium & minimal',
  'Inspirational',
];

const SEED_BRANDS = [
  {
    id: 'brand-1',
    name: 'Lumina Health',
    initials: 'LH',
    tone: 'is-orange',
    verified: true,
    industry: 'HealthTech & Telehealth',
    description:
      'Telehealth platform connecting patients with primary and specialist care across the United States.',
    country: 'United States',
    timezone: 'America/New_York',
    timezoneLabel: 'ET · UTC−5',
    website: 'https://luminahealth.io',
    driveFolderUrl: 'https://drive.google.com/drive/folders/lumina-health-assets',
    manager: 'Marcus Vance',
    managerInitials: 'MV',
    managerEmail: 'marcus.vance@orvia-creative.com',
    managerRole: 'Senior Client Partner',
    team: 'Brand Strategy Squad',
    teamMembers: '5 specialists',
    status: 'active',
    createdAt: '2024-10-14',
    contactName: 'Dr. Maya Chen',
    contactRole: 'Head of Brand',
    contactEmail: 'maya@luminahealth.io',
    contactPhone: '+1 (555) 204-8890',
  },
  {
    id: 'brand-2',
    name: 'Kinetic Motors',
    initials: 'KM',
    tone: 'is-blue',
    verified: true,
    industry: 'EV Automotive & Fleet',
    description:
      'Electric vehicle manufacturer building fleet-ready mobility for modern cities and campuses.',
    country: 'United States',
    timezone: 'America/Detroit',
    timezoneLabel: 'ET · UTC−5',
    website: 'https://kineticmotors.com',
    driveFolderUrl: 'https://drive.google.com/drive/folders/kinetic-motors-assets',
    manager: 'Sarah Jenkins',
    managerInitials: 'SJ',
    managerEmail: 'sarah.jenkins@orvia-creative.com',
    managerRole: 'Account Director',
    team: 'Performance Ops',
    teamMembers: '4 specialists',
    status: 'active',
    createdAt: '2024-11-02',
    contactName: 'Jonas Weber',
    contactRole: 'VP Marketing',
    contactEmail: 'jonas@kineticmotors.com',
    contactPhone: '+1 (555) 771-2044',
  },
  {
    id: 'brand-3',
    name: 'Aura Skincare',
    initials: 'AS',
    tone: 'is-pink',
    verified: true,
    industry: 'Organic Cosmetics',
    description:
      'Clean skincare line formulated with organic actives and refillable packaging for everyday rituals.',
    country: 'France',
    timezone: 'Europe/Paris',
    timezoneLabel: 'CET · UTC+1',
    website: 'https://auraskincare.fr',
    driveFolderUrl: 'https://drive.google.com/drive/folders/aura-skincare-assets',
    manager: 'Maya Lin',
    managerInitials: 'ML',
    managerEmail: 'maya.lin@orvia-creative.com',
    managerRole: 'Brand Director',
    team: 'Creative Direction & Motion',
    teamMembers: '6 specialists',
    status: 'active',
    createdAt: '2024-12-12',
    contactName: 'Camille Laurent',
    contactRole: 'Brand Director',
    contactEmail: 'camille@auraskincare.fr',
    contactPhone: '+33 1 84 80 22 18',
  },
  {
    id: 'brand-4',
    name: 'Vertex AI',
    initials: 'VX',
    tone: 'is-purple',
    verified: true,
    industry: 'Enterprise AI SaaS',
    description:
      'Enterprise AI platform helping operations teams deploy reliable, auditable copilots at scale.',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    timezoneLabel: 'PT · UTC−8',
    website: 'https://vertex.ai',
    driveFolderUrl: 'https://drive.google.com/drive/folders/vertex-ai-assets',
    manager: 'David Chen',
    managerInitials: 'DC',
    managerEmail: 'david.chen@orvia-creative.com',
    managerRole: 'Account Manager',
    team: 'Brand Strategy Squad',
    teamMembers: '3 specialists',
    status: 'active',
    createdAt: '2025-01-09',
    contactName: 'Priya Raman',
    contactRole: 'Chief Marketing Officer',
    contactEmail: 'priya@vertex.ai',
    contactPhone: '+1 (415) 555-0192',
  },
  {
    id: 'brand-5',
    name: 'Nova Robotics',
    initials: 'NR',
    tone: 'is-orange',
    verified: false,
    industry: 'Industrial Automation',
    description:
      'Industrial robotics company automating precision assembly for advanced manufacturing lines.',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    timezoneLabel: 'JST · UTC+9',
    website: 'https://novarobotics.jp',
    driveFolderUrl: '',
    manager: '',
    managerInitials: '',
    managerEmail: '',
    managerRole: '',
    team: '',
    teamMembers: '',
    status: 'onboarding',
    createdAt: '2025-02-14',
    contactName: 'Kenji Sato',
    contactRole: 'Head of Marketing',
    contactEmail: 'kenji@novarobotics.jp',
    contactPhone: '+81 3 5550 7712',
  },
  {
    id: 'brand-6',
    name: 'Bloom Care Group',
    initials: 'BC',
    tone: 'is-gray',
    verified: false,
    industry: 'Hospitality Franchise',
    description:
      'Hospitality group operating boutique, care-led stays across the Gulf region.',
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
    timezoneLabel: 'GST · UTC+4',
    website: 'https://bloomcare.ae',
    driveFolderUrl: 'https://drive.google.com/drive/folders/bloom-care-assets',
    manager: 'Sarah Jenkins',
    managerInitials: 'SJ',
    managerEmail: 'sarah.jenkins@orvia-creative.com',
    managerRole: 'Account Director',
    team: 'Brand Strategy',
    teamMembers: '2 specialists',
    status: 'archived',
    createdAt: '2024-07-19',
    contactName: 'Amira Haddad',
    contactRole: 'Group Marketing Lead',
    contactEmail: 'amira@bloomcare.ae',
    contactPhone: '+971 4 555 0138',
  },
  {
    id: 'brand-7',
    name: 'Solaris Energy',
    initials: 'SE',
    tone: 'is-amber',
    verified: true,
    industry: 'Renewable Energy',
    description:
      'Renewable energy developer bringing community solar and storage to Southern Europe.',
    country: 'Spain',
    timezone: 'Europe/Madrid',
    timezoneLabel: 'CET · UTC+1',
    website: 'https://solaris.energy',
    driveFolderUrl: 'https://drive.google.com/drive/folders/solaris-energy-assets',
    manager: 'Liam Chen',
    managerInitials: 'LC',
    managerEmail: 'liam.chen@orvia-creative.com',
    managerRole: 'Account Manager',
    team: 'Editorial & Brand Voice',
    teamMembers: '3 specialists',
    status: 'active',
    createdAt: '2024-05-15',
    contactName: 'Lucía Ortega',
    contactRole: 'Brand Lead',
    contactEmail: 'lucia@solaris.energy',
    contactPhone: '+34 91 555 0184',
  },
  {
    id: 'brand-8',
    name: 'Apex Dynamics',
    initials: 'AD',
    tone: 'is-purple',
    verified: true,
    industry: 'Aerospace Engineering',
    description:
      'Aerospace engineering firm designing next-generation autonomous flight and navigation systems.',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    timezoneLabel: 'GMT · UTC+0',
    website: 'https://apexdynamics.co.uk',
    driveFolderUrl: 'https://drive.google.com/drive/folders/apex-dynamics-assets',
    manager: 'Elana Vance',
    managerInitials: 'EV',
    managerEmail: 'elana.vance@orvia-creative.com',
    managerRole: 'Studio Lead',
    team: 'Digital Product Design',
    teamMembers: '4 specialists',
    status: 'active',
    createdAt: '2024-04-30',
    contactName: 'Oliver Grant',
    contactRole: 'Marketing Director',
    contactEmail: 'oliver@apexdynamics.co.uk',
    contactPhone: '+44 20 7946 0821',
  },
];

export const seedBrands = SEED_BRANDS;

export const seedPlans = [
  { id: 'plan-brand-1-2026-10', brandId: 'brand-1', month: '2026-10', postsTarget: 12, reelsTarget: 8, createdAt: '2026-10-01' },
  { id: 'plan-brand-2-2026-10', brandId: 'brand-2', month: '2026-10', postsTarget: 10, reelsTarget: 6, createdAt: '2026-10-01' },
  { id: 'plan-brand-3-2026-10', brandId: 'brand-3', month: '2026-10', postsTarget: 8, reelsTarget: 10, createdAt: '2026-10-01' },
  { id: 'plan-brand-4-2026-10', brandId: 'brand-4', month: '2026-10', postsTarget: 6, reelsTarget: 4, createdAt: '2026-10-01' },
  { id: 'plan-brand-7-2026-10', brandId: 'brand-7', month: '2026-10', postsTarget: 8, reelsTarget: 6, createdAt: '2026-10-01' },
  { id: 'plan-brand-8-2026-10', brandId: 'brand-8', month: '2026-10', postsTarget: 10, reelsTarget: 8, createdAt: '2026-10-01' },
];

const CONTENT_ROWS = {
  'brand-1': [
    ['post', '5 signs your telehealth visit is working', '2026-10-02', '09:30', 'Warm & empathetic', 'delivered', 'Care should feel continuous, even from home. Here are five signs your virtual visit is doing its job.', 'Pull the stat card from the Q3 patient report.'],
    ['reel', 'Meet your care team in 30 seconds', '2026-10-05', '18:00', 'Bold & confident', 'delivered', 'Real clinicians. Real care. Meet the people behind your next visit.', 'Use the clinic b-roll and the new brand sting.'],
    ['post', 'World Mental Health Day: a softer check-in', '2026-10-10', '10:00', 'Warm & empathetic', 'delivered', 'Today is a reminder that asking “how are you, really?” can change someone’s day.', 'Pair with the clinical helpline carousel.'],
    ['reel', 'How Lumina keeps your data private', '2026-10-12', '19:00', 'Informative & clear', 'delivered', 'Your health data is yours. Here is how we protect it at every step.', 'Animated explainer — approved by legal.'],
    ['post', 'Patient story: care from anywhere', '2026-10-15', '11:00', 'Warm & empathetic', 'delivered', 'A quiet morning, a familiar face on screen, and a care plan that finally fits.', 'Use the approved patient quote.'],
    ['reel', 'Three questions to ask your provider', '2026-10-18', '17:30', 'Informative & clear', 'planned', 'Make your next appointment count with these three simple questions.', 'Talking-head format with Dr. Chen.'],
    ['post', 'Flu season prep, without the panic', '2026-10-20', '09:00', 'Warm & empathetic', 'planned', 'A practical checklist for keeping your household well this season.', 'Link to the seasonal care guide.'],
    ['reel', 'Behind the scenes: our clinical network', '2026-10-22', '18:30', 'Premium & minimal', 'delayed', 'A look inside the network that makes same-day care possible.', 'Waiting on final clinic footage.'],
    ['post', 'Your 2026 wellness checklist', '2026-10-26', '10:00', 'Playful & witty', 'planned', 'Small habits, big payoff. Save this checklist for the week ahead.', 'Carousel version due Thursday.'],
    ['reel', 'What happens after you book?', '2026-10-29', '17:00', 'Informative & clear', 'delayed', 'From booking to follow-up, here is exactly what to expect.', 'Storyboard approved; voiceover pending.'],
  ],
  'brand-2': [
    ['post', 'The fleet that charges itself', '2026-10-01', '09:00', 'Bold & confident', 'delivered', 'Kinetic fleet vehicles spend less time plugged in and more time on the road.', 'Lead with the new depot photography.'],
    ['reel', 'Kinetic K5: 0 to 60 in silence', '2026-10-04', '18:00', 'Premium & minimal', 'delivered', 'No noise. No compromise. Meet the K5.', 'Use the approved track footage.'],
    ['post', 'Why range anxiety is a design problem', '2026-10-08', '10:30', 'Informative & clear', 'delivered', 'The best way to end range anxiety is to design it out of the experience.', 'Link to the engineering blog.'],
    ['reel', 'Inside our Detroit assembly line', '2026-10-14', '17:00', 'Informative & clear', 'planned', 'A 45-second tour of where the K5 comes to life.', 'Safety review required before publish.'],
    ['post', 'EV tax credits, explained simply', '2026-10-17', '09:30', 'Informative & clear', 'delivered', 'A plain-language guide to the incentives that make electric fleets easier to adopt.', 'Legal copy approved 10 Oct.'],
    ['reel', 'A day with a Kinetic fleet manager', '2026-10-21', '18:30', 'Warm & empathetic', 'delayed', 'Follow Maya through a full day of keeping a 40-vehicle fleet moving.', 'Reschedule with the fleet partner.'],
    ['post', 'Winter driving checklist', '2026-10-28', '08:30', 'Playful & witty', 'planned', 'Cold mornings, warm seats, zero guesswork. Your winter checklist is here.', 'Pair with the service-center CTA.'],
  ],
  'brand-3': [
    ['post', 'The refill ritual, simplified', '2026-10-03', '10:00', 'Premium & minimal', 'delivered', 'A quieter routine, a lighter footprint. Meet the refill ritual.', 'Product still life with the amber bottle.'],
    ['reel', 'Three textures, one routine', '2026-10-07', '18:00', 'Warm & empathetic', 'delivered', 'Gel, cream, oil — in the right order, every time.', 'Creator edit due with captions burned in.'],
    ['post', 'Ingredient spotlight: squalane', '2026-10-13', '11:00', 'Informative & clear', 'delivered', 'Why squalane belongs in your everyday barrier routine.', 'Link to the ingredient glossary.'],
    ['reel', 'Unboxing the Aura starter set', '2026-10-19', '17:30', 'Playful & witty', 'planned', 'The starter set, unboxed in under 20 seconds.', 'Use the new packaging samples.'],
    ['post', 'What “clean” actually means', '2026-10-24', '09:30', 'Informative & clear', 'delayed', 'Clean beauty should be clear beauty. Here is how we define it.', 'Final claims review pending.'],
  ],
  'brand-4': [
    ['post', 'The copilot your ops team can trust', '2026-10-06', '09:00', 'Bold & confident', 'delivered', 'Vertex gives operations teams an AI copilot with an audit trail built in.', 'Use the enterprise security stat.'],
    ['reel', 'Vertex in 60 seconds', '2026-10-12', '17:00', 'Informative & clear', 'planned', 'From messy tickets to a clear next action, in under a minute.', 'Screen recording walkthrough.'],
    ['post', 'Enterprise AI without the black box', '2026-10-20', '10:00', 'Informative & clear', 'delivered', 'Every recommendation traceable. Every decision reviewable. That is Vertex.', 'Link to the trust whitepaper.'],
  ],
  'brand-7': [
    ['post', 'Community solar comes to Andalusia', '2026-10-05', '09:00', 'Inspirational', 'delivered', 'A sunny region, a shared grid, and a cleaner way to power local homes.', 'Photography from the Seville site visit.'],
    ['reel', 'The journey of a solar electron', '2026-10-16', '18:00', 'Informative & clear', 'planned', 'Follow the sun from rooftop to socket in 30 seconds.', 'Motion graphics handoff due 12 Oct.'],
    ['post', 'Why local grids matter', '2026-10-22', '10:30', 'Warm & empathetic', 'delayed', 'The energy transition is most powerful when it starts on your street.', 'Awaiting the community impact numbers.'],
  ],
  'brand-8': [
    ['post', 'Autonomous flight, safely engineered', '2026-10-02', '09:30', 'Premium & minimal', 'delivered', 'Every Apex system is designed around one question: what happens if?', 'Use the clean lab photography.'],
    ['reel', 'Inside the Apex wind tunnel', '2026-10-09', '18:00', 'Informative & clear', 'planned', 'A rare look inside the testing facility where flight takes shape.', 'Facility clearance confirmed.'],
    ['post', 'Meet the engineers behind the glide', '2026-10-15', '11:00', 'Warm & empathetic', 'delivered', 'Three engineers, one shared obsession with quiet flight.', 'Portrait series approved.'],
    ['reel', 'Apex at the Farnborough show', '2026-10-27', '17:30', 'Bold & confident', 'planned', 'Come see the next generation of autonomous flight up close.', 'Event team supplying the footage.'],
  ],
};

function buildContent() {
  const items = [];

  Object.entries(CONTENT_ROWS).forEach(([brandId, rows]) => {
    rows.forEach((row, index) => {
      const [type, title, publishDate, publishTime, tov, status, caption, notes] = row;

      items.push({
        id: `content-${brandId}-${index + 1}`,
        brandId,
        month: publishDate.slice(0, 7),
        type,
        title,
        publishDate,
        publishTime,
        tov,
        caption,
        notes,
        referenceUrl: '',
        materialUrl: `https://drive.google.com/drive/folders/${brandId}-materials`,
        designDirection: '',
        status,
        createdAt: '2026-10-01',
      });
    });
  });

  return items;
}

export const seedContent = buildContent();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function monthKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(key, delta) {
  const [year, month] = String(key)
    .split('-')
    .map(Number);
  const date = new Date(year, month - 1 + delta, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key) {
  const [year, month] = String(key)
    .split('-')
    .map(Number);

  if (!year || !month) return key;

  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function monthShortLabel(key) {
  const [year, month] = String(key)
    .split('-')
    .map(Number);

  if (!year || !month) return key;

  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function formatDate(value) {
  if (!value) return '—';

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(value) {
  if (!value) return '—';
  const [hour, minute] = String(value).split(':').map(Number);
  const date = new Date(2026, 0, 1, hour || 0, minute || 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function initialsOf(name) {
  const initials = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || 'BR';
}

export function displayUrl(value) {
  if (!value) return '';

  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

export function timezoneLabelFor(value) {
  const timezone = TIMEZONES.find((item) => item.value === value);
  return timezone ? timezone.label.split(' · ')[0] : value;
}

export function isValidHttpUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
