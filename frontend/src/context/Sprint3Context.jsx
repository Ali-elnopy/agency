import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sprint3Context } from './sprint3Store';
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

export function Sprint3Provider({ children }) {
  const [templates, setTemplates] = useState(() =>
    readArray(KEYS.templates, seedTemplates),
  );
  const [dispatches, setDispatches] = useState(() =>
    readArray(KEYS.dispatches, seedDispatches),
  );
  const [briefs, setBriefs] = useState(() => readArray(KEYS.briefs, seedBriefs));
  const [strategies, setStrategies] = useState(() =>
    readArray(KEYS.strategies, seedStrategies),
  );
  const [campaigns, setCampaigns] = useState(() =>
    readArray(KEYS.campaigns, seedCampaigns),
  );
  const [contentMeta, setContentMeta] = useState(() =>
    readObject(KEYS.contentMeta, seedContentMeta),
  );
  const [settings, setSettings] = useState(() =>
    readObject(KEYS.settings, seedSettings),
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
    const isNew = !templateInput.id;
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

      const template = dispatch ? getTemplate(dispatch.templateId) : null;
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
        status: BRIEF_STATUSES.DRAFT,
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

      return newBrief;
    },
    [dispatches, briefs, getTemplate],
  );

  const saveBrief = useCallback((briefInput) => {
    setBriefs((prev) => {
      const exists = prev.some((b) => b.id === briefInput.id);
      if (exists) {
        return prev.map((b) => (b.id === briefInput.id ? { ...b, ...briefInput } : b));
      }
      return [briefInput, ...prev];
    });
  }, []);

  const approveBrief = useCallback((briefId, approverName, notes = '') => {
    const now = stamp();
    let updated = null;

    setBriefs((prev) =>
      prev.map((b) => {
        if (b.id !== briefId) return b;
        updated = {
          ...b,
          status: BRIEF_STATUSES.APPROVED,
          approvedBy: approverName || 'Account Manager',
          approvedAt: now,
          notes,
        };
        return updated;
      }),
    );

    return updated;
  }, []);

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
    const normalized = {
      ...strategyInput,
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

    return normalized;
  }, []);

  const setStrategyStatus = useCallback((strategyId, status, meta = {}) => {
    const now = stamp();
    let updated = null;

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

    return updated;
  }, []);

  const deleteStrategy = useCallback((strategyId) => {
    setStrategies((prev) => prev.filter((s) => s.id !== strategyId));
  }, []);

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
          s.brandId === String(brandId) && s.status === 'client_approved',
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
    return record;
  }, []);

  const updateCampaign = useCallback((campaignId, patch) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...patch } : c)),
    );
  }, []);

  const deleteCampaign = useCallback((campaignId) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  }, []);

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

  return (
    <Sprint3Context.Provider value={value}>{children}</Sprint3Context.Provider>
  );
}
