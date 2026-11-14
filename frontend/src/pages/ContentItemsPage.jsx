import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../components/common/Modal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import { useBrands } from '../context/brandsStore';
import { useSprint3 } from '../context/sprint3Store';
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABEL,
  CONTENT_TYPE_LABEL,
  formatDate,
  monthKey,
  monthLabel,
  TOV_OPTIONS,
} from '../data/brands';
import { linesOf } from '../data/sprint3';
import {
  createContentPlanApi,
  deleteContentPlanApi,
  fetchContentItemsApi,
  fetchContentPlansApi,
  fetchPlatformAccountsApi,
  updateContentPlanApi,
  updateContentPlanStatusApi,
} from '../services/contentManagementApi';
import { fetchCampaignsApi } from '../services/sprint3Api';
import {
  EmptyState,
  PageHeader,
  Stat,
  StatusPill,
} from '../components/sprint3/Sprint3UI';

const STATUS_TONE = {
  draft: 'is-gray',
  in_review: 'is-purple',
  needs_changes: 'is-amber',
  approved: 'is-green',
};

const CAMPAIGN_COLORS = ['is-orange', 'is-blue', 'is-purple', 'is-green', 'is-pink'];
const PLAN_STATUS_LABELS = {
  draft: 'Draft',
  in_review: 'In Review',
  needs_changes: 'Needs Changes',
  approved: 'Approved',
};
const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EMPTY_CAMPAIGN = {
  name: '',
  objective: '',
  startDate: '',
  endDate: '',
};

const EMPTY_PLAN = {
  month: monthKey(),
  platformAccountId: '',
  postsTarget: 10,
  reelsTarget: 5,
  monthlyGoals: '',
};

const EMPTY_ITEM = {
  title: '',
  type: 'post',
  publishDate: new Date().toISOString().slice(0, 10),
  publishTime: '12:00',
  tov: 'Warm & empathetic',
  caption: '',
  notes: '',
  referenceUrl: '',
  campaignId: '',
  status: 'planned',
};

const DEFAULT_PLATFORMS = [
  { id: 'Instagram', name: 'Instagram', handle: '@brand_official', status: 'active', icon: '📷' },
  { id: 'Facebook', name: 'Facebook', handle: 'Brand Official Page', status: 'active', icon: '📘' },
  { id: 'LinkedIn', name: 'LinkedIn', handle: 'Brand Company Inc.', status: 'active', icon: '💼' },
  { id: 'X', name: 'X / Twitter', handle: '@brand_hq', status: 'active', icon: '🐦' },
  { id: 'TikTok', name: 'TikTok', handle: '@brand_tok', status: 'active', icon: '🎵' },
];
// Kept for the separate fixture cleanup task; live platform screens do not read it.
void DEFAULT_PLATFORMS;

const PLATFORM_ICONS = {
  instagram: '📷',
  facebook: '📘',
  linkedin: '💼',
  x: '🐦',
  twitter: '🐦',
  tiktok: '🎵',
};

