import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

/* Brand records live in the API. Plans and content are still workspace-local
   until their endpoints land, so they stay in localStorage for now. */

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
  const demo = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';

  const [brands, setBrands] = useState(() =>
    demo ? readStore(STORAGE_KEYS.brands, seedBrands) : [],
  );
  const [plans, setPlans] = useState(() => readStore(STORAGE_KEYS.plans, seedPlans));
  const [content, setContent] = useState(() => readStore(STORAGE_KEYS.content, seedContent));
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [loadingBrands, setLoadingBrands] = useState(!demo);
  const [brandsError, setBrandsError] = useState(null);

  useEffect(() => {
    if (!demo) return;
    writeStore(STORAGE_KEYS.brands, brands);
  }, [brands, demo]);

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
    if (demo) return;

    let alive = true;

    setLoadingBrands(true);
    listBrands()
      .then((records) => {
        if (alive) setBrands(records);
      })
      .catch((error) => {
        if (alive) setBrandsError(error?.message ?? 'Could not load brands.');
      })
      .finally(() => {
        if (alive) setLoadingBrands(false);
      });

    return () => {
      alive = false;
    };
  }, [demo]);

  const addBrand = useCallback(
    async (input) => {
      const name = String(input.name ?? '').trim();

      if (demo) {
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
          manager: '',
          managerInitials: '',
          managerEmail: '',
          managerRole: '',
          team: '',
          teamMembers: '',
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
          contactName: '',
          contactRole: '',
          contactEmail: '',
          contactPhone: '',
        };

        setBrands((prev) => [brand, ...prev]);
        return brand;
      }

      const brand = await createBrandApi(input);

      setBrands((prev) => [brand, ...prev]);
      return brand;
    },
    [brands.length, demo],
  );

  const deleteBrand = useCallback(
    async (brandId) => {
      if (!demo) {
        await deleteBrandApi(brandId);
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

      if (!demo && Number.isSafeInteger(numericBrandId) && numericBrandId > 0) {
        try {
          const [yearStr, monthStr] = (month || '').split('-');
          const parsedYear = Number(yearStr) || new Date().getFullYear();
          const parsedMonth = Number(monthStr) || new Date().getMonth() + 1;

          const plansRes = await apiRequest(
            `/content-plans?brandId=${numericBrandId}&year=${parsedYear}&month=${parsedMonth}`,
          ).catch(() => null);
          const existingPlans = plansRes?.data ?? plansRes;
          if (Array.isArray(existingPlans) && existingPlans.length > 0) {
            const planId = existingPlans[0].id;
            await apiRequest(`/content-plans/${planId}`, {
              method: 'PATCH',
              body: {
                title: `${month} Content Plan`,
                notes: `Posts target: ${input.postsTarget || 0}, Reels target: ${input.reelsTarget || 0}`,
              },
            }).catch(() => {});
          }
        } catch (err) {
          console.warn('Backend plan sync note:', err);
        }
      }

      const plan = {
        id: `plan-${brandId}-${month}`,
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
      status: 'planned',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setContent((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateContentStatus = useCallback((contentId, status) => {
    setContent((prev) =>
      prev.map((item) => (item.id === contentId ? { ...item, status } : item)),
    );
  }, []);

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
          const res = await apiRequest('/platform-accounts', {
            method: 'POST',
            body: {
              brandId: numericBrandId,
              platformName: String(input.name ?? '').trim(),
              accountHandle:
                String(input.handle ?? '').trim() ||
                `@${String(input.name ?? '').trim().toLowerCase()}`,
              profileUrl: input.url ? String(input.url).trim() : null,
              brandTone: input.tone ?? 'is-orange',
            },
          });
          serverPlatform = res?.data ?? res;
        } catch (e) {
          console.warn('Backend platform sync note:', e);
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
        if (patch.name) body.platformName = String(patch.name).trim();
        if (patch.handle) body.accountHandle = String(patch.handle).trim();
        if (patch.url !== undefined) body.profileUrl = patch.url || null;
        if (patch.tone) body.brandTone = patch.tone;
        if (Object.keys(body).length) {
          await apiRequest(`/platform-accounts/${numericId}`, {
            method: 'PATCH',
            body,
          }).catch(() => {});
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
      brands,
      plans,
      content,
      loading: loadingBrands,
      error: brandsError,
      addBrand,
      deleteBrand,
      updateBrand,
      savePlan,
      addContent,
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
