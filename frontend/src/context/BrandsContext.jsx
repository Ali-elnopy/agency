import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useSprint3 } from './sprint3Store';
import { useWorkspace } from './workspaceStore';
import { BrandsContext } from './brandsStore';
import {
  seedBrands,
  seedContent,
  seedPlans,
  initialsOf,
  monthKey,
  timezoneLabelFor,
} from '../data/brands';
import {
  createBrand as createBrandApi,
  deleteBrand as deleteBrandApi,
  listBrands,
  updateBrand as updateBrandApi,
} from '../services/brands';
import { apiRequest } from '../services/http';
import {
  createContentItemApi,
  deleteContentItemApi,
  updateContentItemApi,
} from '../services/contentManagementApi';

/* Brand records, platform accounts, content plans and content items live in the
   API. Local state keeps the UI responsive and is reconciled with the server
   response; only genuinely local fields (targets, pipeline status) stay local. */

const STORAGE_KEYS = {
  brands: 'orvia_brands_v1',
  plans: 'orvia_brand_plans_v1',
  content: 'orvia_brand_content_v1',
  workspace: 'orvia_brand_workspace_v1',
};

function emptyWorkspace() {
  return {
    platforms: [],
    briefs: [],
    assets: [],
    strategies: [],
    planDirections: [],
    briefInfo: {},
    teams: {},
  };
}

function readWorkspace() {
  const fallback = emptyWorkspace();

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.workspace);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;

    return {
      platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [],
      briefs: Array.isArray(parsed.briefs) ? parsed.briefs : [],
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      strategies: Array.isArray(parsed.strategies) ? parsed.strategies : [],
      planDirections: Array.isArray(parsed.planDirections) ? parsed.planDirections : [],
      briefInfo:
        parsed.briefInfo && typeof parsed.briefInfo === 'object' ? parsed.briefInfo : {},
      teams: parsed.teams && typeof parsed.teams === 'object' ? parsed.teams : {},
    };
  } catch {
    return fallback;
  }
}

const TONES = ['is-purple', 'is-blue', 'is-pink', 'is-amber', 'is-gray', 'is-orange'];