export default function ContentItemsPage({ initialBrandId, onOpenPlan, onAddPlatform }) {
  const { user } = useAuth();
  const { brands, content, updateContent, deleteContent, plans, getPlatforms } = useBrands();
  const {
    getApprovedStrategy,
    getCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    getContentMeta,
    saveContentMeta,
    role,
    t,
  } = useSprint3();
  const { toast, showToast } = useToast(4500);

  const activeBrands = brands.filter((brand) => brand.status !== 'archived');

  // Hierarchy Navigation State:
  // 'brands' -> 'brand_hub' -> 'platforms' OR 'plans' -> 'plan_details' -> 'campaign_details' -> 'item_details'
  const [screen, setScreen] = useState(() => (initialBrandId ? 'brand_hub' : 'brands'));
  const [selectedBrandId, setSelectedBrandId] = useState(initialBrandId || activeBrands[0]?.id || '');

  useEffect(() => {
    if (initialBrandId) {
      setSelectedBrandId(initialBrandId);
      setScreen('brand_hub');
    }
  }, [initialBrandId]);
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
  const [selectedPlatformAccountId, setSelectedPlatformAccountId] = useState(null);
  const [platformScopedPlanRecords, setPlatformScopedPlanRecords] = useState(null);
  const [platformPlansLoading, setPlatformPlansLoading] = useState(false);
  const [platformPlansError, setPlatformPlansError] = useState('');
  const platformPlansRequestRef = useRef(0);
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey());
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

  // Local state for Plans stored in component/store
  const [localPlans, setLocalPlans] = useState(() => plans || []);
  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  // Filter states
  const [brandSearch, setBrandSearch] = useState('');
  const [platformSearch, setPlatformSearch] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState('all');
  const [planYearFilter, setPlanYearFilter] = useState('all');
  const [planMonthFilter, setPlanMonthFilter] = useState('all');
  const [itemsView, setItemsView] = useState('table');

  // Modal states
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deletedPlanIds, setDeletedPlanIds] = useState([]);

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN);
  const [campaignError, setCampaignError] = useState('');
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [itemToDelete, setItemToDelete] = useState(null);

  const roleName = String(user?.role?.name ?? user?.role ?? '')
    .trim()
    .toUpperCase()
    .replace(/[ -]+/g, '_');
  const jobTitle = String(user?.jobTitle?.name ?? user?.jobTitle ?? '')
    .trim()
    .toLowerCase();
  const canEdit =
    roleName === 'CREATOR' ||
    roleName === 'CONTENT_CREATOR' ||
    (roleName === 'EMPLOYEE' && jobTitle === 'content creator');

  const selectedBrand = brands.find((item) => String(item.id) === String(selectedBrandId)) ?? activeBrands[0] ?? null;
  const platformAccounts = useMemo(
    () => Array.from(new Map(
      [
        ...(selectedBrand ? getPlatforms(selectedBrand.id) : []),
        ...(selectedBrand ? getPlatforms(String(selectedBrand.id)) : []),
      ]
        .map((account) => ({
          ...account,
          numericId: Number(account.serverId ?? account.id),
        }))
        .filter((account) => Number.isSafeInteger(account.numericId) && account.numericId > 0)
        .map((account) => [account.numericId, account]),
    ).values()),
    [getPlatforms, selectedBrand],
  );

  useEffect(() => {
    const brandId = Number(selectedBrand?.id);
    if (!Number.isSafeInteger(brandId) || brandId <= 0) {
      setOverviewData(null);
      setOverviewError('');
      return undefined;
    }

    let alive = true;
    setOverviewLoading(true);
    setOverviewError('');
    setOverviewData(null);

    Promise.all([
      fetchPlatformAccountsApi(brandId),
      fetchContentPlansApi({ brandId }),
    ])
      .then(async ([platformsResponse, plansResponse]) => {
        const accountRecords = platformsResponse?.data?.accounts;
        const planRecords = plansResponse?.data?.plans;
        if (!Array.isArray(accountRecords) || !Array.isArray(planRecords)) {
          throw new Error(t('Could not load brand overview data.'));
        }

        const planSummaries = await Promise.all(planRecords.map(async (plan) => {
          const contentPlanId = Number(plan.id);
          if (!Number.isSafeInteger(contentPlanId) || contentPlanId <= 0) {
            throw new Error(t('A content plan has an invalid ID.'));
          }

          const [itemsResponse, campaignRecords] = await Promise.all([
            fetchContentItemsApi({ contentPlanId }),
            fetchCampaignsApi({ contentPlanId }),
          ]);
          const itemRecords = itemsResponse?.data?.items;
          if (!Array.isArray(itemRecords) || !Array.isArray(campaignRecords)) {
            throw new Error(t('Could not load plan items and campaigns.'));
          }

          return {
            ...plan,
            itemCount: itemRecords.length,
            campaigns: campaignRecords,
          };
        }));

        if (!alive) return;
        setOverviewData({
          platforms: accountRecords,
          plans: planSummaries,
          campaigns: planSummaries.flatMap((plan) => plan.campaigns),
          itemCount: planSummaries.reduce((total, plan) => total + plan.itemCount, 0),
        });
      })
      .catch((error) => {
        if (!alive) return;
        setOverviewError(error?.message || t('Could not load brand overview data.'));
      })
      .finally(() => {
        if (alive) setOverviewLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedBrand?.id, platformAccounts, localPlans, content, t]);

  React.useEffect(() => {
    if (activeBrands.length && !brands.some((b) => String(b.id) === String(selectedBrandId))) {
      setSelectedBrandId(activeBrands[0]?.id || '');
    }
  }, [brands, activeBrands, selectedBrandId]);

  const brandStrategy = selectedBrand ? getApprovedStrategy(selectedBrand.id) : null;
  const isStrategyApproved = Boolean(brandStrategy);
  const campaigns = selectedBrand ? getCampaigns(selectedBrand.id) : [];

  const pillars = useMemo(() => {
    const fromStrategy = linesOf(brandStrategy?.sections?.pillars?.body ?? '');
    const fromItems = content
      .filter((item) => String(item.brandId) === String(selectedBrandId))
      .map((item) => getContentMeta(item.id).pillar || item.pillar)
      .filter(Boolean);
    return Array.from(new Set([...fromStrategy, ...fromItems]));
  }, [brandStrategy, content, selectedBrandId, getContentMeta]);

  // Brand items
  const brandItems = useMemo(() => {
    return content.filter((item) => String(item.brandId) === String(selectedBrandId));
  }, [content, selectedBrandId]);

  // Items for selected month/plan
  const planItems = useMemo(() => {
    return brandItems.filter((item) => item.month === selectedMonth);
  }, [brandItems, selectedMonth]);

  // Campaigns in selected plan
  const planCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // If campaign has dates or items in this month
      const count = planItems.filter((it) => {
        const meta = getContentMeta(it.id);
        return (meta.campaignId ?? it.campaignId) === c.id;
      }).length;
      return count > 0 || (c.startDate && c.startDate.startsWith(selectedMonth));
    });
  }, [campaigns, planItems, selectedMonth, getContentMeta]);

  // Unassigned items in this plan
  const unassignedItems = useMemo(() => {
    return planItems.filter((it) => {
      const meta = getContentMeta(it.id);
      return !meta.campaignId && !it.campaignId;
    });
  }, [planItems, getContentMeta]);

  // Items in selected campaign
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? null;
  const campaignItems = useMemo(() => {
    if (!selectedCampaignId) return [];
    return planItems.filter((it) => {
      const meta = getContentMeta(it.id);
      return (meta.campaignId ?? it.campaignId) === selectedCampaignId;
    });
  }, [planItems, selectedCampaignId, getContentMeta]);

  // Selected item object
  const selectedItem = content.find((it) => it.id === selectedItemId) ?? null;

  // Breadcrumbs navigation handlers
  const navTo = (targetScreen) => {
    setScreen(targetScreen);
  };

  const handleSelectBrand = (bId) => {
    platformPlansRequestRef.current += 1;
    setSelectedBrandId(bId);
    setSelectedPlatformAccountId(null);
    setPlatformScopedPlanRecords(null);
    setPlatformPlansLoading(false);
    setPlatformPlansError('');
    setScreen('brand_hub');
  };

  const handleSelectPlatform = async (platformAccount) => {
    const platformAccountId = Number(platformAccount?.id);
    if (!Number.isSafeInteger(platformAccountId) || platformAccountId <= 0) {
      setPlatformPlansError(t('This platform account does not have a valid server ID.'));
      return;
    }

    setSelectedPlatform(platformAccount.platform);
    setSelectedPlatformAccountId(platformAccountId);
    setPlatformScopedPlanRecords(null);
    setPlatformPlansError('');
    setPlatformPlansLoading(true);
    setScreen('plans');
    const requestId = ++platformPlansRequestRef.current;
    try {
      const response = await fetchContentPlansApi({ platformAccountId });
      const records = response?.data?.plans;
      if (!Array.isArray(records)) {
        throw new Error(t('Could not load content plans for this platform account.'));
      }
      if (platformPlansRequestRef.current === requestId) setPlatformScopedPlanRecords(records);
    } catch (error) {
      if (platformPlansRequestRef.current === requestId) {
        setPlatformPlansError(error?.message || t('Could not load content plans for this platform account.'));
      }
    } finally {
      if (platformPlansRequestRef.current === requestId) setPlatformPlansLoading(false);
    }
  };

  const handleSelectPlan = (month) => {
    setSelectedMonth(month);
    setScreen('plan_details');
  };

  const handleSelectCampaign = (cId) => {
    setSelectedCampaignId(cId);
    setScreen('campaign_details');
  };

  const handleSelectItem = (it) => {
    setSelectedItemId(it.id);
    setItemForm({
      title: it.title,
      type: it.type,
      publishDate: it.publishDate,
      publishTime: it.publishTime,
      tov: it.tov || 'Warm & empathetic',
      caption: it.caption || '',
      notes: it.notes || '',
      referenceUrl: it.referenceUrl || '',
      campaignId: getContentMeta(it.id).campaignId ?? it.campaignId ?? '',
      status: it.status,
    });
    setScreen('item_details');
  };

  const handleAddPlatformFromOverview = () => {
    if (onAddPlatform) {
      onAddPlatform(selectedBrand?.id);
      return;
    }
    navTo('platforms');
  };

  const handleCreatePlanFromOverview = () => {
    const defaultAccount = platformAccounts.find((account) => account.name === selectedPlatform)
      ?? platformAccounts[0];
    setPlanForm({
      ...EMPTY_PLAN,
      platformAccountId: defaultAccount ? String(defaultAccount.numericId) : '',
    });
    setPlanModalOpen(true);
  };

  // Plan Handlers
  const handleCreatePlan = async () => {
    if (!canEdit) return;
    if (!isStrategyApproved) {
      showToast(t('Creating a Content Plan is locked because this brand does not have an approved strategy yet.'), 'error');
      return;
    }
    const [year, month] = String(planForm.month || '').split('-').map(Number);
    const brandId = Number(selectedBrandId);
    const platformAccountId = Number(planForm.platformAccountId);
    if (
      !Number.isSafeInteger(brandId) || brandId <= 0 ||
      !Number.isSafeInteger(platformAccountId) || platformAccountId <= 0 ||
      !Number.isSafeInteger(year) || !Number.isSafeInteger(month) || month < 1 || month > 12
    ) {
      showToast(t('Select a platform account and a valid month.'), 'error');
      return;
    }

    const postsTarget = Number(planForm.postsTarget) || 0;
    const reelsTarget = Number(planForm.reelsTarget) || 0;
    const platformAccount = platformAccounts.find(
      (account) => Number(account.serverId ?? account.id) === platformAccountId,
    );
    const payload = {
      brandId,
      platformAccountId,
      title: `${planForm.month} Content Plan`,
      year,
      month,
      monthlyGoals: String(planForm.monthlyGoals || '').trim() || null,
      notes: `Posts target: ${postsTarget}, Reels target: ${reelsTarget}`,
    };

    try {
      const editingServerId = Number(planForm.serverId);
      const response = editingServerId > 0
        ? await updateContentPlanApi(editingServerId, payload)
        : await createContentPlanApi(payload);
      const created = response?.data?.plan ?? response?.data ?? response?.plan ?? response;
      const serverId = Number(created?.id ?? editingServerId);
      if (!Number.isSafeInteger(serverId) || serverId <= 0) {
        throw new Error(t('The server response did not include a valid plan ID.'));
      }
      const newPlan = {
        id: `plan-${brandId}-${year}-${String(month).padStart(2, '0')}`,
        serverId,
        brandId: String(brandId),
        platformAccountId,
        platform: platformAccount?.name,
        month: `${year}-${String(month).padStart(2, '0')}`,
        postsTarget,
        reelsTarget,
        status: String(created.status || 'DRAFT').toLowerCase(),
        title: created.title || payload.title,
        createdAt: created.createdAt || new Date().toISOString().slice(0, 10),
      };
      setLocalPlans((prev) => [newPlan, ...prev.filter((plan) => Number(plan.serverId) !== serverId)]);
      setDeletedPlanIds((prev) => prev.filter((id) => id !== serverId));
      setPlanModalOpen(false);
      setPlanForm(EMPTY_PLAN);
      showToast(t(editingServerId > 0 ? 'Plan updated.' : 'Plan created.'), 'success');
    } catch (error) {
      showToast(error?.message || t('Could not save the plan.'), 'error');
    }
  };

  const handleSubmitPlanForReview = async (plan) => {
    const serverId = plan?.serverId;
    const status = String(plan?.status || '').toUpperCase();
    if (
      !canEdit ||
      typeof serverId !== 'number' ||
      !Number.isSafeInteger(serverId) ||
      serverId <= 0 ||
      !['DRAFT', 'NEEDS_CHANGES'].includes(status)
    ) return;

    try {
      await updateContentPlanStatusApi(serverId, 'IN_REVIEW');
      setLocalPlans((prev) => [
        { ...plan, status: 'IN_REVIEW' },
        ...prev.filter((item) => Number(item.serverId) !== serverId),
      ]);
      showToast(t('Plan submitted for review.'), 'success');
    } catch (error) {
      showToast(error?.message || t('Could not submit the plan for review.'), 'error');
    }
  };

  const confirmDeletePlan = async () => {
    if (!canEdit || !planToDelete) return;
    const serverId = Number(planToDelete.serverId);
    if (!Number.isSafeInteger(serverId) || serverId <= 0) {
      showToast(t('This plan is not available on the server and cannot be deleted.'), 'error');
      return;
    }
    try {
      await deleteContentPlanApi(serverId);
      setDeletedPlanIds((prev) => [...new Set([...prev, serverId])]);
      setLocalPlans((prev) => prev.filter((plan) => Number(plan.serverId) !== serverId));
      setPlanToDelete(null);
      showToast(t('Plan deleted.'), 'success');
    } catch (error) {
      showToast(error?.message || t('Could not delete the plan.'), 'error');
    }
  };

  // Campaign Handlers
  const handleSaveCampaign = () => {
    if (!campaignForm.name.trim()) {
      setCampaignError(t('Campaign name is required.'));
      return;
    }
    if (campaignForm.startDate && campaignForm.endDate) {
      if (new Date(campaignForm.endDate) <= new Date(campaignForm.startDate)) {
        setCampaignError(
          t('Campaign end date must be strictly after start date (endDate > startDate).')
        );
        return;
      }
    }
    if (campaignForm.id) {
      updateCampaign(campaignForm.id, {
        name: campaignForm.name.trim(),
        objective: campaignForm.objective || '',
        startDate: campaignForm.startDate || '',
        endDate: campaignForm.endDate || '',
      });
      showToast(t('Campaign updated.'), 'success');
    } else {
      addCampaign({
        brandId: selectedBrandId,
        ...campaignForm,
        name: campaignForm.name.trim(),
        color: CAMPAIGN_COLORS[campaigns.length % CAMPAIGN_COLORS.length],
      });
      showToast(t('Campaign created.'), 'success');
    }
    setCampaignForm(EMPTY_CAMPAIGN);
    setCampaignModalOpen(false);
    setCampaignError('');
  };

  const confirmDeleteCampaign = () => {
    if (!campaignToDelete) return;
    deleteCampaign(campaignToDelete.id);
    setCampaignToDelete(null);
    if (selectedCampaignId === campaignToDelete.id) {
      setScreen('plan_details');
    }
    showToast(t('Campaign deleted and data refreshed from server.'), 'success');
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    deleteContent?.(itemToDelete.id);
    const deletedId = itemToDelete.id;
    setItemToDelete(null);
    if (selectedItemId === deletedId) {
      if (selectedCampaignId) {
        setScreen('campaign_details');
      } else {
        setScreen('plan_details');
      }
    }
    showToast(t('Content item deleted.'), 'success');
  };

  // Item Handlers
  const handleSaveItemDetails = () => {
    if (!selectedItemId) return;
    updateContent(selectedItemId, {
      title: itemForm.title,
      type: itemForm.type,
      publishDate: itemForm.publishDate,
      publishTime: itemForm.publishTime,
      tov: itemForm.tov,
      caption: itemForm.caption,
      notes: itemForm.notes,
      referenceUrl: itemForm.referenceUrl,
      status: itemForm.status,
    });
    saveContentMeta(selectedItemId, {
      campaignId: itemForm.campaignId,
      detailsStatus: 'saved',
    });
    showToast(t('Content details saved.'), 'success');
  };

  const handleSaveItemDraft = () => {
    if (!selectedItemId) return;
    updateContent(selectedItemId, {
      title: itemForm.title,
      type: itemForm.type,
      publishDate: itemForm.publishDate,
      publishTime: itemForm.publishTime,
      tov: itemForm.tov,
      caption: itemForm.caption,
      notes: itemForm.notes,
      referenceUrl: itemForm.referenceUrl,
    });
    saveContentMeta(selectedItemId, {
      campaignId: itemForm.campaignId,
      detailsStatus: 'draft',
    });
    showToast(t('Details saved as draft'), 'info');
  };

  const handleCreateContentItem = () => {
    const newItemId = `content-${selectedBrandId}-${Date.now()}`;
    const newItem = {
      id: newItemId,
      brandId: selectedBrandId,
      month: selectedMonth,
      type: itemForm.type || 'post',
      title: itemForm.title || t('Untitled Content'),
      publishDate: itemForm.publishDate || `${selectedMonth}-15`,
      publishTime: itemForm.publishTime || '12:00',
      tov: itemForm.tov || 'Warm & empathetic',
      caption: itemForm.caption || '',
      notes: itemForm.notes || '',
      referenceUrl: itemForm.referenceUrl || '',
      materialUrl: '',
      designDirection: '',
      status: 'planned',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    updateContent(newItemId, newItem);
    saveContentMeta(newItemId, {
      campaignId: selectedCampaignId || itemForm.campaignId || '',
      platform: selectedPlatform,
      detailsStatus: 'draft',
    });
    setItemModalOpen(false);
    setItemForm(EMPTY_ITEM);
    showToast(t('Content item created.'), 'success');
  };

  // RENDER: Breadcrumbs Navigation
  const renderBreadcrumbs = () => {
    return (
      <nav className="s3-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li className={screen === 'brands' ? 'is-active' : ''}>
            <button type="button" onClick={() => navTo('brands')}>
              <svg aria-hidden="true" className="icon" style={{ width: 14, height: 14 }}>
                <use href="#i-briefcase" />
              </svg>
              <span>{t('Brands')}</span>
            </button>
          </li>

          {selectedBrand && screen !== 'brands' ? (
            <>
              <li className="s3-breadcrumbs__sep">/</li>
              <li className={screen === 'brand_hub' ? 'is-active' : ''}>
                <button type="button" onClick={() => navTo('brand_hub')}>
                  <span>{selectedBrand.name}</span>
                </button>
              </li>
              <li className="s3-breadcrumbs__sep">/</li>
              <li className={screen === 'brand_hub' ? 'is-active' : ''}>
                <button type="button" onClick={() => navTo('brand_hub')}>
                  <span>{t('Content Management')}</span>
                </button>
              </li>
            </>
          ) : null}

          {screen === 'platforms' ? (
            <>
              <li className="s3-breadcrumbs__sep">/</li>
              <li className="is-active">
                <span>{t('Platforms')}</span>
              </li>
            </>
          ) : null}

          {(screen === 'plans' || screen === 'plan_details' || screen === 'campaign_details' || screen === 'item_details') ? (
            <>
              <li className="s3-breadcrumbs__sep">/</li>
              <li className={screen === 'plans' ? 'is-active' : ''}>
                <button type="button" onClick={() => navTo('plans')}>
                  <span>{selectedPlatform ? `${selectedPlatform} ${t('Plans')}` : t('Content Plans')}</span>
                </button>
              </li>
            </>
          ) : null}

          {(screen === 'plan_details' || screen === 'campaign_details' || screen === 'item_details') && selectedMonth ? (
            <>
              <li className="s3-breadcrumbs__sep">/</li>
              <li className={screen === 'plan_details' ? 'is-active' : ''}>
                <button type="button" onClick={() => navTo('plan_details')}>
                  <span>{monthLabel(selectedMonth)}</span>
                </button>
              </li>
            </>
          ) : null}

          {(screen === 'campaign_details' || (screen === 'item_details' && selectedCampaign)) && selectedCampaign ? (
            <>
              <li className="s3-breadcrumbs__sep">/</li>
              <li className={screen === 'campaign_details' ? 'is-active' : ''}>
                <button type="button" onClick={() => navTo('campaign_details')}>
                  <span>{selectedCampaign.name}</span>
                </button>
              </li>
            </>
          ) : null}

          {screen === 'item_details' && selectedItem ? (
            <>
              <li className="s3-breadcrumbs__sep">/</li>
              <li className="is-active">
                <span>{selectedItem.title}</span>
              </li>
            </>
          ) : null}
        </ol>
      </nav>
    );
  };

  /* ==========================================================================
     SCREEN 1: BRANDS LIST
     ========================================================================== */
  const renderScreen1Brands = () => {
    const filtered = activeBrands.filter((b) =>
      b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
      (b.industry || '').toLowerCase().includes(brandSearch.toLowerCase()),
    );

    return (
      <div className="s3-screen">
        <div className="s3-screen-header">
          <div>
            <h2>{t('Brands')}</h2>
            <p className="s3-muted">{t('Select a brand to manage its platform accounts and content plans.')}</p>
          </div>
          <div className="s3-head-actions">
            <input
              type="search"
              className="form-input"
              placeholder={t('Search brands…')}
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              style={{ minWidth: 220 }}
            />
          </div>
        </div>

        {filtered.length ? (
          <div className="s3-platform-grid">
            {filtered.map((b) => {
              const strat = getApprovedStrategy(b.id);
              const bPlans = localPlans.filter((p) => String(p.brandId) === String(b.id));

              return (
                <div
                  key={b.id}
                  className="s3-platform-card"
                  onClick={() => handleSelectBrand(b.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectBrand(b.id)}
                >
                  <div className="s3-platform-card__header">
                    <span className="s3-platform-card__icon">🏢</span>
                    <div>
                      <strong>{b.name}</strong>
                      <small className="s3-muted" style={{ display: 'block' }}>{b.industry || t('General')}</small>
                    </div>
                  </div>

                  <div style={{ margin: '10px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <StatusPill
                      label={strat ? t('Approved Strategy') : t('No approved strategy')}
                      tone={strat ? 'is-green' : 'is-amber'}
                    />
                    <StatusPill
                      label={`5 ${t('Platform Accounts')}`}
                      tone="is-blue"
                    />
                  </div>

                  <footer style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                    <span className="s3-muted" style={{ fontSize: 12 }}>
                      {bPlans.length} {t('Content Plans')}
                    </span>
                    <button type="button" className="button button--ghost button--xs">
                      {t('Content Management')} →
                    </button>
                  </footer>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="#i-briefcase"
            title={t('No brands found')}
            text={t('Try adjusting your search query.')}
          />
        )}
      </div>
    );
  };

  /* ==========================================================================
     SCREEN 1.5: BRAND CONTENT MANAGEMENT HUB (Selected Brand -> Content Management)
     ========================================================================== */
  const renderScreenBrandContentManagement = () => {
    if (!selectedBrand) {
      return (
        <div className="s3-screen">
          <EmptyState
            icon="#i-briefcase"
            title={t('No brand selected')}
            text={t('Please select a brand from the brands list.')}
            actionLabel={t('Back to Brands')}
            onAction={() => navTo('brands')}
          />
        </div>
      );
    }

    const strat = getApprovedStrategy(selectedBrand.id);
    const overviewPlatforms = overviewData?.platforms ?? [];
    const overviewPlans = overviewData?.plans ?? [];
    const overviewCampaigns = overviewData?.campaigns ?? [];
    const overviewItemCount = overviewData?.itemCount ?? 0;

    return (
      <div className="s3-screen">
        {/* Hub Header */}
        <div className="s3-screen-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 18,
                boxShadow: '0 4px 12px rgba(108, 92, 231, 0.25)',
              }}
            >
              {(selectedBrand.name || 'B').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0 }}>{selectedBrand.name}</h2>
                <StatusPill
                  label={strat ? t('Approved Strategy') : t('Strategy Pending')}
                  tone={strat ? 'is-green' : 'is-amber'}
                />
              </div>
              <p className="s3-muted" style={{ margin: '4px 0 0' }}>
                {selectedBrand.industry || t('General')} · {t('Content Management & Channel Operations')}
              </p>
            </div>
          </div>

          <div className="s3-head-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => navTo('brands')}
            >
              ← {t('Switch Brand')}
            </button>
            {canEdit && (
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  setItemForm({ ...EMPTY_ITEM, publishDate: `${selectedMonth}-15` });
                  setItemModalOpen(true);
                }}
              >
                + {t('New Content Item')}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="s3-stats-grid" style={{ marginBottom: 24 }}>
          <Stat
            icon="#i-grid"
            label={t('Connected Platforms')}
            value={overviewLoading ? '…' : overviewError ? '—' : overviewPlatforms.length}
            hint={t('Platform accounts linked to this brand')}
          />
          <Stat
            icon="#i-file"
            label={t('Content Plans')}
            value={overviewLoading ? '…' : overviewError ? '—' : overviewPlans.length}
            hint={t('Monthly schedules')}
          />
          <Stat
            icon="#i-layers"
            label={t('Active Campaigns')}
            value={overviewLoading ? '…' : overviewError ? '—' : overviewCampaigns.length}
            hint={t('Strategic marketing initiatives')}
          />
          <Stat
            icon="#i-calendar"
            label={t('Total Content Items')}
            value={overviewLoading ? '…' : overviewError ? '—' : overviewItemCount}
            hint={t('Planned, scheduled & published')}
          />
        </div>

        {/* Main Content Management Sections: Platforms & Content Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Card 1: Platforms Hub */}
          <div className="s3-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <strong style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>
                  📱 {t('Social Media Platforms')}
                </strong>
                <p className="s3-muted" style={{ fontSize: 13, margin: 0 }}>
                  {t('Manage publishing accounts and platform-specific metrics for')} {selectedBrand.name}.
                </p>
              </div>
              <span className="pill is-blue" style={{ fontSize: 11, fontWeight: 700 }}>
                {overviewLoading ? '…' : overviewError ? '—' : overviewPlatforms.length} {t('Connected')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0 20px' }}>
              {overviewLoading || (!overviewData && !overviewError) ? (
                <small className="s3-muted">{t('Loading platform accounts...')}</small>
              ) : overviewError ? (
                <small className="s3-muted" role="alert">{overviewError}</small>
              ) : overviewPlatforms.length ? overviewPlatforms.map((plat) => (
                <div
                  key={plat.id}
                  onClick={() => {
                    setSelectedPlatform(plat.platform);
                    navTo('plans');
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => e.key === 'Enter' && (setSelectedPlatform(plat.platform), navTo('plans'))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                    background: 'var(--surface-alt, #FAF9F6)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>
                      {PLATFORM_ICONS[String(plat.platform || '').toLowerCase().split(/[ /]/)[0]] || '◉'}
                    </span>
                    <div>
                      <strong style={{ fontSize: 13, display: 'block' }}>{plat.platform}</strong>
                      <small className="s3-muted">{plat.accountName || plat.accountUrl}</small>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="s3-muted" style={{ fontSize: 12 }}>→</span>
                  </div>
                </div>
              )) : (
                <EmptyState
                  icon="#i-globe"
                  title={t('No social platforms yet.')}
                  action={canEdit ? (
                    <button type="button" className="button button--primary button--sm" onClick={handleAddPlatformFromOverview}>
                      {t('Add Platform')}
                    </button>
                  ) : null}
                />
              )}
            </div>

            <footer style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="s3-muted" style={{ fontSize: 12 }}>
                {t('View all account configurations')}
              </span>
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={() => navTo('platforms')}
              >
                {t('Open Platforms')} →
              </button>
            </footer>
          </div>

          {/* Card 2: Content Items & Monthly Plans Hub */}
          <div className="s3-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <strong style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>
                  🗓️ {t('Content Plans & Items')}
                </strong>
                <p className="s3-muted" style={{ fontSize: 13, margin: 0 }}>
                  {t('Explore monthly schedules, creative campaigns, and content assets.')}
                </p>
              </div>
              <span className="pill is-purple" style={{ fontSize: 11, fontWeight: 700 }}>
                {overviewLoading ? '…' : overviewError ? '—' : overviewItemCount} {t('Items')}
              </span>
            </div>

            {/* Quick overview of plans */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0 20px' }}>
              {overviewLoading || (!overviewData && !overviewError) ? (
                <small className="s3-muted">{t('Loading content plans...')}</small>
              ) : overviewError ? (
                <small className="s3-muted" role="alert">{overviewError}</small>
              ) : overviewPlans.length ? overviewPlans.map((plan) => {
                const planMonth = `${plan.year}-${String(plan.month).padStart(2, '0')}`;
                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedMonth(planMonth);
                      navTo('plan_details');
                    }}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setSelectedMonth(planMonth);
                        navTo('plan_details');
                      }
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--line)',
                      background: 'var(--surface-alt, #FAF9F6)',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{plan.title}</strong>
                    <small className="s3-muted" style={{ display: 'block' }}>
                      {monthLabel(planMonth)} {plan.year} · {plan.itemCount} {t('Items')} · {plan.campaigns.length} {t('Campaigns')}
                    </small>
                  </div>
                );
              }) : (
                <EmptyState
                  icon="#i-calendar"
                  title={t('No monthly plans yet.')}
                  action={canEdit ? (
                    <button type="button" className="button button--primary button--sm" onClick={handleCreatePlanFromOverview}>
                      {t('Create Monthly Plan')}
                    </button>
                  ) : null}
                />
              )}

              {/* Active Campaigns Preview */}
              <div style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-alt, #FAF9F6)' }}>
                <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                  🎯 {t('Active Campaigns')} ({overviewCampaigns.length})
                </strong>
                {overviewLoading || (!overviewData && !overviewError) ? (
                  <small className="s3-muted">{t('Loading campaigns...')}</small>
                ) : overviewError ? (
                  <small className="s3-muted" role="alert">{overviewError}</small>
                ) : overviewCampaigns.length ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {overviewCampaigns.slice(0, 3).map((c, idx) => (
                      <span
                        key={c.id}
                        className={`pill ${CAMPAIGN_COLORS[idx % CAMPAIGN_COLORS.length]}`}
                        style={{ cursor: 'pointer', fontSize: 11 }}
                        onClick={() => {
                          handleSelectCampaign(c.id);
                        }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <small className="s3-muted">{t('No active campaigns yet.')}</small>
                )}
              </div>
            </div>

            <footer style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="s3-muted" style={{ fontSize: 12 }}>
                {t('Access all monthly plans')}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => navTo('plans')}
                >
                  {t('Browse Content Plans')} →
                </button>
                <button
                  type="button"
                  className="button button--primary button--sm"
                  onClick={() => {
                    setSelectedMonth(monthKey());
                    navTo('plan_details');
                  }}
                >
                  {t('Open Monthly Items')} →
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  };

  /* ==========================================================================
     SCREEN 2: PLATFORM ACCOUNTS LIST
     ========================================================================== */
  const renderScreen2Platforms = () => {
    const platforms = (overviewData?.platforms || []).filter((platform) =>
      String(platform.platform || '').toLowerCase().includes(platformSearch.toLowerCase()) ||
      String(platform.accountName || '').toLowerCase().includes(platformSearch.toLowerCase()) ||
      String(platform.accountUrl || '').toLowerCase().includes(platformSearch.toLowerCase()),
    );

    return (
      <div className="s3-screen">
        <div className="s3-screen-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost button--xs"
                onClick={() => navTo('brand_hub')}
              >
                ← {t('Back to Content Management')}
              </button>
              <h2>{selectedBrand?.name} · {t('Platform Accounts')}</h2>
            </div>
            <p className="s3-muted">{t('Select a connected platform account to view and manage its content plans.')}</p>
          </div>
          <div className="s3-head-actions">
            <input
              type="search"
              className="form-input"
              placeholder={t('Filter platforms…')}
              value={platformSearch}
              onChange={(e) => setPlatformSearch(e.target.value)}
              style={{ minWidth: 200 }}
            />
          </div>
        </div>

        {overviewLoading || (!overviewData && !overviewError) ? (
          <p className="s3-muted">{t('Loading platform accounts...')}</p>
        ) : overviewError ? (
          <p className="s3-muted" role="alert">{overviewError}</p>
        ) : platforms.length ? (
          <div className="s3-platform-grid">
            {platforms.map((plat) => (
            <div
              key={plat.id}
              className="s3-platform-card"
              onClick={() => handleSelectPlatform(plat)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === 'Enter' && handleSelectPlatform(plat)}
            >
              <div className="s3-platform-card__header">
                <span className="s3-platform-card__icon">
                  {PLATFORM_ICONS[String(plat.platform || '').toLowerCase().split(/[ /]/)[0]] || '◉'}
                </span>
                <div>
                  <strong>{plat.platform}</strong>
                  <small className="s3-muted" style={{ display: 'block' }}>
                    {plat.accountName || plat.accountUrl}
                  </small>
                </div>
              </div>

              <footer style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <button
                  type="button"
                  className="button button--primary button--xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelectPlatform(plat);
                  }}
                >
                  {t('View Content Plans')} →
                </button>
              </footer>
            </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="#i-globe"
            title={overviewData.platforms.length ? t('No matching platforms found.') : t('No social platforms yet.')}
            action={!overviewData.platforms.length && canEdit ? (
              <button type="button" className="button button--primary button--sm" onClick={handleAddPlatformFromOverview}>
                {t('Add Platform')}
              </button>
            ) : null}
          />
        )}
      </div>
    );
  };

  /* ==========================================================================
     SCREEN 3: CONTENT PLANS LIST
     ========================================================================== */
  const renderScreen3Plans = () => {
    const accountPlans = Array.isArray(platformScopedPlanRecords)
      ? platformScopedPlanRecords.map((plan) => {
        const notes = String(plan.notes || '');
        return {
          id: `plan-${plan.brandId}-${plan.year}-${String(plan.month).padStart(2, '0')}`,
          serverId: plan.id,
          brandId: String(plan.brandId),
          platformAccountId: Number(plan.platformAccountId),
          platform: selectedPlatform,
          month: `${plan.year}-${String(plan.month).padStart(2, '0')}`,
          postsTarget: Number(notes.match(/Posts target:\s*(\d+)/i)?.[1] || 0),
          reelsTarget: Number(notes.match(/Reels target:\s*(\d+)/i)?.[1] || 0),
          monthlyGoals: plan.monthlyGoals,
          status: plan.status,
          title: plan.title,
          createdAt: plan.createdAt,
        };
      })
      : [];
    const contentPlans = (selectedPlatformAccountId !== null
      ? accountPlans
      : [...localPlans, ...(plans || [])]
    ).filter((plan) => !deletedPlanIds.includes(Number(plan.serverId)));
    const selectedPlatformAccountIds = new Set(
      selectedPlatformAccountId !== null
        ? [selectedPlatformAccountId]
        : platformAccounts
          .filter((account) => account.name === selectedPlatform)
          .map((account) => account.numericId),
    );
    const getPlanForMonth = (month) => contentPlans.find((item) => {
      if (String(item.brandId) !== String(selectedBrandId) || item.month !== month) return false;
      if (item.platformAccountId) return selectedPlatformAccountIds.has(Number(item.platformAccountId));
      return !item.platform || item.platform === selectedPlatform;
    });
    // Show months represented by a Content Plan record. Demo fixtures remain
    // available through the provider's demo bypass hydration path.
    const availableMonths = Array.from(
      new Set([
        ...contentPlans
          .filter((plan) => getPlanForMonth(plan.month) === plan)
          .map((plan) => plan.month),
      ]),
    ).sort().reverse();
    const getPlanStatus = (month) => {
      const plan = getPlanForMonth(month);
      return String(plan?.status || 'DRAFT').toLowerCase();
    };
    const availableYears = Array.from(
      new Set(availableMonths.map((month) => month.slice(0, 4))),
    ).sort().reverse();

    const filteredPlans = availableMonths.filter((m) => {
      if (planMonthFilter !== 'all' && m.slice(5, 7) !== planMonthFilter) return false;
      if (planYearFilter !== 'all' && m.slice(0, 4) !== planYearFilter) return false;
      if (planStatusFilter !== 'all' && getPlanStatus(m) !== planStatusFilter) return false;
      return true;
    });

    return (
      <div className="s3-screen">
        <div className="s3-screen-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost button--xs"
                onClick={() => navTo('brand_hub')}
              >
                ← {t('Back to Content Management')}
              </button>
              <h2>{selectedBrand?.name} · {selectedPlatform} {t('Content Plans')}</h2>
            </div>
            <p className="s3-muted">{t('Monthly publication plans, campaigns, and content schedules.')}</p>
          </div>

          <div className="s3-head-actions">
            {canEdit ? (
              <button
                type="button"
                className="button button--primary"
                disabled={!isStrategyApproved}
                title={!isStrategyApproved ? t('Strategy must be approved first') : ''}
                onClick={() => {
                  const defaultAccount = platformAccounts.find(
                    (account) => account.numericId === selectedPlatformAccountId,
                  ) ?? platformAccounts.find((account) => account.name === selectedPlatform);
                  setPlanForm({
                    ...EMPTY_PLAN,
                    platformAccountId: defaultAccount ? String(defaultAccount.numericId) : '',
                  });
                  setPlanModalOpen(true);
                }}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-plus" />
                </svg>
                {t('Create Plan')}
              </button>
            ) : null}
          </div>
        </div>

        {/* Important Rule: Strategy Approval Check */}
        {!isStrategyApproved ? (
          <section className="s3-warning" style={{ marginBottom: 16 }}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-alert" />
            </svg>
            <div>
              <strong>{t('Content Plan Creation Locked')}</strong>
              <p>{t('Creating a Content Plan is locked because this brand does not have an approved strategy yet.')}</p>
            </div>
          </section>
        ) : null}

        {/* Toolbar Filters: Brand, Status, Month, Year as required by specification */}
        <section className="s3-toolbar s3-toolbar--wrap" style={{ marginBottom: 16 }}>
          {/* Brand Filter */}
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={selectedBrandId}
              onChange={(e) => {
                platformPlansRequestRef.current += 1;
                setSelectedBrandId(e.target.value);
                setSelectedPlatformAccountId(null);
                setPlatformScopedPlanRecords(null);
                setPlatformPlansLoading(false);
                setPlatformPlansError('');
              }}
              aria-label={t('Brand')}
            >
              {activeBrands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>

          {/* Month Filter */}
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={planMonthFilter}
              onChange={(e) => setPlanMonthFilter(e.target.value)}
              aria-label={t('Month')}
            >
              <option value="all">{t('All months')}</option>
              {MONTH_OPTIONS.map((month, index) => {
                const value = String(index + 1).padStart(2, '0');
                return (
                  <option key={value} value={value}>
                    {t(month)}
                  </option>
                );
              })}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>

          {/* Year Filter */}
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={planYearFilter}
              onChange={(e) => setPlanYearFilter(e.target.value)}
              aria-label={t('Year')}
            >
              <option value="all">{t('All years')}</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>

          {/* Status Filter */}
          <span className="form-select-wrap">
            <select
              className="form-select"
              value={planStatusFilter}
              onChange={(e) => setPlanStatusFilter(e.target.value)}
              aria-label={t('Status')}
            >
              <option value="all">{t('All statuses')}</option>
              <option value="draft">{t('Draft')}</option>
              <option value="in_review">{t('In Review')}</option>
              <option value="needs_changes">{t('Needs Changes')}</option>
              <option value="approved">{t('Approved')}</option>
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>
        </section>

        {selectedPlatformAccountId !== null && platformPlansLoading ? (
          <p className="s3-muted">{t('Loading content plans...')}</p>
        ) : selectedPlatformAccountId !== null && platformPlansError ? (
          <p className="s3-muted" role="alert">{platformPlansError}</p>
        ) : filteredPlans.length ? (
          <div className="s3-plan-grid">
            {filteredPlans.map((m) => {
              const status = getPlanStatus(m);
              const plan = getPlanForMonth(m);
              const mItems = brandItems.filter((i) => i.month === m);
              const mCampaigns = campaigns.filter((c) =>
                mItems.some((i) => (getContentMeta(i.id).campaignId ?? i.campaignId) === c.id),
              );
              const postsCount = mItems.filter((i) => i.type === 'post').length;
              const reelsCount = mItems.filter((i) => i.type === 'reel').length;

              return (
                <div key={m} className="s3-plan-card">
                  <div className="s3-plan-card__header">
                    <div>
                      <strong style={{ fontSize: 16 }}>{selectedBrand?.name} · {monthLabel(m)} Plan</strong>
                      <small className="s3-muted" style={{ display: 'block' }}>
                        {t('Month')}: {m.slice(5, 7)} · {t('Year')}: {m.slice(0, 4)} · {selectedPlatform}
                      </small>
                    </div>
                    <StatusPill
                      label={t(PLAN_STATUS_LABELS[status] || status)}
                      tone={STATUS_TONE[status] || 'is-blue'}
                    />
                  </div>

                  <div style={{ margin: '8px 0', fontSize: 12, color: 'var(--muted)' }}>
                    <strong>{t('Monthly Goals')}:</strong> {postsCount || 10} {t('Posts')}, {reelsCount || 5} {t('Reels')} · {t('Audience engagement')}
                  </div>

                  <div className="s3-plan-card__stats">
                    <div>
                      <strong>{mItems.length}</strong>
                      <span className="s3-muted" style={{ display: 'block', fontSize: 11 }}>{t('Total Items')}</span>
                    </div>
                    <div>
                      <strong>{postsCount}</strong>
                      <span className="s3-muted" style={{ display: 'block', fontSize: 11 }}>{t('Posts')}</span>
                    </div>
                    <div>
                      <strong>{reelsCount}</strong>
                      <span className="s3-muted" style={{ display: 'block', fontSize: 11 }}>{t('Reels')}</span>
                    </div>
                    <div>
                      <strong>{mCampaigns.length}</strong>
                      <span className="s3-muted" style={{ display: 'block', fontSize: 11 }}>{t('Campaigns')}</span>
                    </div>
                  </div>

                  <div className="s3-plan-card__actions">
                    <button
                      type="button"
                      className="button button--primary button--sm"
                      onClick={() => handleSelectPlan(m)}
                    >
                      {t('View Plan')} →
                    </button>

                    {canEdit ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {typeof plan?.serverId === 'number' &&
                        Number.isSafeInteger(plan.serverId) &&
                        plan.serverId > 0 &&
                        ['draft', 'needs_changes'].includes(status) ? (
                          <button
                            type="button"
                            className="button button--secondary button--sm"
                            onClick={() => handleSubmitPlanForReview(plan)}
                          >
                            {t('Submit for Review')}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="button button--ghost button--sm"
                          onClick={() => {
                            setPlanForm({
                              ...EMPTY_PLAN,
                              serverId: plan?.serverId,
                              month: m,
                              platformAccountId: plan?.platformAccountId || '',
                              postsTarget: postsCount || 10,
                              reelsTarget: reelsCount || 5,
                              monthlyGoals: plan?.monthlyGoals || '',
                            });
                            setPlanModalOpen(true);
                          }}
                          aria-label={t('Edit Plan')}
                          title={t('Edit Plan')}
                        >
                          <svg aria-hidden="true" className="icon" style={{ width: 14, height: 14 }}>
                            <use href="#i-edit" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="button button--ghost button--sm is-danger"
                          onClick={() => setPlanToDelete({
                            ...plan,
                            id: plan?.id || m,
                            month: m,
                            hasRelated: mCampaigns.length > 0 || mItems.length > 0,
                          })}
                          aria-label={t('Delete Plan')}
                          title={t('Delete Plan')}
                        >
                          <svg aria-hidden="true" className="icon" style={{ width: 14, height: 14 }}>
                            <use href="#i-trash" />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="#i-calendar"
            title={t('No plans found')}
            text={t('Create a new plan for this platform account to get started.')}
          />
        )}
      </div>
    );
  };

  /* ==========================================================================
     SCREEN 4: CONTENT PLAN DETAILS (MONTHLY PLAN)
     ========================================================================== */
  const renderScreen4PlanDetails = () => {
    return (
      <div className="s3-screen">
        <div className="s3-screen-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost button--xs"
                onClick={() => navTo('plans')}
              >
                ← {t('Back to Plans')}
              </button>
              <h2>{monthLabel(selectedMonth)} · {t('Monthly Content Plan')}</h2>
            </div>
            <p className="s3-muted">
              {selectedBrand?.name} · {selectedPlatform} · {selectedMonth.slice(0, 4)} · <StatusPill label={t('In Progress')} tone="is-blue" />
            </p>
          </div>

          <div className="s3-head-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => onOpenPlan?.(selectedBrandId, selectedMonth)}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-calendar" />
              </svg>
              {t('Open plan sheet')}
            </button>

            {canEdit ? (
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  setItemForm({ ...EMPTY_ITEM, publishDate: `${selectedMonth}-15` });
                  setItemModalOpen(true);
                }}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-plus" />
                </svg>
                {t('Create Content Item')}
              </button>
            ) : null}
          </div>
        </div>

        {/* Plan Header Card (Screen 4 Specification) */}
        <section className="s3-card" style={{ marginBottom: 20, padding: '18px 24px', background: '#FAFAF7', border: '1px solid var(--line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <span className="s3-muted" style={{ fontSize: 12, display: 'block' }}>{t('Plan Title')}</span>
              <strong style={{ fontSize: 16 }}>{selectedBrand?.name} · {monthLabel(selectedMonth)} Content Plan</strong>
            </div>
            <div>
              <span className="s3-muted" style={{ fontSize: 12, display: 'block' }}>{t('Month / Year')}</span>
              <strong style={{ fontSize: 15 }}>{monthLabel(selectedMonth)} · {selectedMonth.slice(0, 4)}</strong>
            </div>
            <div>
              <span className="s3-muted" style={{ fontSize: 12, display: 'block' }}>{t('Status')}</span>
              <StatusPill label={t('In Progress')} tone="is-blue" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="s3-muted" style={{ fontSize: 12, display: 'block' }}>{t('Monthly Goals')}</span>
              <p style={{ margin: '4px 0 0', fontSize: 14 }}>
                Target: {planItems.filter((i) => i.type === 'post').length || 10} Posts, {planItems.filter((i) => i.type === 'reel').length || 5} Reels · Boost brand awareness, highlight core product features, and drive community engagement.
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="s3-muted" style={{ fontSize: 12, display: 'block' }}>{t('Notes')}</span>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
                Ensure all visuals align with brand guidelines. Creator drafts require account manager sign-off prior to scheduled publishing.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="s3-stats" style={{ marginBottom: 20 }}>
          <Stat label={t('Items')} value={planItems.length} note={monthLabel(selectedMonth)} />
          <Stat label={t('Campaigns')} value={planCampaigns.length} note={t('Active in this plan')} />
          <Stat label={t('Unassigned')} value={unassignedItems.length} note={t('Items without a campaign')} />
          <Stat
            label={t('Delivered')}
            value={planItems.filter((i) => i.status === 'delivered').length}
            note={t('Published to date')}
          />
        </div>

        {/* SECTION 1: CAMPAIGNS SECTION */}
        <section className="s3-card s3-campaigns" style={{ marginBottom: 24 }}>
          <header className="s3-card__head">
            <div>
              <span className="s3-eyebrow">{t('Campaigns')}</span>
              <h2>{t('Plan Campaigns')}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusPill label={`${planCampaigns.length}`} tone="is-purple" />
              {canEdit ? (
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => setCampaignModalOpen(true)}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-plus" />
                  </svg>
                  {t('New campaign')}
                </button>
              ) : null}
            </div>
          </header>

          {planCampaigns.length ? (
            <div className="s3-campaign-grid">
              {planCampaigns.map((camp) => {
                const count = planItems.filter((i) => {
                  const meta = getContentMeta(i.id);
                  return (meta.campaignId ?? i.campaignId) === camp.id;
                }).length;

                return (
                  <article className={`s3-campaign ${camp.color}`} key={camp.id}>
                    <div className="s3-campaign__top">
                      <strong>{camp.name}</strong>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="s3-mini-btn"
                          onClick={() => handleSelectCampaign(camp.id)}
                          aria-label={t('View Campaign')}
                          title={t('View Campaign')}
                        >
                          <svg aria-hidden="true" className="icon">
                            <use href="#i-chevron" />
                          </svg>
                        </button>
                        {canEdit ? (
                          <>
                            <button
                              type="button"
                              className="s3-mini-btn"
                              onClick={() => {
                                setCampaignForm({
                                  id: camp.id,
                                  name: camp.name,
                                  objective: camp.objective || '',
                                  startDate: camp.startDate || '',
                                  endDate: camp.endDate || '',
                                });
                                setCampaignModalOpen(true);
                              }}
                              aria-label={`${t('Edit')} ${camp.name}`}
                              title={t('Edit Campaign')}
                            >
                              <svg aria-hidden="true" className="icon">
                                <use href="#i-edit" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="s3-mini-btn is-danger"
                              onClick={() => setCampaignToDelete({ ...camp, relatedCount: count })}
                              aria-label={`${t('Delete')} ${camp.name}`}
                              title={t('Delete Campaign')}
                            >
                              <svg aria-hidden="true" className="icon">
                                <use href="#i-trash" />
                              </svg>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <p>{camp.objective || t('No objective set.')}</p>
                    <footer>
                      <span>{count} {t('items')}</span>
                      <span>{camp.startDate || '—'} → {camp.endDate || '—'}</span>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="s3-muted">{t('No campaigns in this plan. Create one to group content items.')}</p>
          )}
        </section>

        {/* SECTION 2: UNASSIGNED CONTENT ITEMS SECTION */}
        <section className="s3-card">
          <header className="s3-card__head">
            <div>
              <span className="s3-eyebrow">{t('Unassigned')}</span>
              <h2>{t('Unassigned Content Items')}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="s3-view-toggle">
                <button
                  type="button"
                  className={itemsView === 'table' ? 'is-active' : ''}
                  onClick={() => setItemsView('table')}
                >
                  <svg aria-hidden="true" className="icon"><use href="#i-table" /></svg>
                  {t('Table')}
                </button>
                <button
                  type="button"
                  className={itemsView === 'kanban' ? 'is-active' : ''}
                  onClick={() => setItemsView('kanban')}
                >
                  <svg aria-hidden="true" className="icon"><use href="#i-layers" /></svg>
                  {t('Kanban')}
                </button>
              </span>
            </div>
          </header>

          {unassignedItems.length ? (
            itemsView === 'table' ? (
              <div className="s3-table-wrap">
                <table className="s3-table">
                  <thead>
                    <tr>
                      <th>{t('Content')}</th>
                      <th>{t('Type')}</th>
                      <th>{t('Platform')}</th>
                      <th>{t('Date')}</th>
                      <th>{t('Tone of Voice')}</th>
                      <th>{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedItems.map((item) => {
                      const meta = getContentMeta(item.id);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="s3-item-cell">
                              <span className={`content-item__icon is-${item.type}`}>
                                <svg aria-hidden="true" className="icon">
                                  <use href={item.type === 'reel' ? '#i-camera' : '#i-file'} />
                                </svg>
                              </span>
                              <span>
                                <strong>{item.title}</strong>
                                {item.caption ? (
                                  <small className="s3-nowrap" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', color: '#6b7280' }}>
                                    {item.caption}
                                  </small>
                                ) : null}
                              </span>
                            </div>
                          </td>
                          <td>
                            <StatusPill
                              label={t(CONTENT_TYPE_LABEL[item.type] ?? item.type)}
                              tone={item.type === 'reel' ? 'is-purple' : item.type === 'story' ? 'is-amber' : 'is-blue'}
                            />
                          </td>
                          <td>
                            <StatusPill label={meta.platform ?? item.platform ?? selectedPlatform} tone="is-blue" />
                          </td>
                          <td className="s3-nowrap">{formatDate(item.publishDate)}</td>
                          <td>{item.tov || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button
                                type="button"
                                className="button button--ghost button--xs"
                                onClick={() => handleSelectItem(item)}
                              >
                                {t('Open')}
                              </button>
                              {canEdit ? (
                                <button
                                  type="button"
                                  className="button button--ghost button--xs is-danger"
                                  onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                                  title={t('Delete Item')}
                                  aria-label={t('Delete Item')}
                                >
                                  <svg aria-hidden="true" className="icon" style={{ width: 13, height: 13 }}>
                                    <use href="#i-trash" />
                                  </svg>
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="s3-kanban">
                {CONTENT_STATUSES.map((st) => {
                  const colItems = unassignedItems.filter((i) => i.status === st.id);
                  return (
                    <section className={`s3-kanban-col is-${st.id}`} key={st.id}>
                      <header>
                        <strong>{t(st.label)}</strong>
                        <span>{colItems.length}</span>
                      </header>
                      {colItems.map((item) => (
                        <article className="s3-kanban-card" key={item.id}>
                          <span className="s3-kanban-card__type">{t(CONTENT_TYPE_LABEL[item.type] ?? item.type)}</span>
                          <strong>{item.title}</strong>
                          <small>{formatDate(item.publishDate)}</small>
                          <button
                            type="button"
                            className="button button--ghost button--xs"
                            onClick={() => handleSelectItem(item)}
                            style={{ marginTop: 8 }}
                          >
                            {t('Open')}
                          </button>
                        </article>
                      ))}
                    </section>
                  );
                })}
              </div>
            )
          ) : (
            <p className="s3-muted" style={{ padding: '16px 20px' }}>
              {t('All content is assigned to campaigns, or no items exist yet.')}
            </p>
          )}
        </section>
      </div>
    );
  };

  /* ==========================================================================
     SCREEN 5: CAMPAIGN DETAILS
     ========================================================================== */
  const renderScreen5CampaignDetails = () => {
    return (
      <div className="s3-screen">
        <div className="s3-screen-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost button--xs"
                onClick={() => navTo('plan_details')}
              >
                ← {t('Back to Plan Details')}
              </button>
              <h2>{selectedCampaign?.name}</h2>
            </div>
            <p className="s3-muted">
              {selectedBrand?.name} · {selectedCampaign?.startDate || '—'} → {selectedCampaign?.endDate || '—'} · {selectedCampaign?.objective || t('No objective set.')}
            </p>
          </div>

          <div className="s3-head-actions">
            {canEdit ? (
              <>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setCampaignForm({
                      id: selectedCampaign?.id,
                      name: selectedCampaign?.name || '',
                      objective: selectedCampaign?.objective || '',
                      startDate: selectedCampaign?.startDate || '',
                      endDate: selectedCampaign?.endDate || '',
                    });
                    setCampaignModalOpen(true);
                  }}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-edit" />
                  </svg>
                  {t('Edit Campaign')}
                </button>
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => setCampaignToDelete({ ...selectedCampaign, relatedCount: campaignItems.length })}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-trash" />
                  </svg>
                  {t('Delete Campaign')}
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => {
                    setItemForm({ ...EMPTY_ITEM, campaignId: selectedCampaignId, publishDate: `${selectedMonth}-15` });
                    setItemModalOpen(true);
                  }}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-plus" />
                  </svg>
                  {t('Add Content Item to Campaign')}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <section className="s3-card">
          <header className="s3-card__head">
            <div>
              <span className="s3-eyebrow">{t('Campaign Items')}</span>
              <h2>{t('Items in this campaign')}</h2>
            </div>
            <StatusPill label={`${campaignItems.length} ${t('items')}`} tone="is-purple" />
          </header>

          {campaignItems.length ? (
            <div className="s3-table-wrap">
              <table className="s3-table">
                <thead>
                  <tr>
                    <th>{t('Content')}</th>
                    <th>{t('Type')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Tone of Voice')}</th>
                    <th>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="s3-item-cell">
                          <span className={`content-item__icon is-${item.type}`}>
                            <svg aria-hidden="true" className="icon">
                              <use href={item.type === 'reel' ? '#i-camera' : '#i-file'} />
                            </svg>
                          </span>
                          <span>
                            <strong>{item.title}</strong>
                            {item.caption ? (
                              <small className="s3-nowrap" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', color: '#6b7280' }}>
                                {item.caption}
                              </small>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusPill
                          label={t(CONTENT_TYPE_LABEL[item.type] ?? item.type)}
                          tone={item.type === 'reel' ? 'is-purple' : item.type === 'story' ? 'is-amber' : 'is-blue'}
                        />
                      </td>
                      <td className="s3-nowrap">{formatDate(item.publishDate)}</td>
                      <td>{item.tov || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            type="button"
                            className="button button--ghost button--xs"
                            onClick={() => handleSelectItem(item)}
                          >
                            {t('Open')}
                          </button>
                          {canEdit ? (
                            <button
                              type="button"
                              className="button button--ghost button--xs is-danger"
                              onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                              title={t('Delete Item')}
                              aria-label={t('Delete Item')}
                            >
                              <svg aria-hidden="true" className="icon" style={{ width: 13, height: 13 }}>
                                <use href="#i-trash" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="#i-layers"
              title={t('No items in this campaign')}
              text={t('Add content items to this campaign to structure your deliverables.')}
              action={
                canEdit ? (
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => {
                      setItemForm({ ...EMPTY_ITEM, campaignId: selectedCampaignId, publishDate: `${selectedMonth}-15` });
                      setItemModalOpen(true);
                    }}
                  >
                    + {t('Add Content Item to Campaign')}
                  </button>
                ) : null
              }
            />
          )}
        </section>
      </div>
    );
  };

  /* ==========================================================================
     SCREEN 6: CONTENT ITEM DETAILS / EDITOR
     ========================================================================== */
  const renderScreen6ItemDetails = () => {
    return (
      <div className="s3-screen">
        <div className="s3-screen-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="button button--ghost button--xs"
                onClick={() => (selectedCampaignId ? navTo('campaign_details') : navTo('plan_details'))}
              >
                ← {selectedCampaignId ? t('Back to Campaign') : t('Back to Plan Details')}
              </button>
              <h2>{itemForm.title || t('Content Item Details')}</h2>
            </div>
            <p className="s3-muted">
              {selectedBrand?.name} · {selectedPlatform} · {formatDate(itemForm.publishDate)}
            </p>
          </div>

          <div className="s3-head-actions">
            {canEdit ? (
              <>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={handleSaveItemDraft}
                >
                  {t('Save Draft')}
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleSaveItemDetails}
                >
                  {t('Save Changes')}
                </button>
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => setItemToDelete({ id: selectedItemId, title: itemForm.title || t('Content Item') })}
                >
                  {t('Delete Item')}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="s3-card" style={{ padding: 24 }}>
          <div className="s3-form-grid">
            <label className="s3-field s3-field--full">
              <span className="s3-field__label">{t('Title')} *</span>
              <input
                className="form-input"
                value={itemForm.title}
                onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
                disabled={!canEdit}
              />
            </label>

            <label className="s3-field">
              <span className="s3-field__label">{t('Content Type')}</span>
              <span className="form-select-wrap">
                <select
                  className="form-select"
                  value={itemForm.type}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, type: e.target.value }))}
                  disabled={!canEdit}
                >
                  <option value="post">{t('Post')}</option>
                  <option value="reel">{t('Reel')}</option>
                  <option value="story">{t('Story')}</option>
                </select>
                <svg aria-hidden="true" className="icon"><use href="#i-chevron" /></svg>
              </span>
            </label>

            <label className="s3-field">
              <span className="s3-field__label">{t('Associated Campaign')}</span>
              <span className="form-select-wrap">
                <select
                  className="form-select"
                  value={itemForm.campaignId}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, campaignId: e.target.value }))}
                  disabled={!canEdit}
                >
                  <option value="">{t('No campaign')}</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon"><use href="#i-chevron" /></svg>
              </span>
            </label>

            <label className="s3-field">
              <span className="s3-field__label">{t('Scheduled Date')}</span>
              <input
                type="date"
                className="form-input"
                value={itemForm.publishDate}
                onChange={(e) => setItemForm((prev) => ({ ...prev, publishDate: e.target.value }))}
                disabled={!canEdit}
              />
            </label>

            <label className="s3-field">
              <span className="s3-field__label">{t('Scheduled Time')}</span>
              <input
                type="time"
                className="form-input"
                value={itemForm.publishTime}
                onChange={(e) => setItemForm((prev) => ({ ...prev, publishTime: e.target.value }))}
                disabled={!canEdit}
              />
            </label>

            <label className="s3-field s3-field--full">
              <span className="s3-field__label">{t('Reference / Link')}</span>
              <input
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/..."
                value={itemForm.referenceUrl}
                onChange={(e) => setItemForm((prev) => ({ ...prev, referenceUrl: e.target.value }))}
                disabled={!canEdit}
              />
            </label>

            <label className="s3-field s3-field--full">
              <span className="s3-field__label">{t('Tone of Voice')}</span>
              <span className="form-select-wrap">
                <select
                  className="form-select"
                  value={itemForm.tov}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, tov: e.target.value }))}
                  disabled={!canEdit}
                >
                  {TOV_OPTIONS.map((tov) => (
                    <option key={tov} value={tov}>
                      {tov}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon"><use href="#i-chevron" /></svg>
              </span>
            </label>

            <label className="s3-field s3-field--full">
              <span className="s3-field__label">{t('Caption')}</span>
              <textarea
                className="form-textarea"
                rows={4}
                value={itemForm.caption}
                onChange={(e) => setItemForm((prev) => ({ ...prev, caption: e.target.value }))}
                placeholder={t('Write the post or reel caption…')}
                disabled={!canEdit}
              />
            </label>

            <label className="s3-field s3-field--full">
              <span className="s3-field__label">{t('Notes')}</span>
              <textarea
                className="form-textarea"
                rows={3}
                value={itemForm.notes}
                onChange={(e) => setItemForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder={t('Internal production notes, visual direction or reminders…')}
                disabled={!canEdit}
              />
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-screen s3-page">
      <PageHeader
        eyebrow={t('Content Management')}
        title={t('Content Management')}
        description={t(
          'Manage brands, connected platform accounts, monthly content plans, campaigns, and content deliverables.',
        )}
      />

      {renderBreadcrumbs()}

      {/* Screen Routing */}
      {screen === 'brands' && renderScreen1Brands()}
      {screen === 'brand_hub' && renderScreenBrandContentManagement()}
      {screen === 'platforms' && renderScreen2Platforms()}
      {screen === 'plans' && renderScreen3Plans()}
      {screen === 'plan_details' && renderScreen4PlanDetails()}
      {screen === 'campaign_details' && renderScreen5CampaignDetails()}
      {screen === 'item_details' && renderScreen6ItemDetails()}

      {/* MODAL: Create / Edit Plan */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={t(planForm.serverId ? 'Edit Plan' : 'New Plan')}
        subtitle={t(planForm.serverId ? 'Update this monthly content plan.' : 'Create a monthly content plan for this platform account.')}
        icon="#i-calendar"
        iconColor="blue"
        maxWidth="480px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setPlanModalOpen(false)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--primary" onClick={handleCreatePlan}>
              {t(planForm.serverId ? 'Save Changes' : 'Create Plan')}
            </button>
          </>
        }
      >
        <div className="s3-form-grid">
          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Platform Account')} *</span>
            <select
              className="form-select"
              value={planForm.platformAccountId}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, platformAccountId: e.target.value }))}
              required
            >
              <option value="">{t('Select platform account')}</option>
              {platformAccounts.map((account) => (
                <option key={account.numericId} value={String(account.numericId)}>
                  {account.name}{account.handle ? ` · ${account.handle}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Month')} (YYYY-MM) *</span>
            <input
              type="month"
              className="form-input"
              value={planForm.month}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, month: e.target.value }))}
            />
          </label>
          <label className="s3-field">
            <span className="s3-field__label">{t('Target Posts')}</span>
            <input
              type="number"
              className="form-input"
              value={planForm.postsTarget}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, postsTarget: e.target.value }))}
            />
          </label>
          <label className="s3-field">
            <span className="s3-field__label">{t('Target Reels')}</span>
            <input
              type="number"
              className="form-input"
              value={planForm.reelsTarget}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, reelsTarget: e.target.value }))}
            />
          </label>
          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Monthly Goals')}</span>
            <textarea
              className="form-input"
              value={planForm.monthlyGoals}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, monthlyGoals: e.target.value }))}
              rows={3}
            />
          </label>
        </div>
      </Modal>

      {/* MODAL: Delete Plan Warning Dialog */}
      <Modal
        isOpen={Boolean(planToDelete)}
        onClose={() => setPlanToDelete(null)}
        title={t('Delete plan?')}
        subtitle={planToDelete ? monthLabel(planToDelete.month) : ''}
        icon="#i-trash"
        iconColor="amber"
        maxWidth="460px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setPlanToDelete(null)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--danger" onClick={confirmDeletePlan}>
              {t('Delete Plan')}
            </button>
          </>
        }
      >
        <p className="modal-copy">
          {t('This Content Plan has related Campaigns and Content Items. Deleting it may affect related data. Do you want to continue?')}
        </p>
      </Modal>

      {/* MODAL: Create / Edit Campaign */}
      <Modal
        isOpen={campaignModalOpen}
        onClose={() => setCampaignModalOpen(false)}
        title={campaignForm.id ? t('Edit Campaign') : t('New campaign')}
        subtitle={campaignForm.id ? t('Update campaign details and duration.') : t('Group related content items under one campaign.')}
        icon="#i-layers"
        iconColor="purple"
        maxWidth="520px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setCampaignModalOpen(false)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--primary" onClick={handleSaveCampaign}>
              {campaignForm.id ? t('Save Changes') : t('Create campaign')}
            </button>
          </>
        }
      >
        <div className="s3-form-grid">
          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Campaign name')} *</span>
            <input
              className="form-input"
              value={campaignForm.name}
              onChange={(e) => {
                setCampaignForm((prev) => ({ ...prev, name: e.target.value }));
                setCampaignError('');
              }}
              placeholder="Always-On Care"
            />
            {campaignError ? <span className="set-error">{campaignError}</span> : null}
          </label>

          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Objective')}</span>
            <textarea
              className="form-textarea"
              rows={2}
              value={campaignForm.objective}
              onChange={(e) => setCampaignForm((prev) => ({ ...prev, objective: e.target.value }))}
              placeholder={t('What the campaign should achieve…')}
            />
          </label>

          <label className="s3-field">
            <span className="s3-field__label">{t('Start date')}</span>
            <input
              type="date"
              className="form-input"
              value={campaignForm.startDate}
              onChange={(e) => setCampaignForm((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </label>

          <label className="s3-field">
            <span className="s3-field__label">{t('End date')}</span>
            <input
              type="date"
              className="form-input"
              value={campaignForm.endDate}
              onChange={(e) => setCampaignForm((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </label>
        </div>
      </Modal>

      {/* MODAL: Delete Content Item Warning Dialog */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title={t('Delete content item?')}
        subtitle={itemToDelete?.title}
        icon="#i-trash"
        iconColor="amber"
        maxWidth="460px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setItemToDelete(null)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--danger" onClick={confirmDeleteItem}>
              {t('Delete Content Item')}
            </button>
          </>
        }
      >
        <p className="modal-copy">
          {t('Are you sure you want to delete this content item? This action cannot be undone.')}
        </p>
      </Modal>

      {/* MODAL: Delete Campaign Warning Dialog */}
      <Modal
        isOpen={Boolean(campaignToDelete)}
        onClose={() => setCampaignToDelete(null)}
        title={t('Delete campaign?')}
        subtitle={campaignToDelete?.name}
        icon="#i-trash"
        iconColor="amber"
        maxWidth="460px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setCampaignToDelete(null)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--danger" onClick={confirmDeleteCampaign}>
              {t('Delete Campaign')}
            </button>
          </>
        }
      >
        <p className="modal-copy">
          {t('This Campaign has related Content Items. Deleting it may affect related data. Do you want to continue?')}
        </p>
      </Modal>

      {/* MODAL: Create Content Item */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={t('Create Content Item')}
        subtitle={t('Add a new post, reel, or story to this plan.')}
        icon="#i-file"
        iconColor="orange"
        maxWidth="500px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setItemModalOpen(false)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--primary" onClick={handleCreateContentItem}>
              {t('Create Content Item')}
            </button>
          </>
        }
      >
        <div className="s3-form-grid">
          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Title')} *</span>
            <input
              className="form-input"
              value={itemForm.title}
              onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={t('Enter content title…')}
            />
          </label>

          <label className="s3-field">
            <span className="s3-field__label">{t('Content Type')}</span>
            <span className="form-select-wrap">
              <select
                className="form-select"
                value={itemForm.type}
                onChange={(e) => setItemForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="post">{t('Post')}</option>
                <option value="reel">{t('Reel')}</option>
                <option value="story">{t('Story')}</option>
              </select>
              <svg aria-hidden="true" className="icon"><use href="#i-chevron" /></svg>
            </span>
          </label>

          <label className="s3-field">
            <span className="s3-field__label">{t('Scheduled Date')}</span>
            <input
              type="date"
              className="form-input"
              value={itemForm.publishDate}
              onChange={(e) => setItemForm((prev) => ({ ...prev, publishDate: e.target.value }))}
            />
          </label>
        </div>
      </Modal>

      {/* MODAL: Delete Content Item Warning Dialog */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title={t('Delete content item?')}
        subtitle={itemToDelete?.title}
        icon="#i-trash"
        iconColor="amber"
        maxWidth="460px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setItemToDelete(null)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--danger" onClick={confirmDeleteItem}>
              {t('Delete Content Item')}
            </button>
          </>
        }
      >
        <p className="modal-copy">
          {t('Are you sure you want to delete this content item? This action cannot be undone.')}
        </p>
      </Modal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
