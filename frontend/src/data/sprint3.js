import { TASKS_ARABIC } from './tasksData.js';
/* ==========================================================================
   Sprint 3 — Strategy & content lifecycle fixtures.

   These records simulate the server-side workflow that Sprint 3 introduces:
   questionnaire templates → client portal answers → AI brief → strategy
   approval → campaign-ready content items. Everything is persisted in
   localStorage by Sprint3Context so every screen reads the same records.
   ========================================================================== */


export const TEMPLATE_INDUSTRIES = [
  'E-commerce',
  'Healthcare',
  'Food & Beverage',
  'Real Estate',
  'Fintech',
  'Education',
  'Fashion & Beauty',
  'Travel & Hospitality',
  'SaaS & Technology',
  'Automotive',
  'Other',
];

export const QUESTION_TYPES = [
  { id: 'text', label: 'Short text', icon: '#i-pencil' },
  { id: 'textarea', label: 'Long text', icon: '#i-file' },
  { id: 'single', label: 'Single choice', icon: '#i-check' },
  { id: 'multi', label: 'Multiple choice', icon: '#i-layers' },
  { id: 'file', label: 'File upload', icon: '#i-upload' },
];

export const QUESTION_TYPE_LABEL = QUESTION_TYPES.reduce((labels, type) => {
  labels[type.id] = type.label;
  return labels;
}, {});

export const DISPATCH_STATUSES = [
  { id: 'sent', label: 'Sent', tone: 'is-amber' },
  { id: 'draft', label: 'In progress', tone: 'is-blue' },
  { id: 'submitted', label: 'Submitted', tone: 'is-green' },
];

export const DISPATCH_STATUS_LABEL = DISPATCH_STATUSES.reduce((labels, status) => {
  labels[status.id] = status.label;
  return labels;
}, {});

export const BRIEF_STATUSES = [
  { id: 'draft', label: 'Draft', tone: 'is-amber' },
  { id: 'approved', label: 'Approved', tone: 'is-green' },
];

export const STRATEGY_FLOW = [
  { id: 'draft', label: 'Draft', tone: 'is-gray' },
  { id: 'in_review', label: 'In review', tone: 'is-amber' },
  { id: 'client_review', label: 'Client review', tone: 'is-blue' },
  { id: 'approved', label: 'Approved', tone: 'is-green' },
  { id: 'changes_requested', label: 'Changes requested', tone: 'is-red' },
];

export const STRATEGY_FLOW_LABEL = STRATEGY_FLOW.reduce((labels, status) => {
  labels[status.id] = status.label;
  return labels;
}, {});

export const STRATEGY_FLOW_TONE = STRATEGY_FLOW.reduce((tones, status) => {
  tones[status.id] = status.tone;
  return tones;
}, {});

export const STRATEGY_SECTIONS = [
  {
    id: 'positioning',
    label: 'Positioning',
    hint: 'The space the brand owns in the customer’s mind.',
    placeholder: 'For busy families who need care that fits their day, Lumina is the telehealth…',
  },
  {
    id: 'audience',
    label: 'Audience insight',
    hint: 'The human truth behind the audience and what they need from us.',
    placeholder: 'They are not shopping for care — they are protecting their family’s routine.',
  },
  {
    id: 'pillars',
    label: 'Content pillars',
    hint: 'One pillar per line. These become the pillar list in the content plan.',
    placeholder: 'Everyday care\nTrust & privacy\nReal patient stories',
  },
  {
    id: 'channels',
    label: 'Channel roles',
    hint: 'Where the brand shows up and what each channel is for.',
    placeholder: 'Instagram — reach and daily care rituals\nLinkedIn — employer brand',
  },
  {
    id: 'tone',
    label: 'Tone & messaging',
    hint: 'How every deliverable should sound and the messages it must carry.',
    placeholder: 'Warm, plain-spoken, never clinical. Lead with relief, not fear.',
  },
  {
    id: 'measurement',
    label: 'Measurement',
    hint: 'How we will know the strategy worked.',
    placeholder: 'Qualified visits, saves, care-plan starts, engagement rate.',
  },
];

export const AI_PROVIDERS = [
  { id: 'openai', label: 'OpenAI · GPT-4.1', hint: 'Best general copy and brief reasoning.' },
  { id: 'anthropic', label: 'Anthropic · Claude 4', hint: 'Strong long-form strategy and tone control.' },
  { id: 'gemini', label: 'Google · Gemini 2.5', hint: 'Fast generation with a generous context window.' },
  { id: 'custom', label: 'Custom provider', hint: 'Point at your own gateway or private model.' },
];

