import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sprint3Context } from './sprint3Store';
import {
  seedTasks,
  seedNotifications,
  seedClientReviews,
  seedClientRequests,
  seedPublishing,
  seedAnalytics,
  generateTaskId,
  generateNotifId,
  generateReqId,
  nowStamp,
} from '../data/sprintWorkflow';
import {
  BRIEF_STATUSES,
  STRATEGY_SECTIONS,
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
  tasks: 'orvia_s4_tasks_v1',
  notifications: 'orvia_s4_notifs_v1',
  clientReviews: 'orvia_s5_reviews_v1',
  clientRequests: 'orvia_s5_requests_v1',
  publishing: 'orvia_s5_publishing_v1',
};

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
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode: keep the in-memory session working.
  }
}

function textOf(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return value.name ?? '';
  return String(value ?? '');
}

function pickAnswer(answers, template, matcher) {
  const questions = template?.questions ?? [];
  for (const question of questions) {
    if (!matcher.test(`${question.label} ${question.id}`)) continue;
    const value = answers?.[question.id];
    const text = textOf(value).trim();
    if (text) return text;
  }
  return '';
}

function firstLongAnswer(answers) {
  return Object.values(answers ?? {})
    .map(textOf)
    .find((value) => value.trim().length > 40)
    ?.trim();
}

function generateSections({ brandName, industry, answers, template }) {
  const goals = pickAnswer(answers, template, /goal|target|objective|quarter|phase/i);
  const audience = pickAnswer(
    answers,
    template,
    /customer|patient|audience|buyer|who/i,
  );
  const competitors = pickAnswer(
    answers,
    template,
    /competitor|claim|market|avoid|usp|selling/i,
  );
  const tone = pickAnswer(answers, template, /tone|voice|feel|brand guide/i);
  const overview = firstLongAnswer(answers) ?? '';
  const trust = answers && Object.values(answers).find(Array.isArray);
  const messages = Array.isArray(trust) ? trust.join(' · ') : '';

  const fallbackTone = {
    Healthcare: 'Warm, plain-spoken and reassuring — never clinical.',
    'E-commerce': 'Confident, useful and shoppable without feeling salesy.',
    'Real Estate': 'Aspirational but grounded in facts and location.',
    'Food & Beverage': 'Sensory, warm and generous.',
    Fintech: 'Clear, precise and trust-building.',
    Education: 'Encouraging, clear and outcome-led.',
  };

  return {
    goals:
      goals ||
      `Grow qualified demand for ${brandName} this quarter and turn attention into measurable action.`,
    audience:
      audience ||
      `${industry || 'The brand'} audience is not clearly defined yet — interview the client before locking the strategy.`,
    competitors:
      competitors ||
      'Competitor set is still unknown. Add two or three brands the client watches closely.',
    tone: tone || fallbackTone[industry] || 'Warm, clear and human — confident without being loud.',
    overview:
      overview ||
      `${brandName} operates in ${industry || 'its category'} and needs a sharper story before the next content cycle.`,
    messages: messages || 'One clear promise, repeated consistently across every channel.',
  };
}

function clarifyingFor(sections, template) {
  const missing = [];

  if (!sections.competitors || /unknown/i.test(sections.competitors)) {
    missing.push('Who are the two or three competitors the client watches most closely?');
  }
  if (!sections.audience || /not clearly defined/i.test(sections.audience)) {
    missing.push('Describe the single most important audience segment in one sentence.');
  }
  if (!sections.goals || /Grow qualified demand/i.test(sections.goals)) {
    missing.push('What is the one measurable outcome for the next 90 days?');
  }

  const fileQuestion = (template?.questions ?? []).find((question) => question.type === 'file');
  if (fileQuestion) {
    missing.push(`Has the client uploaded the ${fileQuestion.label.replace(/^Upload\s+/i, '').toLowerCase()}?`);
  }

  return missing.map((question) => ({
    id: sprint3Id('cl'),
    question,
    answer: '',
  }));
}

