import React, { useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import Toast from '../components/ui/Toast';
import { useSprint3 } from '../context/sprint3Store';
import { isMockApiEnabled } from '../services/api';
import { apiRequest } from '../services/http';
import {
  fetchMyOnboardingApi,
  fetchOnboardingCategoriesApi,
  fetchOnboardingTemplateApi,
  saveOnboardingAnswersApi,
  saveOnboardingSelectionApi,
  submitOnboardingApi,
} from '../services/sprint3Api';

export default function ClientPortalPage({ token, onSignOut, theme = 'light', onToggleTheme }) {
  const { user, logout } = useAuth();
  const isDark = theme === 'dark';
  const {
    dispatches = [],
    strategies = [],
    setStrategyStatus,
    getDispatchByToken,
    roleFilteredNotifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
    lang,
    setLang,
    t,
  } = useSprint3();
  const { toast, showToast } = useToast(4500);

  // Active navigation: 'onboarding' | 'brief' | 'strategy' | 'notifications' | 'brands' | 'content_plans'
  const [activeNav, setActiveNav] = useState('onboarding');

  // Sub-screens
  const [onboardingStep, setOnboardingStep] = useState('category'); // 'category' | 'form' | 'sections' | 'confirmation'
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [briefViewMode, setBriefViewMode] = useState('summary'); // 'summary' (p11) | 'answers' (p12)
  const [strategySubScreen, setStrategySubScreen] = useState('approval'); // 'details' (p13) | 'internal_review' (p14) | 'approval' (p15)
  const [brandSubScreen, setBrandSubScreen] = useState('list'); // 'list' (p17) | 'platforms' (p18)
  const [contentPlanSubScreen, setContentPlanSubScreen] = useState('list'); // 'list' (p19) | 'create' (p20) | 'delete' (p21) | 'monthly' (p22) | 'campaign' (p23) | 'item' (p24)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread' | 'strategy' | 'content_plans' | 'onboarding'
  const [notifSearch, setNotifSearch] = useState('');
  const [clientBrand, setClientBrand] = useState(null);
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [brandRequestStatus, setBrandRequestStatus] = useState('loading');
  const [brandRequestError, setBrandRequestError] = useState('');
  const [brandRequestAttempt, setBrandRequestAttempt] = useState(0);
  const [onboardingCategories, setOnboardingCategories] = useState([]);
  const [onboardingTemplate, setOnboardingTemplate] = useState(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [activityType, setActivityType] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    let active = true;

    async function loadClientBrand() {
      setBrandRequestStatus('loading');
      setBrandRequestError('');

      try {
        const response = await apiRequest('/brands');
        const records = response?.data?.brands;
        const linkedBrand = Array.isArray(records) ? records[0] ?? null : null;

        if (!linkedBrand) {
          if (active) {
            setClientBrand(null);
            setPlatformAccounts([]);
            setBrandRequestStatus('empty');
          }
          return;
        }

        const accountsResponse = await apiRequest(
          `/platform-accounts?brandId=${encodeURIComponent(linkedBrand.id)}`,
        );

        if (active) {
          setClientBrand(linkedBrand);
          setPlatformAccounts(accountsResponse?.data?.accounts ?? []);
          setBrandRequestStatus('loaded');
        }
      } catch (error) {
        if (active) {
          setBrandRequestError(error?.message || 'Could not load your brand.');
          setBrandRequestStatus('error');
        }
      }
    }

    loadClientBrand();
    return () => {
      active = false;
    };
  }, [brandRequestAttempt, user?.id]);

  useEffect(() => {
    let active = true;

    async function loadOnboarding() {
      setOnboardingLoading(true);
      setOnboardingError('');

      try {
        const [categoriesData, myOnboarding] = await Promise.all([
          fetchOnboardingCategoriesApi(),
          fetchMyOnboardingApi(),
        ]);
        const categories = categoriesData?.categories ?? [];
        const onboarding = myOnboarding?.onboarding ?? null;
        const selectedCategory = categories.find((item) => item.code === onboarding?.mainCategory) ?? categories[0];
        const selectedActivity = onboarding?.activityType
          ?? selectedCategory?.subtypes?.[0]?.code
          ?? '';

        let template = null;
        if (onboarding) {
          template = await fetchOnboardingTemplateApi({
            mainCategory: onboarding.mainCategory,
            activityType: selectedCategory?.requires_subtype ? onboarding.activityType : undefined,
          });
        }

        if (active) {
          setOnboardingCategories(categories);
          setMainCategory(selectedCategory?.code ?? '');
          setActivityType(selectedActivity);
          setOnboardingTemplate(template);
          setAnswers(Object.fromEntries((onboarding?.answers ?? []).map(({ questionCode, answer }) => [questionCode, answer])));
          if (onboarding?.status === 'SUBMITTED') {
            setOnboardingStep('confirmation');
          } else if (onboarding) {
            setOnboardingStep('sections');
          }
        }
      } catch (error) {
        if (active) setOnboardingError(error?.message || 'Could not load your onboarding.');
      } finally {
        if (active) setOnboardingLoading(false);
      }
    }

    loadOnboarding();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Client notifications system
  const [clientNotifications, setClientNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Strategy Plan Ready for Review',
      titleAr: 'خطة الاستراتيجية جاهزة للمراجعة والاعتماد',
      message: 'Bean & Co Cafe Q4 Growth Strategy is awaiting your review and approval.',
      messageAr: 'استراتيجية نمو الربع الرابع لـ Bean & Co Cafe جاهزة لمراجعتكم واعتمادكم.',
      time: '10 minutes ago',
      timeAr: 'منذ 10 دقائق',
      unread: true,
      category: 'strategy',
      actionNav: 'strategy',
      actionSubScreen: 'approval',
    },
    {
      id: 'notif-2',
      title: 'October Content Calendar Published',
      titleAr: 'تم نشر تقويم المحتوى لشهر أكتوبر',
      message: '14 new content items and 2 campaigns added to your monthly plan.',
      messageAr: 'تمت إضافة 14 عنصر محتوى وحملتين تسويقيتين إلى خطتكم الشهرية.',
      time: '2 hours ago',
      timeAr: 'منذ ساعتين',
      unread: true,
      category: 'content_plans',
      actionNav: 'content_plans',
      actionSubScreen: 'monthly',
    },
    {
      id: 'notif-3',
      title: 'Onboarding Questionnaire Received',
      titleAr: 'تم استلام استبيان الإعداد بنجاح',
      message: 'Creative team has received your brand voice and preferences.',
      messageAr: 'فريق العمل الإبداعي استلم تفضيلات البراند وهويتك بنجاح.',
      time: 'Yesterday',
      timeAr: 'أمس',
      unread: true,
      category: 'onboarding',
      actionNav: 'onboarding',
      actionStep: 'confirmation',
    },
    {
      id: 'notif-4',
      title: 'Brand Brief AI Draft Generated',
      titleAr: 'تم توليد مسودة الملخص الإبداعي بالذكاء الاصطناعي',
      message: 'Initial competitor benchmarks and audience insights are ready to inspect.',
      messageAr: 'تحليل المنافسين ومعلومات الجمهور المستهدف جاهزة للاطلاع.',
      time: '2 days ago',
      timeAr: 'منذ يومين',
      unread: false,
      category: 'brief',
      actionNav: 'brief',
      actionSubScreen: 'summary',
    },
    {
      id: 'notif-5',
      title: 'Instagram & TikTok Accounts Synced',
      titleAr: 'تمت مزامنة حسابات إنستجرام وتيك توك',
      message: 'Platform accounts connected successfully with live metrics tracking enabled.',
      messageAr: 'تم ربط الحسابات وتفعيل تتبع مؤشرات الأداء الحية.',
      time: '3 days ago',
      timeAr: 'منذ 3 أيام',
      unread: false,
      category: 'brands',
      actionNav: 'brands',
      actionSubScreen: 'platforms',
    },
  ]);

  const unreadNotifCount = useMemo(
    () => clientNotifications.filter((n) => n.unread).length,
    [clientNotifications],
  );

  // Replace the showcase notifications with the signed-in client's real feed as
  // soon as the API returns records. Demo builds keep the fixtures.
  useEffect(() => {
    if (isMockApiEnabled() || roleFilteredNotifications.length === 0) return;

    const navFor = (link) => {
      if (link === 'strategy') return { actionNav: 'strategy', actionSubScreen: 'approval' };
      if (link === 'content_plans') return { actionNav: 'content_plans', actionSubScreen: 'monthly' };
      return { actionNav: 'onboarding', actionStep: 'confirmation' };
    };

    setClientNotifications(
      roleFilteredNotifications.map((item) => {
        const nav = navFor(item.link);
        const time = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
            })
          : '';

        return {
          id: `portal-${item.id}`,
          contextId: item.id,
          title: item.title,
          titleAr: item.titleAr ?? item.title,
          message: item.message,
          messageAr: item.messageAr ?? item.message,
          time,
          timeAr: time,
          unread: !item.isRead,
          category: item.link || 'onboarding',
          ...nav,
        };
      }),
    );
  }, [roleFilteredNotifications]);

  const handleToggleRead = (id, forceState) => {
    const target = clientNotifications.find((n) => n.id === id);

    setClientNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const next = forceState !== undefined ? !forceState : !n.unread;
          return { ...n, unread: next };
        }
        return n;
      }),
    );

    if (target?.contextId && target.unread) {
      markNotificationAsRead?.(target.contextId);
    }

    showToast(t('Notification updated'), 'info');
  };

  const handleMarkAllAsRead = () => {
    setClientNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    markAllNotificationsAsRead?.();
    showToast(t('All notifications marked as read.'), 'success');
  };

  const handleClearReadNotifications = () => {
    setClientNotifications((prev) => prev.filter((n) => n.unread));
    showToast(t('Read notifications cleared'), 'info');
  };

  const handleDeleteNotif = (id) => {
    setClientNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast(t('Notification deleted'), 'info');
  };

  const handleNavigateFromNotif = (notif) => {
    setNotifDropdownOpen(false);
    handleToggleRead(notif.id, true);
    if (notif.actionNav) {
      setActiveNav(notif.actionNav);
      if (notif.actionSubScreen) {
        if (notif.actionNav === 'strategy') setStrategySubScreen(notif.actionSubScreen);
        if (notif.actionNav === 'content_plans') setContentPlanSubScreen(notif.actionSubScreen);
        if (notif.actionNav === 'brief') setBriefViewMode(notif.actionSubScreen);
        if (notif.actionNav === 'brands') setBrandSubScreen(notif.actionSubScreen);
      }
      if (notif.actionStep && notif.actionNav === 'onboarding') {
        setOnboardingStep(notif.actionStep);
      }
    }
  };

  const dispatch = useMemo(() => {
    if (token) {
      const found = getDispatchByToken(token);
      if (found) return found;
    }
    return dispatches[0] ?? {
      id: 'disp-default',
      status: 'in_progress',
      answers: {},
    };
  }, [getDispatchByToken, token, dispatches]);

  const brandName = clientBrand?.name || '';
  const [strategyComment, setStrategyComment] = useState('Please focus more on Instagram Reels.');
  const [planForm, setPlanForm] = useState({
    title: 'Winter Launch',
    month: '13',
    year: '2026',
    goals: 'Grow followers by 15%.',
    notes: '',
  });
  const [itemForm, setItemForm] = useState({
    title: 'Latte art tips',
    type: 'POST',
    scheduledDate: '2026-12-02',
    reference: 'Winter menu shoot',
    toneOfVoice: 'Warm and playful',
    caption: 'Warm up with our new latte.',
    notes: '',
    campaign: 'Hot Drinks Week',
  });

  const brandStrategy = useMemo(() => {
    return strategies.find((s) => String(s.brandId) === String(dispatch?.brandId)) ?? strategies[0] ?? null;
  }, [dispatch, strategies]);

  const currentSection = onboardingTemplate?.sections?.[currentSectionIndex] ?? null;
  const selectedCategory = onboardingCategories.find((category) => category.code === mainCategory) ?? null;

  const handleFieldChange = (questionCode, answer) => {
    setAnswers((previous) => ({ ...previous, [questionCode]: answer }));
  };

  const getAnswerPayload = () => Object.entries(answers)
    .filter(([, answer]) => answer !== undefined && answer !== null)
    .map(([questionCode, answer]) => ({ questionCode, answer }));

  const handleSaveDraft = async () => {
    if (!onboardingTemplate) return;
    setOnboardingBusy(true);
    setOnboardingError('');
    try {
      const payload = getAnswerPayload();
      if (payload.length === 0) throw new Error('Enter at least one answer before saving.');
      await saveOnboardingAnswersApi(payload);
      showToast(t('Draft saved successfully.'), 'success');
    } catch (error) {
      setOnboardingError(error?.message || 'Could not save your answers.');
      showToast(error?.message || 'Could not save your answers.', 'error');
    } finally {
      setOnboardingBusy(false);
    }
  };

  const handleSubmitOnboarding = async () => {
    if (!onboardingTemplate) return;
    setOnboardingBusy(true);
    setOnboardingError('');
    try {
      const payload = getAnswerPayload();
      if (payload.length === 0) throw new Error('Answer at least one question before submitting.');
      await saveOnboardingAnswersApi(payload);
      await submitOnboardingApi();
      setOnboardingStep('confirmation');
      showToast(t('Onboarding submitted successfully!'), 'success');
    } catch (error) {
      setOnboardingError(error?.message || 'Could not submit your onboarding.');
      showToast(error?.message || 'Could not submit your onboarding.', 'error');
    } finally {
      setOnboardingBusy(false);
    }
  };

  const handleStartOnboarding = async () => {
    if (!selectedCategory) return;
    setOnboardingBusy(true);
    setOnboardingError('');
    try {
      const selection = await saveOnboardingSelectionApi({
        mainCategory,
        activityType: selectedCategory.requires_subtype ? activityType : undefined,
      });
      const template = await fetchOnboardingTemplateApi({
        mainCategory,
        activityType: selectedCategory.requires_subtype ? activityType : undefined,
      });
      setOnboardingTemplate(template);
      setAnswers(Object.fromEntries((selection?.answers ?? []).map(({ questionCode, answer }) => [questionCode, answer])));
      setCurrentSectionIndex(0);
      setOnboardingStep('sections');
    } catch (error) {
      setOnboardingError(error?.message || 'Could not load the selected questionnaire.');
    } finally {
      setOnboardingBusy(false);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < (onboardingTemplate?.sections?.length ?? 0) - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmitOnboarding();
    }
  };

  const handleApproveStrategy = () => {
    if (!brandStrategy) return;
    setStrategyStatus(brandStrategy.id, 'client_approved', {
      clientApproved: true,
      clientName: user?.fullName || 'Client',
      note: 'Client approved the strategy.',
    });
    showToast(t('Strategy approved successfully.'), 'success');
  };

  const handleRequestStrategyChanges = () => {
    if (!brandStrategy) return;
    if (!strategyComment.trim()) {
      showToast(t('Reason for changes is required.'), 'error');
      return;
    }
    setStrategyStatus(brandStrategy.id, 'changes_requested', {
      clientReason: strategyComment.trim(),
      clientName: user?.fullName || 'Client',
    });
    showToast(t('Your change request was sent.'), 'info');
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      logout?.();
      window.location.hash = '#login';
      window.location.reload();
    }
  };

  /* ==========================================================================
     PAGE RENDERERS (Pages 1 to 24)
     ========================================================================== */

  // PAGE 1: Select a category and load its server template.
  const renderPage1Category = () => (
    <div style={{ maxWidth: 900 }}>
      <div className="portal-page-header">
        <h1>Select Category</h1>
        <div className="portal-breadcrumb">Orvia / Onboarding</div>
      </div>
      {onboardingError && <p role="alert" className="modal-error">{onboardingError}</p>}
      {onboardingLoading ? <p>Loading onboarding…</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '24px 0 36px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>
              Main Category
              <select className="form-select" value={mainCategory} onChange={(event) => {
                const nextCategory = onboardingCategories.find((item) => item.code === event.target.value);
                setMainCategory(event.target.value);
                setActivityType(nextCategory?.subtypes?.[0]?.code ?? '');
              }} style={{ display: 'block', width: '100%', height: 46, marginTop: 8 }}>
                {onboardingCategories.map((category) => <option key={category.code} value={category.code}>{category.label}</option>)}
              </select>
            </label>
            {selectedCategory?.requires_subtype && (
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>
                Activity Type
                <select className="form-select" value={activityType} onChange={(event) => setActivityType(event.target.value)} style={{ display: 'block', width: '100%', height: 46, marginTop: 8 }}>
                  {(selectedCategory.subtypes ?? []).map((subtype) => <option key={subtype.code} value={subtype.code}>{subtype.label}</option>)}
                </select>
              </label>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleStartOnboarding} disabled={onboardingBusy || !selectedCategory} className="button button--primary">
              {onboardingBusy ? 'Loading…' : 'Continue'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  // PAGE 2: Questionnaire section rendered from the selected server template.
  const renderPage2OnboardingSection1 = () => {
    if (onboardingLoading) return <p>Loading onboarding…</p>;
    if (!currentSection) return <p role="alert">Select an onboarding category to load its questions.</p>;
    const sections = onboardingTemplate.sections ?? [];
    const isLastSection = currentSectionIndex >= sections.length - 1;

    return (
      <div style={{ maxWidth: 960 }}>
        <div className="portal-page-header">
          <h1>Onboarding Form</h1>
          <div className="portal-breadcrumb">Orvia / Onboarding</div>
        </div>
        {onboardingError && <p role="alert" className="modal-error">{onboardingError}</p>}
        <div style={{ background: '#DBEBFC', borderRadius: 18, padding: '22px 28px', margin: '20px 0', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <strong style={{ fontSize: 18, color: '#111111' }}>{currentSection.title}</strong>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Section {currentSectionIndex + 1} of {sections.length}</span>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 20, padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {(currentSection.questions ?? []).map((question) => {
              const value = answers[question.code];
              const inputStyle = { width: '100%', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFFFF' };
              return (
                <div key={question.code}>
                  <label htmlFor={`onboarding-${question.code}`} style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{question.label}</label>
                  {question.required && <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 6 }}>* Required</span>}
                  {question.type === 'textarea' ? (
                    <textarea id={`onboarding-${question.code}`} className="form-textarea" rows={3} value={typeof value === 'string' ? value : ''} onChange={(event) => handleFieldChange(question.code, event.target.value)} style={inputStyle} />
                  ) : question.type === 'single_select' ? (
                    <select id={`onboarding-${question.code}`} className="form-select" value={typeof value === 'string' ? value : ''} onChange={(event) => handleFieldChange(question.code, event.target.value)} style={inputStyle}>
                      <option value="">Select an option</option>
                      {(question.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : question.type === 'multi_select' ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {(question.options ?? []).map((option) => {
                        const selected = Array.isArray(value) && value.includes(option);
                        return <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={selected} onChange={(event) => handleFieldChange(question.code, event.target.checked ? [...(Array.isArray(value) ? value : []), option] : (Array.isArray(value) ? value.filter((item) => item !== option) : []))} />{option}</label>;
                      })}
                    </div>
                  ) : question.type === 'boolean' ? (
                    <select id={`onboarding-${question.code}`} className="form-select" value={typeof value === 'boolean' ? String(value) : ''} onChange={(event) => handleFieldChange(question.code, event.target.value === '' ? undefined : event.target.value === 'true')} style={inputStyle}>
                      <option value="">Select an option</option><option value="true">Yes</option><option value="false">No</option>
                    </select>
                  ) : (
                    <input id={`onboarding-${question.code}`} type="text" className="form-input" value={typeof value === 'string' ? value : ''} onChange={(event) => handleFieldChange(question.code, event.target.value)} style={{ ...inputStyle, height: 46 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button type="button" onClick={() => setOnboardingStep('sections')} className="button">Back to sections</button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={handleSaveDraft} disabled={onboardingBusy} className="button">{onboardingBusy ? 'Saving…' : 'Save Draft'}</button>
            <button type="button" onClick={handleNextSection} disabled={onboardingBusy} className="button button--primary">{onboardingBusy ? 'Submitting…' : isLastSection ? 'Submit' : 'Continue'}</button>
          </div>
        </div>
      </div>
    );
  };

  // PAGE 3: Sections from the selected server template.
  const renderPage3Sections = () => (
    <div style={{ maxWidth: 900 }}>
      <div className="portal-page-header">
        <h1>Onboarding Sections</h1>
        <div className="portal-breadcrumb">Orvia / Onboarding</div>
      </div>
      {onboardingError && <p role="alert" className="modal-error">{onboardingError}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        {(onboardingTemplate?.sections ?? []).map((section, index) => {
          const isDone = (section.questions ?? []).every((question) => answers[question.code] !== undefined && answers[question.code] !== '');
          return (
            <button key={section.code} type="button" onClick={() => { setCurrentSectionIndex(index); setOnboardingStep('form'); }} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <strong style={{ fontSize: 14, color: '#111111' }}>{section.title}</strong>
              <span style={{ fontSize: 12, color: isDone ? '#15803D' : '#6B7280' }}>{isDone ? 'Done' : 'Not started'}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <button type="button" onClick={handleSaveDraft} disabled={onboardingBusy} className="button">{onboardingBusy ? 'Saving…' : 'Save Draft'}</button>
        <button type="button" onClick={() => { setCurrentSectionIndex(0); setOnboardingStep('form'); }} disabled={!onboardingTemplate?.sections?.length} className="button button--primary">Continue questionnaire</button>
      </div>
    </div>
  );
  // PAGE 10: Confirmation
  const renderPage10Confirmation = () => (
    <div style={{ maxWidth: 900 }}>
      <div className="portal-page-header">
        <h1>Confirmation</h1>
        <div className="portal-breadcrumb">Orvia / Onboarding</div>
      </div>

      <div style={{ background: '#DBEBFC', borderRadius: 20, padding: '36px 44px', maxWidth: 620, marginTop: 32 }}>
        <strong style={{ fontSize: 20, fontWeight: 800, color: '#111111', display: 'block', marginBottom: 8 }}>
          Onboarding submitted
        </strong>
        <p style={{ margin: 0, fontSize: 14, color: '#4B5563', lineHeight: 1.6 }}>
          Your answers were sent successfully. Edits now require an approved request.
        </p>
      </div>
    </div>
  );

  // PAGE 11: Brief Details
  const renderPage11BriefDetails = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Brief Details</h1>
        <div className="portal-breadcrumb">Orvia / Brief</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28, marginTop: 12 }}>
        {/* Left Light Blue Card */}
        <div style={{ background: '#DBEBFC', borderRadius: 20, padding: '28px', color: '#111111' }}>
          <strong style={{ fontSize: 22, fontWeight: 800, display: 'block', marginBottom: 6 }}>
            {brandName}
          </strong>
          <span style={{ fontSize: 13, color: '#4B5563', display: 'block', marginBottom: 18 }}>
            Brand Type: {mainCategory} / {activityType}
          </span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
              Version 1
            </span>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
              Generated
            </span>
          </div>
          <small style={{ color: '#4B5563', fontSize: 12 }}>Generated on 12 Nov 2026</small>
        </div>

        {/* Right Light Purple Card */}
        <div style={{ background: '#EAE7FC', borderRadius: 20, padding: '28px' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
              Generated by AI
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              '1 · Brand Overview',
              '2 · Target Audience',
              '3 · Brand Personality',
              '4 · Products & Services',
              '5 · Competitors',
              '6 · Goals',
              '7 · Content Direction',
            ].map((item) => (
              <div
                key={item}
                style={{ background: '#FFFFFF', borderRadius: 12, padding: '11px 18px', fontSize: 13, fontWeight: 600, color: '#111111' }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => setBriefViewMode('answers')}
          style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '11px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Original Client Answers
        </button>
      </div>
    </div>
  );

  // PAGE 12: Client Answers
  const renderPage12ClientAnswers = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Client Answers</h1>
        <div className="portal-breadcrumb">Orvia / Brief</div>
      </div>

      <div style={{ marginBottom: 18, marginTop: 12 }}>
        <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
          Provided by client
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#FDE2D8', borderRadius: 18, padding: '20px 24px' }}>
          <small style={{ display: 'block', fontSize: 12, color: '#555555', marginBottom: 4 }}>What is your brand name?</small>
          <strong style={{ fontSize: 16, fontWeight: 800, color: '#111111' }}>{brandName}</strong>
        </div>

        <div style={{ background: '#FDE2D8', borderRadius: 18, padding: '20px 24px' }}>
          <small style={{ display: 'block', fontSize: 12, color: '#555555', marginBottom: 4 }}>Who is your target audience?</small>
          <strong style={{ fontSize: 16, fontWeight: 800, color: '#111111' }}>Students and remote workers, 18–35</strong>
        </div>

        <div style={{ background: '#FDE2D8', borderRadius: 18, padding: '20px 24px', gridColumn: 'span 2' }}>
          <small style={{ display: 'block', fontSize: 12, color: '#555555', marginBottom: 4 }}>Describe your brand personality</small>
          <strong style={{ fontSize: 16, fontWeight: 800, color: '#111111' }}>Warm, friendly, creative</strong>
        </div>
      </div>

      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 18, padding: '16px 20px', marginBottom: 24, maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#166534', fontWeight: 700, fontSize: 13.5 }}>
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: '#16A34A', strokeWidth: 2.5, fill: 'none' }}>
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {lang === 'ar'
            ? 'تم استلام وتوثيق إجاباتكم بنجاح.'
            : 'Answers submitted and documented successfully.'}
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#15803D', lineHeight: 1.5 }}>
          {lang === 'ar'
            ? 'سيقوم مدير الحسابات بمراجعة هذه الإجابات وتوليد ملخص البراند (Brand Brief) بالذكاء الاصطناعي لفريق صُنّاع المحتوى.'
            : 'Your Account Manager will review these answers and generate the AI Brand Brief for the creative team.'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          type="button"
          onClick={() => setBriefViewMode('summary')}
          style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          {lang === 'ar' ? 'العودة للملخص الإبداعي' : 'Back to Brief'}
        </button>
      </div>
    </div>
  );

  // PAGE 13: Strategy Details
  const renderPage13StrategyDetails = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Strategy Details</h1>
        <div className="portal-breadcrumb">Orvia / Strategy</div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 32, marginTop: 12 }}>
        <div style={{ background: '#EAE7FC', borderRadius: 20, padding: '24px 30px', flex: 1, maxWidth: 540 }}>
          {[
            { label: 'Brand Name', value: brandName },
            { label: 'Associated Brief', value: 'Brief v1' },
            { label: 'Strategy File', value: 'BeanCo-Strategy.pdf', isBold: true },
            { label: 'Upload Date', value: '14 Nov 2026' },
            { label: 'Version', value: '2' },
            { label: 'Status', value: 'Requested Changes', isBadge: true },
          ].map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <span style={{ fontSize: 13, color: '#4B5563' }}>{row.label}</span>
              {row.isBadge ? (
                <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
                  {row.value}
                </span>
              ) : (
                <strong style={{ fontSize: 13, color: '#111111', fontWeight: row.isBold ? 800 : 600 }}>{row.value}</strong>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setStrategySubScreen('approval')}
            style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            View
          </button>
          <button
            type="button"
            onClick={() => showToast(t('Downloading strategy document…'), 'info')}
            style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Download
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setStrategySubScreen('internal_review')}
            style={{ background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Switch to Internal Review View
          </button>
          <button
            type="button"
            onClick={() => setStrategySubScreen('approval')}
            style={{ background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Switch to Client Approval View
          </button>
        </div>

        <button
          type="button"
          onClick={() => showToast(t('Upload new strategy version dialog'), 'info')}
          style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Upload New Version
        </button>
      </div>
    </div>
  );

  // PAGE 14: Internal Review
  const renderPage14InternalReview = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Internal Review</h1>
        <div className="portal-breadcrumb">Orvia / Strategy</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, marginTop: 12 }}>
        {/* Left Light Blue Card */}
        <div style={{ background: '#DBEBFC', borderRadius: 20, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#4B5563' }}>Strategy File</span>
            <strong style={{ fontSize: 14, fontWeight: 800 }}>BeanCo-Strategy.pdf</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#4B5563' }}>Status</span>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
              Pending Internal Review
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => showToast(t('Previewing strategy…'), 'info')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => showToast(t('Downloading strategy…'), 'info')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Download
            </button>
          </div>
        </div>

        {/* Right Comments Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 20, padding: '24px' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#111111' }}>
            Comments for the Creator
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            defaultValue="Please add a content calendar outline."
            style={{ width: '100%', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFFFF', fontSize: 13 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setStrategySubScreen('details')}
          style={{ background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          ← Back to Strategy Details
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => showToast(t('Returned to Creator with feedback.'), 'info')}
            style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Return to Creator
          </button>
          <button
            type="button"
            onClick={() => {
              setStrategySubScreen('approval');
              showToast(t('Internal review approved. Sent for client approval.'), 'success');
            }}
            style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 26px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );

  // PAGE 15: Strategy Approval (Client Review)
  const renderPage15StrategyApproval = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Strategy Approval</h1>
        <div className="portal-breadcrumb">Orvia / Strategy</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, marginTop: 12 }}>
        {/* Left Light Peach Card */}
        <div style={{ background: '#FDE2D8', borderRadius: 20, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#4B5563' }}>Strategy File</span>
            <strong style={{ fontSize: 14, fontWeight: 800 }}>BeanCo-Strategy.pdf</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#4B5563' }}>Status</span>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
              Pending Client Approval
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => showToast(t('Viewing strategy…'), 'info')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              View Strategy
            </button>
            <button
              type="button"
              onClick={() => showToast(t('Downloading strategy…'), 'info')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Download Strategy
            </button>
          </div>
        </div>

        {/* Right Reason for Changes Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 20, padding: '24px' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2, color: '#111111' }}>
            Reason for changes
          </label>
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 8 }}>* Required</span>
          <textarea
            className="form-textarea"
            rows={4}
            value={strategyComment}
            onChange={(e) => setStrategyComment(e.target.value)}
            placeholder="Please focus more on Instagram Reels."
            style={{ width: '100%', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFFFF', fontSize: 13 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setStrategySubScreen('details')}
          style={{ background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          ← Back to Strategy Details
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={handleRequestStrategyChanges}
            style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Request Changes
          </button>
          <button
            type="button"
            onClick={handleApproveStrategy}
            style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 26px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );

  const renderClientBrandRequestState = () => {
    if (brandRequestStatus === 'loading') return <p>Loading your brand…</p>;
    if (brandRequestStatus === 'error') {
      return (
        <div role="alert" style={{ marginTop: 20 }}>
          <p>{brandRequestError}</p>
          <button type="button" onClick={() => setBrandRequestAttempt((attempt) => attempt + 1)}>Retry</button>
        </div>
      );
    }
    if (brandRequestStatus === 'empty') {
      return <p role="status">No brand is linked to your account yet. Please contact your account manager.</p>;
    }
    return null;
  };

  // PAGE 17: Brands List (scoped to the brand returned for the logged-in Client)
  const renderPage17Brands = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>{lang === 'ar' ? 'العلامة التجارية الخاصة بي' : 'My Brand'}</h1>
        <div className="portal-breadcrumb">Orvia / Brands</div>
      </div>
      {brandRequestStatus !== 'loaded' ? renderClientBrandRequestState() : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 24 }}>
          <div style={{ background: '#DBEBFC', borderRadius: 20, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, border: '1.5px solid #BFDBFE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>{brandName}</strong>
              <span style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                {lang === 'ar' ? 'حسابك النشط' : 'Your Account'}
              </span>
            </div>
            {clientBrand.industry && <span style={{ fontSize: 12.5, color: '#4B5563' }}>{clientBrand.industry}</span>}
            <button type="button" onClick={() => setBrandSubScreen('platforms')} style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 'auto', width: '100%' }}>
              {lang === 'ar' ? 'عرض تفاصيل البراند والمنصات' : 'View Brand & Platforms'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // PAGE 18: Platform Accounts for the linked Brand
  const renderPage18PlatformAccounts = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Platform Accounts</h1>
        <div className="portal-breadcrumb">Orvia / Brands</div>
      </div>
      {brandRequestStatus !== 'loaded' ? renderClientBrandRequestState() : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 12 }}>
          <div style={{ background: '#EAE7FC', borderRadius: 20, padding: '28px' }}>
            <small style={{ display: 'block', fontSize: 12, color: '#555555', marginBottom: 4 }}>Brand Information</small>
            <strong style={{ fontSize: 20, fontWeight: 800, color: '#111111', display: 'block', marginBottom: 4 }}>{brandName}</strong>
            {clientBrand.industry && <span style={{ fontSize: 13, color: '#4B5563' }}>{clientBrand.industry}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {platformAccounts.length === 0 ? <p>No platform accounts are linked to this brand.</p> : platformAccounts.map((account) => (
              <div key={account.id} style={{ background: '#DBEBFC', borderRadius: 20, padding: '20px 24px' }}>
                <strong style={{ fontSize: 16, fontWeight: 800, color: '#111111' }}>{account.platform}</strong>
                {(account.accountName || account.accountUrl) && (
                  <div style={{ marginTop: 6, fontSize: 13, color: '#4B5563' }}>{account.accountName || account.accountUrl}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <button type="button" onClick={() => setBrandSubScreen('list')} style={{ background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          ← Back to Brands
        </button>
      </div>
    </div>
  );
  // PAGE 19: Content Plans List
  const renderPage19ContentPlans = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Content Plans</h1>
        <div className="portal-breadcrumb">Orvia / Content Plans</div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, marginTop: 12, flexWrap: 'wrap' }}>
        <input
          type="search"
          className="form-input"
          placeholder="Search"
          style={{ flex: 1, minWidth: 200, height: 44, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
        />
        <select className="form-select" style={{ minWidth: 120, height: 44, borderRadius: 14, border: '1px solid #E5E7EB', background: '#FFFFFF', padding: '0 12px' }}>
          <option>Status</option>
          <option>DRAFT</option>
          <option>APPROVED</option>
        </select>
        <select className="form-select" style={{ minWidth: 120, height: 44, borderRadius: 14, border: '1px solid #E5E7EB', background: '#FFFFFF', padding: '0 12px' }}>
          <option>Month</option>
          <option>December</option>
          <option>November</option>
        </select>
        <select className="form-select" style={{ minWidth: 120, height: 44, borderRadius: 14, border: '1px solid #E5E7EB', background: '#FFFFFF', padding: '0 12px' }}>
          <option>Year</option>
          <option>2026</option>
          <option>2025</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 32 }}>
        {/* Winter Launch Card (Light Purple) */}
        <div style={{ background: '#EAE7FC', borderRadius: 20, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>Winter Launch</strong>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
              DRAFT
            </span>
          </div>
          <small style={{ color: '#4B5563', display: 'block', marginBottom: 20, fontSize: 12 }}>December 2026</small>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setContentPlanSubScreen('monthly')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'عرض تفاصيل الخطة' : 'View Plan'}
            </button>
          </div>
        </div>

        {/* Autumn Offers Card (Light Blue) */}
        <div style={{ background: '#DBEBFC', borderRadius: 20, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>Autumn Offers</strong>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
              APPROVED
            </span>
          </div>
          <small style={{ color: '#4B5563', display: 'block', marginBottom: 20, fontSize: 12 }}>November 2026</small>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setContentPlanSubScreen('monthly')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'عرض تفاصيل الخطة' : 'View Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // PAGE 20: Create Plan Form
  const renderPage20CreatePlan = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Create Plan</h1>
        <div className="portal-breadcrumb">Orvia / Content Plans</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16, marginTop: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Title</label>
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 6 }}>*</span>
          <input
            type="text"
            className="form-input"
            value={planForm.title}
            onChange={(e) => setPlanForm((prev) => ({ ...prev, title: e.target.value }))}
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Month</label>
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 6 }}>*</span>
          <input
            type="text"
            className="form-input"
            value={planForm.month}
            onChange={(e) => setPlanForm((prev) => ({ ...prev, month: e.target.value }))}
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1.5px solid #DC2626', padding: '0 16px', background: '#FFFFFF' }}
          />
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginTop: 4 }}>Month must be between 1 and 12</span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Year</label>
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 6 }}>*</span>
          <input
            type="text"
            className="form-input"
            value={planForm.year}
            onChange={(e) => setPlanForm((prev) => ({ ...prev, year: e.target.value }))}
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Monthly Goals</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={planForm.goals}
          onChange={(e) => setPlanForm((prev) => ({ ...prev, goals: e.target.value }))}
          style={{ width: '100%', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFFFF' }}
        />
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Notes</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={planForm.notes}
          onChange={(e) => setPlanForm((prev) => ({ ...prev, notes: e.target.value }))}
          style={{ width: '100%', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFFFF' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          type="button"
          onClick={() => setContentPlanSubScreen('list')}
          style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setContentPlanSubScreen('list');
            showToast(t('Plan saved successfully.'), 'success');
          }}
          style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Save
        </button>
      </div>
    </div>
  );

  // PAGE 21: Delete Plan Confirmation
  const renderPage21DeletePlan = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Delete Plan</h1>
        <div className="portal-breadcrumb">Orvia / Content Plans</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
        <div style={{ background: '#EAE7FC', borderRadius: 20, padding: '28px' }}>
          <strong style={{ fontSize: 18, fontWeight: 800, color: '#111111', display: 'block', marginBottom: 6 }}>
            Winter Launch
          </strong>
          <small style={{ color: '#4B5563', fontSize: 13 }}>December 2026</small>
        </div>

        <div style={{ background: '#FDE2D8', borderRadius: 20, padding: '28px' }}>
          <strong style={{ fontSize: 18, fontWeight: 800, color: '#111111', display: 'block', marginBottom: 8 }}>
            Delete Content Plan
          </strong>
          <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
            This Content Plan has related Campaigns and Content Items. Deleting it may affect related data. Do you want to continue?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setContentPlanSubScreen('list')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 10, padding: '8px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setContentPlanSubScreen('list');
                showToast(t('Plan deleted.'), 'success');
              }}
              style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '8px 22px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // PAGE 22: Monthly Plan
  const renderPage22MonthlyPlan = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Monthly Plan</h1>
        <div className="portal-breadcrumb">Orvia / Content Plans</div>
        <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>
          Bean & Co Cafe / Instagram / 2026 / December
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, marginTop: 16 }}>
        {/* Left Side: Plan & Campaigns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#DBEBFC', borderRadius: 20, padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <strong style={{ fontSize: 18, fontWeight: 800 }}>Winter Launch</strong>
              <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 11, fontWeight: 800 }}>
                DRAFT
              </span>
            </div>
            <small style={{ color: '#4B5563', fontSize: 13 }}>Goal: grow followers by 15%.</small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <strong style={{ fontSize: 16, fontWeight: 800 }}>Campaigns</strong>
            <button
              type="button"
              onClick={() => setContentPlanSubScreen('campaign')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Create Campaign
            </button>
          </div>

          <div
            onClick={() => setContentPlanSubScreen('campaign')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && setContentPlanSubScreen('campaign')}
            style={{ background: '#EAE7FC', borderRadius: 20, padding: '22px 26px', cursor: 'pointer' }}
          >
            <strong style={{ fontSize: 16, fontWeight: 800, display: 'block', marginBottom: 4 }}>
              Hot Drinks Week
            </strong>
            <small style={{ color: '#4B5563', fontSize: 12 }}>Boost winter drink sales · 1 Dec - 7 Dec</small>
          </div>
        </div>

        {/* Right Side: Unassigned Content Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '2px dashed #D1D5DB', borderRadius: 20, padding: '24px' }}>
            <strong style={{ fontSize: 15, fontWeight: 800, display: 'block', marginBottom: 14 }}>
              Unassigned Content Items
            </strong>
            <div
              onClick={() => setContentPlanSubScreen('item')}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === 'Enter' && setContentPlanSubScreen('item')}
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <strong style={{ fontSize: 13, fontWeight: 700 }}>Behind the bar</strong>
              <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '3px 12px', fontSize: 10, fontWeight: 800 }}>
                REEL
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setContentPlanSubScreen('list')}
          style={{ background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          ← Back to Content Plans
        </button>

        <button
          type="button"
          onClick={() => setContentPlanSubScreen('item')}
          style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Create Content Item
        </button>
      </div>
    </div>
  );

  // PAGE 23: Campaign Details
  const renderPage23CampaignDetails = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Campaign Details</h1>
        <div className="portal-breadcrumb">Orvia / Content Plans</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, marginTop: 16 }}>
        {/* Left Campaign Card */}
        <div style={{ background: '#EAE7FC', borderRadius: 20, padding: '26px 28px' }}>
          <strong style={{ fontSize: 18, fontWeight: 800, display: 'block', marginBottom: 4 }}>
            Hot Drinks Week
          </strong>
          <span style={{ fontSize: 13, color: '#4B5563', display: 'block', marginBottom: 4 }}>
            Objective: Boost winter drink sales
          </span>
          <small style={{ color: '#4B5563', display: 'block', marginBottom: 20, fontSize: 12 }}>
            Start 1 Dec 2026 · End 7 Dec 2026
          </small>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => showToast(t('Editing campaign…'), 'info')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Edit Campaign
            </button>
            <button
              type="button"
              onClick={() => showToast(t('Deleting campaign…'), 'info')}
              style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Delete Campaign
            </button>
          </div>
        </div>

        {/* Right Content Items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            onClick={() => setContentPlanSubScreen('item')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && setContentPlanSubScreen('item')}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <strong style={{ fontSize: 14, fontWeight: 700 }}>Latte art tips</strong>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 10, fontWeight: 800 }}>
              POST
            </span>
          </div>

          <div
            onClick={() => setContentPlanSubScreen('item')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && setContentPlanSubScreen('item')}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <strong style={{ fontSize: 14, fontWeight: 700 }}>Winter menu reveal</strong>
            <span style={{ background: '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '4px 14px', fontSize: 10, fontWeight: 800 }}>
              STORY
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setContentPlanSubScreen('monthly')}
          style={{ background: '#FFFFFF', color: '#111111', border: '1px solid #D1D5DB', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          ← Back to Monthly Plan
        </button>

        <button
          type="button"
          onClick={() => setContentPlanSubScreen('item')}
          style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Create Content Item
        </button>
      </div>
    </div>
  );

  // PAGE 24: Content Item Editor
  const renderPage24ContentItem = () => (
    <div style={{ maxWidth: 960 }}>
      <div className="portal-page-header">
        <h1>Content Item</h1>
        <div className="portal-breadcrumb">Orvia / Content Plans</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16, marginTop: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Title</label>
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 6 }}>*</span>
          <input
            type="text"
            className="form-input"
            value={itemForm.title}
            onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Type</label>
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 6 }}>*</span>
          <span className="form-select-wrap" style={{ width: '100%' }}>
            <select
              className="form-select"
              value={itemForm.type}
              onChange={(e) => setItemForm((prev) => ({ ...prev, type: e.target.value }))}
              style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
            >
              <option value="POST">POST</option>
              <option value="REEL">REEL</option>
              <option value="STORY">STORY</option>
            </select>
          </span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Scheduled Date</label>
          <span style={{ display: 'block', color: '#DC2626', fontSize: 12, marginBottom: 6 }}>*</span>
          <input
            type="date"
            className="form-input"
            value={itemForm.scheduledDate}
            onChange={(e) => setItemForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Reference</label>
          <input
            type="text"
            className="form-input"
            value={itemForm.reference}
            onChange={(e) => setItemForm((prev) => ({ ...prev, reference: e.target.value }))}
            placeholder="Winter menu shoot"
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Tone of Voice</label>
          <input
            type="text"
            className="form-input"
            value={itemForm.toneOfVoice}
            onChange={(e) => setItemForm((prev) => ({ ...prev, toneOfVoice: e.target.value }))}
            placeholder="Warm and playful"
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Caption</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={itemForm.caption}
          onChange={(e) => setItemForm((prev) => ({ ...prev, caption: e.target.value }))}
          style={{ width: '100%', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFFFF' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Notes</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={itemForm.notes}
          onChange={(e) => setItemForm((prev) => ({ ...prev, notes: e.target.value }))}
          style={{ width: '100%', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 16px', background: '#FFFFFF' }}
        />
      </div>

      <div style={{ marginBottom: 28, maxWidth: 360 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Campaign (Optional)</label>
        <span className="form-select-wrap" style={{ width: '100%' }}>
          <select
            className="form-select"
            value={itemForm.campaign}
            onChange={(e) => setItemForm((prev) => ({ ...prev, campaign: e.target.value }))}
            style={{ width: '100%', height: 46, borderRadius: 14, border: '1px solid #E5E7EB', padding: '0 16px', background: '#FFFFFF' }}
          >
            <option value="Hot Drinks Week">Hot Drinks Week</option>
            <option value="Launch Week">Launch Week</option>
          </select>
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          type="button"
          onClick={() => setContentPlanSubScreen('campaign')}
          style={{ background: '#FFFFFF', color: '#111111', border: '1.5px solid #111111', borderRadius: 12, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setContentPlanSubScreen('campaign');
            showToast(t('Content item saved.'), 'success');
          }}
          style={{ background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Save
        </button>
      </div>
    </div>
  );

  // Full Interactive Notifications Hub for Client
  const renderNotificationsScreen = () => {
    const filteredNotifs = clientNotifications.filter((n) => {
      if (notifFilter === 'unread' && !n.unread) return false;
      if (notifFilter !== 'all' && notifFilter !== 'unread' && n.category !== notifFilter) return false;
      if (notifSearch.trim()) {
        const q = notifSearch.toLowerCase();
        const title = (lang === 'ar' ? n.titleAr || n.title : n.title).toLowerCase();
        const msg = (lang === 'ar' ? n.messageAr || n.message : n.message).toLowerCase();
        if (!title.includes(q) && !msg.includes(q)) return false;
      }
      return true;
    });

    return (
      <div className="portal-content-inner" style={{ maxWidth: 940, margin: '0 auto', width: '100%' }}>
        <div className="portal-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="portal-breadcrumb">Orvia / {lang === 'ar' ? 'مركز الإشعارات' : 'Notifications Hub'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ margin: 0 }}>{lang === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications & Updates'}</h1>
              {unreadNotifCount > 0 && (
                <span
                  style={{
                    background: '#6C5CE7',
                    color: '#FFFFFF',
                    borderRadius: 9999,
                    padding: '3px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {unreadNotifCount} {lang === 'ar' ? 'غير مقروء' : 'Unread'}
                </span>
              )}
            </div>
            <p style={{ margin: '6px 0 0 0', color: '#6B7280', fontSize: 13.5 }}>
              {lang === 'ar' ? 'تتبع تحديثات الاستراتيجيات، تقاويم المحتوى، والمهام المعلقة في مكان واحد منظم' : 'Review live approvals, creative briefs, content calendars, and onboarding updates'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadNotifCount === 0}
              style={{
                background: unreadNotifCount > 0 ? '#FFFFFF' : '#F3F4F6',
                color: unreadNotifCount > 0 ? '#111111' : '#9CA3AF',
                border: '1.5px solid #111111',
                borderColor: unreadNotifCount > 0 ? '#111111' : '#D1D5DB',
                borderRadius: 12,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: unreadNotifCount > 0 ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All as Read'}</span>
            </button>

            {clientNotifications.some((n) => !n.unread) && (
              <button
                type="button"
                onClick={handleClearReadNotifications}
                style={{
                  background: 'transparent',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  padding: '9px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {lang === 'ar' ? 'مسح المقروء' : 'Clear Read'}
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid #E5E7EB',
            padding: '12px 18px',
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Categories Pill Switcher */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All', labelAr: 'الكل', count: clientNotifications.length },
              { id: 'unread', label: 'Unread', labelAr: 'غير مقروء', count: unreadNotifCount },
              { id: 'strategy', label: 'Strategy & Briefs', labelAr: 'الاستراتيجية', count: clientNotifications.filter((n) => n.category === 'strategy' || n.category === 'brief').length },
              { id: 'content_plans', label: 'Content Plans', labelAr: 'خطط المحتوى', count: clientNotifications.filter((n) => n.category === 'content_plans').length },
              { id: 'onboarding', label: 'Onboarding', labelAr: 'الإعداد', count: clientNotifications.filter((n) => n.category === 'onboarding' || n.category === 'brands').length },
            ].map((cat) => {
              const isActive = notifFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNotifFilter(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 9999,
                    border: 'none',
                    background: isActive ? '#111111' : '#F3F4F6',
                    color: isActive ? '#FFFFFF' : '#4B5563',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{lang === 'ar' ? cat.labelAr : cat.label}</span>
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                      color: 'inherit',
                      padding: '1px 6px',
                      borderRadius: 999,
                      fontSize: 11,
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ minWidth: 220, position: 'relative' }}>
            <input
              type="search"
              placeholder={lang === 'ar' ? 'بحث في الإشعارات...' : 'Search notifications...'}
              value={notifSearch}
              onChange={(e) => setNotifSearch(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                padding: '0 14px',
                fontSize: 13,
                background: '#F9FAFB',
                color: '#111111',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifs.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px dashed #D1D5DB',
              padding: '60px 24px',
              textAlign: 'center',
              color: '#6B7280',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#F3F4F6',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111111', margin: '0 0 6px 0' }}>
              {lang === 'ar' ? 'لا توجد إشعارات تطابق هذا الفلتر' : 'No notifications found'}
            </h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              {lang === 'ar' ? 'كل إشعاراتك وتنبيهاتك ستظهر هنا فور تحديثها' : 'When new updates arrive, they will appear organized here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredNotifs.map((notif) => {
              const isUnread = notif.unread;
              const catColor =
                notif.category === 'strategy' || notif.category === 'brief'
                  ? { bg: '#EAE7FC', text: '#6C5CE7', border: '#D5CFF7' }
                  : notif.category === 'content_plans'
                  ? { bg: '#FDE2D8', text: '#D9531F', border: '#F8BBA6' }
                  : { bg: '#DBEBFC', text: '#2563EB', border: '#B8D7FA' };

              return (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    background: isUnread ? '#FFFFFF' : '#FAF9F6',
                    borderRadius: 18,
                    border: isUnread ? '1.5px solid #6C5CE7' : '1px solid #E5E7EB',
                    padding: '20px 24px',
                    boxShadow: isUnread ? '0 4px 16px rgba(108, 92, 231, 0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
                    {/* Unread indicator dot */}
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: isUnread ? '#6C5CE7' : '#D1D5DB',
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: catColor.bg,
                            color: catColor.text,
                            borderRadius: 9999,
                            padding: '2px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {notif.category === 'strategy' ? 'Strategy' : notif.category === 'content_plans' ? 'Content Plan' : notif.category === 'brief' ? 'AI Brief' : 'System'}
                        </span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>•</span>
                        <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                          {lang === 'ar' ? notif.timeAr || notif.time : notif.time}
                        </span>
                      </div>

                      <strong style={{ fontSize: 15, fontWeight: 700, color: '#111111', display: 'block', marginBottom: 4 }}>
                        {lang === 'ar' ? notif.titleAr || notif.title : notif.title}
                      </strong>

                      <p style={{ margin: 0, fontSize: 13.5, color: '#4B5563', lineHeight: 1.5 }}>
                        {lang === 'ar' ? notif.messageAr || notif.message : notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions on right */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 4 }}>
                    {notif.actionNav && (
                      <button
                        type="button"
                        onClick={() => handleNavigateFromNotif(notif)}
                        style={{
                          background: '#111111',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 10,
                          padding: '7px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>{lang === 'ar' ? 'فتح' : 'Open'}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleRead(notif.id)}
                      title={isUnread ? (lang === 'ar' ? 'تحديد كمقروء' : 'Mark as read') : (lang === 'ar' ? 'تحديد كغير مقروء' : 'Mark as unread')}
                      style={{
                        background: '#FFFFFF',
                        color: '#4B5563',
                        border: '1px solid #E5E7EB',
                        borderRadius: 10,
                        padding: '7px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isUnread ? (lang === 'ar' ? 'قراءة' : 'Mark Read') : (lang === 'ar' ? 'غير مقروء' : 'Unread')}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotif(notif.id)}
                      title={lang === 'ar' ? 'حذف الإشعار' : 'Delete notification'}
                      style={{
                        background: '#FFF5F5',
                        color: '#EF4444',
                        border: '1px solid #FEE2E2',
                        borderRadius: 10,
                        padding: '7px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="portal-layout" style={{ position: 'relative' }}>
      {/* Top Header Controls: Language Toggle, Theme Toggle (Light/Dark), Notifications Bell */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: lang === 'ar' ? 'auto' : 36,
          left: lang === 'ar' ? 36 : 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 60,
        }}
      >
        <button
          type="button"
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          style={{
            height: 42,
            padding: '0 14px',
            borderRadius: 21,
            background: isDark ? '#141824' : '#FFFFFF',
            border: isDark ? '1px solid #242c42' : '1px solid #E5E7EB',
            color: isDark ? '#f8fafc' : '#111111',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
        >
          <span>🌐</span>
          <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          title={theme === 'dark' ? t('Switch to Light Mode') : t('Switch to Dark Mode')}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: isDark ? '#141824' : '#FFFFFF',
            border: isDark ? '1px solid #242c42' : '1px solid #E5E7EB',
            color: isDark ? '#f8fafc' : '#111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: 0,
          }}
        >
          <svg className="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
          </svg>
          <svg className="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
          style={{
            position: 'relative',
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: isDark ? '#141824' : '#FFFFFF',
            border: isDark ? '1px solid #242c42' : '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={isDark ? '#F8FAFC' : '#111111'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadNotifCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                background: '#6C5CE7',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 800,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* Page 16: Notifications Dropdown */}
      {notifDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: 76,
            right: lang === 'ar' ? 'auto' : 36,
            left: lang === 'ar' ? 36 : 'auto',
            width: 380,
            background: isDark ? '#131722' : '#FFFFFF',
            borderRadius: 22,
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 12px 36px rgba(0,0,0,0.12)',
            border: isDark ? '1px solid #242c42' : '1px solid #E5E7EB',
            padding: '24px',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <strong style={{ fontSize: 17, fontWeight: 800, color: isDark ? '#F8FAFC' : '#111111' }}>
              {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
            </strong>
            <span style={{ background: isDark ? '#6C5CE7' : '#111111', color: '#FFFFFF', borderRadius: 9999, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>
              {unreadNotifCount} {lang === 'ar' ? 'جديد' : 'Unread'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadNotifCount === 0}
              style={{
                flex: 1,
                fontSize: 12,
                padding: '7px 12px',
                background: isDark ? '#191F2E' : '#FFFFFF',
                border: isDark ? '1px solid #2B354F' : '1.5px solid #111111',
                color: isDark ? '#F8FAFC' : '#111111',
                borderRadius: 10,
                fontWeight: 700,
                cursor: unreadNotifCount > 0 ? 'pointer' : 'default',
                opacity: unreadNotifCount > 0 ? 1 : 0.5,
              }}
            >
              {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All as Read'}
            </button>
            <button
              type="button"
              onClick={() => {
                setNotifDropdownOpen(false);
                setActiveNav('notifications');
              }}
              style={{
                fontSize: 12,
                padding: '7px 12px',
                background: isDark ? '#6C5CE7' : '#111111',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {lang === 'ar' ? 'المركز الكامل' : 'Hub'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
            {clientNotifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                style={{
                  background: notif.unread ? (isDark ? '#231D45' : '#EAE7FC') : (isDark ? '#161B29' : '#FAF9F6'),
                  borderRadius: 14,
                  padding: '14px',
                  border: notif.unread ? (isDark ? '1px solid #4C3D82' : '1px solid #D5CFF7') : (isDark ? '1px solid #242C42' : '1px solid #E5E7EB'),
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: isDark ? '#F8FAFC' : '#111111', lineHeight: 1.35 }}>
                    {lang === 'ar' ? notif.titleAr || notif.title : notif.title}
                  </strong>
                  {notif.unread && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6C5CE7', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
                <small style={{ color: isDark ? '#94A3B8' : '#6B7280', display: 'block', marginBottom: 8, fontSize: 11 }}>
                  {lang === 'ar' ? notif.timeAr || notif.time : notif.time}
                </small>
                <div style={{ display: 'flex', gap: 8 }}>
                  {notif.actionNav && (
                    <button
                      type="button"
                      onClick={() => handleNavigateFromNotif(notif)}
                      style={{
                        background: isDark ? '#6C5CE7' : '#111111',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ar' ? 'فتح' : 'Open'}
                    </button>
                  )}
                  {notif.unread && (
                    <button
                      type="button"
                      onClick={() => handleToggleRead(notif.id, true)}
                      style={{
                        background: isDark ? '#191F2E' : '#FFFFFF',
                        color: isDark ? '#F8FAFC' : '#111111',
                        border: isDark ? '1px solid #2B354F' : '1.5px solid #111111',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ar' ? 'تحديد كمقروء' : 'Mark Read'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setNotifDropdownOpen(false);
              setActiveNav('notifications');
            }}
            style={{
              width: '100%',
              marginTop: 14,
              padding: '8px',
              background: isDark ? '#151927' : '#F8F7F3',
              border: isDark ? '1px solid #242C42' : '1px solid #E8E5DF',
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 700,
              color: isDark ? '#F8FAFC' : '#111111',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {lang === 'ar' ? 'عرض جميع الإشعارات (المركز الكامل) ←' : 'View All Notifications Hub →'}
          </button>
        </div>
      )}

      {/* Sidebar matching PDF (pages 1 to 24) */}
      <aside className="portal-sidebar" style={{ width: 230, padding: '24px 16px', background: isDark ? '#0F121D' : '#F8F7F3', borderRight: isDark ? '1px solid #1E2335' : '1px solid #E8E5DF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, paddingLeft: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isDark ? '#6C5CE7' : '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '3px solid #FFFFFF',
              }}
            />
          </div>
          <strong style={{ fontSize: 20, color: isDark ? '#FFFFFF' : '#111111', fontWeight: 800, letterSpacing: '-0.02em' }}>Orvia</strong>
        </div>

        <nav className="portal-nav" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            className={`portal-nav__item ${activeNav === 'onboarding' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveNav('onboarding');
              setOnboardingStep('category');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              background: activeNav === 'onboarding' ? (isDark ? '#1F253A' : '#EDEAE4') : 'transparent',
              color: activeNav === 'onboarding' ? (isDark ? '#FFFFFF' : '#111111') : (isDark ? '#94A3B8' : '#555555'),
              fontWeight: activeNav === 'onboarding' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeNav === 'onboarding' ? '#6C5CE7' : (isDark ? '#333C53' : '#D1D5DB') }} />
            <span>Onboarding</span>
          </button>

          <button
            type="button"
            className={`portal-nav__item ${activeNav === 'brief' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveNav('brief');
              setBriefViewMode('summary');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              background: activeNav === 'brief' ? (isDark ? '#1F253A' : '#EDEAE4') : 'transparent',
              color: activeNav === 'brief' ? (isDark ? '#FFFFFF' : '#111111') : (isDark ? '#94A3B8' : '#555555'),
              fontWeight: activeNav === 'brief' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeNav === 'brief' ? '#6C5CE7' : (isDark ? '#333C53' : '#D1D5DB') }} />
            <span>Brief</span>
          </button>

          <button
            type="button"
            className={`portal-nav__item ${activeNav === 'strategy' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveNav('strategy');
              setStrategySubScreen('approval');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              background: activeNav === 'strategy' ? (isDark ? '#1F253A' : '#EDEAE4') : 'transparent',
              color: activeNav === 'strategy' ? (isDark ? '#FFFFFF' : '#111111') : (isDark ? '#94A3B8' : '#555555'),
              fontWeight: activeNav === 'strategy' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeNav === 'strategy' ? '#6C5CE7' : (isDark ? '#333C53' : '#D1D5DB') }} />
            <span>Strategy</span>
          </button>

          <button
            type="button"
            className={`portal-nav__item ${activeNav === 'notifications' ? 'is-active' : ''}`}
            onClick={() => setActiveNav('notifications')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              background: activeNav === 'notifications' ? (isDark ? '#1F253A' : '#EDEAE4') : 'transparent',
              color: activeNav === 'notifications' ? (isDark ? '#FFFFFF' : '#111111') : (isDark ? '#94A3B8' : '#555555'),
              fontWeight: activeNav === 'notifications' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeNav === 'notifications' ? '#6C5CE7' : (isDark ? '#333C53' : '#D1D5DB') }} />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            className={`portal-nav__item ${activeNav === 'brands' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveNav('brands');
              setBrandSubScreen('list');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              background: activeNav === 'brands' ? (isDark ? '#1F253A' : '#EDEAE4') : 'transparent',
              color: activeNav === 'brands' ? (isDark ? '#FFFFFF' : '#111111') : (isDark ? '#94A3B8' : '#555555'),
              fontWeight: activeNav === 'brands' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeNav === 'brands' ? '#6C5CE7' : (isDark ? '#333C53' : '#D1D5DB') }} />
            <span>Brands</span>
          </button>

          <button
            type="button"
            className={`portal-nav__item ${activeNav === 'content_plans' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveNav('content_plans');
              setContentPlanSubScreen('list');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              background: activeNav === 'content_plans' ? (isDark ? '#1F253A' : '#EDEAE4') : 'transparent',
              color: activeNav === 'content_plans' ? (isDark ? '#FFFFFF' : '#111111') : (isDark ? '#94A3B8' : '#555555'),
              fontWeight: activeNav === 'content_plans' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeNav === 'content_plans' ? '#6C5CE7' : (isDark ? '#333C53' : '#D1D5DB') }} />
            <span>Content Plans</span>
          </button>
        </nav>

        {/* Footer with sign out */}
        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: isDark ? '1px solid #1E2335' : '1px solid #E8E5DF', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            className="button button--ghost"
            style={{
              width: '100%',
              fontSize: 12,
              background: isDark ? '#141824' : '#FFFFFF',
              border: isDark ? '1px solid #242C42' : '1px solid #D1D5DB',
              color: isDark ? '#F8FAFC' : '#111111',
              borderRadius: 10,
              padding: '8px 12px'
            }}
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          >
            🌐 {lang === 'ar' ? 'English' : 'العربية'}
          </button>

          <button
            type="button"
            className="button button--ghost"
            style={{
              width: '100%',
              fontSize: 12,
              color: isDark ? '#F87171' : '#DC2626',
              borderColor: isDark ? '#5C2222' : '#FCA5A5',
              background: isDark ? '#2D1515' : '#FEF2F2',
              borderRadius: 10,
              padding: '8px 12px',
              fontWeight: 700
            }}
            onClick={handleSignOut}
          >
            {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="portal-content" style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        {activeNav === 'onboarding' && (
          <>
            {onboardingStep === 'category' && renderPage1Category()}
            {onboardingStep === 'form' && renderPage2OnboardingSection1()}
            {onboardingStep === 'sections' && renderPage3Sections()}
            {onboardingStep === 'confirmation' && renderPage10Confirmation()}
          </>
        )}

        {activeNav === 'brief' && (
          <>
            {briefViewMode === 'summary' && renderPage11BriefDetails()}
            {briefViewMode === 'answers' && renderPage12ClientAnswers()}
          </>
        )}

        {activeNav === 'strategy' && (
          <>
            {strategySubScreen === 'details' && renderPage13StrategyDetails()}
            {strategySubScreen === 'internal_review' && renderPage14InternalReview()}
            {strategySubScreen === 'approval' && renderPage15StrategyApproval()}
          </>
        )}

        {activeNav === 'notifications' && renderNotificationsScreen()}

        {activeNav === 'brands' && (
          <>
            {brandSubScreen === 'list' && renderPage17Brands()}
            {brandSubScreen === 'platforms' && renderPage18PlatformAccounts()}
          </>
        )}

        {activeNav === 'content_plans' && (
          <>
            {contentPlanSubScreen === 'list' && renderPage19ContentPlans()}
            {contentPlanSubScreen === 'create' && renderPage20CreatePlan()}
            {contentPlanSubScreen === 'delete' && renderPage21DeletePlan()}
            {contentPlanSubScreen === 'monthly' && renderPage22MonthlyPlan()}
            {contentPlanSubScreen === 'campaign' && renderPage23CampaignDetails()}
            {contentPlanSubScreen === 'item' && renderPage24ContentItem()}
          </>
        )}
      </main>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
