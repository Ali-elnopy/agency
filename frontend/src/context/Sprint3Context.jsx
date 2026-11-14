import { seedTasks } from '../data/tasksData';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { Sprint3Context } from './sprint3Store';
import {
  portalToken,
  seedBriefs,
  seedCampaigns,
  seedContentMeta,
  seedDispatches,
  seedSettings,
  seedStrategies,
  seedTemplates,
  sprint3Id,
  stamp,
  translate,
} from '../data/sprint3';
import {
  fetchUnreadNotificationCountApi,
  fetchNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../services/contentManagementApi';
import { isMockApiEnabled } from '../services/api';
import {
  apiEnabled,
  toNumericId,
  fetchStrategiesApi,
  createStrategyApi,
  renameStrategyApi,
  deleteStrategyApi,
  uploadStrategyVersionApi,
  requestStrategyChangesApi,
  approveStrategyApi,
  fetchBriefsApi,
  generateBriefApi,
  updateBriefApi,
  approveBriefApi,
  fetchTasksApi,
  createDirectTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
  fetchCampaignsApi,
  createCampaignApi,
  updateCampaignApi,
  deleteCampaignApi,
} from '../services/sprint3Api';

/* Sprint 3 workflow state lives entirely in the browser. Each section of the
   page chain reads the same records, so a submitted portal answer is visible
   to the AI brief screen without any backend round-trip. */

const KEYS = {
  templates: 'orvia_s3_templates_v1',
  dispatches: 'orvia_s3_dispatches_v1',
  briefs: 'orvia_s3_briefs_v1',
  strategies: 'orvia_s3_strategies_v1',
  campaigns: 'orvia_s3_campaigns_v1',
  contentMeta: 'orvia_s3_content_meta_v1',
  settings: 'orvia_s3_settings_v1',
  prefs: 'orvia_s3_prefs_v1',
  tasks: 'orvia_tasks_v1',
  notifications: 'orvia_s3_notifications_v1',
};

const defaultNotifications = [
  {
    id: 'notif-1',
    type: 'onboarding_submitted',
    targetRoles: ['ACCOUNT_MANAGER', 'ADMIN'],
    title: 'New Client Onboarding Submitted',
    titleAr: 'تم استلام استمارة عميل جديدة',
    message: 'Bean & Co Cafe submitted onboarding questionnaire.',
    messageAr: 'قام براند Bean & Co Cafe بإرسال استمارة الأسئلة بنجاح.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    link: 'dispatch',
  },
  {
    id: 'notif-2',
    type: 'strategy_uploaded',
    targetRoles: ['ACCOUNT_MANAGER', 'ADMIN'],
    title: 'Strategy Uploaded for Internal Review',
    titleAr: 'تم رفع استراتيجية جديدة للمراجعة الداخلية',
    message: 'Noah Reed uploaded Bean & Co Cafe Brand Strategy v2.0.',
    messageAr: 'قام صانع المحتوى برفع استراتيجية Bean & Co Cafe للمراجعة الداخلية.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    link: 'strategy',
  },
  {
    id: 'notif-3',
    type: 'brief_review_needed',
    targetRoles: ['ACCOUNT_MANAGER', 'ADMIN'],
    title: 'AI Brief Review Required',
    titleAr: 'مطلوب مراجعة واعتماد البريف الذكي',
    message: 'AI Brand Brief for Bean & Co Cafe is ready for Account Manager sign-off.',
    messageAr: 'ملخص البريف الذكي لبراند Bean & Co Cafe جاهز لاعتماد مدير الحسابات.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    link: 'briefs',
  },
  {
    id: 'notif-4',
    type: 'client_approved_strategy',
    targetRoles: ['ACCOUNT_MANAGER', 'ADMIN'],
    title: 'Client Approved Strategy',
    titleAr: 'العميل اعتمد الاستراتيجية',
    message: 'Sarah Jenkins approved the strategy. Final sign-off required to unlock content plans.',
    messageAr: 'قام العميل باعتماد الاستراتيجية. مطلوب تسجيل الاعتماد النهائي لفتح خطط المحتوى.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    link: 'strategy',
  },
  {
    id: 'notif-5',
    type: 'strategy_changes_requested',
    targetRoles: ['EMPLOYEE', 'CONTENT_CREATOR', 'CREATOR'],
    title: 'Strategy Revision Requested',
    titleAr: 'مطلوب تعديلات على الاستراتيجية',
    message: 'Account Manager requested revisions on BeanCo-Strategy.pdf: Please add a content calendar outline.',
    messageAr: 'طلب مدير الحسابات تعديلات على ملف الاستراتيجية: يرجى إضافة تفاصيل تقويم المحتوى.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    link: 'strategy',
  },
  {
    id: 'notif-6',
    type: 'content_task_assigned',
    targetRoles: ['EMPLOYEE', 'CONTENT_CREATOR', 'CREATOR'],
    title: 'New Content Item Assigned',
    titleAr: 'تم تعيين عنصر محتوى جديد',
    message: 'You have been assigned to produce "Behind the bar" Reel for Bean & Co Cafe.',
    messageAr: 'تم تعيينك لإنتاج فيديو ريلز "Behind the bar" لبراند Bean & Co Cafe.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    link: 'content',
  },
];

function readArray(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readObject(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or blocked storage in sandboxed iframe; state remains in memory
  }
}

/* Write-through helpers never block the UI: the optimistic local record is
   already rendered, and a failed request is reported instead of swallowed. */
function reportSync(scope, error) {
  if (!error) return;
  console.warn(`[ORVIA sync] ${scope}:`, error?.message || error);
}

/* The notifications table stores a numeric id plus an optional JSON payload.
   The UI needs a stable string id for React keys and keeps the numeric id as
   `serverId` so mark-as-read calls the right endpoint. */
function mapServerNotification(record) {
  const payload =
    record?.data && typeof record.data === 'object' ? record.data : {};

  return {
    id: `notif-${record.id}`,
    serverId: record.id,
    type: record.type,
    title: record.title,
    titleAr: record.title,
    message: record.message,
    messageAr: record.message,
    isRead: Boolean(record.isRead),
    createdAt: record.createdAt,
    brandId: payload.brandId == null ? null : String(payload.brandId),
    onboardingId: payload.onboardingId ?? null,
    clientId: payload.clientId ?? null,
    link: payload.link || 'dispatch',
    targetRoles: Array.isArray(payload.targetRoles) ? payload.targetRoles : undefined,
  };
}

export function Sprint3Provider({ children }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState(() =>
    readArray(KEYS.templates, seedTemplates),
  );
  const [dispatches, setDispatches] = useState(() =>
    readArray(KEYS.dispatches, seedDispatches),
  );
  const [briefs, setBriefs] = useState(() => {
    const loaded = readArray(KEYS.briefs, seedBriefs);
    const hasBeanco = loaded.some((b) => b.brandId === 'brand-beanco' || b.id === 'brief-beanco');
    return hasBeanco ? loaded : [seedBriefs[0], ...loaded];
  });
  const [strategies, setStrategies] = useState(() => {
    const loaded = readArray(KEYS.strategies, seedStrategies);
    const hasBeanco = loaded.some((s) => s.brandId === 'brand-beanco' || s.id === 'str-beanco');
    const base = hasBeanco ? loaded : [seedStrategies[0], ...loaded];
    return base.map((s) => ({
      ...s,
      fileName: s.fileName || `${(s.brandName || s.title || 'Brand').replace(/[^a-zA-Z0-9]/g, '_')}_Strategy.pdf`,
      fileSize: s.fileSize || '3.5 MB',
      fileType: s.fileType || 'application/pdf',
      version: s.version || '1',
      uploadDate: s.uploadDate || (s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '14 Nov 2026'),
      associatedBrief: s.associatedBrief || 'Brief v1',
    }));
  });
  const [campaigns, setCampaigns] = useState(() =>
    readArray(KEYS.campaigns, seedCampaigns),
  );
  const [contentMeta, setContentMeta] = useState(() =>
    readObject(KEYS.contentMeta, seedContentMeta),
  );
  const [settings, setSettings] = useState(() =>
    readObject(KEYS.settings, seedSettings),
  );
  const [tasks, setTasks] = useState(() => readArray(KEYS.tasks, seedTasks));
  const [notifications, setNotifications] = useState(() =>
    readArray(KEYS.notifications, defaultNotifications),
  );

  const technicalRole = useMemo(() => {
    if (!user) return 'EMPLOYEE';
    const r = String(user.role || '').toUpperCase();
    if (r === 'ADMIN') return 'ADMIN';
    if (r === 'ACCOUNT_MANAGER') return 'ACCOUNT_MANAGER';
    if (r === 'CONTENT_CREATOR' || r === 'EMPLOYEE' || r === 'CREATIVE' || r === 'CREATOR') return 'EMPLOYEE';
    if (r === 'CLIENT') return 'CLIENT';
    return r;
  }, [user]);

  const isAdmin = technicalRole === 'ADMIN';
  const isAccountManager = technicalRole === 'ACCOUNT_MANAGER';
  const isEmployee = technicalRole === 'EMPLOYEE' || technicalRole === 'CONTENT_CREATOR';
  const isClient = technicalRole === 'CLIENT';
  // Creator = Employee per user requirements
  const isCreator = isEmployee;

  const effectiveRole = useMemo(() => {
    if (isAdmin) return 'admin';
    if (isAccountManager) return 'account_manager';
    if (isEmployee) return 'employee';
    if (isClient) return 'client';
    return 'employee';
  }, [isAdmin, isAccountManager, isEmployee, isClient]);

  const [prefs, setPrefs] = useState(() => {
    const saved = readObject(KEYS.prefs, {});
    return {
      role: saved.role || 'admin',
      lang: saved.lang === 'ar' ? 'ar' : 'en',
    };
  });

  useEffect(() => write(KEYS.templates, templates), [templates]);
  useEffect(() => write(KEYS.dispatches, dispatches), [dispatches]);
  useEffect(() => write(KEYS.briefs, briefs), [briefs]);
  useEffect(() => write(KEYS.strategies, strategies), [strategies]);
  useEffect(() => write(KEYS.campaigns, campaigns), [campaigns]);
  useEffect(() => write(KEYS.contentMeta, contentMeta), [contentMeta]);
  useEffect(() => write(KEYS.settings, settings), [settings]);
  useEffect(() => write(KEYS.prefs, prefs), [prefs]);
  useEffect(() => write(KEYS.tasks, tasks), [tasks]);
  useEffect(() => write(KEYS.notifications, notifications), [notifications]);

  // The client portal is usually opened in its own tab, so a submission there
  // must reach the account-manager dashboard without a manual reload. The
  // `storage` event only fires in other tabs, and writing the same JSON back
  // does not trigger a second event, so this cannot loop.
  useEffect(() => {
    const sync = (event) => {
      if (event.storageArea !== window.localStorage) return;
      switch (event.key) {
        case KEYS.templates:
          setTemplates(readArray(KEYS.templates, seedTemplates));
          break;
        case KEYS.dispatches:
          setDispatches(readArray(KEYS.dispatches, seedDispatches));
          break;
        case KEYS.briefs:
          setBriefs(readArray(KEYS.briefs, seedBriefs));
          break;
        case KEYS.strategies:
          setStrategies(readArray(KEYS.strategies, seedStrategies));
          break;
        case KEYS.campaigns:
          setCampaigns(readArray(KEYS.campaigns, seedCampaigns));
          break;
        case KEYS.contentMeta:
          setContentMeta(readObject(KEYS.contentMeta, seedContentMeta));
          break;
        case KEYS.settings:
          setSettings(readObject(KEYS.settings, seedSettings));
          break;
        case KEYS.prefs:
          setPrefs((prev) => ({ ...prev, ...readObject(KEYS.prefs, prev) }));
          break;
        case KEYS.tasks:
          setTasks(readArray(KEYS.tasks, seedTasks));
          break;
        case KEYS.notifications:
          setNotifications(readArray(KEYS.notifications, defaultNotifications));
          break;
        default:
          break;
      }
    };

    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Hydrate the Sprint 3 workflow from the API. When the server has records
  // they replace the local fixtures, so the UI shows the same data for every
  // signed-in user instead of a browser-local copy. In demo mode this is a
  // no-op and the fixtures stay in charge.
  useEffect(() => {
    if (!user || !apiEnabled()) return undefined;

    let alive = true;

    Promise.all([
      fetchStrategiesApi().catch(() => null),
      fetchBriefsApi().catch(() => null),
      fetchTasksApi().catch(() => null),
      fetchCampaignsApi().catch(() => null),
    ]).then(([serverStrategies, serverBriefs, serverTasks, serverCampaigns]) => {
      if (!alive) return;
      if (serverStrategies?.length) setStrategies(serverStrategies);
      if (serverBriefs?.length) setBriefs(serverBriefs);
      if (serverTasks?.length) setTasks(serverTasks);
      if (serverCampaigns?.length) setCampaigns(serverCampaigns);
    });

    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    document.documentElement.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = prefs.lang;
  }, [prefs.lang]);

  const t = useCallback((text) => translate(prefs.lang, text), [prefs.lang]);

  const setRole = useCallback((role) => {
    setPrefs((prev) => ({ ...prev, role }));
  }, []);

  const setLang = useCallback((lang) => {
    setPrefs((prev) => ({ ...prev, lang: lang === 'ar' ? 'ar' : 'en' }));
  }, []);

  /* -------------------------- Template Library -------------------------- */

  const saveTemplate = useCallback((templateInput) => {
    const now = stamp();
    const id = templateInput.id || sprint3Id('tmpl');

    const normalized = {
      ...templateInput,
      id,
      questions: (templateInput.questions || []).map((q, idx) => ({
        ...q,
        id: q.id || `q-${idx + 1}-${Date.now().toString(36)}`,
      })),
      createdAt: templateInput.createdAt || now,
      updatedAt: now,
    };

    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === id);
      if (exists) {
        return prev.map((t) => (t.id === id ? normalized : t));
      }
      return [normalized, ...prev];
    });

    return normalized;
  }, []);

  const deleteTemplate = useCallback((templateId) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }, []);

  const getTemplate = useCallback(
    (templateId) => templates.find((t) => t.id === templateId) || null,
    [templates],
  );

  /* ------------------------- Question Dispatch ------------------------- */

  const createDispatch = useCallback((input) => {
    const id = sprint3Id('disp');
    const token = portalToken(input.brandId || '1');
    const now = stamp();

    const record = {
      id,
      brandId: String(input.brandId),
      brandName: input.brandName || 'Brand',
      templateId: input.templateId,
      templateName: input.templateName || 'Strategy Intake',
      clientEmail: input.clientEmail || '',
      token,
      portalUrl: `${window.location.origin}${window.location.pathname}#portal?token=${token}`,
      status: 'pending',
      dispatchedBy: input.dispatchedBy || 'System Admin',
      dispatchedAt: now,
      answers: {},
      draftAnswers: {},
      editRequested: false,
      editRequestedReason: '',
      history: [
        {
          action: 'dispatched',
          actor: input.dispatchedBy || 'System Admin',
          at: now,
          note: `Dispatched ${input.templateName || 'intake questions'} to ${input.clientEmail || 'client'}`,
        },
      ],
    };

    setDispatches((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateDispatch = useCallback((dispatchId, patch) => {
    setDispatches((prev) =>
      prev.map((d) => (d.id === dispatchId ? { ...d, ...patch } : d)),
    );
  }, []);

  const saveAnswers = useCallback((dispatchId, draftAnswers) => {
    setDispatches((prev) =>
      prev.map((d) =>
        d.id === dispatchId
          ? {
              ...d,
              draftAnswers: { ...(d.draftAnswers || {}), ...draftAnswers },
              status: d.status === 'locked' ? d.status : 'draft',
              updatedAt: stamp(),
            }
          : d,
      ),
    );
  }, []);

  const submitAnswers = useCallback((dispatchId, finalAnswers) => {
    const now = stamp();
    let updatedRecord = null;

    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id !== dispatchId) return d;
        const mergedAnswers = { ...(d.draftAnswers || {}), ...finalAnswers };
        updatedRecord = {
          ...d,
          answers: mergedAnswers,
          draftAnswers: mergedAnswers,
          status: 'submitted',
          submittedAt: now,
          editRequested: false,
          history: [
            ...(d.history || []),
            {
              action: 'submitted',
              actor: d.clientEmail || 'Client',
              at: now,
              note: 'Client finalized questionnaire responses',
            },
          ],
        };
        return updatedRecord;
      }),
    );

    return updatedRecord;
  }, []);

  const requestEdit = useCallback((dispatchId, reason) => {
    const now = stamp();
    setDispatches((prev) =>
      prev.map((d) =>
        d.id === dispatchId
          ? {
              ...d,
              editRequested: true,
              editRequestedReason: reason,
              history: [
                ...(d.history || []),
                {
                  action: 'edit_requested',
                  actor: 'Client',
                  at: now,
                  note: reason,
                },
              ],
            }
          : d,
      ),
    );
  }, []);

  const getDispatch = useCallback(
    (dispatchId) => dispatches.find((d) => d.id === dispatchId) || null,
    [dispatches],
  );

  const getDispatchByToken = useCallback(
    (token) => dispatches.find((d) => d.token === token) || null,
    [dispatches],
  );

  /* ----------------------------- AI Brief ------------------------------ */

  const generateBrief = useCallback(
    (brandId) => {
      const dispatch =
        dispatches.find(
          (d) =>
            d.brandId === String(brandId) &&
            (d.status === 'submitted' || d.status === 'locked'),
        ) || dispatches.find((d) => d.brandId === String(brandId));

      const brandName = dispatch?.brandName || `Brand ${brandId}`;
      const answers = dispatch?.answers || dispatch?.draftAnswers || {};
      const answerTexts = Object.values(answers).map(String).join(' ');

      const audience =
        answers['q-audience'] ||
        answers['audience'] ||
        'Growth-minded modern consumers seeking premium, transparent solutions with frictionless access.';
      const competitors =
        answers['q-competitors'] ||
        answers['competitors'] ||
        'Established legacy players with high brand awareness, plus nimble direct-to-consumer alternatives.';
      const tone =
        answers['q-tone'] ||
        answers['tone'] ||
        'Warm, modern, authoritative, never clinical or overly corporate.';

      const objectives = [
        `Cement ${brandName} as the reference standard in its primary category within 90 days.`,
        'Drive measurable qualified acquisition through value-led creative content and transparent messaging.',
        'Build defensible brand equity by turning one-off purchasers into loyal community advocates.',
      ];

      const questions = [];
      if (!answers['q-budget'] && !answerTexts.toLowerCase().includes('budget')) {
        questions.push({
          id: 'sq-1',
          question: `What is ${brandName}'s quarterly paid experimentation budget vs. organic focus?`,
          reason: 'Clarifies whether creative production should emphasize organic viral formats or high-intent paid funnels.',
        });
      }
      if (!answers['q-target-geo']) {
        questions.push({
          id: 'sq-2',
          question: 'Are there prioritized geographic regions for the initial campaign rollout?',
          reason: 'Helps tailor regional references, publishing windows, and localized messaging nuance.',
        });
      }
      questions.push({
        id: 'sq-3',
        question: 'Which creative formats historically produced the lowest cost-per-acquisition for your team?',
        reason: 'Guides pillar distribution across short-form vertical video, carousel breakdowns, and long-form narrative.',
      });

      const now = stamp();
      const existing = briefs.find((b) => b.brandId === String(brandId));
      const briefId = existing?.id || sprint3Id('brf');

      const newBrief = {
        id: briefId,
        brandId: String(brandId),
        brandName,
        status: 'draft',
        version: (existing?.version || 0) + 1,
        objectives,
        targetAudience: audience,
        competitors,
        toneOfVoice: tone,
        suggestedQuestions: questions,
        generatedAt: now,
        approvedBy: null,
        approvedAt: null,
        notes: '',
        dispatchId: dispatch?.id || null,
      };

      setBriefs((prev) => {
        const remaining = prev.filter((b) => b.id !== briefId);
        return [newBrief, ...remaining];
      });

      if (apiEnabled() && toNumericId(brandId)) {
        generateBriefApi(brandId)
          .then((serverBrief) => {
            if (!serverBrief) return;
            setBriefs((prev) =>
              prev.map((b) =>
                b.id === briefId ? { ...b, ...serverBrief, id: briefId } : b,
              ),
            );
          })
          .catch((error) => reportSync('generate brief', error));
      }

      return newBrief;
    },
    [dispatches, briefs],
  );

  const saveBrief = useCallback((briefInput) => {
    setBriefs((prev) => {
      const exists = prev.some((b) => b.id === briefInput.id);
      if (exists) {
        return prev.map((b) => (b.id === briefInput.id ? { ...b, ...briefInput } : b));
      }
      return [briefInput, ...prev];
    });

    if (apiEnabled() && toNumericId(briefInput.serverId)) {
      updateBriefApi(briefInput.serverId, {
        content: {
          objectives: briefInput.objectives,
          targetAudience: briefInput.targetAudience,
          competitors: briefInput.competitors,
          toneOfVoice: briefInput.toneOfVoice,
          suggestedQuestions: briefInput.suggestedQuestions,
          notes: briefInput.notes,
        },
      }).catch((error) => reportSync('save brief', error));
    }
  }, []);

  const approveBrief = useCallback((briefId, approverName, notes = '') => {
    const now = stamp();
    let updated = null;
    const current = briefs.find((b) => b.id === briefId);

    setBriefs((prev) =>
      prev.map((b) => {
        if (b.id !== briefId) return b;
        updated = {
          ...b,
          status: 'approved',
          approvedBy: approverName || 'Account Manager',
          approvedAt: now,
          notes,
        };
        return updated;
      }),
    );

    if (apiEnabled()) {
      const serverId = current?.serverId ?? toNumericId(briefId);

      if (serverId) {
        approveBriefApi(serverId, notes)
          .then((serverBrief) => {
            if (!serverBrief) return;
            setBriefs((prev) =>
              prev.map((b) =>
                b.id === briefId
                  ? { ...b, ...serverBrief, id: briefId, status: 'approved' }
                  : b,
              ),
            );
          })
          .catch((error) => reportSync('approve brief', error));
      }
    }

    return updated;
  }, [briefs]);

  const getBrief = useCallback(
    (briefId) => briefs.find((b) => b.id === briefId) || null,
    [briefs],
  );

  const getBriefForBrand = useCallback(
    (brandId) => briefs.find((b) => b.brandId === String(brandId)) || null,
    [briefs],
  );

  /* ------------------------------- Strategy ------------------------------ */

  const saveStrategy = useCallback((strategyInput) => {
    const now = stamp();
    const id = strategyInput.id || sprint3Id('strat');
    // A File cannot be serialised into localStorage, so keep it out of the
    // record and send it to the versions endpoint instead.
    const { file: strategyFile, ...strategyFields } = strategyInput;
    const normalized = {
      ...strategyFields,
      id,
      updatedAt: now,
      createdAt: strategyInput.createdAt || now,
    };

    setStrategies((prev) => {
      const exists = prev.some((s) => s.id === id);
      if (exists) {
        return prev.map((s) => (s.id === id ? normalized : s));
      }
      return [normalized, ...prev];
    });

    if (apiEnabled()) {
      const attachServerId = (serverRecord) => {
        if (!serverRecord) return;
        setStrategies((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  serverId: serverRecord.serverId,
                  brandName: s.brandName || serverRecord.brandName,
                  versionId: serverRecord.versionId ?? s.versionId ?? null,
                }
              : s,
          ),
        );
      };

      const file = strategyFile;

      (async () => {
        let serverId = strategyInput.serverId ?? null;

        if (serverId) {
          const renamed = await renameStrategyApi(serverId, normalized.title);
          attachServerId(renamed);
        } else if (toNumericId(normalized.brandId)) {
          const created = await createStrategyApi({
            brandId: normalized.brandId,
            title: normalized.title,
          });
          serverId = created?.serverId ?? null;
          attachServerId(created);
        }

        // The actual PDF lives in object storage; only the strategy metadata
        // was covered by the create/rename call above.
        if (serverId && file) {
          const version = await uploadStrategyVersionApi(serverId, file);
          if (version) {
            setStrategies((prev) =>
              prev.map((s) =>
                s.id === id ? { ...s, versionId: version.id } : s,
              ),
            );
          }
        }
      })().catch((error) => reportSync('save strategy', error));
    }

    return normalized;
  }, []);

  const setStrategyStatus = useCallback((strategyId, status, meta = {}) => {
    const now = stamp();
    let updated = null;
    const current = strategies.find((s) => s.id === strategyId);

    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id !== strategyId) return s;
        updated = {
          ...s,
          status,
          updatedAt: now,
          reviewHistory: [
            ...(s.reviewHistory || []),
            {
              status,
              actor: meta.actor || 'User',
              at: now,
              note: meta.note || '',
            },
          ],
          ...(status === 'client_approved'
            ? { approvedByClientAt: now, clientApprover: meta.actor || 'Client' }
            : {}),
        };
        return updated;
      }),
    );

    if (apiEnabled() && current?.serverId && current?.versionId) {
      if (status === 'approved') {
        approveStrategyApi(current.serverId, current.versionId, meta.note)
          .catch((error) => reportSync('approve strategy', error));
      } else if (status === 'changes_requested' || status === 'in_review') {
        requestStrategyChangesApi(current.serverId, current.versionId, meta.note || 'Revision requested')
          .catch((error) => reportSync('request strategy changes', error));
      }
    }

    return updated;
  }, [strategies]);

  const deleteStrategy = useCallback((strategyId) => {
    const current = strategies.find((s) => s.id === strategyId);

    setStrategies((prev) => prev.filter((s) => s.id !== strategyId));

    if (apiEnabled() && current?.serverId) {
      deleteStrategyApi(current.serverId)
        .catch((error) => reportSync('delete strategy', error));
    }
  }, [strategies]);

  const getStrategy = useCallback(
    (strategyId) => strategies.find((s) => s.id === strategyId) || null,
    [strategies],
  );

  const getStrategyForBrand = useCallback(
    (brandId) => strategies.find((s) => s.brandId === String(brandId)) || null,
    [strategies],
  );

  const getApprovedStrategy = useCallback(
    (brandId) =>
      strategies.find(
        (s) =>
          s.brandId === String(brandId) && s.status === 'approved',
      ) || null,
    [strategies],
  );

  /* ------------------------------ Campaigns ----------------------------- */

  const addCampaign = useCallback((campaignInput) => {
    const id = campaignInput.id || sprint3Id('cmp');
    const record = {
      id,
      brandId: String(campaignInput.brandId || '1'),
      name: campaignInput.name || 'Untitled Campaign',
      pillarId: campaignInput.pillarId || 'p-1',
      goal: campaignInput.goal || 'Awareness',
      quarter: campaignInput.quarter || 'Q1',
      status: campaignInput.status || 'Active',
      startDate: campaignInput.startDate || '',
      endDate: campaignInput.endDate || '',
      budget: campaignInput.budget || '$0',
    };

    setCampaigns((prev) => [record, ...prev]);

    // The API needs a content plan plus a real date range; campaigns that only
    // have a quarter label stay local until those two values exist.
    if (
      apiEnabled() &&
      toNumericId(record.brandId) &&
      record.startDate &&
      record.endDate
    ) {
      createCampaignApi({
        brandId: record.brandId,
        name: record.name,
        objective: campaignInput.objective || record.goal,
        startDate: record.startDate,
        endDate: record.endDate,
      })
        .then((serverCampaign) => {
          if (!serverCampaign) return;
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === id
                ? { ...c, serverId: serverCampaign.serverId, contentPlanId: serverCampaign.contentPlanId }
                : c,
            ),
          );
        })
        .catch((error) => reportSync('create campaign', error));
    }

    return record;
  }, []);

  const updateCampaign = useCallback((campaignId, patch) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...patch } : c)),
    );

    const current = campaigns.find((c) => c.id === campaignId);
    if (apiEnabled() && current?.serverId) {
      updateCampaignApi(current.serverId, patch)
        .catch((error) => reportSync('update campaign', error));
    }
  }, [campaigns]);

  const deleteCampaign = useCallback((campaignId) => {
    const current = campaigns.find((c) => c.id === campaignId);

    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));

    if (apiEnabled() && current?.serverId) {
      deleteCampaignApi(current.serverId)
        .catch((error) => reportSync('delete campaign', error));
    }
  }, [campaigns]);

  const getCampaigns = useCallback(
    (brandId) =>
      brandId
        ? campaigns.filter((c) => c.brandId === String(brandId))
        : campaigns,
    [campaigns],
  );

  /* ---------------------------- Content Metadata ------------------------- */

  const saveContentMeta = useCallback((contentId, patch) => {
    setContentMeta((prev) => {
      const existing = prev[contentId] || {};
      return {
        ...prev,
        [contentId]: {
          ...existing,
          ...patch,
          updatedAt: stamp(),
        },
      };
    });
  }, []);

  const getContentMeta = useCallback(
    (contentId) => contentMeta[contentId] ?? {},
    [contentMeta],
  );

  /* ------------------------------ Settings ----------------------------- */

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  /* ------------------------------- Tasks Management ------------------------------- */

  const addTask = useCallback((taskInput) => {
    const id = `tsk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const nowIso = new Date().toISOString();
    const newTask = {
      id,
      title: taskInput.title || 'Untitled Task',
      description: taskInput.description || '',
      brandId: String(taskInput.brandId || '1'),
      brandName: taskInput.brandName || 'Nike',
      contentItemId: taskInput.contentItemId || '',
      contentTitle: taskInput.contentTitle || taskInput.title,
      priority: taskInput.priority || 'medium',
      status: taskInput.status || 'to_do',
      deadline: taskInput.deadline || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      assigneeId: taskInput.assigneeId || 'emp-1',
      assigneeName: taskInput.assigneeName || 'Sarah Lin',
      assigneeRole: taskInput.assigneeRole || 'Employee',
      assigneeAvatar: (taskInput.assigneeName || 'SL').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      revisionNote: taskInput.revisionNote || '',
      createdAt: nowIso,
    };

    setTasks((prev) => [newTask, ...prev]);

    if (apiEnabled() && toNumericId(newTask.assigneeId)) {
      createDirectTaskApi({
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assigneeId,
        priority: newTask.priority,
        plannedDeadline: newTask.deadline,
      })
        .then((serverTask) => {
          if (!serverTask) return;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === newTask.id
                ? {
                    ...t,
                    serverId: serverTask.serverId,
                    contentItemId: t.contentItemId || serverTask.contentItemId,
                  }
                : t,
            ),
          );
        })
        .catch((error) => reportSync('create task', error));
    }

    return newTask;
  }, []);

  const updateTask = useCallback((taskId, patch) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    );

    const current = tasks.find((t) => t.id === taskId);
    if (apiEnabled() && current?.serverId) {
      updateTaskApi(current.serverId, patch)
        .catch((error) => reportSync('update task', error));
    }
  }, [tasks]);

  const deleteTask = useCallback((taskId) => {
    const current = tasks.find((t) => t.id === taskId);

    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (apiEnabled() && current?.serverId) {
      deleteTaskApi(current.serverId)
        .catch((error) => reportSync('delete task', error));
    }
  }, [tasks]);

  const changeTaskStatus = useCallback((taskId, newStatus, optionalNote) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const patch = { status: newStatus };
        if (optionalNote !== undefined) {
          patch.revisionNote = optionalNote;
        }
        if (newStatus === 'in_progress' && t.revisionNote) {
          patch.returnedForRevision = false;
        }
        if (newStatus === 'to_do' && optionalNote) {
          patch.returnedForRevision = true;
        }
        return { ...t, ...patch };
      }),
    );

    const current = tasks.find((t) => t.id === taskId);
    if (apiEnabled() && current?.serverId) {
      updateTaskStatusApi(current.serverId, newStatus)
        .catch((error) => reportSync('update task status', error));
    }
  }, [tasks]);

  const autoConvertContentToTasks = useCallback((items, brandId, brandName) => {
    const createdTasks = [];
    const nowIso = new Date().toISOString();

    for (const item of items || []) {
      const exists = tasks.some((t) => t.contentItemId === item.id || t.title === item.title);
      if (!exists) {
        const deadlineDate = item.scheduledDate
          ? new Date(item.scheduledDate).toISOString()
          : new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

        const tsk = {
          id: `tsk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          title: item.title || 'Produce Content Deliverable',
          description: `Prepare, review, and finalize visual/copy assets for ${item.platform || 'social'} (${item.format || 'post'}).`,
          brandId: String(brandId || '1'),
          brandName: brandName || 'Nike',
          contentItemId: item.id || '',
          contentTitle: item.title || 'Content Item',
          priority: item.format?.toLowerCase().includes('video') ? 'high' : 'medium',
          status: 'to_do',
          deadline: deadlineDate,
          assigneeId: 'emp-1',
          assigneeName: 'Sarah Lin',
          assigneeRole: 'Employee',
          assigneeAvatar: 'SL',
          revisionNote: '',
          createdAt: nowIso,
        };
        createdTasks.push(tsk);
      }
    }

    if (createdTasks.length > 0) {
      setTasks((prev) => [...createdTasks, ...prev]);
    }
    return createdTasks.length;
  }, [tasks]);


  const [serverUnreadCount, setServerUnreadCount] = useState(null);

  // Keep the latest notifications in a ref so async handlers can resolve the
  // numeric server id without depending on the state closure.
  const notificationsRef = useRef(notifications);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const roleFilteredNotifications = useMemo(() => {
    if (!technicalRole || technicalRole === 'ADMIN') return notifications;
    return notifications.filter((n) => {
      if (!n.targetRoles) return true;
      return n.targetRoles.includes(technicalRole);
    });
  }, [notifications, technicalRole]);

  const unreadCount = useMemo(() => {
    if (serverUnreadCount !== null) return serverUnreadCount;
    return roleFilteredNotifications.filter((n) => !n.isRead).length;
  }, [serverUnreadCount, roleFilteredNotifications]);

  const refreshNotifications = useCallback(async () => {
    if (!user || isMockApiEnabled()) return;
    const [listResponse, countResponse] = await Promise.all([
      fetchNotificationsApi(),
      fetchUnreadNotificationCountApi(),
    ]);
    const list = Array.isArray(listResponse?.data)
      ? listResponse.data
      : listResponse?.data?.notifications;
    if (Array.isArray(list)) setNotifications(list.map(mapServerNotification));
    if (typeof countResponse?.data === 'number') {
      setServerUnreadCount(countResponse.data);
    } else if (typeof countResponse?.data?.unreadCount === 'number') {
      setServerUnreadCount(countResponse.data.unreadCount);
    }
  }, [user]);

  // Load the server feed and keep it current while the app is open.
  useEffect(() => {
    if (!user || isMockApiEnabled()) return undefined;
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    return () => {
      clearInterval(interval);
    };
  }, [user, refreshNotifications]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    const target = notificationsRef.current.find((n) => n.id === notificationId);
    const serverId = target?.serverId;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
    setServerUnreadCount((prev) => (prev !== null && prev > 0 ? prev - 1 : null));

    // Seeds and locally created notifications have no numeric id, so there is
    // nothing to persist for them.
    if (!Number.isSafeInteger(Number(serverId)) || Number(serverId) <= 0) return;

    try {
      const response = await markNotificationAsReadApi(serverId);
      if (response?.success !== false) await refreshNotifications();
    } catch {
      // Mock mode or offline fallback
    }
  }, [refreshNotifications]);

  const markAllNotificationsAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setServerUnreadCount(0);

    try {
      await markAllNotificationsAsReadApi();
    } catch {
      // Mock mode or offline fallback
    }
  }, []);

  const addNotification = useCallback((notification) => {
    const item = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notification,
    };
    setNotifications((prev) => [item, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      templates,
      dispatches,
      briefs,
      strategies,
      campaigns,
      contentMeta,
      settings,
      role: effectiveRole,
      technicalRole,
      isCreator,
      isAdmin,
      isAccountManager,
      isEmployee,
      isClient,
      lang: prefs.lang,
      t,
      setRole,
      setLang,
      roleFilteredNotifications,
      unreadCount,
      markNotificationAsRead,
      refreshNotifications,
      markAllNotificationsAsRead,
      addNotification,
      saveTemplate,
      deleteTemplate,
      getTemplate,
      createDispatch,
      updateDispatch,
      saveAnswers,
      submitAnswers,
      requestEdit,
      getDispatch,
      getDispatchByToken,
      generateBrief,
      saveBrief,
      approveBrief,
      getBrief,
      getBriefForBrand,
      saveStrategy,
      setStrategyStatus,
      deleteStrategy,
      getStrategy,
      getStrategyForBrand,
      getApprovedStrategy,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      getCampaigns,
      saveContentMeta,
      getContentMeta,
      updateSettings,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      changeTaskStatus,
      autoConvertContentToTasks,
    }),
    [
      templates,
      dispatches,
      briefs,
      strategies,
      campaigns,
      contentMeta,
      settings,
      effectiveRole,
      technicalRole,
      isCreator,
      isAdmin,
      isAccountManager,
      isEmployee,
      isClient,
      prefs.lang,
      t,
      setRole,
      setLang,
      roleFilteredNotifications,
      unreadCount,
      markNotificationAsRead,
      refreshNotifications,
      markAllNotificationsAsRead,
      addNotification,
      saveTemplate,
      deleteTemplate,
      getTemplate,
      createDispatch,
      updateDispatch,
      saveAnswers,
      submitAnswers,
      requestEdit,
      getDispatch,
      getDispatchByToken,
      generateBrief,
      saveBrief,
      approveBrief,
      getBrief,
      getBriefForBrand,
      saveStrategy,
      setStrategyStatus,
      deleteStrategy,
      getStrategy,
      getStrategyForBrand,
      getApprovedStrategy,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      getCampaigns,
      saveContentMeta,
      getContentMeta,
      updateSettings,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      changeTaskStatus,
      autoConvertContentToTasks,
    ],
  );

  return (
    <Sprint3Context.Provider value={value}>{children}</Sprint3Context.Provider>
  );
}
