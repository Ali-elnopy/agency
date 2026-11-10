export const TASK_STATUSES = [
  { id: 'to_do', label: 'To Do', labelAr: 'قيد الانتظار', tone: 'is-gray' },
  { id: 'in_progress', label: 'In Progress', labelAr: 'جاري التنفيذ', tone: 'is-blue' },
  { id: 'in_review', label: 'In Review', labelAr: 'قيد المراجعة', tone: 'is-amber' },
  { id: 'completed', label: 'Completed', labelAr: 'مكتملة', tone: 'is-green' },
];

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', labelAr: 'منخفضة', tone: 'is-blue' },
  { id: 'medium', label: 'Medium', labelAr: 'متوسطة', tone: 'is-amber' },
  { id: 'high', label: 'High', labelAr: 'عالية', tone: 'is-red' },
];

export const REGISTERED_EMPLOYEES = [
  { id: 'emp-1', name: 'Sarah Lin', role: 'Content Creator', email: 's.lin@orvia-creative.com', avatar: 'SL' },
  { id: 'emp-2', name: 'Milo Kostas', role: 'Art Director', email: 'm.kostas@orvia-creative.com', avatar: 'MK' },
  { id: 'emp-3', name: 'Elena Vance', role: 'Motion Designer', email: 'e.vance@orvia-creative.com', avatar: 'EV' },
  { id: 'emp-4', name: 'Marcus Brody', role: 'Copywriter & Editor', email: 'm.brody@orvia-creative.com', avatar: 'MB' },
];

export function isTaskOverdue(deadline, status) {
  if (!deadline) return false;
  if (status === 'completed') return false;
  const due = new Date(deadline);
  if (isNaN(due.getTime())) return false;
  return due < new Date();
}

export function formatDateTime(isoString, locale) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const isAr =
      locale === 'ar' ||
      (typeof document !== 'undefined' && document.documentElement.lang === 'ar');
    return d.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

// Generate realistic ISO date strings relative to now
const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
const todayLater = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
const tomorrow = new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString();
const nextWeek = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();