function readStore(key, fallback) {
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

function writeStore(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode; the in-memory workspace
    // still works for the current session.
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function BrandsProvider({ children }) {
  const { user } = useAuth();
  const { role } = useSprint3();
  const workspaceContext = useWorkspace();
  const teams = workspaceContext?.teams || [];
  const workspaceUsers = workspaceContext?.users || [];
  const demo = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';

  const [brands, setBrands] = useState(() => {
    const stored = readStore(STORAGE_KEYS.brands, null);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    return seedBrands;
  });
  const [plans, setPlans] = useState(() => readStore(STORAGE_KEYS.plans, seedPlans));
  const [content, setContent] = useState(() => readStore(STORAGE_KEYS.content, seedContent));
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [loadingBrands] = useState(false);
  const [brandsError] = useState(null);

  const accessibleBrandIds = useMemo(() => {
    if (!user) return new Set(brands.map((b) => b.id));
    const roleUpper = String(user.role || '').toUpperCase();
    const accessLower = String(user.systemAccess || '').toLowerCase();
    const emailLower = String(user.email || '').toLowerCase();

    // 1. Administrators have global visibility across all brands
    if (roleUpper === 'ADMIN' || accessLower === 'admin' || role === 'admin') {
      return new Set(brands.map((b) => b.id));
    }

    // 2. Clients only see their own assigned brand
    if (roleUpper === 'CLIENT' || role === 'client') {
      const clientBrand = brands.find((b) => b.id === user.brandId) || brands[0];
      return new Set(clientBrand ? [clientBrand.id] : ['brand-1']);
    }

    // 3. Collect all teams the user belongs to (multi-team support)
    const userTeamIds = new Set();
    if (Array.isArray(user.teamIds)) {
      user.teamIds.forEach((id) => userTeamIds.add(String(id)));
    }
    if (user.teamId) {
      userTeamIds.add(String(user.teamId));
    }

    const dirUser = workspaceUsers.find(
      (u) => u.email?.toLowerCase() === emailLower || String(u.id) === String(user.id),
    );
    if (dirUser) {
      if (Array.isArray(dirUser.teamIds)) {
        dirUser.teamIds.forEach((id) => userTeamIds.add(String(id)));
      }
      if (dirUser.teamId) {
        userTeamIds.add(String(dirUser.teamId));
      }
    }

    teams.forEach((team) => {
      if (
        Array.isArray(team.memberIds) &&
        (team.memberIds.includes(user.id) || (dirUser && team.memberIds.includes(dirUser.id)))
      ) {
        userTeamIds.add(String(team.id));
      }
    });

    // Default portfolio assignment for standard roles & demo accounts
    if (emailLower === 'employee@orvia.com' || roleUpper === 'CONTENT_CREATOR' || role === 'employee') {
      userTeamIds.add('team-1');
      userTeamIds.add('team-4');
    } else if (emailLower === 'creator@orvia.com' || roleUpper === 'CREATOR' || role === 'creator') {
      userTeamIds.add('team-2');
      userTeamIds.add('team-3');
    } else if (emailLower === 'am@orvia.com' || roleUpper === 'ACCOUNT_MANAGER' || role === 'account_manager') {
      userTeamIds.add('team-1');
      userTeamIds.add('team-4');
    }

    const allowed = new Set();

    teams.forEach((team) => {
      if (userTeamIds.has(String(team.id))) {
        if (Array.isArray(team.brandIds)) {
          team.brandIds.forEach((bid) => allowed.add(String(bid)));
        }
      }
    });

    brands.forEach((brand) => {
      if (
        (brand.managerEmail && brand.managerEmail.toLowerCase() === emailLower) ||
        (brand.manager && user.fullName && brand.manager.toLowerCase() === user.fullName.toLowerCase())
      ) {
        allowed.add(String(brand.id));
      }
    });

    // Explicit portfolio guarantees for standard demo users
    if (emailLower === 'employee@orvia.com') {
      ['brand-1', 'brand-4', 'brand-6'].forEach((id) => allowed.add(id));
    } else if (emailLower === 'creator@orvia.com') {
      ['brand-2', 'brand-3', 'brand-5', 'brand-7'].forEach((id) => allowed.add(id));
    } else if (emailLower === 'am@orvia.com') {
      ['brand-1', 'brand-3', 'brand-7', 'brand-8'].forEach((id) => allowed.add(id));
    }

    return allowed.size > 0 ? allowed : new Set(brands.map((b) => b.id));
  }, [brands, user, role, teams, workspaceUsers]);

  const scopedBrands = useMemo(() => {
    return brands.filter((brand) => accessibleBrandIds.has(String(brand.id)));
  }, [brands, accessibleBrandIds]);

  const scopedPlans = useMemo(() => {
    return plans.filter((plan) => accessibleBrandIds.has(String(plan.brandId)));
  }, [plans, accessibleBrandIds]);

  const scopedContent = useMemo(() => {
    return content.filter((item) => accessibleBrandIds.has(String(item.brandId)));
  }, [content, accessibleBrandIds]);

  useEffect(() => {
    writeStore(STORAGE_KEYS.brands, brands);
  }, [brands]);

  useEffect(() => {
    writeStore(STORAGE_KEYS.plans, plans);
  }, [plans]);

  useEffect(() => {
    writeStore(STORAGE_KEYS.content, content);
  }, [content]);

  useEffect(() => {
    writeStore(STORAGE_KEYS.workspace, workspace);
  }, [workspace]);

  useEffect(() => {
    let alive = true;

    listBrands()
      .then((records) => {
        if (alive && Array.isArray(records) && records.length) {
          setBrands(records);
        }
      })
      .catch(() => {
        // Keeps local seedBrands active if backend is offline
      });

    return () => {
      alive = false;
    };
  }, []);

  // Platform accounts are owned by the API. Hydrate them once so every brand
  // workspace shows the server records; local-only records (created while the
  // API was unreachable) are kept instead of being dropped.
  useEffect(() => {
    if (demo) return undefined;

    let alive = true;

    apiRequest('/platform-accounts')
      .then((res) => {
        const records = res?.data?.accounts;
        if (!alive || !Array.isArray(records)) return;

        setWorkspace((prev) => {
          const server = records.map((item) => ({
            id: String(item.id),
            serverId: item.id,
            brandId: String(item.brandId),
            name: item.platform,
            short: String(item.platform || '').slice(0, 2).toUpperCase(),
            tone: TONES[Number(item.id) % TONES.length],
            handle: item.accountName,
            url: item.accountUrl ?? '',
            goal: '',
            monthlyTarget: 0,
            contentTypes: [],
            notes: '',
            createdAt: item.createdAt,
          }));

          const serverIds = new Set(server.map((item) => item.id));
          const localOnly = (prev.platforms || []).filter(
            (item) => !serverIds.has(String(item.id)),
          );

          return { ...prev, platforms: [...server, ...localOnly] };
        });
      })
      .catch(() => {
        // Offline demo: keep the locally stored platforms.
      });

    return () => {
      alive = false;
    };
  }, [demo]);

  // Content plans and their items are stored by the API. Hydrate them for the
  // real brands; anything created locally (offline) is kept alongside.
  useEffect(() => {
    if (demo) return undefined;

    let alive = true;

    Promise.all([
      apiRequest('/content-plans').catch(() => null),
      apiRequest('/content-items').catch(() => null),
    ]).then(([plansRes, itemsRes]) => {
      if (!alive) return;

      const serverPlans = plansRes?.data?.plans;
      const serverItems = itemsRes?.data?.items;

      if (Array.isArray(serverPlans) && serverPlans.length) {
        setPlans((prev) => {
          const mapped = serverPlans.map((plan) => {
            const notes = String(plan.notes || '');
            const posts = Number(notes.match(/Posts target:\s*(\d+)/i)?.[1] || 0);
            const reels = Number(notes.match(/Reels target:\s*(\d+)/i)?.[1] || 0);

            return {
              id: `plan-${plan.brandId}-${plan.year}-${String(plan.month).padStart(2, '0')}`,
              serverId: plan.id,
              brandId: String(plan.brandId),
              month: `${plan.year}-${String(plan.month).padStart(2, '0')}`,
              postsTarget: posts,
              reelsTarget: reels,
              status: plan.status,
              title: plan.title,
              createdAt: plan.createdAt,
            };
          });

          const localOnly = prev.filter(
            (plan) => !mapped.some((item) => item.id === plan.id),
          );

          return [...mapped, ...localOnly];
        });
      }

      if (Array.isArray(serverItems) && serverItems.length && Array.isArray(serverPlans)) {
        const planIndex = new Map(serverPlans.map((plan) => [plan.id, plan]));

        const mapped = serverItems.reduce((rows, item) => {
          const plan = planIndex.get(item.contentPlanId);
          if (!plan) return rows;

          const scheduled = item.scheduledDate ? new Date(item.scheduledDate) : null;
          const iso = scheduled && !Number.isNaN(scheduled.getTime())
            ? scheduled.toISOString()
            : '';

          rows.push({
            id: `content-${item.id}`,
            serverId: item.id,
            brandId: String(plan.brandId),
            month: `${plan.year}-${String(plan.month).padStart(2, '0')}`,
            platformId: null,
            planDirectionId: null,
            type: item.type,
            title: item.title,
            publishDate: iso.slice(0, 10),
            publishTime: iso ? iso.slice(11, 16) : '',
            tov: item.toneOfVoice ?? '',
            caption: item.caption ?? '',
            notes: item.notes ?? '',
            designDirection: '',
            referenceUrl:
              typeof item.reference === 'string' && /^https?:\/\//i.test(item.reference)
                ? item.reference
                : '',
            materialUrl: '',
            pillar: '',
            campaignId: item.campaignId ? String(item.campaignId) : '',
            platform: '',
            keyMessage: '',
            references: [],
            attachments: [],
            detailsStatus: 'draft',
            status: 'planned',
            createdAt: iso || item.createdAt,
          });

          return rows;
        }, []);

        if (mapped.length) {
          setContent((prev) => {
            const serverIds = new Set(mapped.map((row) => row.id));
            return [...mapped, ...prev.filter((row) => !serverIds.has(row.id))];
          });
        }
      }
    });

    return () => {
      alive = false;
    };
  }, [demo]);

  const addBrand = useCallback(
    async (input) => {
      const name = String(input.name ?? '').trim();

      if (!demo) {
        try {
          const brand = await createBrandApi(input);
          if (brand && brand.id) {
            setBrands((prev) => [brand, ...prev]);
            return brand;
          }
        } catch {
          // Fallback to local creation if backend offline
        }
      }

      const brand = {
        id: makeId('brand'),
        name,
        initials: initialsOf(name),
        tone: TONES[brands.length % TONES.length],
        verified: false,
        industry: String(input.industry ?? '').trim(),
        description: String(input.description ?? '').trim(),
        country: input.country ?? '',
        timezone: input.timezone ?? '',
        timezoneLabel: input.timezoneLabel || timezoneLabelFor(input.timezone),
        website: String(input.website ?? '').trim(),
        driveFolderUrl: String(input.driveFolderUrl ?? '').trim(),
        manager: 'Elena Vance',
        managerInitials: 'EV',
        managerEmail: 'am@orvia.com',
        managerRole: 'Account Manager',
        team: 'Brand Strategy & Growth',
        teamMembers: '3 members',
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        contactName: '',
        contactRole: '',
        contactEmail: '',
        contactPhone: '',
      };

      setBrands((prev) => [brand, ...prev]);
      return brand;
    },
    [brands.length, demo],
  );

  const deleteBrand = useCallback(
    async (brandId) => {
      if (!demo) {
        try {
          await deleteBrandApi(brandId);
        } catch {
          // Fallback
        }
      }

      setBrands((prev) => prev.filter((brand) => brand.id !== brandId));
      setPlans((prev) => prev.filter((plan) => plan.brandId !== brandId));
      setContent((prev) => prev.filter((item) => item.brandId !== brandId));
      setWorkspace((prev) => {
        const briefInfo = { ...prev.briefInfo };
        const teams = { ...prev.teams };
        delete briefInfo[brandId];
        delete teams[brandId];

        return {
          ...prev,
          briefInfo,
          teams,
          platforms: prev.platforms.filter((item) => item.brandId !== brandId),
          briefs: prev.briefs.filter((item) => item.brandId !== brandId),
          assets: prev.assets.filter((item) => item.brandId !== brandId),
          strategies: prev.strategies.filter((item) => item.brandId !== brandId),
          planDirections: prev.planDirections.filter((item) => item.brandId !== brandId),
        };
      });
    },
    [demo],
  );

  const updateBrand = useCallback(
    async (brandId, patch) => {
      if (!demo) {
        const brand = await updateBrandApi(brandId, patch);
        setBrands((prev) =>
          prev.map((item) => (item.id === brand.id ? { ...item, ...brand, ...patch } : item)),
        );
        return brand;
      }

      setBrands((prev) =>
        prev.map((item) => (item.id === brandId ? { ...item, ...patch } : item)),
      );

      return { ...(brands.find((item) => item.id === brandId) ?? {}), ...patch };
    },
    [brands, demo],
  );

  const savePlan = useCallback(
    async (input) => {
      const brandId = input.brandId;
      const month = input.month || monthKey();
      const numericBrandId = Number(brandId);
      let serverPlanId = null;

      if (!demo && Number.isSafeInteger(numericBrandId) && numericBrandId > 0) {
        try {
          const [yearStr, monthStr] = (month || '').split('-');
          const parsedYear = Number(yearStr) || new Date().getFullYear();
          const parsedMonth = Number(monthStr) || new Date().getMonth() + 1;

          const plansRes = await apiRequest(
            `/content-plans?brandId=${numericBrandId}&year=${parsedYear}&month=${parsedMonth}`,
          ).catch(() => null);

          // The endpoint answers with `{ plans, total }`, not a bare array.
          const existingPlans = plansRes?.data?.plans;

          const notes = `Posts target: ${input.postsTarget || 0}, Reels target: ${input.reelsTarget || 0}`;

          if (Array.isArray(existingPlans) && existingPlans.length > 0) {
            const planId = existingPlans[0].id;
            serverPlanId = planId;
            await apiRequest(`/content-plans/${planId}`, {
              method: 'PATCH',
              body: { title: `${month} Content Plan`, notes },
            }).catch((error) => {
              console.warn('Content plan update was not saved:', error?.message || error);
            });
          } else {
            // A plan needs a platform account; use the brand's first one.
            const accountsRes = await apiRequest(
              `/platform-accounts?brandId=${numericBrandId}`,
            ).catch(() => null);
            const accounts = accountsRes?.data?.accounts;
            const platformAccountId = accounts?.[0]?.id;

            if (platformAccountId) {
              const createdPlan = await apiRequest('/content-plans', {
                method: 'POST',
                body: {
                  brandId: numericBrandId,
                  platformAccountId,
                  title: `${month} Content Plan`,
                  year: parsedYear,
                  month: parsedMonth,
                  notes,
                },
              }).catch((error) => {
                console.warn('Content plan creation was not saved:', error?.message || error);
                return null;
              });

              const created = createdPlan?.data ?? createdPlan;
              serverPlanId = created?.id ?? created?.plan?.id ?? null;
            } else {
              console.warn(
                'Content plan stays local: this brand has no platform account yet.',
              );
            }
          }
        } catch (err) {
          console.warn('Backend plan sync note:', err?.message || err);
        }
      }

      const plan = {
        id: `plan-${brandId}-${month}`,
        serverId: serverPlanId,
        brandId,
        month,
        postsTarget: Math.max(0, Number(input.postsTarget) || 0),
        reelsTarget: Math.max(0, Number(input.reelsTarget) || 0),
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setPlans((prev) => {
        const index = prev.findIndex((item) => item.brandId === brandId && item.month === month);

        if (index === -1) return [...prev, plan];

        const next = [...prev];
        next[index] = { ...next[index], ...plan, createdAt: next[index].createdAt };
        return next;
      });

      return plan;
    },
    [demo],
  );

  const addContent = useCallback((input) => {
    const item = {
      id: makeId('content'),
      brandId: input.brandId,
      month: input.month,
      platformId: input.platformId ?? null,
      planDirectionId: input.planDirectionId ?? null,
      type: input.type,
      title: String(input.title ?? '').trim(),
      publishDate: input.publishDate,
      publishTime: input.publishTime,
      tov: input.tov,
      caption: String(input.caption ?? '').trim(),
      notes: String(input.notes ?? '').trim(),
      designDirection: String(input.designDirection ?? '').trim(),
      referenceUrl: String(input.referenceUrl ?? '').trim(),
      materialUrl: String(input.materialUrl ?? '').trim(),
      pillar: String(input.pillar ?? '').trim(),
      campaignId: input.campaignId ?? '',
      platform: String(input.platform ?? '').trim(),
      keyMessage: String(input.keyMessage ?? '').trim(),
      references: Array.isArray(input.references) ? input.references : [],
      attachments: Array.isArray(input.attachments) ? input.attachments : [],
      detailsStatus: input.detailsStatus ?? 'draft',
      status: 'planned',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setContent((prev) => [item, ...prev]);

    // Content items belong to a content plan on the server. When this month's
    // plan has no server id yet (no platform account / offline) the item stays
    // local instead of failing loudly in the middle of the form.
    const planServerId = plans.find(
      (plan) => plan.brandId === item.brandId && plan.month === item.month,
    )?.serverId;

    if (!demo && planServerId) {
      const payload = {
        contentPlanId: planServerId,
        type: item.type,
        title: item.title,
        scheduledDate: item.publishDate
          ? `${item.publishDate}T${item.publishTime || '09:00'}:00`
          : new Date().toISOString(),
        reference: item.referenceUrl || null,
        toneOfVoice: item.tov || null,
        caption: item.caption || null,
        notes: item.notes || null,
      };

      const numericCampaignId = Number(item.campaignId);
      if (Number.isSafeInteger(numericCampaignId) && numericCampaignId > 0) {
        payload.campaignId = numericCampaignId;
      }

      createContentItemApi(payload)
        .then((response) => {
          const created = response?.data ?? response;
          if (!created?.id) return;
          setContent((prev) =>
            prev.map((row) => (row.id === item.id ? { ...row, serverId: created.id } : row)),
          );
        })
        .catch((error) => {
          console.warn('Content item was saved locally only:', error?.message || error);
        });
    }

    return item;
  }, [demo, plans]);

  const updateContent = useCallback((contentId, patch) => {
    setContent((prev) =>
      prev.map((item) => (item.id === contentId ? { ...item, ...patch } : item)),
    );

    if (demo) return;

    const current = content.find((item) => item.id === contentId);
    if (!current?.serverId) return;

    // Only the columns the API owns are sent; pipeline status and targets are
    // workspace-local fields that the content items table does not store.
    const payload = {};
    if (patch.title !== undefined) payload.title = String(patch.title).trim();
    if (patch.type !== undefined) payload.type = patch.type;
    if (patch.caption !== undefined) payload.caption = patch.caption || null;
    if (patch.notes !== undefined) payload.notes = patch.notes || null;
    if (patch.tov !== undefined) payload.toneOfVoice = patch.tov || null;
    if (patch.referenceUrl !== undefined) payload.reference = patch.referenceUrl || null;
    if (patch.publishDate !== undefined || patch.publishTime !== undefined) {
      const date = patch.publishDate ?? current.publishDate;
      const time = patch.publishTime ?? current.publishTime;
      if (date) payload.scheduledDate = `${date}T${time || '09:00'}:00`;
    }
    if (patch.campaignId !== undefined) {
      const numericCampaignId = Number(patch.campaignId);
      payload.campaignId =
        Number.isSafeInteger(numericCampaignId) && numericCampaignId > 0
          ? numericCampaignId
          : null;
    }

    if (Object.keys(payload).length === 0) return;

    updateContentItemApi(current.serverId, payload).catch((error) => {
      console.warn('Content item update was not saved:', error?.message || error);
    });
  }, [content, demo]);

  // The content items table has no workflow status column (status lives on the
  // generated tasks), so this stays a local pipeline state.
  const updateContentStatus = useCallback((contentId, status) => {
    setContent((prev) =>
      prev.map((item) => (item.id === contentId ? { ...item, status } : item)),
    );
  }, []);

  const deleteContent = useCallback((contentId) => {
    const current = content.find((item) => item.id === contentId);

    setContent((prev) => prev.filter((item) => item.id !== contentId));

    if (!demo && current?.serverId) {
      deleteContentItemApi(current.serverId).catch((error) => {
        console.warn('Content item was only removed locally:', error?.message || error);
      });
    }
  }, [content, demo]);

  const getBrand = useCallback(
    (brandId) => brands.find((brand) => brand.id === brandId) ?? null,
    [brands],
  );

  const getPlan = useCallback(
    (brandId, month) =>
      plans.find((plan) => plan.brandId === brandId && plan.month === month) ?? null,
    [plans],
  );

  /* ------------------------------------------------------------------ *
   * Brand workspace: platforms, briefs, assets, strategy, plan
   * directions and brand-level team membership. Kept in localStorage so
   * every screen of the brand page reads the same records.
   * ------------------------------------------------------------------ */

  const getPlatforms = useCallback(
    (brandId) => workspace.platforms.filter((item) => item.brandId === brandId),
    [workspace.platforms],
  );

  const getBriefs = useCallback(
    (brandId) => workspace.briefs.filter((item) => item.brandId === brandId),
    [workspace.briefs],
  );

  const getAssets = useCallback(
    (brandId) => workspace.assets.filter((item) => item.brandId === brandId),
    [workspace.assets],
  );

  const getStrategies = useCallback(
    (brandId) => workspace.strategies.filter((item) => item.brandId === brandId),
    [workspace.strategies],
  );

  const getPlanDirections = useCallback(
    (brandId) => workspace.planDirections.filter((item) => item.brandId === brandId),
    [workspace.planDirections],
  );

  const getBriefInfo = useCallback(
    (brandId) => workspace.briefInfo[brandId] ?? {},
    [workspace.briefInfo],
  );

  const getBrandTeam = useCallback(
    (brandId) => workspace.teams[brandId] ?? [],
    [workspace.teams],
  );

  const addPlatform = useCallback(
    async (brandId, input) => {
      let serverPlatform = null;
      const numericBrandId = Number(brandId);
      if (!demo && Number.isSafeInteger(numericBrandId) && numericBrandId > 0) {
        try {
          const accountName =
            String(input.handle ?? '').trim() ||
            String(input.name ?? '').trim() ||
            'Account';

          const payload = {
            brandId: numericBrandId,
            platform: String(input.name ?? '').trim().slice(0, 30) || 'Instagram',
            accountName: accountName.slice(0, 200),
          };

          const url = String(input.url ?? '').trim();
          if (url && /^https?:\/\//i.test(url)) {
            payload.accountUrl = url;
          }

          const res = await apiRequest('/platform-accounts', {
            method: 'POST',
            body: payload,
          });
          serverPlatform = res?.data ?? res;
        } catch (e) {
          console.warn('Backend platform sync note:', e?.message || e);
        }
      }

      const platform = {
        id: serverPlatform?.id ? String(serverPlatform.id) : makeId('platform'),
        brandId,
        name: String(input.name ?? '').trim(),
        short: String(input.short ?? '').trim().toUpperCase(),
        tone: input.tone ?? 'is-orange',
        handle: String(input.handle ?? '').trim(),
        url: String(input.url ?? '').trim(),
        goal: String(input.goal ?? '').trim(),
        monthlyTarget: Math.max(0, Number(input.monthlyTarget) || 0),
        contentTypes: Array.isArray(input.contentTypes) ? input.contentTypes : [],
        notes: String(input.notes ?? '').trim(),
        createdAt: new Date().toISOString(),
      };

      setWorkspace((prev) => ({ ...prev, platforms: [...prev.platforms, platform] }));
      return platform;
    },
    [demo],
  );

  const updatePlatform = useCallback(
    async (platformId, patch) => {
      const numericId = Number(platformId);
      if (!demo && Number.isSafeInteger(numericId) && numericId > 0) {
        const body = {};
        if (patch.name) body.platform = String(patch.name).trim().slice(0, 30);
        if (patch.handle) body.accountName = String(patch.handle).trim().slice(0, 200);

        if (patch.url !== undefined) {
          const url = String(patch.url ?? '').trim();
          body.accountUrl = /^https?:\/\//i.test(url) ? url : null;
        }

        if (Object.keys(body).length) {
          await apiRequest(`/platform-accounts/${numericId}`, {
            method: 'PATCH',
            body,
          }).catch((error) => {
            console.warn('Platform account update was not saved:', error?.message || error);
          });
        }
      }

      setWorkspace((prev) => ({
        ...prev,
        platforms: prev.platforms.map((item) =>
          item.id === platformId ? { ...item, ...patch } : item,
        ),
      }));
    },
    [demo],
  );

  const deletePlatform = useCallback(
    async (platformId) => {
      const numericId = Number(platformId);
      if (!demo && Number.isSafeInteger(numericId) && numericId > 0) {
        await apiRequest(`/platform-accounts/${numericId}`, { method: 'DELETE' }).catch(() => {});
      }

      setWorkspace((prev) => ({
        ...prev,
        platforms: prev.platforms.filter((item) => item.id !== platformId),
        planDirections: prev.planDirections.filter((item) => item.platformId !== platformId),
      }));
    },
    [demo],
  );

  const addBrief = useCallback((brandId, meta) => {
    const brief = {
      id: makeId('brief'),
      brandId,
      ...meta,
      uploadedAt: new Date().toISOString(),
    };

    setWorkspace((prev) => ({ ...prev, briefs: [...prev.briefs, brief] }));
    return brief;
  }, []);

  const deleteBrief = useCallback((briefId) => {
    setWorkspace((prev) => ({
      ...prev,
      briefs: prev.briefs.filter((item) => item.id !== briefId),
    }));
  }, []);

  const addAsset = useCallback((brandId, meta) => {
    const asset = {
      id: makeId('asset'),
      brandId,
      category: meta.category ?? 'other',
      ...meta,
      uploadedAt: new Date().toISOString(),
    };

    setWorkspace((prev) => ({ ...prev, assets: [...prev.assets, asset] }));
    return asset;
  }, []);

  const deleteAsset = useCallback((assetId) => {
    setWorkspace((prev) => ({
      ...prev,
      assets: prev.assets.filter((item) => item.id !== assetId),
    }));
  }, []);

  const saveBriefInfo = useCallback((brandId, patch) => {
    setWorkspace((prev) => ({
      ...prev,
      briefInfo: {
        ...prev.briefInfo,
        [brandId]: { ...(prev.briefInfo[brandId] ?? {}), ...patch },
      },
    }));
  }, []);

  const saveStrategy = useCallback((input) => {
    const now = new Date().toISOString();

    setWorkspace((prev) => {
      if (input.id) {
        const patch = Object.fromEntries(
          Object.entries(input).filter(([, value]) => value !== undefined),
        );

        return {
          ...prev,
          strategies: prev.strategies.map((item) =>
            item.id === input.id ? { ...item, ...patch, updatedAt: now } : item,
          ),
        };
      }

      const strategy = {
        id: makeId('strategy'),
        brandId: input.brandId,
        title: String(input.title ?? '').trim(),
        body: String(input.body ?? '').trim(),
        status: input.status ?? 'draft',
        authorName: String(input.authorName ?? '').trim(),
        reviewerName: '',
        reviewerNote: '',
        createdAt: now,
        updatedAt: now,
      };

      return { ...prev, strategies: [...prev.strategies, strategy] };
    });
  }, []);

  const deleteStrategy = useCallback((strategyId) => {
    setWorkspace((prev) => ({
      ...prev,
      strategies: prev.strategies.filter((item) => item.id !== strategyId),
    }));
  }, []);

  const setStrategyStatus = useCallback((strategyId, status, note = '', reviewerName = '') => {
    setWorkspace((prev) => ({
      ...prev,
      strategies: prev.strategies.map((item) =>
        item.id === strategyId
          ? {
              ...item,
              status,
              reviewerNote: note,
              reviewerName: reviewerName || item.reviewerName,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    }));
  }, []);

  const savePlanDirection = useCallback((input) => {
    const now = new Date().toISOString();

    setWorkspace((prev) => {
      if (input.id) {
        return {
          ...prev,
          planDirections: prev.planDirections.map((item) =>
            item.id === input.id ? { ...item, ...input, updatedAt: now } : item,
          ),
        };
      }

      const direction = {
        id: makeId('direction'),
        brandId: input.brandId,
        platformId: input.platformId ?? null,
        month: input.month,
        title: String(input.title ?? '').trim(),
        body: String(input.body ?? '').trim(),
        status: input.status ?? 'draft',
        createdAt: now,
        updatedAt: now,
      };

      return { ...prev, planDirections: [...prev.planDirections, direction] };
    });
  }, []);

  const deletePlanDirection = useCallback((directionId) => {
    setWorkspace((prev) => ({
      ...prev,
      planDirections: prev.planDirections.filter((item) => item.id !== directionId),
    }));
  }, []);

  const setBrandTeam = useCallback((brandId, userIds) => {
    setWorkspace((prev) => ({
      ...prev,
      teams: { ...prev.teams, [brandId]: Array.from(new Set(userIds ?? [])) },
    }));
  }, []);

  const value = useMemo(
    () => ({
      brands: scopedBrands,
      allBrands: brands,
      plans: scopedPlans,
      allPlans: plans,
      content: scopedContent,
      allContent: content,
      loading: loadingBrands,
      error: brandsError,
      addBrand,
      deleteBrand,
      updateBrand,
      savePlan,
      addContent,
      updateContent,
      deleteContent,
      updateContentStatus,
      getBrand,
      getPlan,
      getPlatforms,
      getBriefs,
      getAssets,
      getStrategies,
      getPlanDirections,
      getBriefInfo,
      getBrandTeam,
      addPlatform,
      updatePlatform,
      deletePlatform,
      addBrief,
      deleteBrief,
      addAsset,
      deleteAsset,
      saveBriefInfo,
      saveStrategy,
      deleteStrategy,
      setStrategyStatus,
      savePlanDirection,
      deletePlanDirection,
      setBrandTeam,
    }),
    [
      scopedBrands,
      scopedPlans,
      scopedContent,
      brands,
      plans,
      content,
      loadingBrands,
      brandsError,
      addBrand,
      deleteBrand,
      updateBrand,
      savePlan,
      addContent,
      updateContent,
      deleteContent,
      updateContentStatus,
      getBrand,
      getPlan,
      getPlatforms,
      getBriefs,
      getAssets,
      getStrategies,
      getPlanDirections,
      getBriefInfo,
      getBrandTeam,
      addPlatform,
      updatePlatform,
      deletePlatform,
      addBrief,
      deleteBrief,
      addAsset,
      deleteAsset,
      saveBriefInfo,
      saveStrategy,
      deleteStrategy,
      setStrategyStatus,
      savePlanDirection,
      deletePlanDirection,
      setBrandTeam,
    ],
  );

  return <BrandsContext.Provider value={value}>{children}</BrandsContext.Provider>;
}
