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
  Teams: 'فِرق العمل',
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
  'Approve & send to client': 'موافقة وإرسال للعميل',
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
  'Details ready': 'التفاصيل جاهزة',
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
  'Details saved as draft': 'تم حفظ التفاصيل كمسودة.',
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
  'Assign Team': 'تعيين فريق',
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
  'Admin': 'مدير النظام',
  'Account Manager': 'مدير حسابات',
  'Content Creator': 'صانع محتوى',
  'Client': 'عميل',
  'Previewing as': 'معاينة كـ',
  'Role preview': 'معاينة الدور',
  'Preview': 'معاينة',
  'Search pages, brands, teams, people...': 'ابحث في الصفحات، البراندات، الفِرق، الأشخاص...',
  'TOTAL BRANDS': 'إجمالي البراندات',
  'TOTAL EMPLOYEES': 'إجمالي الموظفين',
  'ACTIVE TEAMS': 'الفِرق النشطة',
  'BRANDS WITHOUT TEAMS': 'براندات بدون فِرق',
  'BRANDS PER TEAMS': 'البراندات لكل فريق',
  'WORKLOAD ALLOCATION MATRIX': 'مصفوفة توزيع أعباء العمل',
  'ATTENTION REQUIRED': 'تنبيهات تتطلب إجراء',
  'High Priority': 'أولوية قصوى',
  'sport': 'رياضة',
  'Industrial Automation': 'أتمتة صناعية',

};

export function translate(lang, text) {
  if (lang !== 'ar' || text == null) return text;
  const str = String(text).trim();
  if (!str) return text;

  // Direct exact match
  if (ARABIC[str]) return ARABIC[str];
  if (ARABIC[text]) return ARABIC[text];

  // Case-insensitive lookup
  const lower = str.toLowerCase();
  for (const [key, value] of Object.entries(ARABIC)) {
    if (key.toLowerCase() === lower) return value;
  }

  // Regex patterns for dynamic formatted strings
  let match = str.match(/^(\d+)\s+assigned$/i);
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