export function Sprint3Provider({ children }) {
  const [templates, setTemplates] = useState(() => readArray(KEYS.templates, seedTemplates));
  const [dispatches, setDispatches] = useState(() =>
    readArray(KEYS.dispatches, seedDispatches),
  );
  const [briefs, setBriefs] = useState(() => readArray(KEYS.briefs, seedBriefs));
  const [strategies, setStrategies] = useState(() =>
    readArray(KEYS.strategies, seedStrategies),
  );
  const [campaigns, setCampaigns] = useState(() => readArray(KEYS.campaigns, seedCampaigns));
  const [contentMeta, setContentMeta] = useState(() =>
    readObject(KEYS.contentMeta, seedContentMeta),
  );
  const [settings, setSettings] = useState(() =>
    readObject(KEYS.settings, seedSettings),
  );

  const [tasks, setTasks] = useState(() => readArray(KEYS.tasks, seedTasks));
  const [notifications, setNotifications] = useState(() =>
    readArray(KEYS.notifications, seedNotifications),
  );
  const [clientReviews, setClientReviews] = useState(() =>
    readArray(KEYS.clientReviews, seedClientReviews),
  );
  const [clientRequests, setClientRequests] = useState(() =>
    readArray(KEYS.clientRequests, seedClientRequests),
  );
  const [publishingItems, setPublishingItems] = useState(() =>
    readArray(KEYS.publishing, seedPublishing),
  );

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
  useEffect(() => write(KEYS.clientReviews, clientReviews), [clientReviews]);
  useEffect(() => write(KEYS.clientRequests, clientRequests), [clientRequests]);
  useEffect(() => write(KEYS.publishing, publishingItems), [publishingItems]);

  // Direction belongs on <html> so every fixed shell element mirrors with it.
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

  /* ----------------------------- Templates ----------------------------- */

  const saveTemplate = useCallback((input) => {
    const now = stamp();

    if (input.id) {
      const patch = { ...input, updatedAt: now };
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === input.id ? { ...template, ...patch } : template,
        ),
      );
      return patch;
    }

    const template = {
      id: sprint3Id('tpl'),
      name: String(input.name ?? '').trim(),
      industry: input.industry ?? 'Other',
      description: String(input.description ?? '').trim(),
      questions: Array.isArray(input.questions) ? input.questions : [],
      createdAt: now,
      updatedAt: now,
    };

    setTemplates((prev) => [template, ...prev]);
    return template;
  }, []);

  const deleteTemplate = useCallback((templateId) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId));
  }, []);

  const getTemplate = useCallback(
    (templateId) => templates.find((template) => template.id === templateId) ?? null,
    [templates],
  );

  /* ----------------------------- Dispatches ---------------------------- */

  const createDispatch = useCallback(
    (input) => {
      const dispatch = {
        id: sprint3Id('dsp'),
        brandId: input.brandId,
        brandName: input.brandName,
        templateId: input.templateId,
        templateName: input.templateName,
        industry: input.industry ?? '',
        status: 'sent',
        portalToken: portalToken(),
        channels: Array.isArray(input.channels) ? input.channels : [],
        note: String(input.note ?? '').trim(),
        answers: {},
        sentAt: stamp(),
        submittedAt: null,
        updatedAt: stamp(),
      };

      setDispatches((prev) => [dispatch, ...prev]);
      return dispatch;
    },
    [],
  );

  const updateDispatch = useCallback((dispatchId, patch) => {
    setDispatches((prev) =>
      prev.map((dispatch) =>
        dispatch.id === dispatchId
          ? { ...dispatch, ...patch, updatedAt: stamp() }
          : dispatch,
      ),
    );
  }, []);

  const saveAnswers = useCallback((dispatchId, answers) => {
    setDispatches((prev) =>
      prev.map((dispatch) =>
        dispatch.id === dispatchId
          ? {
              ...dispatch,
              answers: { ...dispatch.answers, ...answers },
              status: dispatch.status === 'sent' ? 'draft' : dispatch.status,
              updatedAt: stamp(),
            }
          : dispatch,
      ),
    );
  }, []);

  const submitAnswers = useCallback((dispatchId, answers) => {
    setDispatches((prev) =>
      prev.map((dispatch) =>
        dispatch.id === dispatchId
          ? {
              ...dispatch,
              answers: { ...dispatch.answers, ...answers },
              status: 'submitted',
              submittedAt: stamp(),
              updatedAt: stamp(),
            }
          : dispatch,
      ),
    );
  }, []);

  const requestEdit = useCallback((dispatchId, reason) => {
    setDispatches((prev) =>
      prev.map((dispatch) =>
        dispatch.id === dispatchId
          ? {
              ...dispatch,
              status: 'draft',
              editRequest: { reason: String(reason ?? '').trim(), at: stamp() },
              updatedAt: stamp(),
            }
          : dispatch,
      ),
    );
  }, []);

  const getDispatch = useCallback(
    (dispatchId) => dispatches.find((dispatch) => dispatch.id === dispatchId) ?? null,
    [dispatches],
  );

  const getDispatchByToken = useCallback(
    (token) => dispatches.find((dispatch) => dispatch.portalToken === token) ?? null,
    [dispatches],
  );

  /* ------------------------------- Briefs ------------------------------ */

  const generateBrief = useCallback(
    ({ brandId, brandName, dispatchId, provider }) => {
      const dispatch = dispatches.find((item) => item.id === dispatchId) ?? null;
      const template = templates.find((item) => item.id === dispatch?.templateId) ?? null;
      const sections = generateSections({
        brandName,
        industry: dispatch?.industry,
        answers: dispatch?.answers ?? {},
        template,
      });

      const brief = {
        id: sprint3Id('brief'),
        brandId,
        brandName,
        dispatchId,
        status: 'draft',
        provider: provider ?? settings.aiProvider,
        sections,
        clarifying: clarifyingFor(sections, template),
        generatedAt: stamp(),
        approverName: '',
        approvedAt: '',
        createdAt: stamp(),
        updatedAt: stamp(),
      };

      setBriefs((prev) => [brief, ...prev]);
      return brief;
    },
    [dispatches, settings.aiProvider, templates],
  );

  const saveBrief = useCallback((briefId, patch) => {
    setBriefs((prev) =>
      prev.map((brief) =>
        brief.id === briefId ? { ...brief, ...patch, updatedAt: stamp() } : brief,
      ),
    );
  }, []);

  const approveBrief = useCallback(
    (briefId, approverName) => {
      const approvedAt = stamp();
      setBriefs((prev) =>
        prev.map((brief) =>
          brief.id === briefId
            ? {
                ...brief,
                status: BRIEF_STATUSES[1].id,
                approverName: approverName || brief.approverName,
                approvedAt,
                updatedAt: approvedAt,
              }
            : brief,
        ),
      );
    },
    [],
  );

  const getBrief = useCallback(
    (briefId) => briefs.find((brief) => brief.id === briefId) ?? null,
    [briefs],
  );

  const getBriefForBrand = useCallback(
    (brandId) =>
      briefs
        .filter((brief) => String(brief.brandId) === String(brandId))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null,
    [briefs],
  );

  /* ----------------------------- Strategies ---------------------------- */

  const saveStrategy = useCallback((input) => {
    const now = stamp();

    if (input.id) {
      const patch = Object.fromEntries(
        Object.entries({ ...input, updatedAt: now }).filter(([, value]) => value !== undefined),
      );
      setStrategies((prev) =>
        prev.map((strategy) =>
          strategy.id === input.id ? { ...strategy, ...patch } : strategy,
        ),
      );
      return patch;
    }

    const sections = STRATEGY_SECTIONS.reduce((accumulator, section) => {
      const source = input.sections?.[section.id];
      accumulator[section.id] = {
        body: String(source?.body ?? ''),
        briefSection: String(source?.briefSection ?? ''),
      };
      return accumulator;
    }, {});

    const strategy = {
      id: sprint3Id('str'),
      brandId: input.brandId,
      brandName: input.brandName,
      briefId: input.briefId ?? '',
      title: String(input.title ?? '').trim() || 'Untitled strategy',
      sections,
      platforms: Array.isArray(input.platforms) ? input.platforms : [],
      status: input.status || 'draft',
      authorName: String(input.authorName ?? '').trim(),
      reviewerName: '',
      reviewerNote: '',
      clientReason: '',
      clientName: '',
      createdAt: now,
      updatedAt: now,
      approvedAt: '',
    };

    setStrategies((prev) => [strategy, ...prev]);
    return strategy;
  }, []);

  const setStrategyStatus = useCallback((strategyId, status, patch = {}) => {
    const now = stamp();
    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === strategyId
          ? {
              ...strategy,
              ...patch,
              status,
              updatedAt: now,
              ...(status === 'approved' ? { approvedAt: patch.approvedAt || now } : {}),
            }
          : strategy,
      ),
    );
  }, []);

  const deleteStrategy = useCallback((strategyId) => {
    setStrategies((prev) => prev.filter((strategy) => strategy.id !== strategyId));
  }, []);

  const getStrategy = useCallback(
    (strategyId) => strategies.find((strategy) => strategy.id === strategyId) ?? null,
    [strategies],
  );

  const getStrategyForBrand = useCallback(
    (brandId) =>
      strategies
        .filter((strategy) => String(strategy.brandId) === String(brandId))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null,
    [strategies],
  );

  const getApprovedStrategy = useCallback(
    (brandId) =>
      strategies.find(
        (strategy) =>
          String(strategy.brandId) === String(brandId) && strategy.status === 'approved',
      ) ?? null,
    [strategies],
  );

  /* ----------------------------- Campaigns ----------------------------- */

  const addCampaign = useCallback((input) => {
    const campaign = {
      id: sprint3Id('cmp'),
      brandId: input.brandId,
      name: String(input.name ?? '').trim(),
      objective: String(input.objective ?? '').trim(),
      startDate: input.startDate ?? '',
      endDate: input.endDate ?? '',
      color: input.color ?? 'is-orange',
      createdAt: stamp(),
    };

    setCampaigns((prev) => [campaign, ...prev]);
    return campaign;
  }, []);

  const updateCampaign = useCallback((campaignId, patch) => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, ...patch } : campaign,
      ),
    );
  }, []);

  const deleteCampaign = useCallback((campaignId) => {
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== campaignId));
    setContentMeta((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((contentId) => {
        if (next[contentId]?.campaignId === campaignId) {
          next[contentId] = { ...next[contentId], campaignId: '' };
        }
      });
      return next;
    });
  }, []);

  const getCampaigns = useCallback(
    (brandId) => campaigns.filter((campaign) => String(campaign.brandId) === String(brandId)),
    [campaigns],
  );

  /* --------------------------- Content details ------------------------- */

  const saveContentMeta = useCallback((contentId, patch) => {
    setContentMeta((prev) => ({
      ...prev,
      [contentId]: {
        ...(prev[contentId] ?? {}),
        ...patch,
        updatedAt: stamp(),
      },
    }));
  }, []);

  const getContentMeta = useCallback(
    (contentId) => contentMeta[contentId] ?? {},
    [contentMeta],
  );

  /* ------------------------------ Settings ----------------------------- */

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);


  /* ------------------------------- Tasks (Sprint 4) ------------------------------- */

  const addTask = useCallback((taskInput) => {
    const id = generateTaskId();
    const now = nowStamp();
    const newTask = {
      id,
      title: taskInput.title || 'Untitled Task',
      description: taskInput.description || '',
      brandId: String(taskInput.brandId || '1'),
      brandName: taskInput.brandName || 'Brand',
      contentItemId: taskInput.contentItemId || '',
      contentTitle: taskInput.contentTitle || taskInput.title,
      assigneeId: String(taskInput.assigneeId || '160'),
      assigneeName: taskInput.assigneeName || 'Sarah Lin',
      assigneeRole: taskInput.assigneeRole || 'Content Creator',
      assigneeAvatar: (taskInput.assigneeName || 'SL').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      priority: taskInput.priority || 'medium',
      deadline: taskInput.deadline || now.split(' ')[0],
      status: taskInput.status || 'todo',
      revisionsRequired: false,
      revisionsNote: '',
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          author: 'Elena Vance',
          authorRole: 'Account Manager',
          action: 'Task Created & Assigned',
          note: taskInput.description || 'Task assigned for execution.',
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    setTasks((prev) => [newTask, ...prev]);

    const notif = {
      id: generateNotifId(),
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You were assigned to "${newTask.title}" for ${newTask.brandName}.`,
      targetRole: 'creative',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);

    return newTask;
  }, []);

  const updateTask = useCallback((taskId, patch) => {
    const now = nowStamp();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return { ...task, ...patch, updatedAt: now };
      }),
    );
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const changeTaskStatus = useCallback((taskId, newStatus, optionalNote) => {
    const now = nowStamp();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const newAudit = {
          id: `aud-${Date.now()}`,
          author: 'Elena Vance',
          authorRole: 'Account Manager',
          action: `Status changed to ${newStatus}`,
          note: optionalNote || '',
          timestamp: now,
        };
        return {
          ...task,
          status: newStatus,
          revisionsRequired: newStatus === 'in_progress' ? task.revisionsRequired : false,
          auditTrail: [newAudit, ...(task.auditTrail || [])],
          updatedAt: now,
        };
      }),
    );
  }, []);

  const submitTaskForReview = useCallback((taskId, creatorNote) => {
    const now = nowStamp();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const newAudit = {
          id: `aud-${Date.now()}`,
          author: task.assigneeName || 'Content Creator',
          authorRole: 'Content Creator',
          action: 'Submitted for Internal Review',
          note: creatorNote || 'Work delivered and ready for review.',
          timestamp: now,
        };
        return {
          ...task,
          status: 'in_review',
          revisionsRequired: false,
          auditTrail: [newAudit, ...(task.auditTrail || [])],
          updatedAt: now,
        };
      }),
    );

    const notif = {
      id: generateNotifId(),
      type: 'in_review',
      title: 'Work Ready for Review',
      message: 'A task was submitted for internal review by content team.',
      targetRole: 'account_manager',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const approveTaskInternal = useCallback((taskId, managerNote) => {
    const now = nowStamp();
    let completedTask = null;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        completedTask = task;
        const newAudit = {
          id: `aud-${Date.now()}`,
          author: 'Elena Vance',
          authorRole: 'Account Manager',
          action: 'Approved & Completed',
          note: managerNote || 'Internal review passed. Ready for client review.',
          timestamp: now,
        };
        return {
          ...task,
          status: 'completed',
          revisionsRequired: false,
          revisionsNote: '',
          auditTrail: [newAudit, ...(task.auditTrail || [])],
          updatedAt: now,
        };
      }),
    );

    if (completedTask) {
      setClientReviews((prevReviews) => {
        const exists = prevReviews.some(
          (r) => r.taskId === taskId || (completedTask.contentItemId && r.contentItemId === completedTask.contentItemId)
        );
        if (exists) return prevReviews;
        const newReview = {
          id: `cr-${Math.random().toString(36).substring(2, 7)}`,
          brandId: completedTask.brandId,
          brandName: completedTask.brandName,
          contentItemId: completedTask.contentItemId || `ci-${completedTask.id}`,
          taskId: completedTask.id,
          title: completedTask.title,
          format: 'post',
          platform: 'instagram',
          caption: `${completedTask.description}\n\n#${completedTask.brandName.replace(/\s+/g, '')} #NewCampaign`,
          mediaPreview: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=720&q=80',
          status: 'pending_client_review',
          clientFeedback: '',
          comments: [
            {
              id: `comm-${Date.now()}`,
              author: 'Elena Vance',
              authorRole: 'Agency Lead',
              text: 'Internal review passed. Ready for your final sign-off!',
              timestamp: now,
            },
          ],
          updatedAt: now,
        };
        return [newReview, ...prevReviews];
      });
    }

    const notif = {
      id: generateNotifId(),
      type: 'client_approval',
      title: 'Task Approved Internally',
      message: 'Task was approved and pushed to Client Review Portal.',
      targetRole: 'creative',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const requestTaskRevisions = useCallback((taskId, revisionsNote) => {
    const now = nowStamp();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const newAudit = {
          id: `aud-${Date.now()}`,
          author: 'Elena Vance',
          authorRole: 'Account Manager',
          action: 'Requested Revisions',
          note: revisionsNote || 'Revisions requested.',
          timestamp: now,
        };
        return {
          ...task,
          status: 'in_progress',
          revisionsRequired: true,
          revisionsNote: revisionsNote || '',
          auditTrail: [newAudit, ...(task.auditTrail || [])],
          updatedAt: now,
        };
      }),
    );

    const notif = {
      id: generateNotifId(),
      type: 'revisions_requested',
      title: 'Revisions Requested',
      message: `Revisions requested: "${revisionsNote}"`,
      targetRole: 'creative',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const autoConvertContentToTasks = useCallback((items, brandId, brandName) => {
    const now = nowStamp();
    const createdTasks = [];
    (items || []).forEach((item, idx) => {
      const exists = tasks.some((t) => t.contentItemId === item.id || t.title === item.title);
      if (!exists && item.title) {
        const id = generateTaskId();
        const tsk = {
          id,
          title: item.title,
          description: item.caption || item.keyMessage || `Execution of content item "${item.title}"`,
          brandId: String(brandId || '1'),
          brandName: brandName || 'Nike',
          contentItemId: item.id || `ci-${idx}`,
          contentTitle: item.title,
          assigneeId: idx % 2 === 0 ? '160' : '170',
          assigneeName: idx % 2 === 0 ? 'Sarah Lin' : 'Liam Chen',
          assigneeRole: idx % 2 === 0 ? 'Content Creator' : 'Video Editor',
          assigneeAvatar: idx % 2 === 0 ? 'SL' : 'LC',
          priority: idx === 0 ? 'high' : 'medium',
          deadline: item.date || item.publishDate || now.split(' ')[0],
          status: 'todo',
          revisionsRequired: false,
          revisionsNote: '',
          auditTrail: [
            {
              id: `aud-${Date.now()}-${idx}`,
              author: 'Elena Vance',
              authorRole: 'Account Manager',
              action: 'Auto-converted from Content Plan',
              note: 'Linked to approved Strategy content item.',
              timestamp: now,
            },
          ],
          createdAt: now,
          updatedAt: now,
        };
        createdTasks.push(tsk);
      }
    });

    if (createdTasks.length > 0) {
      setTasks((prev) => [...createdTasks, ...prev]);
    }
    return createdTasks.length;
  }, [tasks]);

  /* -------------------------- Client Review (Sprint 5) ------------------------- */

  const approveClientReview = useCallback((reviewId, clientNote) => {
    const now = nowStamp();
    let approvedReview = null;

    setClientReviews((prev) =>
      prev.map((rev) => {
        if (rev.id !== reviewId) return rev;
        approvedReview = {
          ...rev,
          status: 'approved',
          clientFeedback: clientNote || 'Approved by client.',
          comments: clientNote
            ? [
                ...(rev.comments || []),
                {
                  id: `comm-${Date.now()}`,
                  author: 'Kenji Sato',
                  authorRole: 'Client Marketing Lead',
                  text: clientNote,
                  timestamp: now,
                },
              ]
            : rev.comments,
          updatedAt: now,
        };
        return approvedReview;
      }),
    );

    if (approvedReview) {
      setPublishingItems((prev) => {
        const alreadyPub = prev.some((p) => p.contentItemId === approvedReview.contentItemId);
        if (alreadyPub) return prev;
        const newPub = {
          id: `pub-${Math.random().toString(36).substring(2, 7)}`,
          contentItemId: approvedReview.contentItemId,
          brandId: approvedReview.brandId,
          brandName: approvedReview.brandName,
          title: approvedReview.title,
          platform: approvedReview.platform || 'instagram',
          scheduledDate: now,
          actualPublishDate: '',
          liveUrl: '',
          status: 'scheduled',
          notes: 'Auto-scheduled following client approval.',
        };
        return [newPub, ...prev];
      });
    }

    const notif = {
      id: generateNotifId(),
      type: 'client_approval',
      title: 'Client Approved Content',
      message: `Content "${approvedReview?.title || 'Post'}" was approved by client and scheduled for publishing!`,
      targetRole: 'account_manager',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const requestClientChanges = useCallback((reviewId, reason) => {
    const now = nowStamp();
    setClientReviews((prev) =>
      prev.map((rev) => {
        if (rev.id !== reviewId) return rev;
        return {
          ...rev,
          status: 'changes_requested',
          clientFeedback: reason || '',
          comments: [
            ...(rev.comments || []),
            {
              id: `comm-${Date.now()}`,
              author: 'Kenji Sato',
              authorRole: 'Client Lead',
              text: `Changes Requested: ${reason}`,
              timestamp: now,
            },
          ],
          updatedAt: now,
        };
      }),
    );

    const notif = {
      id: generateNotifId(),
      type: 'revisions_requested',
      title: 'Client Requested Changes',
      message: `Client requested modifications: "${reason}"`,
      targetRole: 'account_manager',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const addReviewComment = useCallback((reviewId, author, authorRole, text) => {
    const now = nowStamp();
    setClientReviews((prev) =>
      prev.map((rev) => {
        if (rev.id !== reviewId) return rev;
        const newComment = {
          id: `comm-${Date.now()}`,
          author: author || 'Elena Vance',
          authorRole: authorRole || 'Agency Lead',
          text,
          timestamp: now,
        };
        return {
          ...rev,
          comments: [...(rev.comments || []), newComment],
          updatedAt: now,
        };
      }),
    );
  }, []);

  /* -------------------------- Client Requests (Sprint 5) ------------------------- */

  const addClientRequest = useCallback((reqInput) => {
    const id = generateReqId();
    const now = nowStamp();
    const newReq = {
      id,
      brandId: String(reqInput.brandId || '1'),
      brandName: reqInput.brandName || 'Nike',
      title: reqInput.title || 'Special Request',
      type: reqInput.type || 'extra_design',
      urgency: reqInput.urgency || 'standard',
      deadline: reqInput.deadline || now.split(' ')[0],
      description: reqInput.description || '',
      status: 'submitted',
      rejectionReason: '',
      assignedTaskId: null,
      createdAt: now,
    };

    setClientRequests((prev) => [newReq, ...prev]);

    const notif = {
      id: generateNotifId(),
      type: 'client_request',
      title: 'New Client Request',
      message: `${newReq.brandName} submitted: "${newReq.title}"`,
      targetRole: 'account_manager',
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [notif, ...prev]);
    return newReq;
  }, []);

  const updateClientRequestStatus = useCallback((reqId, newStatus, reason, assignedTaskId) => {
    setClientRequests((prev) =>
      prev.map((req) => {
        if (req.id !== reqId) return req;
        return {
          ...req,
          status: newStatus,
          rejectionReason: reason || req.rejectionReason,
          assignedTaskId: assignedTaskId || req.assignedTaskId,
        };
      }),
    );
  }, []);

  /* -------------------------- Publishing Tracker (Sprint 5) ------------------------- */

  const addPublishingItem = useCallback((pubInput) => {
    const id = `pub-${Math.random().toString(36).substring(2, 7)}`;
    const now = nowStamp();
    const newPub = {
      id,
      contentItemId: pubInput.contentItemId || `ci-${Date.now()}`,
      brandId: String(pubInput.brandId || '1'),
      brandName: pubInput.brandName || 'Nike',
      title: pubInput.title || 'Untitled Post',
      platform: pubInput.platform || 'instagram',
      scheduledDate: pubInput.scheduledDate || now,
      actualPublishDate: pubInput.actualPublishDate || '',
      liveUrl: pubInput.liveUrl || '',
      status: pubInput.status || 'scheduled',
      notes: pubInput.notes || '',
    };
    setPublishingItems((prev) => [newPub, ...prev]);
    return newPub;
  }, []);

  const updatePublishingItem = useCallback((pubId, patch) => {
    setPublishingItems((prev) =>
      prev.map((pub) => (pub.id === pubId ? { ...pub, ...patch } : pub)),
    );
  }, []);

  /* --------------------------- Notifications --------------------------- */

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
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
      role: prefs.role,
      lang: prefs.lang,
      t,
      setRole,
      setLang,
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
      notifications,
      clientReviews,
      clientRequests,
      publishingItems,
      seedAnalytics,
      addTask,
      updateTask,
      deleteTask,
      changeTaskStatus,
      submitTaskForReview,
      approveTaskInternal,
      requestTaskRevisions,
      autoConvertContentToTasks,
      approveClientReview,
      requestClientChanges,
      addReviewComment,
      addClientRequest,
      updateClientRequestStatus,
      addPublishingItem,
      updatePublishingItem,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
    }),
    [
      templates,
      dispatches,
      briefs,
      strategies,
      campaigns,
      contentMeta,
      settings,
      prefs.role,
      prefs.lang,
      t,
      setRole,
      setLang,
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
    ],
  );

  return <Sprint3Context.Provider value={value}>{children}</Sprint3Context.Provider>;
}
