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

/* Local-first workspace store. The brand API is create-only today, so the
   workspace keeps its plans and content in the browser until the backend
   endpoints land. Every list screen reads from this single provider. */

const STORAGE_KEYS = {
  brands: 'orvia_brands_v1',
  plans: 'orvia_brand_plans_v1',
  content: 'orvia_brand_content_v1',
};

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
  const [brands, setBrands] = useState(() => readStore(STORAGE_KEYS.brands, seedBrands));
  const [plans, setPlans] = useState(() => readStore(STORAGE_KEYS.plans, seedPlans));
  const [content, setContent] = useState(() => readStore(STORAGE_KEYS.content, seedContent));

  useEffect(() => {
    writeStore(STORAGE_KEYS.brands, brands);
  }, [brands]);

  useEffect(() => {
    writeStore(STORAGE_KEYS.plans, plans);
  }, [plans]);

  useEffect(() => {
    writeStore(STORAGE_KEYS.content, content);
  }, [content]);

  const addBrand = useCallback(
    (input) => {
      const name = String(input.name ?? '').trim();
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
    },
    [brands.length],
  );

  const deleteBrand = useCallback((brandId) => {
    setBrands((prev) => prev.filter((brand) => brand.id !== brandId));
    setPlans((prev) => prev.filter((plan) => plan.brandId !== brandId));
    setContent((prev) => prev.filter((item) => item.brandId !== brandId));
  }, []);

  const savePlan = useCallback((input) => {
    const brandId = input.brandId;
    const month = input.month || monthKey();
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
  }, []);

  const addContent = useCallback((input) => {
    const item = {
      id: makeId('content'),
      brandId: input.brandId,
      month: input.month,
      type: input.type,
      title: String(input.title ?? '').trim(),
      publishDate: input.publishDate,
      publishTime: input.publishTime,
      tov: input.tov,
      caption: String(input.caption ?? '').trim(),
      notes: String(input.notes ?? '').trim(),
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

  const value = useMemo(
    () => ({
      brands,
      plans,
      content,
      addBrand,
      deleteBrand,
      savePlan,
      addContent,
      updateContentStatus,
      getBrand,
      getPlan,
    }),
    [
      brands,
      plans,
      content,
      addBrand,
      deleteBrand,
      savePlan,
      addContent,
      updateContentStatus,
      getBrand,
      getPlan,
    ],
  );

  return <BrandsContext.Provider value={value}>{children}</BrandsContext.Provider>;
}