export const seedTasks = [
  {
    id: 'tsk-001',
    title: 'Design Q1 Launch Reel for Instagram',
    description: 'Create high-tempo 15s vertical video showcasing core product features and motion graphics.',
    brandId: '1',
    brandName: 'Nike',
    contentItemId: 'ci-101',
    contentTitle: 'Spring Product Reveal Video',
    priority: 'high',
    status: 'in_progress',
    deadline: yesterday, // Overdue!
    assigneeId: 'emp-1',
    assigneeName: 'Sarah Lin',
    assigneeRole: 'Content Creator',
    assigneeAvatar: 'SL',
    revisionNote: '',
    createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tsk-002',
    title: 'Write Thought Leadership Article for LinkedIn',
    description: 'Long-form commentary on regenerative agriculture and sustainability milestones.',
    brandId: '1',
    brandName: 'Nike',
    contentItemId: 'ci-102',
    contentTitle: 'Founder Manifesto on Sustainability',
    priority: 'medium',
    status: 'to_do',
    deadline: todayLater, // Due today!
    assigneeId: 'emp-1',
    assigneeName: 'Sarah Lin',
    assigneeRole: 'Content Creator',
    assigneeAvatar: 'SL',
    revisionNote: '',
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tsk-003',
    title: 'Create Carousel Visuals on Hydration Science',
    description: '3D renders and nutritional breakdown carousel for wellness consumer launch.',
    brandId: '2',
    brandName: 'Nova Robotics',
    contentItemId: 'ci-103',
    contentTitle: 'Science Behind Automation Carousel',
    priority: 'high',
    status: 'in_progress',
    deadline: tomorrow,
    assigneeId: 'emp-1',
    assigneeName: 'Sarah Lin',
    assigneeRole: 'Content Creator',
    assigneeAvatar: 'SL',
    revisionNote: 'Please adjust color palette to match brand guideline hex codes and clarify slide 4 typography.',
    returnedForRevision: true,
    createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tsk-004',
    title: 'Motion Teaser for TikTok Launch',
    description: 'Fast-paced hook video formatted in 9:16 with dynamic sound sync.',
    brandId: '1',
    brandName: 'Nike',
    contentItemId: 'ci-104',
    contentTitle: 'Behind the Scenes Athlete Interview',
    priority: 'medium',
    status: 'in_review',
    deadline: nextWeek,
    assigneeId: 'emp-3',
    assigneeName: 'Elena Vance',
    assigneeRole: 'Motion Designer',
    assigneeAvatar: 'EV',
    revisionNote: '',
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tsk-005',
    title: 'Editorial Copy for Product Launch Newsletter',
    description: 'Engaging email copy with clear CTA for VIP early-access community.',
    brandId: '2',
    brandName: 'Nova Robotics',
    contentItemId: 'ci-105',
    contentTitle: 'VIP Early Access Drop',
    priority: 'low',
    status: 'completed',
    deadline: yesterday,
    assigneeId: 'emp-4',
    assigneeName: 'Marcus Brody',
    assigneeRole: 'Copywriter & Editor',
    assigneeAvatar: 'MB',
    revisionNote: '',
    createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export const TASKS_ARABIC = {
  'Tasks Management': 'إدارة المهام',
  'Tasks': 'المهام',
  'My Work': 'أعمالي',
  'Executive Tasks': 'المهام التنفيذية',
  'Manage, distribute and track creative execution across your team': 'إدارة وتوزيع وتتبع التنفيذ الإبداعي عبر فريق العمل',
  'New Task': 'مهمة جديدة',
  'Add Task': 'إضافة مهمة',
  'Convert Content to Tasks': 'تحويل عناصر المحتوى إلى مهام',
  'Converted': 'تم التحويل',
  'Task Name': 'اسم المهمة',
  'Description': 'الوصف والمحددات',
  'Associated Content Item': 'عنصر المحتوى المرتبط',
  'Priority': 'الأولوية',
  'Deadline': 'تاريخ التسليم النهائي',
  'Assignee': 'الموظف المسند إليه',
  'Assign to Employee': 'إسناد لموظف',
  'Status': 'الحالة',
  'To Do': 'قيد الانتظار',
  'In Progress': 'جاري التنفيذ',
  'In Review': 'قيد المراجعة',
  'Completed': 'مكتملة',
  'Overdue': 'متأخرة',
  'Low': 'منخفضة',
  'Medium': 'متوسطة',
  'High': 'عالية',
  'All Brands': 'جميع البراندات',
  'All Priorities': 'جميع الأولويات',
  'All Statuses': 'جميع الحالات',
  'Kanban Board': 'لوحة كانبان',
  'Table View': 'عرض الجدول',
  'Search tasks...': 'البحث في المهام...',
  'No tasks found': 'لا توجد مهام مطابقة',
  'No tasks in this column': 'لا توجد مهام في هذا العمود',
  'Task Details': 'تفاصيل المهمة',
  'Return with Revisions': 'إرجاع بتعديلات',
  'Submit for Review': 'تسليم للمراجعة',
  'Start Task': 'بدء التنفيذ',
  'Mark Completed': 'تحديد كمكتملة',
  'Revisions Required': 'مطلوب تعديلات',
  'Manager Feedback:': 'ملاحظات وتوجيهات المدير:',
  "Today's Tasks": 'مهام اليوم',
  'Upcoming': 'المهام القادمة',
  'High Priority': 'عالية الأولوية',
  'Returned with Revisions': 'مرجعة بتعديل',
  'Personal workspace for executing assigned creative deliverables': 'مساحة العمل الشخصية لتنفيذ وتسليم المخرجات الإبداعية المسندة إليك',
  'Move status': 'تغيير الحالة',
  'Close': 'إغلاق',
  'Save Task': 'حفظ المهمة',
  'Create Task': 'إنشاء المهمة',
  'Select Employee': 'اختر الموظف',
  'Select Brand': 'اختر البراند',
  'Select Content Item': 'اختر عنصر المحتوى',
  'Optional link to content item': 'ربط اختياري بعنصر محتوى',
  'Due date & time': 'تاريخ ووقت الاستحقاق',
  'Design Q1 Launch Reel for Instagram': 'تصميم فيديو ريلز لإطلاق الربع الأول على إنستغرام',
  'Create high-tempo 15s vertical video showcasing core product features and motion graphics.': 'إنشاء فيديو رأسي مدته 15 ثانية يعرض ميزات المنتج الأساسية ورسومات متحركة.',
  'Spring Product Reveal Video': 'فيديو الكشف عن منتجات الربيع',
  'Write Thought Leadership Article for LinkedIn': 'كتابة مقال ريادة فكرية لمنصة لينكد إن',
  'Long-form commentary on regenerative agriculture and sustainability milestones.': 'تعليق مطول ومقال تفصيلي حول الزراعة المتجددة ومحطات الاستدامة.',
  'Founder Manifesto on Sustainability': 'بيان المؤسس حول الاستدامة',
  'Develop Brand Voice Matrix and Style Guide': 'تطوير مصفوفة نبرة صوت البراند ودليل الأسلوب',
  'Comprehensive documentation detailing tone of voice, dos and don’ts across social touchpoints.': 'توثيق شامل يوضح نبرة الصوت والمحاذير والتوجيهات عبر كافة نقاط التماس.',
  'Render 3D Product Explainer Animation': 'رندرة رسوم متحركة ثلاثية الأبعاد لشرح المنتج',
  'Detailed 3D motion graphic highlighting modular robotic joints and industrial use cases.': 'موشن جرافيك ثلاثي الأبعاد تفصيلي يوضح المفاصل الروبوتية وحالات الاستخدام الصناعي.',
  'Editorial Copy for Product Launch Newsletter': 'صياغة نصوص تحريرية للنشرة الإخبارية لإطلاق المنتج',
  'Engaging email copy with clear CTA for VIP early-access community.': 'نص بريد إلكتروني جذاب مع دعوة واضحة لاتخاذ إجراء لمجتمع الوصول المبكر.',
  'VIP Early Access Drop': 'إطلاق الوصول المبكر الحصري',
};
