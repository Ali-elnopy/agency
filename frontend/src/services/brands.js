import { apiRequest } from './http';

/**
 * Brand workspace service. The Express API is the source of truth for brand
 * records; plans and content are still kept in the browser until their
 * endpoints land.
 *
 *   GET    /brands      -> { brands, total }
 *   GET    /brands/:id  -> brand
 *   POST   /brands      -> brand
 *   PATCH  /brands/:id  -> brand
 *   DELETE /brands/:id  -> brand
 */

const TONES = ['is-purple', 'is-blue', 'is-pink', 'is-amber', 'is-gray', 'is-orange'];

export function initialsOf(name = '') {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function toneFor(name = '') {
  const seed = String(name)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return TONES[seed % TONES.length];
}

function toDateOnly(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function mapBrand(brand) {
  if (!brand) return null;

  const manager = brand.accountManager ?? null;
  const team = brand.team ?? null;
  const status =
    brand.status === 'archived' || brand.status === 'paused' ? brand.status : 'active';

  return {
    id: brand.id,
    name: brand.name,
    initials: initialsOf(brand.name),
    tone: toneFor(brand.name),
    verified: Boolean(manager),
    industry: brand.industry ?? '',
    description: brand.description ?? '',
    country: '',
    timezone: '',
    timezoneLabel: '',
    website: brand.websiteUrl ?? '',
    driveFolderUrl: '',
    manager: manager?.fullName ?? '',
    managerInitials: manager ? initialsOf(manager.fullName) : '',
    managerEmail: manager?.email ?? '',
    managerRole: manager ? 'Account Manager' : '',
    accountManagerId: brand.accountManagerId ?? null,
    team: team?.name ?? '',
    teamId: brand.teamId ?? null,
    teamMembers: '',
    status,
    createdAt: toDateOnly(brand.createdAt),
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
  };
}

function unwrap(body) {
  return body?.data ?? body;
}

export async function listBrands() {
  const data = unwrap(await apiRequest('/brands'));
  const records = Array.isArray(data?.brands) ? data.brands : [];

  return records.map(mapBrand);
}

export async function createBrand(input) {
  const payload = {
    name: String(input.name ?? '').trim(),
    industry: String(input.industry ?? '').trim() || null,
    description: String(input.description ?? '').trim() || null,
  };

  const website = String(input.website ?? input.websiteUrl ?? '').trim();

  if (website) payload.websiteUrl = website;

  if (input.accountManagerId) payload.accountManagerId = Number(input.accountManagerId);
  if (input.teamId) payload.teamId = Number(input.teamId);

  return mapBrand(unwrap(await apiRequest('/brands', { method: 'POST', body: payload })));
}

export async function updateBrand(id, patch) {
  const payload = {};

  if (patch.name !== undefined) payload.name = String(patch.name).trim();
  if (patch.industry !== undefined) payload.industry = String(patch.industry).trim() || null;
  if (patch.description !== undefined) {
    payload.description = String(patch.description).trim() || null;
  }
  if (patch.website !== undefined || patch.websiteUrl !== undefined) {
    payload.websiteUrl = String(patch.website ?? patch.websiteUrl ?? '').trim() || null;
  }
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.teamId !== undefined) {
    payload.teamId = patch.teamId == null ? null : Number(patch.teamId);
  }
  if (patch.accountManagerId !== undefined) {
    payload.accountManagerId =
      patch.accountManagerId == null ? null : Number(patch.accountManagerId);
  }

  return mapBrand(
    unwrap(await apiRequest(`/brands/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })),
  );
}

export async function deleteBrand(id) {
  return unwrap(await apiRequest(`/brands/${encodeURIComponent(id)}`, { method: 'DELETE' }));
}