export const NOTIFICATION_CHANNELS = [
  { id: 'in_app', label: 'In-App', description: 'Bell notifications inside ORVIA.' },
  { id: 'email', label: 'Email', description: 'Transactional email to the client contact.' },
  { id: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp Business template message.' },
];

export function sprint3Id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function portalToken() {
  return `prt_${Math.random().toString(36).slice(2, 10)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function stamp() {
  return new Date().toISOString();
}

export function formatStamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function linesOf(text = '') {
  return String(text)
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Seed: questionnaire templates                                              */
/* -------------------------------------------------------------------------- */

export const seedTemplates = [
  {
    id: 'tpl-ecommerce',
    name: 'E-commerce Brand Discovery',
    industry: 'E-commerce',
    description: 'Launch-ready discovery for online stores: catalogue, offer and customer journey.',
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-10-12T11:30:00.000Z',
    questions: [
      {
        id: 'q-store',
        label: 'What do you sell, and what is the hero product?',
        type: 'textarea',
        required: true,
        options: [],
      },
      {
        id: 'q-customer',
        label: 'Who is the core customer?',
        type: 'textarea',
        required: true,
        options: [],
      },
      {
        id: 'q-channel',
        label: 'Which channels drive most of your revenue today?',
        type: 'multi',
        required: false,
        options: ['Instagram', 'TikTok', 'Google Shopping', 'Marketplace', 'Retail'],
      },
      {
        id: 'q-goal',
        label: 'Primary goal for the next quarter',
        type: 'single',
        required: true,
        options: ['Grow revenue', 'Launch a product', 'Improve retention', 'Enter a new market'],
      },
      {
        id: 'q-catalogue',
        label: 'Upload the current catalogue or product sheet',
        type: 'file',
        required: false,
        options: [],
      },
    ],
  },
  {
    id: 'tpl-healthcare',
    name: 'Healthcare Content Brief',
    industry: 'Healthcare',
    description: 'Clinical-safe discovery covering patient needs, compliance and trust.',
    createdAt: '2026-09-08T10:15:00.000Z',
    updatedAt: '2026-10-18T08:45:00.000Z',
    questions: [
      {
        id: 'q-service',
        label: 'Which services should the content focus on?',
        type: 'textarea',
        required: true,
        options: [],
      },
      {
        id: 'q-patient',
        label: 'Describe the patient you want to reach.',
        type: 'textarea',
        required: true,
        options: [],
      },
      {
        id: 'q-claims',
        label: 'Are there claims the content must avoid?',
        type: 'textarea',
        required: false,
        options: [],
      },
      {
        id: 'q-trust',
        label: 'What builds trust with your patients?',
        type: 'multi',
        required: false,
        options: ['Real clinicians', 'Patient stories', 'Clear pricing', 'Privacy', 'Same-day care'],
      },
      {
        id: 'q-brand',
        label: 'Upload brand guidelines or disclaimers',
        type: 'file',
        required: false,
        options: [],
      },
    ],
  },
  {
    id: 'tpl-realestate',
    name: 'Real Estate Launch Brief',
    industry: 'Real Estate',
    description: 'Project launch intake: unit mix, location story and buyer profile.',
    createdAt: '2026-09-21T12:00:00.000Z',
    updatedAt: '2026-10-20T16:20:00.000Z',
    questions: [
      {
        id: 'q-project',
        label: 'What is the project and where is it located?',
        type: 'textarea',
        required: true,
        options: [],
      },
      {
        id: 'q-buyer',
        label: 'Who is the target buyer?',
        type: 'single',
        required: true,
        options: ['First-home buyers', 'Investors', 'Families', 'Luxury buyers'],
      },
      {
        id: 'q-phase',
        label: 'Which launch phase are we supporting?',
        type: 'single',
        required: true,
        options: ['Teaser', 'Launch', 'Sales push', 'Handover'],
      },
      {
        id: 'q-usp',
        label: 'List the three strongest selling points.',
        type: 'textarea',
        required: true,
        options: [],
      },
      {
        id: 'q-assets',
        label: 'Upload renders or the master plan',
        type: 'file',
        required: false,
        options: [],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Seed: dispatches (client portal requests)                                  */
/* -------------------------------------------------------------------------- */

export const seedDispatches = [
  {
    id: 'dsp-lumina',
    brandId: 'brand-1',
    brandName: 'Lumina Health',
    templateId: 'tpl-healthcare',
    templateName: 'Healthcare Content Brief',
    industry: 'Healthcare',
    status: 'submitted',
    portalToken: 'prt_lumina2026',
    channels: ['in_app', 'email'],
    note: 'Please complete before our strategy session on Monday.',
    answers: {
      'q-service':
        'Primary care, dermatology and mental health visits — all delivered through same-day video appointments.',
      'q-patient':
        'Working parents aged 28–45 who manage the healthcare of the whole household and have little time to spare.',
      'q-claims': 'No guarantees of diagnosis or treatment outcomes. No fear-based messaging.',
      'q-trust': ['Real clinicians', 'Patient stories', 'Privacy', 'Same-day care'],
      'q-brand': { name: 'lumina-brand-guidelines.pdf', size: '4.2 MB' },
    },
    sentAt: '2026-10-04T09:10:00.000Z',
    submittedAt: '2026-10-06T17:42:00.000Z',
    updatedAt: '2026-10-06T17:42:00.000Z',
  },
  {
    id: 'dsp-aura',
    brandId: 'brand-3',
    brandName: 'Aura Skincare',
    templateId: 'tpl-ecommerce',
    templateName: 'E-commerce Brand Discovery',
    industry: 'E-commerce',
    status: 'draft',
    portalToken: 'prt_aura2026',
    channels: ['in_app'],
    note: 'The refill ritual is the focus this quarter.',
    answers: {
      'q-store':
        'Clean skincare with refillable packaging. The hero product is the Barrier Repair Serum.',
      'q-customer': 'Women aged 25–40 who care about ingredients and want a calmer routine.',
      'q-channel': ['Instagram', 'TikTok'],
      'q-goal': 'Launch a product',
    },
    sentAt: '2026-10-12T10:00:00.000Z',
    submittedAt: null,
    updatedAt: '2026-10-14T08:22:00.000Z',
  },
  {
    id: 'dsp-kinetic',
    brandId: 'brand-2',
    brandName: 'Kinetic Motors',
    templateId: 'tpl-realestate',
    templateName: 'Real Estate Launch Brief',
    industry: 'Real Estate',
    status: 'sent',
    portalToken: 'prt_kinetic2026',
    channels: ['in_app', 'email', 'whatsapp'],
    note: 'Adapted for the fleet launch — ignore the unit-mix questions.',
    answers: {},
    sentAt: '2026-10-18T13:35:00.000Z',
    submittedAt: null,
    updatedAt: '2026-10-18T13:35:00.000Z',
  },
];

/* -------------------------------------------------------------------------- */
/* Seed: AI briefs                                                            */
/* -------------------------------------------------------------------------- */

export const seedBriefs = [
  {
    id: 'brief-lumina',
    brandId: 'brand-1',
    brandName: 'Lumina Health',
    dispatchId: 'dsp-lumina',
    status: 'approved',
    provider: 'openai',
    sections: {
      goals:
        'Grow qualified first-time video visits by 20% this quarter and make same-day care feel like the obvious choice for busy households.',
      audience:
        'Working parents aged 28–45 who carry the healthcare admin for the whole family. They are time-poor, research-led and quietly anxious about getting care right.',
      competitors:
        'BetterHelp owns the mental-health conversation, Teladoc owns insurance-led trust. Lumina can win by owning the everyday family care moment — not the crisis moment.',
      tone:
        'Warm, plain-spoken and reassuring. Lead with relief, never fear. Clinicians are real people; privacy is a promise, not a feature.',
      overview:
        'Lumina is a same-day telehealth platform for primary care, dermatology and mental health, built around the family routine rather than the clinic schedule.',
      messages:
        'Care that fits your day. Doctors you can reach in minutes. Your data stays yours.',
    },
    clarifying: [
      {
        id: 'cl-1',
        question: 'Which service line should lead the campaign — primary care or dermatology?',
        answer: 'Primary care first, dermatology as the second wave.',
      },
      {
        id: 'cl-2',
        question: 'Do we have permission to use the patient story from the Q3 report?',
        answer: 'Yes — written consent is on file.',
      },
    ],
    generatedAt: '2026-10-07T09:05:00.000Z',
    approverName: 'Elena Vance',
    approvedAt: '2026-10-07T10:12:00.000Z',
    createdAt: '2026-10-07T09:05:00.000Z',
    updatedAt: '2026-10-07T10:12:00.000Z',
  },
  {
    id: 'brief-aura',
    brandId: 'brand-3',
    brandName: 'Aura Skincare',
    dispatchId: 'dsp-aura',
    status: 'draft',
    provider: 'anthropic',
    sections: {
      goals: 'Launch the Barrier Repair Serum to the existing community and lift refill attach-rate.',
      audience:
        'Women aged 25–40 who read ingredient lists and want a calmer, lighter routine that still performs.',
      competitors: '',
      tone: 'Quiet, premium and tactile. Slow beauty, not loud beauty.',
      overview: '',
      messages: 'A quieter routine, a lighter footprint.',
    },
    clarifying: [
      {
        id: 'cl-3',
        question: 'Who are the two competitors the client watches most closely?',
        answer: '',
      },
      {
        id: 'cl-4',
        question: 'What proof point supports the barrier-repair claim?',
        answer: '',
      },
    ],
    generatedAt: '2026-10-15T11:30:00.000Z',
    approverName: '',
    approvedAt: '',
    createdAt: '2026-10-15T11:30:00.000Z',
    updatedAt: '2026-10-15T11:30:00.000Z',
  },
];

/* -------------------------------------------------------------------------- */
/* Seed: strategies                                                           */
/* -------------------------------------------------------------------------- */

const emptySections = () =>
  STRATEGY_SECTIONS.reduce((sections, section) => {
    sections[section.id] = { body: '', briefSection: '' };
    return sections;
  }, {});

export const seedStrategies = [
  {
    id: 'str-lumina',
    brandId: 'brand-1',
    brandName: 'Lumina Health',
    briefId: 'brief-lumina',
    title: 'Q4 Everyday Care Strategy',
    sections: {
      ...emptySections(),
      positioning: {
        body: 'Lumina is the family’s front door to care — same-day video visits that fit around school runs, commutes and bedtime.',
        briefSection: 'overview',
      },
      audience: {
        body: 'Time-poor parents who manage everyone else’s health. They want a plan, not a phone tree.',
        briefSection: 'audience',
      },
      pillars: {
        body: 'Everyday care\nTrust & privacy\nReal patient stories\nCare from anywhere',
        briefSection: 'messages',
      },
      channels: {
        body: 'Instagram — daily care rituals and reach\nTikTok — clinician explainers\nLinkedIn — employer benefit story',
        briefSection: 'goals',
      },
      tone: {
        body: 'Warm, plain-spoken, never clinical. Lead with relief.',
        briefSection: 'tone',
      },
      measurement: {
        body: 'Qualified first visits, saves, care-plan starts, engagement rate.',
        briefSection: 'competitors',
      },
    },
    platforms: ['Instagram', 'TikTok', 'LinkedIn'],
    status: 'client_review',
    authorName: 'Noah Reed',
    reviewerName: 'Elena Vance',
    reviewerNote: 'Strong. Tightened the measurement section before sending to the client.',
    clientReason: '',
    clientName: 'Dr. Maya Chen',
    createdAt: '2026-10-09T09:00:00.000Z',
    updatedAt: '2026-10-11T14:20:00.000Z',
    approvedAt: '',
  },
  {
    id: 'str-kinetic',
    brandId: 'brand-2',
    brandName: 'Kinetic Motors',
    briefId: 'brief-kinetic',
    title: 'K5 Fleet Launch Strategy',
    sections: {
      ...emptySections(),
      positioning: {
        body: 'The fleet that spends more time on the road than on the charger.',
        briefSection: 'overview',
      },
      audience: {
        body: 'Operations leads at mid-sized city fleets who are judged on uptime and cost per mile.',
        briefSection: 'audience',
      },
      pillars: {
        body: 'Uptime by design\nTotal cost of ownership\nDriver experience',
        briefSection: 'messages',
      },
      channels: {
        body: 'LinkedIn — fleet decision makers\nInstagram — product craft\nYouTube — depot walkthroughs',
        briefSection: 'goals',
      },
      tone: {
        body: 'Confident, engineering-led, never boastful.',
        briefSection: 'tone',
      },
      measurement: {
        body: 'Qualified fleet demos, cost-per-mile calculator completions, LinkedIn CTR.',
        briefSection: 'competitors',
      },
    },
    platforms: ['LinkedIn', 'Instagram', 'YouTube'],
    status: 'approved',
    authorName: 'Noah Reed',
    reviewerName: 'Elena Vance',
    reviewerNote: 'Approved for the launch window.',
    clientReason: '',
    clientName: 'Jonas Weber',
    createdAt: '2026-09-28T09:00:00.000Z',
    updatedAt: '2026-10-02T16:10:00.000Z',
    approvedAt: '2026-10-02T16:10:00.000Z',
  },
];

/* A matching approved brief for Kinetic so the approved strategy has a source. */
seedBriefs.push({
  id: 'brief-kinetic',
  brandId: 'brand-2',
  brandName: 'Kinetic Motors',
  dispatchId: 'dsp-kinetic',
  status: 'approved',
  provider: 'openai',
  sections: {
    goals: 'Book 40 qualified fleet demos during the K5 launch window.',
    audience:
      'Operations and procurement leads at 20–200 vehicle fleets. They are judged on uptime, cost per mile and driver retention.',
    competitors:
      'Legacy diesel fleets are the real competitor, not another EV. The objection is charging downtime, not range.',
    tone: 'Confident, engineering-led and specific. Show the math; skip the adjectives.',
    overview:
      'Kinetic Motors builds fleet-ready electric vehicles designed around depot charging and predictable uptime.',
    messages: 'Less time plugged in. More time on the road. Every mile accounted for.',
  },
  clarifying: [
    {
      id: 'cl-k1',
      question: 'What is the guaranteed minimum uptime for a 40-vehicle fleet?',
      answer: '97.5% with scheduled depot charging.',
    },
  ],
  generatedAt: '2026-09-25T09:00:00.000Z',
  approverName: 'Elena Vance',
  approvedAt: '2026-09-25T11:45:00.000Z',
  createdAt: '2026-09-25T09:00:00.000Z',
  updatedAt: '2026-09-25T11:45:00.000Z',
});

/* -------------------------------------------------------------------------- */
/* Seed: campaigns                                                            */
/* -------------------------------------------------------------------------- */

export const seedCampaigns = [
  {
    id: 'cmp-lumina-care',
    brandId: 'brand-1',
    name: 'Always-On Care',
    objective: 'Keep same-day care top of mind between seasonal pushes.',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    color: 'is-orange',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'cmp-lumina-flu',
    brandId: 'brand-1',
    name: 'Flu Season Push',
    objective: 'Drive family flu-shot bookings before the peak weeks.',
    startDate: '2026-10-15',
    endDate: '2026-11-30',
    color: 'is-blue',
    createdAt: '2026-10-01T09:05:00.000Z',
  },
  {
    id: 'cmp-kinetic-launch',
    brandId: 'brand-2',
    name: 'K5 Launch',
    objective: 'Put the K5 in front of fleet decision makers during launch.',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    color: 'is-purple',
    createdAt: '2026-09-28T09:00:00.000Z',
  },
];

/* -------------------------------------------------------------------------- */
/* Seed: content item details + campaign links                                */
/* -------------------------------------------------------------------------- */

export const seedContentMeta = {
  'content-brand-1-1': {
    pillar: 'Everyday care',
    campaignId: 'cmp-lumina-care',
    platform: 'Instagram',
    keyMessage: 'Care should feel continuous, even from home.',
    tone: 'Warm & empathetic',
    references: ['Q3 patient report, page 12'],
    notes: 'Pull the stat card from the Q3 report.',
    attachments: [{ name: 'q3-stat-card.png', size: '820 KB' }],
    detailsStatus: 'saved',
    updatedAt: '2026-10-02T09:30:00.000Z',
  },
  'content-brand-1-3': {
    pillar: 'Trust & privacy',
    campaignId: 'cmp-lumina-care',
    platform: 'Instagram',
    keyMessage: 'Asking “how are you, really?” can change a day.',
    tone: 'Warm & empathetic',
    references: ['Clinical helpline carousel'],
    notes: 'Pair with the helpline carousel.',
    attachments: [],
    detailsStatus: 'draft',
    updatedAt: '2026-10-09T10:00:00.000Z',
  },
  'content-brand-1-7': {
    pillar: 'Everyday care',
    campaignId: 'cmp-lumina-flu',
    platform: 'Instagram',
    keyMessage: 'Keep the household well this season.',
    tone: 'Warm & empathetic',
    references: ['Seasonal care guide'],
    notes: 'Link to the seasonal care guide.',
    attachments: [],
    detailsStatus: 'draft',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  'content-brand-2-2': {
    pillar: 'Driver experience',
    campaignId: 'cmp-kinetic-launch',
    platform: 'Instagram',
    keyMessage: 'No noise. No compromise.',
    tone: 'Premium & minimal',
    references: ['Approved track footage'],
    notes: 'Use the approved track footage.',
    attachments: [],
    detailsStatus: 'saved',
    updatedAt: '2026-10-04T18:00:00.000Z',
  },
};

export const seedSettings = {
  aiProvider: 'openai',
  channels: ['in_app', 'email'],
  briefTone: 'Warm & empathetic',
  autoLink: true,
};

/* -------------------------------------------------------------------------- */
/* Arabic dictionary for the Sprint 3 surfaces                                */
/* -------------------------------------------------------------------------- */

export const ARABIC = {
  ...TASKS_ARABIC,
  // Auth & Login Screens

  'Forgot your password?': 'هل نسيت كلمة المرور؟',
  'Enter the work email your agency uses and we\'ll send you a secure reset link.': 'أدخل بريد العمل الخاص بوكالتك وسنرسل لك رابط إعادة تعيين آمن.',
  'Check your inbox!': 'تفقد صندوق الوارد!',
  'Return to Sign In': 'العودة إلى تسجيل الدخول',
  'I already have a reset link': 'لدي بالفعل رابط إعادة تعيين',
  'Work Email Address': 'عنوان البريد الإلكتروني للعمل',
  'Sending…': 'جاري الإرسال…',
  'Security Notice': 'إشعار أمني',
  'For security reasons, we do not confirm whether an account exists with this email address.': 'لأسباب أمنية، لا نؤكد ما إذا كان هناك حساب مسجل بهذا البريد.',
  'End-to-end 256-bit encryption': 'تشفير طرفي كامل 256 بت',
  'Privacy Policy': 'سياسة الخصوصية',
  'Help Desk': 'مكتب المساعدة',
  '1. Reset Form': '1. نموذج التعيين',
  '2. Success': '2. تم بنجاح',
  '3. Expired Link': '3. رابط منتهي',
  'Secure Credential Update': 'تحديث آمن لبيانات الاعتماد',
  'Reset your password': 'إعادة تعيين كلمة المرور',
  'Choose a strong, unique password for': 'اختر كلمة مرور قوية وفريدة لـ',
  'Password updated': 'تم تحديث كلمة المرور',
  'Your credentials are secured. You can now sign in with your new password.': 'تم تأمين بيانات اعتمادك. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
  'Sign in to ORVIA': 'تسجيل الدخول إلى أورفيا',
  'This reset link is incomplete': 'هذا الرابط غير مكتمل',
  'Reset links are single-use and expire after 30 minutes. Request a fresh one and open it from your inbox.': 'روابط إعادة التعيين تُستخدم لمرة واحدة وتنتهي خلال 30 دقيقة. اطلب رابطاً جديداً وافتحه من بريدك.',
  'Request a new link': 'طلب رابط جديد',
  'Confirm New Password': 'تأكيد كلمة المرور الجديدة',
  'Update password & sign in': 'تحديث كلمة المرور والدخول',
  'Updating…': 'جاري التحديث…',
  'Return to Login': 'العودة إلى تسجيل الدخول',
  'Need assistance?': 'هل تحتاج لمساعدة؟',
  'Studio Security Protocol 2.4': 'بروتوكول أمان الاستوديو 2.4',
  'Welcome back': 'مرحباً بعودتك',
  'Sign in to your workspace': 'تسجيل الدخول إلى مساحة عملك',
  'Access your creative operations, briefs, pipelines, and client approvals.': 'الوصول إلى عملياتك الإبداعية، والبريفات، ومسارات العمل، واعتمادات العملاء.',
  'Work Email': 'البريد الإلكتروني للعمل',
  'Password': 'كلمة المرور',
  'Forgot password?': 'نسيت كلمة المرور؟',
  'Keep me signed in for 30 days': 'تذكرني على هذا الجهاز لمدة 30 يوماً',
  'Only for trusted private devices': 'فقط للأجهزة الشخصية الموثوقة',
  'Log in to ORVIA': 'تسجيل الدخول إلى أورفيا',
  'Authenticating…': 'جاري التحقق من الهوية…',
  'Demo login:': 'تسجيل دخول تجريبي سريع:',
  'SOC2 Type II & 256-bit SSL Protected': 'محمي بمعايير SOC2 النوع الثاني وتشفير 256 بت SSL',
  'Privacy': 'سياسة الخصوصية',
  'Terms': 'شروط الاستخدام',
  'Contact Support': 'التواصل مع الدعم الفني',
  'ORVIA Workspace Support': 'دعم مساحة عمل أورفيا',
  'Need assistance accessing your creative workspace?': 'هل تحتاج لمساعدة في الوصول لمساحة عملك الإبداعية؟',
  'For login assistance, password resets, or enterprise single sign-on (SSO) queries, please contact your studio administrator.': 'للمساعدة في تسجيل الدخول أو إعادة تعيين كلمة المرور أو الاستفسارات، يرجى التواصل مع مسؤول الاستوديو.',
  'Support desk:': 'مكتب الدعم الفني:',
  'Start 14-Day Studio Trial': 'بدء تجربة استوديو مجانية لمدة 14 يوماً',
  'Experience full production velocity for your brand & agency.': 'اختبر سرعة الإنتاج الكاملة لعلامتك التجارية ووكالتك.',
  'Request Access': 'طلب صلاحية الدخول',
  'Includes 20 user seats, multi-brand asset review gates, real-time feedback canvases, and priority support.': 'تشمل 20 مقعداً للمستخدمين، وبوابات مراجعة الأصول، ولوحات الملاحظات الفورية، ودعماً ذا أولوية.',
  'Direct onboarding:': 'التسجيل المباشر:',
  'Back to Sign In': 'العودة لتسجيل الدخول',
  'Forgot Password': 'نسيت كلمة المرور',
  'Sent ✓': 'تم الإرسال ✓',
  'Reset instructions': 'تعليمات إعادة التعيين',
  'Enter your work email address to receive password reset instructions.': 'أدخل بريدك الإلكتروني للعمل لتلقي تعليمات إعادة تعيين كلمة المرور.',
  'Send reset link': 'إرسال رابط إعادة التعيين',
  'Sending link…': 'جاري إرسال الرابط…',
  'Check your inbox': 'افحص صندوق الوارد',
  'We\'ve sent a password reset link to': 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى',
  'Resend email': 'إعادة إرسال البريد الإلكتروني',
  'Try another email': 'تجربة بريد إلكتروني آخر',
  'Reset Password': 'إعادة تعيين كلمة المرور',
  'Create new password': 'إنشاء كلمة مرور جديدة',
  'Password requirements': 'متطلبات كلمة المرور',
  'New Password': 'كلمة المرور الجديدة',
  'Confirm Password': 'تأكيد كلمة المرور',
  'Save new password': 'حفظ كلمة المرور الجديدة',
  'Saving…': 'جاري الحفظ…',
  'Password reset successfully': 'تمت إعادة تعيين كلمة المرور بنجاح',
  'Your password has been reset. You can now sign in with your new credentials.': 'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول ببياناتك الجديدة.',
  'Sign in with new password': 'تسجيل الدخول بكلمة المرور الجديدة',
  'At least 12 characters long': '12 حرفاً على الأقل',
  'Contains at least one uppercase letter (A-Z)': 'يحتوي على حرف كبير واحد على الأقل (A-Z)',
  'Contains at least one number (0-9)': 'يحتوي على رقم واحد على الأقل (0-9)',
  'Contains at least one special symbol (!@#$%^&*)': 'يحتوي على رمز خاص واحد على الأقل (!@#$%^&*)',
  'Very Weak': 'ضعيفة جداً',
  'Weak': 'ضعيفة',
  'Fair': 'مقبولة',
  'Good': 'جيدة',
  'Strong': 'قوية',
  'Passwords match': 'كلمات المرور متطابقة',
  'Passwords must match': 'يجب أن تتطابق كلمتا المرور',
  'Password Strength': 'قوة كلمة المرور',
  'Creative Flow Engine 4.2': 'محرك التدفق الإبداعي 4.2',
  '99.98% SLA Availability': 'جاهزية بنسبة 99.98%',
  '12.4k Campaigns Live': '12.4 ألف حملة نشطة',
  'From brief to': 'من الفكرة والبريف إلى',
  'impact.': 'الأثر والتأثير.',
  'The collaborative engine powering high-velocity agency deliverables and effortless client approvals.': 'المحرك التعاوني الذي يقود تسليم مخرجات الوكالة بسرعة فائقة واعتمادات العملاء السلسة.',
  'Clients': 'العملاء',
  'Teams': 'فِرق العمل',
  'Workflow': 'مسار العمل',
  'Review': 'المراجعة',
  'Approvals': 'الاعتمادات',
  'Analyze': 'التحليلات',

  Dashboard: 'لوحة التحكم',
  Brands: 'البراندات',
  Users: 'المستخدمين',
  'Roles & Permissions': 'الأدوار والصلاحيات',
  Profile: 'الملف الشخصي',
  Settings: 'الإعدادات',
  'Studio Lead': 'مدير استوديو',
  'Team Leader': 'قائد فريق',
  'Team Member': 'عضو فريق',
  'Sign out': 'تسجيل الخروج',
  'Click to Sign out': 'انقر لتسجيل الخروج',
  'Help & Documentation': 'المساعدة والتوثيق',
  'Switch to Light Mode': 'التبديل إلى الوضع الفاتح',
  'Switch to Dark Mode': 'التبديل إلى الوضع الداكن',
  'Search pages, brands, teams, people...': 'ابحث في الصفحات، البراندات، الفِرق، الأشخاص...',
  'New Brief': 'بريف جديد',
  'Total Brands': 'إجمالي البراندات',
  'Total Employees': 'إجمالي الموظفين',
  'Active Teams': 'الفِرق النشطة',
  'Operational Units': 'وحدات تشغيلية',
  'Studio Seats': 'مقاعد الاستوديو',
  'Brands per Teams': 'البراندات لكل فريق',
  'Brands currently assigned to each team in the workspace.': 'البراندات المسندة حالياً لكل فريق في مساحة العمل.',
  'Review assignments in Brands →': 'مراجعة تعيينات البراندات ←',
  'Attention Required': 'تنبيهات تتطلب إجراء',
  'Alert': 'تنبيه',
  'Alerts': 'تنبيهات',
  'Brands without teams': 'براندات بدون فِرق',
  'No team': 'بدون فريق',
  'sport': 'رياضة',
  'sport · No team': 'رياضة · بدون فريق',
  'Industrial Automation': 'أتمتة صناعية',
  'Industrial Automation · No team': 'أتمتة صناعية · بدون فريق',
  'Assign Team': 'تعيين فريق',
  'Every brand has a team assigned.': 'جميع البراندات مسندة إلى فِرق العمل.',
  'Workload Allocation Matrix': 'مصفوفة توزيع أعباء العمل',
  'Account managers and the brands currently assigned to them.': 'مديرو الحسابات والبراندات المسندة إليهم حالياً.',
  'Distribution of active brand accounts across squads.': 'توزيع حسابات البراندات النشطة عبر الفِرق.',
  'Assigned Team': 'الفريق المسند',
  'Capacity State': 'حالة الاستيعاب',
  'Optimal': 'مثالي',
  'Has Space': 'توجد سعة',
  'At Capacity': 'مكتمل السعة',
  'Ready': 'جاهز',
  'Available': 'متاح',
  'Lead': 'قائد',
  'Unassigned': 'غير مسند',
  'assigned': 'معيّن',
  'active': 'نشط',
  'deactivated account': 'حساب معطّل',
  'deactivated accounts': 'حسابات معطّلة',
  'Every account is active': 'جميع الحسابات نشطة',
  'All covered': 'مغطاة بالكامل',
  'empty': 'فارغة',
  'brands without a team': 'براندات بدون فريق',
  'brand without a team': 'براند بدون فريق',
  'teams have assigned brands': 'فِرق لديها براندات مسندة',
  'of': 'من',
  'member': 'عضو',
  'members': 'أعضاء',
  'brand': 'براند',
  'brands': 'براندات',
  'No data': 'لا توجد بيانات',
  'Studio metrics are unavailable for this account.': 'مقاييس الاستوديو غير متوفرة لهذا الحساب.',
  'No teams yet.': 'لا توجد فِرق بعد.',
  'Create a team to start distributing brands across the studio.': 'أنشئ فريقاً للبدء في توزيع البراندات عبر الاستوديو.',
  'No account managers yet.': 'لا يوجد مديرو حسابات بعد.',
  'Add an account manager to start tracking brand capacity.': 'أضف مدير حسابات للبدء في تتبع السعة الاستيعابية للبراندات.',
  'Brands without a team are excluded from team workload until a team is assigned.': 'يتم استبعاد البراندات التي لا تملك فريقاً من عبء عمل الفريق حتى يتم تعيين فريق لها.',
  'Brand Strategy & Growth': 'استراتيجية البراند والنمو',
  'Social & Community': 'التواصل والمجتمع',
  'Creative & Motion': 'الإبداع والتحريك',
  'Performance Ops': 'عمليات الأداء',
  'Editorial & Brand': 'التحرير والبراند',
  'Expand sidebar': 'توسيع القائمة الجانبية',
  'Collapse sidebar': 'طي القائمة الجانبية',
  'Nike': 'نايكي',
  'Nova Robotics': 'نوفا روبوتكس',
  'Lumina Health': 'لومينا هيلث',
  'Kinetic Motors': 'كينيتك موتورز',
  'Aura Skincare': 'أورا للعناية بالبشرة',
  'Urban Edge': 'أوربان إيدج',
  'Pulse Fitness': 'بالس فيتنس',
  'Savor Foods': 'سافور فودز',
  'Apex Financial': 'أبيكس فاينانشال',
  'Jump to': 'الانتقال إلى',
  'Pages': 'الصفحات',
  'People': 'الأشخاص',
  'Page': 'صفحة',
  'Team': 'فريق',
  'Strategy & Content': 'الاستراتيجية والمحتوى',
  Templates: 'القوالب',
  'Template Library': 'مكتبة القوالب',
  'Question Dispatch': 'إرسال الأسئلة',
  'Client Portal': 'بوابة العميل',
  'AI Briefs': 'البريف الذكي',
  'AI Brief Generation & Approval': 'توليد واعتماد البريف بالـ AI',
  Strategy: 'الاستراتيجية',
  'Strategy Formulation': 'صياغة الاستراتيجية',
  'Content Items': 'عناصر المحتوى',
  'Content Plan & Items': 'خطة المحتوى والعناصر',
  'Decision Settings': 'إعدادات القرارات التقنية',
  'Role preview': 'معاينة الدور',
  Admin: 'مدير النظام',
  'Account Manager': 'مدير حسابات',
  'Content Creator': 'صانع محتوى',
  Client: 'عميل',
  English: 'English',
  Arabic: 'العربية',
  'New template': 'قالب جديد',
  'Edit template': 'تعديل القالب',
  'Template name': 'اسم القالب',
  Industry: 'المجال',
  Description: 'الوصف',
  Questions: 'الأسئلة',
  'Add question': 'إضافة سؤال',
  'Question text': 'نص السؤال',
  'Question type': 'نوع السؤال',
  Required: 'إلزامي',
  Optional: 'اختياري',
  Options: 'الخيارات',
  'One option per line': 'خيار في كل سطر',
  Save: 'حفظ',
  Cancel: 'إلغاء',
  Delete: 'حذف',
  Edit: 'تعديل',
  'Save draft': 'حفظ كمسودة',
  'Delete template?': 'حذف القالب؟',
  'Send questions': 'إرسال الأسئلة',
  Brand: 'البراند',
  'Select a brand': 'اختر براند',
  'Select a template': 'اختر قالباً',
  'Portal link': 'رابط البوابة',
  'Copy link': 'نسخ الرابط',
  'Open portal': 'فتح البوابة',
  'Simulate notification': 'محاكاة إشعار',
  'Sent requests': 'الطلبات المرسلة',
  'No requests yet': 'لا توجد طلبات بعد',
  'Not submitted': 'لم يُرسل',
  Submitted: 'تم الإرسال',
  'In progress': 'قيد التعبئة',
  Sent: 'تم الإرسال',
  'Edit requested': 'طلب تعديل',
  'View answers': 'عرض الإجابات',
  Answers: 'الإجابات',
  'Brand questions': 'أسئلة البراند',
  'Save draft answers': 'حفظ المسودة',
  'Submit answers': 'إرسال الإجابات',
  'Answers locked': 'الإجابات مقفلة',
  'Request an edit': 'طلب تعديل',
  'Request edit': 'طلب التعديل',
  'Why do you need to edit?': 'لماذا تحتاج للتعديل؟',
  'This link is not valid': 'هذا الرابط غير صالح',
  'Portal closed': 'البوابة مغلقة',
  'Generate brief with AI': 'توليد البريف بالـ AI',
  'Regenerate brief with AI': 'إعادة توليد البريف بالـ AI',
  'Generating…': 'جارٍ التوليد…',
  'Approved brief': 'البريف المعتمد',
  'Draft brief': 'مسودة البريف',
  'Clarifying questions': 'أسئلة توضيحية ذكية',
  'Approve brief': 'اعتماد البريف',
  'Save brief': 'حفظ البريف',
  'Approved by': 'اعتُمد بواسطة',
  'No approved brief': 'لا يوجد بريف معتمد',
  'Answer the client questions first': 'أجب على أسئلة العميل أولاً',
  'Strategy editor': 'محرر الاستراتيجية',
  'Approved brief side by side': 'البريف المعتمد جنباً إلى جنب',
  'Link to brief section': 'ربط بقسم البريف',
  'Submit to account manager': 'إرسال لمدير الحسابات',
  'Send to client': 'إرسال للعميل',
  'Review note': 'ملاحظة المراجعة',
  'Return to creator': 'إرجاع للصانع',
  'Approve strategy': 'اعتماد الاستراتيجية',
  'Approve & send to client': 'اعتماد وإرسال للعميل',
  'Client approval': 'موافقة العميل',
  'Approve': 'موافقة',
  'Request changes': 'طلب تعديلات',
  'Reason is required': 'سبب طلب التعديل مطلوب',
  'The strategy is approved': 'الاستراتيجية معتمدة',
  'Campaigns': 'الحملات',
  'New campaign': 'حملة جديدة',
  'Campaign name': 'اسم الحملة',
  Objective: 'الهدف',
  'Start date': 'تاريخ البداية',
  'End date': 'تاريخ النهاية',
  'Content plan': 'خطة المحتوى',
  Pillar: 'الركيزة / المحور',
  Campaign: 'الحملة',
  Platform: 'المنصة',
  Platforms: 'المنصات',
  Type: 'النوع',
  Date: 'التاريخ',
  Status: 'الحالة',
  'Linked strategy': 'الاستراتيجية المرتبطة',
  'Auto-filled from the approved strategy': 'مُملّأ تلقائياً من الاستراتيجية المعتمدة',
  'Content details': 'تفاصيل المنشور',
  Caption: 'الكابشن',
  'Key message': 'الرسالة الأساسية',
  Tone: 'النبرة',
  References: 'المراجع',
  Notes: 'الملاحظات',
  Attachments: 'المرفقات',
  'Add attachment': 'إضافة مرفق',
  'Details saved as draft': 'تم حفظ التفاصيل كمسودة',
  'Save details': 'حفظ التفاصيل',
  Table: 'جدول',
  Kanban: 'كانبان',
  'AI provider': 'مزود الذكاء الاصطناعي',
  'Notification channels': 'قنوات الإشعارات',
  'Save settings': 'حفظ الإعدادات',
  'Settings saved': 'تم حفظ الإعدادات بنجاح',
  'Required answers are missing': 'هناك إجابات إلزامية ناقصة',
  'Back': 'رجوع',
  'Previewing as': 'معاينة كـ',
  Preview: 'معاينة',
  'Create team for this brand': 'إنشاء فريق لهذا البراند',
  'Team name': 'اسم الفريق',
  'and create its team': 'وإنشاء فريقه',
  'Open': 'فتح',
  'Close': 'إغلاق',
  'No items': 'لا توجد عناصر',
  'All': 'الكل',
  'Approved': 'معتمد',
  'Draft': 'مسودة',
  'In review': 'قيد المراجعة',
  'Client review': 'مراجعة العميل',
  'Changes requested': 'تعديلات مطلوبة',
  'Short text': 'نص قصير',
  'Long text': 'نص طويل',
  'Single choice': 'اختيار فردي',
  'Multiple choice': 'اختيار متعدد',
  'File upload': 'رفع ملف',
  'Brand overview': 'نظرة عامة على البراند',
  'Goals': 'الأهداف',
  'Audience': 'الجمهور المستهدف',
  'Competitors': 'المنافسون',
  'Tone of voice': 'نبرة الصوت',
  'Key messages': 'الرسائل الأساسية',
  'Positioning': 'التموضع',
  'Audience insight': 'رؤية الجمهور',
  'Content pillars': 'ركائز المحتوى',
  'Channel roles': 'أدوار المنصات',
  'Tone & messaging': 'النبرة والرسائل',
  'Measurement': 'قياس الأداء',
  'All industries': 'جميع المجالات',
  'All campaigns': 'جميع الحملات',
  'All pillars': 'جميع الركائز',
  'All statuses': 'جميع الحالات',
  'Open plan sheet': 'فتح جدول الخطة',
  'Apply strategy defaults': 'تطبيق افتراضيات الاستراتيجية',
  'Campaign grouping': 'تجميع الحملات',
  'Details ready': 'التفاصيل جاهزة',
  'Details draft': 'مسودة التفاصيل',
  'No campaign': 'بدون حملة',
  'No pillar': 'بدون ركيزة',
  'No platform': 'بدون منصة',
  'Open strategy': 'فتح الاستراتيجية',
  'Open AI Briefs': 'فتح البريف الذكي',
  'Reopen': 'إعادة فتح',
  'Choose a file': 'اختر ملفاً',
  'Type your answer': 'اكتب إجابتك هنا',
  'Search templates…': 'البحث في القوالب…',
  'Protected client session': 'جلسة عميل محمية',
  'Back to Dashboard': 'العودة للوحة التحكم',
  'Who generates the briefs?': 'من يقوم بتوليد البريفات؟',
  'Where do we reach the client?': 'أين نتواصل مع العميل؟',
  'Auto-link content plans': 'الربط التلقائي لخطط المحتوى',
  'Used by the AI brief generator and the clarifying-question engine.': 'يُستخدم بواسطة منشئ البريف بالـ AI ومحرك الأسئلة التوضيحية.',
  'Active channels receive questionnaire, brief and approval notifications.': 'القنوات النشطة تتلقى إشعارات الاستبيان والبريف والموافقات.',
  'When a strategy is approved, fill pillars and platforms into the monthly plan automatically.': 'عند اعتماد الاستراتيجية، يتم ملء الركائز والمنصات في الخطة الشهرية تلقائياً.',
  'Lock the technical decisions now so the next phase can start without blocking the team.': 'حسم القرارات التقنية الآن حتى تبدأ المرحلة التالية دون تعطيل الفريق.',
  'Read only for this role': 'للقراءة فقط لهذا الدور',
  'Select a brand first.': 'اختر البراند أولاً.',
  'Select a template first.': 'اختر القالب أولاً.',
  'Questions sent to the client portal.': 'تم إرسال الأسئلة لبوابة العميل.',
  'Portal link copied.': 'تم نسخ رابط البوابة.',
  'Notification simulated via': 'تمت محاكاة الإشعار عبر',
  'Pick a brand and a template, then generate the client portal link and notify them.': 'اختر براند وقالباً، ثم قم بتوليد رابط بوابة العميل وإشعارهم.',
  'Templates available': 'القوالب المتاحة',
  'Ready to dispatch': 'جاهزة للإرسال',
  'Awaiting answers': 'في انتظار الإجابات',
  'Draft or not started': 'مسودة أو لم تبدأ',
  'New request': 'طلب جديد',
  'Message to the client': 'رسالة موجهة للعميل',
  'Optional context for the client…': 'سياق توضيحي اختياري للعميل…',
  'Portal link is ready': 'رابط البوابة جاهز',
  'Sent to': 'أُرسل إلى',
  'Share the link with the client.': 'شارك الرابط مع العميل.',
  'Answers unlocked for editing.': 'تم فك قفل الإجابات للتعديل.',
  'Draft saved. You can finish this later from the same link.': 'تم حفظ المسودة. يمكنك المتابعة لاحقاً من نفس الرابط.',
  'Answers submitted. This questionnaire is now locked.': 'تم إرسال الإجابات. تم قفل الاستبيان نهائياً.',
  'Your account manager will unlock the questionnaire.': 'تم إرسال طلب التعديل لمدير الحسابات.',
  'The form is read-only. Request an edit if something needs to change.': 'الاستبيان للقراءة فقط. يمكنك طلب تعديل إذا لزم الأمر.',
  'Note from your account manager': 'ملاحظة من مدير حساباتك',
  'Your answers are submitted': 'تم إرسال إجاباتك بنجاح',
  'answered': 'مُجاب',
  'Not answered': 'لم تتم الإجابة',
  'Draft brief generated. Review each section before approving.': 'تم توليد مسودة البريف. راجع الأقسام قبل الاعتماد.',
  'Brief saved as a draft.': 'تم حفظ البريف كمسودة.',
  'Brief approved and locked.': 'تم اعتماد البريف وتوثيقه بنجاح.',
  'Complete every brief section before approving.': 'يرجى إكمال كل أقسام البريف قبل الاعتماد.',
  'Reading the client answers…': 'جارٍ قراءة إجابات العميل…',
  'Structuring goals, audience, competitors and tone.': 'جارٍ صياغة الأهداف، الجمهور، المنافسين، والنبرة.',
  'Submitted questionnaires': 'الاستبيانات المستلمة',
  'Briefs generated': 'البريفات المولدة',
  'Clarifications open': 'أسئلة توضيحية معلقة',
  'Questions the client still owes us': 'بيانات إضافية مطلوبة من العميل',
  'Client answers': 'إجابات العميل',
  'Questionnaire': 'الاستبيان',
  'AI brief': 'البريف الذكي',
  'Provider': 'المزود',
  'No brief generated yet': 'لم يتم توليد بريف بعد',
  'Run the AI generator to turn the client answers into an editable brief.': 'قم بتشغيل مولد الـ AI لتحويل إجابات العميل إلى بريف قابل للتعديل.',
  'Approve this brief?': 'هل تريد اعتماد هذا البريف؟',
  'Approving locks the brief and records your name, date and time as the approver. The strategy editor will use this version.': 'الاعتماد يقفل البريف ويوثق اسمك وتاريخ ووقت الاعتماد تلقائياً. سيستخدم محرر الاستراتيجية هذا الإصدار.',
  'Approver': 'المسؤول المعتمد',
  'Timestamp': 'الوقت والتاريخ',
  'The AI flagged missing data. Record the client’s answers so the strategy can use them.': 'اكتشف الذكاء الاصطناعي نقصاً في البيانات. دوّن إجابات العميل لتستفيد منها الاستراتيجية.',
  'Client answer…': 'إجابة العميل…',
  'Strategy saved as a draft.': 'تم حفظ الاستراتيجية كمسودة.',
  'Strategy sent to the account manager for review.': 'تم إرسال الاستراتيجية لمدير الحسابات للمراجعة.',
  'Strategy returned to the content creator.': 'تم إرجاع الاستراتيجية لصانع المحتوى مع الملاحظات.',
  'Strategy approved and sent to the client.': 'تمت الموافقة على الاستراتيجية وإرسالها للعميل للموافقة النهائية.',
  'Strategy approved. The content plan is now linked.': 'تم اعتماد الاستراتيجية. خطة المحتوى أصبحت مرتبطة تلقائياً.',
  'Your change request was sent to the account manager.': 'تم إرسال طلب التعديل إلى مدير الحسابات.',
  'Not linked': 'غير مرتبط',
  'Not written yet.': 'لم يُكتب بعد.',
  'Write the strategy next to the approved brief, link every section, then move it through review to client approval.': 'صغ الاستراتيجية بجوار البريف المعتمد، واربط كل قسم، ثم مررها للمراجعة وصولاً لموافقة العميل.',
  'New strategy': 'استراتيجية جديدة',
  'Strategy title': 'عنوان الاستراتيجية',
  'From the brief': 'من البريف المعتمد',
  'This brief section is empty.': 'هذا القسم في البريف فارغ.',
  'Platforms selected here are auto-filled into the content plan.': 'المنصات المختارة هنا يتم ملؤها تلقائياً في خطة المحتوى.',
  'Open content plan': 'فتح خطة المحتوى',
  'Account manager note': 'ملاحظة مدير الحسابات',
  'Client change request': 'طلب تعديل من العميل',
  'Account manager review': 'مراجعة مدير الحسابات',
  'Notes for the creator or the client…': 'ملاحظات للصانع أو للعميل…',
  'Approve the strategy to unlock the content plan, or tell the team what should change.': 'وافق على الاستراتيجية لتفعيل خطة المحتوى، أو اذكر التعديلات المطلوبة.',
  'Why do you need changes? (required to request changes)': 'لماذا تحتاج تعديلات؟ (حقل إلزامي لطلب التعديل)',
  'Waiting for the account manager to review this strategy.': 'في انتظار مراجعة مدير الحسابات لهذه الاستراتيجية.',
  'Waiting for the client to approve this strategy.': 'في انتظار موافقة العميل على هذه الاستراتيجية.',
  'No strategy yet for this brand': 'لا توجد استراتيجية بعد لهذا البراند',
  'Start from the approved brief and draft the first strategy version.': 'ابدأ من البريف المعتمد وصغ المسودة الأولى للاستراتيجية.',
  'The plan is re-linked to the approved strategy: pillars and platforms flow in automatically, and every item can join one campaign.': 'تمت إعادة ربط الخطة بالاستراتيجية المعتمدة: الركائز والمنصات تتدفق تلقائياً، ويمكن لكل عنصر الانضمام لحملة واحدة كحد أقصى.',
  'items linked to the approved strategy.': 'عنصر تم ربطها بالاستراتيجية المعتمدة.',
  'Every item is already linked.': 'كل العناصر مرتبطة بالفعل بالاستراتيجية.',
  'No approved strategy for this brand yet. Approve the strategy to auto-fill pillars and platforms.': 'لا توجد استراتيجية معتمدة لهذا البراند بعد. اعتمد الاستراتيجية لملء الركائز والمنصات تلقائياً.',
  'Items': 'العناصر',
  'Pillar linked': 'مرتبط بركيزة',
  'Pulled from strategy': 'مسحوبة من الاستراتيجية',
  'In a campaign': 'ضمن حملة',
  'One campaign per item': 'حملة واحدة لكل عنصر كحد أقصى',
  'Caption & assets complete': 'الكابشن والملفات مكتملة',
  'Campaign created.': 'تم إنشاء الحملة بنجاح.',
  'Campaign name is required.': 'اسم الحملة مطلوب.',
  'An item can belong to one campaign at most.': 'يمكن للعنصر أن ينتمي لحملة واحدة كحد أقصى.',
  'The final caption the audience will read…': 'الكابشن النهائي الذي سيظهر للجمهور…',
  'One sentence the post must land': 'جملة واحدة محددة يرسخها المنشور',
  'One reference per line': 'مرجع في كل سطر',
  'Internal notes for the production team…': 'ملاحظات داخلية لفريق الإنتاج…',
  'Content': 'المحتوى',
  'Details': 'التفاصيل',
  'Content details saved.': 'تم حفظ تفاصيل المنشور بنجاح.',
  'Template created and ready to dispatch.': 'تم إنشاء القالب وأصبح جاهزاً للإرسال.',
  'Template updated.': 'تم تحديث القالب بنجاح.',
  'Template name is required.': 'اسم القالب مطلوب.',
  'Add at least one question.': 'أضف سؤالاً واحداً على الأقل.',
  'Every question needs a label.': 'كل سؤال يحتاج إلى نص واضح.',
  'Choice questions need at least two options.': 'أسئلة الاختيار تتطلب خيارين على الأقل.',
  'Build the questionnaire library once, then dispatch the right template to every brand.': 'ابنِ مكتبة القوالب مرة واحدة، ثم أرسل القالب المناسب لكل براند.',
  'Across all templates': 'عبر كافة القوالب',
  'In the library': 'في المكتبة',
  'Industries': 'المجالات',
  'Covered by the library': 'تغطيها المكتبة',
  'more questions': 'أسئلة إضافية',
  'Updated': 'تم التحديث',
  'Drag-free ordering: use the arrows to move questions up or down.': 'ترتيب سهل: استخدم الأسهم لنقل الأسئلة لأعلى أو لأسفل.',
  'Move up': 'تحريك لأعلى',
  'Move down': 'تحريك لأسفل',
  'Remove question': 'حذف السؤال',
  'Questions are reused for every brand you dispatch this template to.': 'يُعاد استخدام الأسئلة مع كل براند ترسل له هذا القالب.',
  'Give the strategy a title first.': 'يرجى وضع عنوان للاستراتيجية أولاً.',
  'Fill at least three strategy sections before submitting.': 'املأ ثلاثة أقسام على الأقل قبل الإرسال للمراجعة.',
  'Add a review note before returning the strategy.': 'أضف ملاحظة توضيحية قبل إرجاع الاستراتيجية.',
  'By': 'بواسطة',
  'None selected.': 'لم يتم التحديد.',
  'No description yet.': 'لا يوجد وصف بعد.',
  'questions': 'أسئلة',
  'items': 'عناصر',
  'pillars': 'ركائز',
  'platforms': 'منصات',
  'Needs Team': 'يحتاج إلى فريق',
  'Creative & Motion Studio': 'استوديو الإبداع والتحريك',
  'Editorial & Brand Voice': 'التحرير ونبرة البراند',
  'Brand Strategy Squad': 'فريق استراتيجية البراند',
  'Brand Strategy & Growth Squad': 'فريق استراتيجية البراند والنمو',
  'Performance Content Squad': 'فريق محتوى الأداء',
  'Elena Vance': 'إيلينا فانس',
  'Marcus Brody': 'ماركوس برودي',
  'Maya Lin': 'مايا لين',
  'Sofia Reyes': 'صوفيا رييس',
  'Sarah Lin': 'سارة لين',
  'Liam Chen': 'ليام تشن',
  'Nora Fields': 'نورا فيلدز',
  'David Kim': 'ديفيد كيم',
  'Layla Haddad': 'ليلى حداد',
  'Nadia Fahmy': 'نادية فهمي',
  'Amara Patel': 'أمارا باتيل',
  'Omar Hassan': 'عمر حسن',
  'Noah Bennett': 'نوح بينيت',
  'Tariq Nabil': 'طارق نبيل',
  'Hana Sato': 'هانا ساتو',
  'Vertex AI': 'فيرتكس للذكاء الاصطناعي',
  'Solaris Energy': 'سولاريس للطاقة',
  'Apex Dynamics': 'أبيكس ديناميكس',
  'Bloom Care Group': 'مجموعة بلوم كير',
  'TOTAL BRANDS': 'إجمالي البراندات',
  'TOTAL EMPLOYEES': 'إجمالي الموظفين',
  'ACTIVE TEAMS': 'الفِرق النشطة',
  'BRANDS WITHOUT TEAMS': 'براندات بدون فِرق',
  'BRANDS PER TEAMS': 'البراندات لكل فريق',
  'WORKLOAD ALLOCATION MATRIX': 'مصفوفة توزيع أعباء العمل',
  'ATTENTION REQUIRED': 'تنبيهات تتطلب إجراء',
  'High Priority': 'أولوية قصوى',

  // Navigation & Sections
  'Execution & Review': 'التنفيذ والمراجعة',
  'Tasks Management': 'إدارة المهام',
  'My Work': 'أعمالي',
  'System Admin': 'مدير النظام',

  // Notification channels
  'WhatsApp': 'واتساب',
  'whatsapp': 'واتساب',
  'Email': 'البريد الإلكتروني',
  'email': 'البريد الإلكتروني',
  'In-App': 'داخل التطبيق',
  'In-app': 'داخل التطبيق',
  'in_app': 'داخل التطبيق',
  'Bell notifications inside ORVIA.': 'إشعارات التنبيهات داخل أورفيا.',
  'Transactional email to the client contact.': 'رسائل البريد الإلكتروني المباشرة لجهة اتصال العميل.',
  'WhatsApp Business template message.': 'رسائل قوالب واتساب للأعمال.',

  // Question Dispatch & Templates
  'Template': 'القالب',
  'E-commerce Brand Discovery': 'استكشاف علامة التجارة الإلكترونية',
  'Healthcare Content Brief': 'بريف محتوى الرعاية الصحية',
  'What do you sell, and what is the hero product?': 'ماذا تبيع، وما هو منتجك الرئيسي؟',
  'Who is the core customer?': 'من هو عميلك الأساسي؟',
  'Which channels drive most of your revenue today?': 'ما هي القنوات التي تحقق معظم إيراداتك اليوم؟',
  'Primary goal for the next quarter': 'الهدف الأساسي للربع القادم',
  'Upload the current catalogue or product sheet.': 'ارفع الكتالوج الحالي أو ورقة المنتج.',
  'Upload the current catalogue or product sheet': 'ارفع الكتالوج الحالي أو ورقة المنتج',
  'Which services should the content focus on?': 'ما هي الخدمات التي يجب أن يركز عليها المحتوى؟',
  'Describe the patient you want to reach.': 'صف المريض أو الفئة المستهدفة التي ترغب في الوصول إليها.',
  'Please complete before our strategy session on Monday': 'يرجى الإكمال قبل جلسة الاستراتيجية يوم الاثنين',
  'Please complete before our strategy session on Monday.': 'يرجى الإكمال قبل جلسة الاستراتيجية يوم الاثنين.',
  'Grow revenue': 'زيادة الإيرادات',
  'Launch a product': 'إطلاق منتج',
  'Improve retention': 'تحسين الاحتفاظ بالعملاء',
  'Enter a new market': 'دخول سوق جديدة',
  'Instagram': 'إنستغرام',
  'TikTok': 'تيك توك',
  'Google Shopping': 'جوجل للتسوق',
  'Marketplace': 'المتجر الإلكتروني',
  'Retail': 'تجارة التجزئة',

  // Brands Page & Brand Cards
  'Add Brand': 'إضافة براند',
  'Add Brand +': 'إضافة براند +',
  'Search brands by name, industry, country or manager…': 'ابحث عن البراندات بالاسم، المجال، الدولة أو المدير…',
  'Search brands by name, industry, country or manager': 'ابحث عن البراندات بالاسم، المجال، الدولة أو المدير',
  'Search brands by name, industry, country or manager...': 'ابحث عن البراندات بالاسم، المجال، الدولة أو المدير...',
  '...Search brands by name, industry, country or manager': 'ابحث عن البراندات بالاسم، المجال، الدولة أو المدير...',
  'Search brands': 'البحث في البراندات',
  'Filter brands by status': 'تصفية البراندات حسب الحالة',
  'Open Brand': 'فتح البراند',
  'Awaiting manager assignment': 'بانتظار تعيين مدير',
  'Verified brand': 'براند موثق',
  'Country not set': 'الدولة غير محددة',
  'Timezone not set': 'المنطقة الزمنية غير محددة',
  'No team assigned': 'بدون فريق مسند',
  'No monthly plan yet': 'لا توجد خطة شهرية بعد',
  'No brands yet': 'لا توجد براندات بعد',
  'No brands match those filters': 'لا توجد براندات تطابق هذه الفلاتر',
  'Create your first brand workspace to start building monthly content plans.': 'أنشئ أول مساحة عمل لبراند للبدء في بناء خطط المحتوى الشهرية.',
  'Try a different name, industry, country or status.': 'جرب اسماً أو مجالاً أو دولة أو حالة مختلفة.',
  'Clear filters': 'مسح الفلاتر',
  'Uncategorized': 'غير مصنف',

  // Statuses
  'Active': 'نشط',
  'Onboarding': 'قيد الإعداد',
  'onboarding': 'قيد الإعداد',
  'Archived': 'مؤرشف',
  'archived': 'مؤرشف',
  'Paused': 'متوقف مؤقتاً',
  'paused': 'متوقف مؤقتاً',

  // Countries
  'United States': 'الولايات المتحدة',
  'United Kingdom': 'المملكة المتحدة',
  'Germany': 'ألمانيا',
  'France': 'فرنسا',
  'Spain': 'إسبانيا',
  'United Arab Emirates': 'الإمارات العربية المتحدة',
  'Saudi Arabia': 'المملكة العربية السعودية',
  'Egypt': 'مصر',
  'Japan': 'اليابان',
  'Singapore': 'سنغافورة',
  'Canada': 'كندا',
  'Australia': 'أستراليا',

  // Industries
  'HealthTech & Telehealth': 'تكنولوجيا صحية ورعاية عن بعد',
  'EV Automotive & Fleet': 'سيارات كهربائية وأساطيل',
  'Organic Cosmetics': 'مستحضرات تجميل عضوية',
  'Enterprise AI SaaS': 'برمجيات الذكاء الاصطناعي للشركات',
  'Hospitality Franchise': 'امتياز ضيافة ورعاية',
  'Renewable Energy': 'طاقة متجددة',
  'Aerospace Engineering': 'هندسة الطيران والفضاء',
  'Fashion & Apparel': 'الأزياء والملابس',
  'Food & Beverage': 'الأغذية والمشروبات',
  'Fintech & Payments': 'التكنولوجيا المالية والمدفوعات',
  'Real Estate & PropTech': 'العقارات والتكنولوجيا العقارية',
  'Education & Learning': 'التعليم والتدريب',
  'Travel & Leisure': 'السياحة والترفيه',
  'Media & Entertainment': 'الإعلام والترفيه',
  'Retail & E-commerce': 'التجزئة والتجارة الإلكترونية',
  'E-commerce': 'تجارة إلكترونية',
  'Healthcare': 'رعاية صحية',
  'SaaS': 'برمجيات خدمية',
  'B2B': 'أعمال لأعمال (B2B)',

  // People & Squads
  'Marcus Vance': 'ماركوس فانس',
  'Sarah Jenkins': 'سارة جنكينز',
  'Creative Direction & Motion': 'الإخراج الإبداعي والتحريك',

  // Brand Workspace Hub & Brand Details
  'Brand Brief': 'بريف البراند',
  'Content Strategy': 'استراتيجية المحتوى',
  'Monthly Plans': 'الخطط الشهرية',
  'Files & Assets': 'الملفات والأصول',
  'Social Media Platforms': 'منصات التواصل الاجتماعي',
  'Brand Workspace': 'مساحة عمل البراند',
  'Client data, the collected Q&A and every brief file version.': 'بيانات العميل، والأسئلة والأجوبة المجمعة، وكل نسخ ملفات البريف.',
  'The approved strategy, drafted by the creator and reviewed by the account manager.': 'الاستراتيجية المعتمدة، المصاغة بواسطة المنشئ والمراجعة من مدير الحسابات.',
  'Platform and month selectors, plan directions and the content plan.': 'محددات المنصة والشهر، وتوجيهات الخطة، وخطة المحتوى.',
  'Logo, visual identity, videos, designs and the rest of the library.': 'الشعار، الهوية البصرية، الفيديوهات، التصاميم، وباقي المكتبة.',
  'Every channel the brand publishes on, with its goals and content types.': 'كل قناة ينشر عليها البراند مع أهدافها وأنواع المحتوى.',
  'Edit Brand': 'تعديل البراند',
  'Update Monthly Plan': 'تحديث الخطة الشهرية',
  'Create Monthly Plan': 'إنشاء خطة شهرية',
  'Add Content': 'إضافة محتوى',
  'Restore Brand': 'استعادة البراند',
  'Archive Brand': 'أرشفة البراند',
  'Delete Brand': 'حذف البراند',
  'Add Platform': 'إضافة منصة',
  'Monthly Content Plan': 'خطة المحتوى الشهرية',
  'Targets, delivery health and content output for this brand.': 'الأهداف، صحة التسليم، ومخرجات المحتوى لهذا البراند.',
  'Brand details updated successfully.': 'تم تحديث بيانات البراند بنجاح.',
  'Team Management': 'إدارة الفِرق',
  'Organize members and assign brands to each team.': 'تنظيم الأعضاء وتعيين البراندات لكل فريق.',
  'Add Team': 'إضافة فريق',
  'Team created successfully.': 'تم إنشاء الفريق بنجاح.',
  'Assigned Brands': 'البراندات المسندة',
  'Team Lead': 'قائد الفريق',
  'Members': 'الأعضاء',
  'Team leader:': 'قائد الفريق:',
  'No team leader assigned': 'لم يتم تعيين قائد للفريق',
  'Open Team': 'فتح الفريق',
  'Edit Team': 'تعديل الفريق',
  'No description added.': 'لم تتم إضافة وصف.',
  'Create a team to start assigning members and brands.': 'أنشئ فريقاً للبدء في تعيين الأعضاء والبراندات.',
  'Create a new team for your workspace.': 'إنشاء فريق جديد لمساحة عملك.',
  'Create Team': 'إنشاء الفريق',
  'Team leader': 'قائد الفريق',
  'Team Leader (Optional)': 'قائد الفريق (اختياري)',
  '(Optional)': 'اختياري',
  'Manage team details, leader and members for': 'إدارة تفاصيل الفريق، القائد والأعضاء لـ',
  'Select team leader (optional)': 'اختر قائد الفريق (اختياري)',
  'No leader assigned': 'لم يتم تعيين قائد',
  'Team Name': 'اسم الفريق',
  'Example: Brand Strategy & Growth': 'مثال: استراتيجية ونمو البراند',
  'What does this team own?': 'ما هي اختصاصات ومسؤوليات هذا الفريق؟',
  'What does this team own': 'ما هي اختصاصات ومسؤوليات هذا الفريق؟',
  'What does this team do?': 'ما هو عمل هذا الفريق؟',
  'Manage Team Members': 'إدارة أعضاء الفريق',
  'members selected': 'أعضاء محددون',
  'member selected': 'عضو محدد',
  'Search people by name, email or role…': 'ابحث بالاسم أو البريد أو المسمى الوظيفي…',
  'No eligible people found.': 'لم يتم العثور على أشخاص مؤهلين.',
  'Only active employees, managers, and team leaders can join a team.': 'يمكن فقط للموظفين والمدراء وقادة الفرق النشطين الانضمام إلى الفريق.',
  'The Team Leader is responsible for this team’s members, tasks, and deliverables.': 'قائد الفريق مسؤول عن أعضاء الفريق، والمهام، ومخرجات العمل.',
  'e.g., Performance Creative': 'مثال: الإبداع الأدائي',
  'Describe the team’s focus or responsibilities.': 'صف اختصاص الفريق ومسؤولياته.',
  'No users found.': 'لم يتم العثور على مستخدمين.',
  'Try a different name or email.': 'جرب البحث باسم أو بريد إلكتروني مختلف.',
  'Showing matches for': 'عرض النتائج المطابقة لـ',
  'Full Name': 'الاسم الكامل',
  'Job Title': 'المسمى الوظيفي',
  'Select a job title': 'اختر المسمى الوظيفي',
  'Other': 'أخرى',
  'Enter the job title': 'أدخل المسمى الوظيفي',
  'Access Level': 'مستوى الصلاحية',
  'Work Permissions': 'صلاحيات العمل',
  'Save User': 'حفظ المستخدم',
  'Delete user?': 'حذف المستخدم؟',
  'This action cannot be undone.': 'لا يمكن التراجع عن هذا الإجراء.',
  'Delete User': 'حذف المستخدم',
  'Admin always receives all permissions across the entire workspace.': 'يمتلك مدير النظام دائماً كافة الصلاحيات عبر كامل مساحة العمل.',
  'Team Leader has full management and review access over their assigned team.': 'يمتلك قائد الفريق صلاحيات الإدارة والمراجعة الكاملة لفريقه المسند.',
  'Account Manager receives Review + Publish permissions.': 'يحصل مدير الحسابات على صلاحيات المراجعة والنشر.',
  'Configure individual work permissions for this team member.': 'تخصيص صلاحيات العمل الفردية لهذا العضو في الفريق.',
  'Active account': 'حساب نشط',
  'Create Content': 'إنشاء المحتوى',
  'Manage Monthly Plans': 'إدارة الخطط الشهرية',
  'Manage Plans': 'إدارة الخطط',
  'Review Content': 'مراجعة المحتوى',
  'Publish Content': 'نشر المحتوى',
  'Clear': 'مسح',

  // Content Items & Empty State (Image 1)
  'No items for this month': 'لا توجد عناصر لهذا الشهر',
  'Open the plan sheet to add posts and reels, then link them to the strategy.': 'افتح جدول الخطة لإضافة المنشورات والريلز، ثم اربطها بالاستراتيجية.',

  // Tasks & My Work (Image 2)
  'Write Thought Leadership Article for LinkedIn': 'كتابة مقال قيادة فكرية لمنصة لينكد إن',
  'Long-form commentary on regenerative agriculture and sustainability milestones.': 'تعليق تفصيلي مطول حول الزراعة التجديدية ومحطات الاستدامة الرئيسية.',
  'Founder Manifesto on Sustainability': 'بيان المؤسس حول الاستدامة',
  'Create Carousel Visuals on Hydration Science': 'تصميم شرائح بصرية حول علوم الترطيب',
  '3D renders and nutritional breakdown carousel for wellness consumer launch.': 'تصاميم ثلاثية الأبعاد وشرائح تفصيلية غذائية لإطلاق منتج العافية.',
  'Science Behind Automation Carousel': 'شرائح العلم وراء الأتمتة',
  'Please adjust color palette to match brand guideline hex codes and clarify slide 4 typography.': 'يرجى ضبط لوحة الألوان لتطابق رموز الهوية البصرية وتوضيح الخط في الشريحة الرابعة.',
  'Motion Teaser for TikTok Launch': 'فيديو تشويقي متحرك لإطلاق تيك توك',
  'Fast-paced hook video formatted in 9:16 with dynamic sound sync.': 'فيديو خاطف سريع بصيغة 9:16 مع مزامنة صوتية ديناميكية.',
  'Behind the Scenes Athlete Interview': 'مقابلة مع الرياضي خلف الكواليس',
  'Editorial Copy for Product Launch Newsletter': 'نص تحريري للنشرة الإخبارية لإطلاق المنتج',
  'Engaging email copy with clear CTA for VIP early-access community.': 'نص بريد إلكتروني تفاعلي مع دعوة واضحة لاتخاذ إجراء لمجتمع الوصول المبكر للعملاء المميزين.',
  'VIP Early Access Drop': 'إطلاق الوصول المبكر للعملاء المميزين',
  'Spring Product Reveal Video': 'فيديو الكشف عن منتجات الربيع',
  'VIP Early Access Drop Announcement': 'إعلان إطلاق الوصول المبكر للعملاء المميزين',
  'Motion Designer': 'مصمم موشن',
  'Copywriter & Editor': 'كاتب نصوص ومحرر',
  'Waiting for manager review': 'بانتظار مراجعة المدير',
  'Task updated successfully!': 'تم تحديث المهمة بنجاح!',
  'Task deadline has passed!': 'فات الموعد النهائي للمهمة!',
  'Scheduled deadline': 'الموعد المحدد',
  'No description provided.': 'لا يوجد وصف مدخل.',

  // Client Portal & Questions (Images 3 & 4)
  'Answer these questions so the ORVIA team can build your brief, strategy and content plan.': 'أجب عن هذه الأسئلة حتى يتمكن فريق أورفيا من بناء البريف والاستراتيجية وخطة المحتوى.',
  'Which services should the content focus on': 'ما هي الخدمات التي يجب أن يركز عليها المحتوى؟',
  'Primary care, dermatology and mental health visits — all delivered through same-day video appointments.': 'زيارات الرعاية الأولية، والأمراض الجلدية، والصحة النفسية — تُقدَّم جميعها عبر مواعيد فيديو في نفس اليوم.',
  'Primary care, dermatology and mental health visits — all delivered through same-day video appointments': 'زيارات الرعاية الأولية، والأمراض الجلدية، والصحة النفسية — تُقدَّم جميعها عبر مواعيد فيديو في نفس اليوم',
  'Describe the patient you want to reach': 'صف المريض أو الفئة المستهدفة التي ترغب في الوصول إليها',
  'Working parents aged 28–45 who manage the healthcare of the whole household and have little time to spare.': 'الآباء والأمهات العاملون الذين تتراوح أعمارهم بين 28 و45 عاماً والذين يديرون الرعاية الصحية لجميع أفراد الأسرة ولديهم القليل من وقت الفراغ.',
  'Are there claims the content must avoid?': 'هل هناك ادعاءات يجب أن يتجنبها المحتوى؟',
  'Are there claims the content must avoid': 'هل هناك ادعاءات يجب أن يتجنبها المحتوى؟',
  'No guarantees of diagnosis or treatment outcomes. No fear-based messaging.': 'لا ضمانات لنتائج التشخيص أو العلاج. تجنب الرسائل القائمة على التخويف.',
  'What builds trust with your patients?': 'ما الذي يبني الثقة مع مرضاك؟',
  'What builds trust with your patients': 'ما الذي يبني الثقة مع مرضاك؟',
  'Real clinicians': 'أطباء معتمدون وحقيقيون',
  'Patient stories': 'قصص وتجارب المرضى',
  'Clear pricing': 'تسعير واضح وشفاف',
  'Same-day care': 'رعاية في نفس اليوم',
  'Upload brand guidelines or disclaimers': 'ارفع إرشادات الهوية أو إخلاء المسؤولية',
  'Editing after submission is only possible through your account manager. Tell them what needs to change.': 'التعديل بعد الإرسال ممكن فقط من خلال مدير حسابك. أخبره بالتعديلات المطلوبة.',
  'lumina-brand-guidelines.pdf': 'دليل-هوية-لومينا.pdf',

  // Additional Seeds (Briefs, Templates, Strategies)
  'Clean skincare with refillable packaging. The hero product is the Barrier Repair Serum.': 'عناية نظيفة بالبشرة بعبوات قابلة لإعادة التعبئة. المنتج البطل هو سيروم إصلاح حاجز البشرة.',
  'Women aged 25–40 who care about ingredients and want a calmer routine.': 'النساء من سن 25 إلى 40 عاماً اللاتي يهتممن بالمكونات ويرغبن في روتين أكثر هدوءاً.',
  'Launch-ready discovery for online stores: catalogue, offer and customer journey.': 'استكشاف جاهز للإطلاق للمتاجر الإلكترونية: الكتالوج، العرض ورحلة العميل.',
  'The refill ritual is the focus this quarter.': 'طقوس إعادة التعبئة هي محور التركيز لهذا الربع.',
  'Adapted for the fleet launch — ignore the unit-mix questions.': 'معدّل لإطلاق الأسطول — تجاهل أسئلة مزيج الوحدات.',
  'Project launch intake: unit mix, location story and buyer profile.': 'استيعاب إطلاق المشروع: مزيج الوحدات، قصة الموقع وملف المشتري.',
  'Real Estate Launch Brief': 'بريف إطلاق العقارات',
  'Q4 Everyday Care Strategy': 'استراتيجية الرعاية اليومية للربع الرابع',
  'K5 Fleet Launch Strategy': 'استراتيجية إطلاق أسطول K5',
  'Strong. Tightened the measurement section before sending to the client.': 'ممتاز. تم تحسين قسم قياس الأداء بدقة قبل إرساله للعميل.',

  // AI Brief Hints & Sections
  'One paragraph describing the brand and its promise.': 'فقرة واحدة تصف البراند ووعده للجمهور.',
  'What the content must achieve this quarter.': 'ما يجب أن يحققه المحتوى خلال هذا الربع.',
  'Who we are speaking to and what they care about.': 'من نخاطبهم وما الذي يهتمون لأجله.',
  'The brands we are measured against and the gap we can own.': 'العلامات التي نقارن بها والفرصة الفريدة التي يمكننا امتلاكها.',
  'How the brand sounds across every channel.': 'كيف تبدو نبرة البراند عبر جميع القنوات.',
  'The ideas every deliverable should reinforce.': 'الأفكار التي يجب أن يرسخها كل محتوى أو مخرج إبداعي.',
  'Read the client’s answers, generate a brief, fill the gaps and approve it with an auditable signature.': 'اقرأ إجابات العميل، وقم بتوليد البريف، واستكمل النواقص واعتمده بتوثيق رسمي.',
  'Read the client\'s answers, generate a brief, fill the gaps and approve it with an auditable signature.': 'اقرأ إجابات العميل، وقم بتوليد البريف، واستكمل النواقص واعتمده بتوثيق رسمي.',
  'Ready for AI processing': 'جاهزة للمعالجة بالذكاء الاصطناعي',

  // AI Brief Bodies (Lumina Health)
  'Lumina is a same-day telehealth platform for primary care, dermatology and mental health, built around the family routine rather than the clinic schedule.': 'لومينا هي منصة رعاية صحية عن بعد في نفس اليوم لخدمات الطب العام، والأمراض الجلدية، والصحة النفسية، صُممت لتلائم روتين العائلة بدلاً من جدول العيادة التقليدي.',
  'Grow qualified first-time video visits by 20% this quarter and make same-day care feel like the obvious choice for busy households.': 'زيادة زيارات الفيديو المؤهلة لأول مرة بنسبة 20% هذا الربع وجعل الرعاية في نفس اليوم الخيار البديهي للأسر المشغولة.',
  'Working parents aged 28–45 who carry the healthcare admin for the whole family. They are time-poor, research-led and quietly anxious about getting care right.': 'الآباء والأمهات العاملون من سن 28 إلى 45 عاماً الذين يتحملون إدارة الرعاية الصحية لجميع أفراد الأسرة. وقتهم ضيق، ويعتمدون على البحث الذاتي ولديهم قلق دفين بشأن الحصول على الرعاية المناسبة.',
  'BetterHelp owns the mental-health conversation, Teladoc owns insurance-led trust. Lumina can win by owning the everyday family care moment — not the crisis moment.': 'بيتر هيلب تستحوذ على حوار الصحة النفسية، وتيلادوك تمتلك ثقة التأمين. يمكن للومينا الفوز من خلال الاستحواذ على لحظات الرعاية الأسرية اليومية — وليس فقط لحظات الأزمات.',
  'Warm, plain-spoken and reassuring. Lead with relief, never fear. Clinicians are real people; privacy is a promise, not a feature.': 'دافئة، واضحة ومطمئنة. ابدأ بتقديم مشاعر الارتياح، ولا تلجأ للتخويف أبداً. الأطباء أشخاص حقيقيون، والخصوصية عهد وليست مجرد ميزة.',
  'Care that fits your day. Doctors you can reach in minutes. Your data stays yours.': 'رعاية تلائم يومك. أطباء تصل إليهم في دقائق. بياناتك تظل ملكك دائماً.',

  // Strategy Bodies & Pillars
  'Lumina is the family’s front door to care — same-day video visits that fit around school runs, commutes and bedtime.': 'لومينا هي الباب الأول للعائلة نحو الرعاية — مواعيد فيديو في نفس اليوم تتلاءم مع توصيل المدارس والتنقل ومواعيد النوم.',
  'Lumina is the family\'s front door to care — same-day video visits that fit around school runs, commutes and bedtime.': 'لومينا هي الباب الأول للعائلة نحو الرعاية — مواعيد فيديو في نفس اليوم تتلاءم مع توصيل المدارس والتنقل ومواعيد النوم.',
  'Time-poor parents who manage everyone else’s health. They want a plan, not a phone tree.': 'أولياء الأمور المشغولون الذين يديرون صحة الجميع. يريدون خطة واضحة ومباشرة دون تعقيدات هاتفية.',
  'Time-poor parents who manage everyone else\'s health. They want a plan, not a phone tree.': 'أولياء الأمور المشغولون الذين يديرون صحة الجميع. يريدون خطة واضحة ومباشرة دون تعقيدات هاتفية.',
  'Everyday care\nTrust & privacy\nReal patient stories\nCare from anywhere': 'رعاية يومية\nالثقة والخصوصية\nقصص مرضى حقيقية\nرعاية من أي مكان',
  'Instagram — daily care rituals and reach\nTikTok — clinician explainers\nLinkedIn — employer benefit story': 'إنستغرام — عادات الرعاية اليومية والوصول\nتيك توك — شروحات الأطباء التوعوية\nلينكد إن — قصة مزايا أصحاب العمل',
  'Warm, plain-spoken, never clinical. Lead with relief.': 'دافئة، بسيطة وواضحة، غير معقدة طبياً. ابدأ بتقديم الارتياح والاطمئنان.',
  'Qualified first visits, saves, care-plan starts, engagement rate.': 'الزيارات الأولى المؤهلة، الحفظ، بدء خطط الرعاية، ومعدل التفاعل.',
  'LinkedIn': 'لينكد إن',

  // Team Descriptions
  'Paid social, performance creative and reporting for high-velocity acquisition accounts.': 'إعلانات وسائل التواصل المدفوعة، والإبداع الأدائي، والتقارير لحسابات الاستحواذ سريعة النمو.',
  'Art direction, content production and motion design across every campaign channel.': 'الإخراج الفني، وإنتاج المحتوى، وتصميم الرسوم المتحركة عبر كافة قنوات الحملات.',
  'Brand positioning, market strategy and growth programs for the studio’s flagship accounts.': 'تموضع البراند، واستراتيجية السوق، وبرامج النمو للحسابات الرائدة في الاستوديو.',
  'Brand positioning, market strategy and growth programs for the studio\'s flagship accounts.': 'تموضع البراند، واستراتيجية السوق، وبرامج النمو للحسابات الرائدة في الاستوديو.',
  'Editorial systems, long-form content and brand voice guidelines for enterprise teams.': 'الأنظمة التحريرية، والمحتوى المطول، وإرشادات نبرة صوت البراند لفِرق الشركات.',
  'Always-on social operations, publishing and community management for retained brands.': 'عمليات التواصل المستمرة، والنشر، وإدارة المجتمعات التفاعلية للبراندات المستمرة معنا.',

  // Users Page
  'Edit roles, permissions and account status.': 'تعديل الأدوار والصلاحيات وحالة الحساب.',
  'Add User': 'إضافة مستخدم',
  'Add User +': 'إضافة مستخدم +',
  'USERS': 'المستخدمين',
  'ACTIVE': 'النشطين',
  'INACTIVE': 'غير النشطين',
  'Inactive': 'غير نشط',
  'ADMIN': 'مدير النظام',
  'ACCOUNT MANAGER': 'مدير حسابات',
  'EMPLOYEE': 'موظف',
  'TEAM LEADER': 'قائد فريق',
  'Brand Director': 'مدير البراند',
  'Community Manager': 'مدير مجتمع',
  'Copywriter': 'كاتب نصوص',
  'Designer': 'مصمم',
  'Edit User': 'تعديل المستخدم',
  'Team: Brand Strategy & Growth': 'الفريق: استراتيجية البراند والنمو',
  'Team: Creative Production': 'الفريق: الإنتاج الإبداعي',
  'Team: Performance & Growth': 'الفريق: الأداء والنمو',
  'Team: Editorial & Content': 'الفريق: التحرير والمحتوى',
  'Team: Social & Community': 'الفريق: التواصل والمجتمع',

  // Profile Page
  'PROFILE': 'الملف الشخصي',
  'My details': 'بياناتي الشخصية',
  'Personal identification and role assignment within the agency.': 'البيانات الشخصية وتعيين الدور الوظيفي داخل الوكالة.',
  'Profile Photo': 'صورة الملف الشخصي',
  'PNG, JPG, or WEBP up to 5MB. Circular display across Kanban & avatars.': 'صيغ PNG أو JPG أو WEBP حتى 5 ميجابايت. تظهر بشكل دائري عبر لوحة كانبان والصور الرمزية.',
  'Upload photo': 'رفع صورة',
  'Upload profile photo': 'رفع صورة الملف الشخصي',
  'Crop': 'قص',
  'Remove': 'إزالة',
  'Phone Number': 'رقم الهاتف',
  'Used strictly for two-factor security alerts.': 'يُستخدم حصرياً لتنبيهات الأمان والمصادقة الثنائية.',
  'Used strictly for two-factor security alerts': 'يُستخدم حصرياً لتنبيهات الأمان والمصادقة الثنائية.',
  'Work email': 'البريد الإلكتروني للعمل',
  'Managed by workspace administrator': 'مُدار بواسطة مسؤول مساحة العمل',
  'Contact your administrator to change your sign-in email.': 'تواصل مع مسؤول النظام لتغيير بريد تسجيل الدخول.',
  'Contact your administrator to change your sign-in email': 'تواصل مع مسؤول النظام لتغيير بريد تسجيل الدخول.',
  'Role Assignment': 'الدور الوظيفي',
  'Role assignment': 'الدور الوظيفي',
  'Assigned by your workspace administrator.': 'مُعين بواسطة مسؤول مساحة العمل.',
  'Assigned by your workspace administrator': 'مُعين بواسطة مسؤول مساحة العمل.',
  'Assigned Squad': 'الفريق المسند',
  'Assigned squad': 'الفريق المسند',
  'Squad membership follows your team assignments.': 'تتبع عضوية الفريق تعييناتك في الفِرق.',
  'Squad membership follows your team assignments': 'تتبع عضوية الفريق تعييناتك في الفِرق.',
  'Studio Lead / Account Manager': 'قائد استوديو / مدير حسابات',
  'Account Manager / Ops': 'مدير حسابات / عمليات',
  'All changes saved': 'تم حفظ جميع التغييرات',
  'Unsaved changes': 'تغييرات غير محفوظة',
  'Save changes': 'حفظ التغييرات',
  'Profile photo updated.': 'تم تحديث صورة الملف الشخصي.',
  'Crop tool opened.': 'تم فتح أداة القص.',
  'Profile photo removed.': 'تمت إزالة صورة الملف الشخصي.',
  'Profile changes saved successfully.': 'تم حفظ تغييرات الملف الشخصي بنجاح.',
  'Changes discarded.': 'تم تجاهل التغييرات.',
  'Personal identification and role assignment within the agency': 'البيانات الشخصية وتعيين الدور الوظيفي داخل الوكالة.',
  'PNG, JPG, or WEBP up to 5MB. Circular display across Kanban & avatars': 'PNG أو JPG أو WEBP حتى 5 ميجابايت. عرض دائري في لوحة المهام والصور الشخصية.',

  // Settings Page
  'Admin Settings': 'إعدادات الإدارة',
  'ADMIN SETTINGS': 'إعدادات الإدارة',
  'Control default workflow deadlines and keep your account secure.': 'تحكم في المواعيد النهائية الافتراضية لسير العمل وحافظ على أمان حسابك.',
  'Control default workflow deadlines and keep your account secure': 'تحكم في المواعيد النهائية الافتراضية لسير العمل وحافظ على أمان حسابك.',
  'Workflow Settings': 'إعدادات سير العمل',
  'Control the default deadline rules used when an Account Manager assigns a new content workflow. Existing tasks keep their current due dates.': 'تحكم في قواعد المواعيد النهائية الافتراضية المستخدمة عندما يسند مدير الحساب سير عمل محتوى جديد. تحتفظ المهام الحالية بمواعيد استحقاقها الحالية.',
  'Control the default deadline rules used when an Account Manager assigns a new content workflow. Existing tasks keep their current due dates': 'تحكم في قواعد المواعيد النهائية الافتراضية المستخدمة عندما يسند مدير الحساب سير عمل محتوى جديد. تحتفظ المهام الحالية بمواعيد استحقاقها الحالية.',
  'Deadline Rules': 'قواعد المواعيد النهائية',
  'Example: 48 hours means the task is due 48 hours before publish_at.': 'مثال: 48 ساعة تعني أن موعد استحقاق المهمة قبل 48 ساعة من وقت النشر.',
  'Example: 48 hours means the task is due 48 hours before publish_at': 'مثال: 48 ساعة تعني أن موعد استحقاق المهمة قبل 48 ساعة من وقت النشر.',
  'Production': 'الإنتاج والتنفيذ',
  'Publish': 'النشر',
  'Deadline is calculated this many hours before the content publish time.': 'يتم احتساب الموعد النهائي بهذا العدد من الساعات قبل موعد نشر المحتوى.',
  'Deadline is calculated this many hours before the content publish time': 'يتم احتساب الموعد النهائي بهذا العدد من الساعات قبل موعد نشر المحتوى.',
  'Hours before publish': 'ساعات قبل النشر',
  'HOURS BEFORE PUBLISH': 'ساعات قبل النشر',
  'deadline saved.': 'تم حفظ الموعد النهائي.',
  'Security': 'الأمان والحماية',
  'Update password and session preferences.': 'تحديث كلمة المرور وتفضيلات الجلسات النشطة.',
  'Update password and session preferences': 'تحديث كلمة المرور وتفضيلات الجلسات النشطة.',
  'Current Password': 'كلمة المرور الحالية',
  'Enter fresh passphrase': 'أدخل كلمة مرور جديدة',
  'Security strength:': 'قوة كلمة المرور:',
  'Security strength': 'قوة كلمة المرور',
  '16+ characters': '16+ حرفاً',
  'Characters >16': '16+ حرفاً',
  'characters +16': '16+ حرفاً',
  'Characters +16': '16+ حرفاً',
  'characters >16': '16+ حرفاً',
  'Uppercase (A-Z)': 'أحرف كبيرة (A-Z)',
  'Numbers (0-9)': 'أرقام (0-9)',
  'Special symbol (!@#)': 'رمز خاص (!@#)',
  'Special symbol': 'رمز خاص',
  '#!@%?! Special symbol': 'رمز خاص (!@#)',
  '!#@$! Special symbol': 'رمز خاص (!#@$)',
  'Special symbol (!#@$)': 'رمز خاص (!#@$)',
  'Re-type new passphrase': 'أعد إدخال كلمة المرور الجديدة',
  'Passwords match correctly': 'كلمتا المرور متطابقتان تماماً',
  'Update password': 'تحديث كلمة المرور',
  'Log out': 'تسجيل الخروج',
  'Active Sessions': 'الجلسات النشطة',
  'Logged in on 3 devices': 'مسجل الدخول على 3 أجهزة',
  'Log out all devices': 'تسجيل الخروج من جميع الأجهزة',
  'Workspace Admin': 'مسؤول مساحة العمل',
  'Enter a whole number between 0 and 720.': 'أدخل رقماً صحيحاً بين 0 و 720.',
  'Use 16+ characters with an uppercase letter, a number and a special symbol.': 'استخدم 16+ حرفاً مع حرف كبير ورقم ورمز خاص.',
  'Choose a password that differs from your current one.': 'اختر كلمة مرور مختلفة عن كلمة مرورك الحالية.',
  'Password changed successfully.': 'تم تغيير كلمة المرور بنجاح.',
  'Signed out of all other devices.': 'تم تسجيل الخروج من كافة الأجهزة الأخرى.',

  // Fallbacks & Dashboard Empty States
  'Team data is unavailable.': 'بيانات الفريق غير متوفرة لهذا الحساب.',
  'Team data is unavailable': 'بيانات الفريق غير متوفرة لهذا الحساب.',
  'Sign in with an administrator account to see team distribution.': 'سجل الدخول بحساب مسؤول للاطلاع على توزيع الفرق.',
  'Sign in with an administrator account to see team distribution': 'سجل الدخول بحساب مسؤول للاطلاع على توزيع الفرق.',
  'Workload data is unavailable.': 'بيانات أعباء العمل غير متوفرة لهذا الحساب.',
  'Workload data is unavailable': 'بيانات أعباء العمل غير متوفرة لهذا الحساب.',
  'Sign in with an administrator account to see workload.': 'سجل الدخول بحساب مسؤول للاطلاع على أعباء العمل.',
  'Sign in with an administrator account to see workload': 'سجل الدخول بحساب مسؤول للاطلاع على أعباء العمل.',
  'Alerts are unavailable for this account.': 'التنبيهات غير متوفرة لهذا الحساب.',
  'Alerts are unavailable for this account': 'التنبيهات غير متوفرة لهذا الحساب.',

  // New Brief Modal
  'Create Creative Brief': 'إنشاء بريف إبداعي',
  'Launch a new campaign asset brief across brands and creative teams.': 'إطلاق بريف حملة وأصول جديد عبر البراندات والفرق الإبداعية.',
  'Launch a new campaign asset brief across brands and creative teams': 'إطلاق بريف حملة وأصول جديد عبر البراندات والفرق الإبداعية.',
  'e.g. Q4 Global Brand Relaunch Hero Motion': 'مثال: فيديو موشن إطلاق الهوية العالمية للربع الرابع',
  'Brief Title': 'عنوان البريف',
  'Brand Partner': 'البراند الشريك',
  'Deliverable Type': 'نوع المخرج الإبداعي',
  'Production Priority': 'أولوية الإنتاج',
  'Target Delivery Date': 'تاريخ التسليم المستهدف',
  'Creative Scope & Objectives': 'نطاق وأهداف العمل الإبداعي',
  'Outline strategic goals, target audience, deliverables checklist, and brand compliance guidelines.': 'حدد الأهداف الاستراتيجية، الجمهور المستهدف، قائمة المخرجات، وإرشادات هوية البراند.',
  'Outline strategic goals, target audience, deliverables checklist, and brand compliance guidelines': 'حدد الأهداف الاستراتيجية، الجمهور المستهدف، قائمة المخرجات، وإرشادات هوية البراند.',
  'Launch Brief': 'إطلاق البريف',
  'Motion & 3D Video': 'فيديو موشن وثلاثي الأبعاد',
  'Brand Refresh Deck': 'ملف تحديث هوية البراند',
  'Social Carousel Assets': 'أصول كاروسيل التواصل الاجتماعي',
  'Campaign Key Visuals': 'البصريات الرئيسية للحملة (Key Visuals)',
  'Digital Ad Set (Display & Video)': 'حزمة إعلانات رقمية (بنرات وفيديو)',
  'Urgent / Critical': 'عاجل / حرج',
  'Normal': 'عادي',
  'Please provide a campaign brief title.': 'يرجى إدخال عنوان لبريف الحملة.',

  // Add Brand Page
  'New brand workspace': 'مساحة عمل براند جديدة',
  'e.g. Hyper El Barka': 'مثال: هايبر البركة',
  'e.g. Fashion & Apparel': 'مثال: أزياء وملابس',
  'Shared folder for brand assets, references and final files.': 'مجلد مشترك لأصول البراند والمراجع والملفات النهائية.',
  'Shared folder for brand assets, references and final files': 'مجلد مشترك لأصول البراند والمراجع والملفات النهائية.',
  'The brand starts as Active and appears in the Brands workspace right away. You can create its first monthly plan from the brand dashboard.': 'يبدأ البراند بحالة نشط ويظهر في مساحة البراندات فوراً. يمكنك إنشاء خطته الشهرية الأولى من لوحة تحكم البراند.',
  'A dedicated squad is created and linked to this brand right away.': 'يتم إنشاء فريق عمل مخصص وربطه بهذا البراند فوراً.',
  'A dedicated squad is created and linked to this brand right away': 'يتم إنشاء فريق عمل مخصص وربطه بهذا البراند فوراً.',
  'Create Brand': 'إنشاء البراند',
  'Creating…': 'جاري الإنشاء…',
  'Brand name is required.': 'اسم البراند مطلوب.',
  'Brand name must not exceed 150 characters.': 'يجب ألا يتجاوز اسم البراند 150 حرفاً.',
  'A brand with this name already exists.': 'يوجد براند بهذا الاسم بالفعل.',
  'Industry is required.': 'مجال العمل مطلوب.',
  'Country is required.': 'الدولة مطلوبة.',
  'Timezone is required.': 'المنطقة الزمنية مطلوبة.',
  'Enter a valid Drive folder URL, starting with http:// or https://.': 'أدخل رابطاً صحيحاً لمجلد Drive يبدأ بـ http:// أو https://.',
  'Could not create the brand.': 'تعذر إنشاء البراند.',

  // Clarifying Questions & Answers (AI Brief)
  'Which service line should lead the campaign — primary care or dermatology?': 'ما هو خط الخدمة الذي يجب أن يقود الحملة — الرعاية الأولية أم الأمراض الجلدية؟',
  'Which service line should lead the campaign — primary care or dermatology': 'ما هو خط الخدمة الذي يجب أن يقود الحملة — الرعاية الأولية أم الأمراض الجلدية؟',
  'Primary care first, dermatology as the second wave.': 'الرعاية الأولية أولاً، تليها الأمراض الجلدية كموجة ثانية.',
  'Primary care first, dermatology as the second wave': 'الرعاية الأولية أولاً، تليها الأمراض الجلدية كموجة ثانية.',
  'Do we have permission to use the patient story from the Q3 report?': 'هل لدينا إذن باستخدام قصة المريض من تقرير الربع الثالث؟',
  'Do we have permission to use the patient story from the Q3 report': 'هل لدينا إذن باستخدام قصة المريض من تقرير الربع الثالث؟',
  'Yes — written consent is on file.': 'نعم — الموافقة الخطية محفوظة في الملف.',
  'Yes — written consent is on file': 'نعم — الموافقة الخطية محفوظة في الملف.',

  // Content Plan & Strategy View Helpers
  'Brand not found': 'البراند غير موجود',
  'Return to the Brands workspace and open a brand before planning content.': 'عد إلى مساحة البراندات وافتح برانداً قبل تخطيط المحتوى.',
  'Return to the Brands workspace and open a brand before planning content': 'عد إلى مساحة البراندات وافتح برانداً قبل تخطيط المحتوى.',
  'Back to Brands': 'العودة إلى البراندات',
  'Content Plan': 'خطة المحتوى',
  'Exploratory Draft': 'مسودة استكشافية',
  'No approved brief linked': 'لا يوجد بريف معتمد مرتبط',

  // Strategy Extra Pillars & Lines
  'Strong. Tightened the measurement section before sending to the client': 'ممتاز. تم تدقيق وتحديد قسم قياس الأداء بدقة قبل الإرسال للعميل.',
  'Everyday care': 'رعاية يومية',
  'Trust & privacy': 'الثقة والخصوصية',
  'Real patient stories': 'قصص مرضى حقيقية',
  'Care from anywhere': 'رعاية من أي مكان',
  'Instagram — daily care rituals and reach': 'إنستغرام — عادات الرعاية اليومية والوصول',
  'TikTok — clinician explainers': 'تيك توك — شروحات الأطباء التوعوية',
  'LinkedIn — employer benefit story': 'لينكد إن — قصة مزايا أصحاب العمل',
  'Warm, plain-spoken, never clinical. Lead with relief': 'دافئة، بسيطة وواضحة، غير معقدة طبياً. ابدأ بتقديم الارتياح والاطمئنان.',
  'Qualified first visits, saves, care-plan starts, engagement rate': 'الزيارات الأولى المؤهلة، الحفظ، بدء خطط الرعاية، ومعدل التفاعل.',
  'Time-poor parents who manage everyone else\'s health. They want a plan, not a phone tree': 'أولياء الأمور المشغولون الذين يديرون صحة الجميع. يريدون خطة واضحة ومباشرة دون تعقيدات هاتفية.',
  'Time-poor parents who manage everyone else’s health. They want a plan, not a phone tree': 'أولياء الأمور المشغولون الذين يديرون صحة الجميع. يريدون خطة واضحة ومباشرة دون تعقيدات هاتفية.',
  'Lumina is the family\'s front door to care — same-day video visits that fit around school runs, commutes and bedtime': 'لومينا هي الباب الأول للعائلة نحو الرعاية — مواعيد فيديو في نفس اليوم تتلاءم مع توصيل المدارس والتنقل ومواعيد النوم.',
  'Lumina is the family’s front door to care — same-day video visits that fit around school runs, commutes and bedtime': 'لومينا هي الباب الأول للعائلة نحو الرعاية — مواعيد فيديو في نفس اليوم تتلاءم مع توصيل المدارس والتنقل ومواعيد النوم.',
};

const AR_MONTHS = {
  jan: 'يناير', january: 'يناير',
  feb: 'فبراير', february: 'فبراير',
  mar: 'مارس', march: 'مارس',
  apr: 'أبريل', april: 'أبريل',
  may: 'مايو',
  jun: 'يونيو', june: 'يونيو',
  jul: 'يوليو', july: 'يوليو',
  aug: 'أغسطس', august: 'أغسطس',
  sep: 'سبتمبر', september: 'سبتمبر',
  oct: 'أكتوبر', october: 'أكتوبر',
  nov: 'نوفمبر', november: 'نوفمبر',
  dec: 'ديسمبر', december: 'ديسمبر',
};

export function translate(lang, text) {
  if (lang !== 'ar' || text == null) return text;
  const str = String(text).trim();
  if (!str) return text;

  // Direct exact match
  if (ARABIC[str]) return ARABIC[str];
  if (ARABIC[text]) return ARABIC[text];

  // Multiline handling (splits by newline and translates line-by-line if full text not found)
  if (str.includes('\n')) {
    const lines = str.split('\n');
    const translated = lines.map((line) => {
      const trimmed = line.trim();
      return trimmed ? (ARABIC[trimmed] || translate(lang, trimmed)) : line;
    });
    if (translated.some((tLine, i) => tLine !== lines[i])) {
      return translated.join('\n');
    }
  }

  // Case-insensitive lookup
  const lower = str.toLowerCase();
  for (const [key, value] of Object.entries(ARABIC)) {
    if (key.toLowerCase() === lower) return value;
  }

  // Punctuation-stripped lookup (handles trailing/leading dots and question marks)
  const clean = str.replace(/^[?؟.,!]+|[?؟.,!]+$/g, '').trim();
  if (clean && clean !== str) {
    if (ARABIC[clean]) return ARABIC[clean];
    const cleanLower = clean.toLowerCase();
    for (const [key, value] of Object.entries(ARABIC)) {
      if (key.toLowerCase() === cleanLower) return value;
    }
  }

  // Regex patterns for dynamic formatted strings
  let match = str.match(/^([a-z]+)\s+(\d{4})\s+plan\s*[·•-]\s*(\d+)\s+items?$/i);
  if (match) {
    const m = AR_MONTHS[match[1].toLowerCase()] || match[1];
    const n = parseInt(match[3], 10);
    const itemWord = n === 1 ? 'عنصر' : (n >= 2 && n <= 10 ? 'عناصر' : 'عنصر');
    return `خطة ${m} ${match[2]} · ${match[3]} ${itemWord}`;
  }

  match = str.match(/^([a-z]+)\s+(\d{4})$/i);
  if (match && AR_MONTHS[match[1].toLowerCase()]) {
    return `${AR_MONTHS[match[1].toLowerCase()]} ${match[2]}`;
  }

  match = str.match(/^All statuses\s*\((\d+)\)$/i);
  if (match) {
    return `جميع الحالات (${match[1]})`;
  }

  match = str.match(/^([A-Za-z]+)\s*\((\d+)\)$/i);
  if (match) {
    const tr = ARABIC[match[1]] || match[1];
    return `${tr} (${match[2]})`;
  }

  match = str.match(/^(\d+)\s+items?$/i);
  if (match) {
    const n = parseInt(match[1], 10);
    return `${match[1]} ${n === 1 ? 'عنصر' : (n >= 2 && n <= 10 ? 'عناصر' : 'عنصر')}`;
  }

  match = str.match(/^(\d+)\s+assigned$/i);
  if (match) return `${match[1]} مسندة`;

  match = str.match(/^(\d+)\s+active$/i);
  if (match) return `${match[1]} نشط`;

  match = str.match(/^(\d+)\s+brands?$/i);
  if (match) {
    const n = parseInt(match[1], 10);
    return `${match[1]} ${n === 1 ? 'براند' : 'براندات'}`;
  }

  match = str.match(/^(\d+)\s+members?$/i);
  if (match) {
    const n = parseInt(match[1], 10);
    return `${match[1]} ${n === 1 ? 'عضو' : 'أعضاء'}`;
  }

  match = str.match(/^(\d+)\s+alerts?$/i);
  if (match) {
    const n = parseInt(match[1], 10);
    return `${match[1]} ${n === 1 ? 'تنبيه' : 'تنبيهات'}`;
  }

  match = str.match(/^(\d+)\s+brands?\s+without\s+a\s+team$/i);
  if (match) {
    const n = parseInt(match[1], 10);
    return `${match[1]} ${n === 1 ? 'براند بدون فريق' : 'براندات بدون فريق'}`;
  }

  match = str.match(/^(\d+)\s+deactivated\s+accounts?$/i);
  if (match) {
    const n = parseInt(match[1], 10);
    return `${match[1]} ${n === 1 ? 'حساب معطّل' : 'حسابات معطّلة'}`;
  }

  match = str.match(/^(\d+)\s+of\s+(\d+)\s+teams\s+have\s+assigned\s+brands$/i);
  if (match) {
    return `${match[1]} من ${match[2]} فِرق لديها براندات مسندة`;
  }

  match = str.match(/^BRANDS\s+WITHOUT\s+TEAMS\s*\((\d+)\)$/i);
  if (match) {
    return `براندات بدون فِرق (${match[1]})`;
  }

  match = str.match(/^(.+?)\s*[·•-]\s*No team$/i);
  if (match) {
    const ind = match[1].trim();
    const trInd = ARABIC[ind] ?? ind;
    return `${trInd} · بدون فريق`;
  }

  match = str.match(/^Previewing\s+as\s+(.+)$/i);
  if (match) {
    const role = match[1].trim();
    const trRole = ARABIC[role] ?? role;
    return `معاينة كـ ${trRole}`;
  }

  return ARABIC[str] ?? text;
}
