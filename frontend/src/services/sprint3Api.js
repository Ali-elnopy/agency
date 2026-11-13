import { apiRequest, ApiError } from './http';
import { isMockApiEnabled, fetchCurrentUserApi } from './api';
import { getAccessToken } from './tokenStorage';

/**
 * Sprint 3 API integration.
 *
 * The UI was originally built against localStorage fixtures. This module is the
 * single translation layer between those view models and the Express/Prisma
 * endpoints, so pages keep their shape while the API becomes the source of
 * truth whenever a real backend session is available.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/** True when requests should reach the API instead of the local fixtures. */
export function apiEnabled() {
  return !isMockApiEnabled();
}

/** Numeric database ids are the only ones the API accepts. */
export function toNumericId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function unwrap(body) {
  return body?.data ?? body;
}

function listFrom(body, key) {
  const data = unwrap(body);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

/* ------------------------------- strategies ------------------------------- */

const STRATEGY_STATUS_TO_UI = {
  DRAFT: 'draft',
  PENDING_ACCOUNT_MANAGER: 'in_review',
  CHANGES_REQUESTED: 'changes_requested',
  PENDING_CLIENT: 'client_review',
  APPROVED: 'approved',
};

export function mapStrategy(record) {
  if (!record) return null;

  const versions = Array.isArray(record.versions) ? record.versions : [];
  const latest = versions[0] ?? null;
  const feedback = latest?.feedback?.[0] ?? null;
  const approvals = latest?.approvals ?? [];
  const clientApproval = approvals.find((item) => item.approverType === 'CLIENT');
  const managerApproval = approvals.find(
    (item) => item.approverType === 'ACCOUNT_MANAGER',
  );

  const fileSize = latest?.fileSize
    ? `${(latest.fileSize / (1024 * 1024)).toFixed(1)} MB`
    : '';

  return {
    id: `strat-${record.id}`,
    serverId: record.id,
    brandId: String(record.brandId),
    brandName: record.brand?.name ?? '',
    title: record.title,
    status: STRATEGY_STATUS_TO_UI[record.status] ?? 'draft',
    backendStatus: record.status,
    version: latest ? String(latest.version) : '0',
    fileName: latest?.fileName ?? '',
    fileSize,
    fileType: latest?.mimeType ?? 'application/pdf',
    uploadDate: latest?.createdAt
      ? new Date(latest.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '',
    authorName: latest?.uploadedBy?.fullName ?? '',
    reviewerName: feedback?.requester?.fullName ?? managerApproval?.approver?.fullName ?? '',
    reviewerNote: feedback?.message ?? managerApproval?.comment ?? '',
    clientName: clientApproval?.approver?.fullName ?? '',
    clientReason: clientApproval?.comment ?? '',
    versionId: latest?.id ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function fetchStrategiesApi() {
  if (!apiEnabled()) return null;

  const body = await apiRequest('/strategies');
  return listFrom(body, 'strategies').map(mapStrategy);
}

export async function createStrategyApi({ brandId, title }) {
  const numericBrandId = toNumericId(brandId);
  if (!numericBrandId) throw new ApiError('A saved brand is required first.', 400);

  const body = await apiRequest('/strategies', {
    method: 'POST',
    body: { brandId: numericBrandId, title: String(title).trim() },
  });

  return mapStrategy(unwrap(body));
}

export async function renameStrategyApi(strategyId, title) {
  const body = await apiRequest(`/strategies/${toNumericId(strategyId)}`, {
    method: 'PATCH',
    body: { title: String(title).trim() },
  });

  return mapStrategy(unwrap(body));
}

export async function deleteStrategyApi(strategyId) {
  await apiRequest(`/strategies/${toNumericId(strategyId)}`, { method: 'DELETE' });
  return true;
}

export async function uploadStrategyVersionApi(strategyId, file) {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(
    `${API_BASE}/strategies/${toNumericId(strategyId)}/versions`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: form,
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || 'Could not upload the strategy file.',
      response.status,
    );
  }

  return unwrap(payload);
}

export async function requestStrategyChangesApi(strategyId, versionId, message) {
  const body = await apiRequest(
    `/strategies/${toNumericId(strategyId)}/versions/${toNumericId(versionId)}/feedback`,
    { method: 'POST', body: { message } },
  );

  return unwrap(body);
}

export async function approveStrategyApi(strategyId, versionId, comment) {
  const body = await apiRequest(
    `/strategies/${toNumericId(strategyId)}/versions/${toNumericId(versionId)}/approve`,
    { method: 'POST', body: { comment: comment || null } },
  );

  return unwrap(body);
}

/* --------------------------------- briefs --------------------------------- */

export function mapBrief(record) {
  if (!record) return null;

  return {
    id: record.id,
    serverId: record.serverId ?? record.id,
    onboardingId: record.onboardingId ?? null,
    brandId: String(record.brandId ?? ''),
    brandName: record.brandName ?? '',
    status: record.status ?? 'draft',
    backendStatus: record.backendStatus ?? null,
    version: record.version ?? 1,
    objectives: record.objectives ?? [],
    targetAudience: record.targetAudience ?? '',
    competitors: record.competitors ?? '',
    toneOfVoice: record.toneOfVoice ?? '',
    suggestedQuestions: record.suggestedQuestions ?? [],
    sections: record.sections ?? null,
    notes: record.notes ?? '',
    approvedBy: record.approvedBy ?? null,
    approvedAt: record.approvedAt ?? null,
    generatedAt: record.generatedAt ?? null,
  };
}

export async function fetchBriefsApi() {
  if (!apiEnabled()) return null;

  const body = await apiRequest('/brand-briefs');
  const data = unwrap(body);
  const records = Array.isArray(data?.briefs) ? data.briefs : [];

  return records.map(mapBrief);
}

export async function generateBriefApi(brandId) {
  const numericBrandId = toNumericId(brandId);
  if (!numericBrandId) throw new ApiError('A saved brand is required first.', 400);

  const body = await apiRequest(`/brand-briefs/${numericBrandId}/generate`, {
    method: 'POST',
  });

  return mapBrief(unwrap(body));
}

export async function updateBriefApi(briefId, patch) {
  const body = await apiRequest(`/brand-briefs/${toNumericId(briefId)}`, {
    method: 'PATCH',
    body: patch,
  });

  return mapBrief(unwrap(body));
}

export async function approveBriefApi(briefId, comment) {
  const numericId = toNumericId(briefId);
  const body = await apiRequest(
    numericId ? `/brand-briefs/${numericId}/approve` : `/brand-briefs/${briefId}/approve`,
    { method: 'POST', body: { comment: comment || null } },
  );

  return mapBrief(unwrap(body));
}

/* ---------------------------------- tasks --------------------------------- */

const TASK_STATUS_TO_UI = {
  TODO: 'to_do',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  NEEDS_CHANGES: 'changes_requested',
  COMPLETED: 'done',
  CANCELLED: 'cancelled',
};

const TASK_STATUS_TO_API = {
  to_do: 'TODO',
  in_progress: 'IN_PROGRESS',
  submitted: 'SUBMITTED',
  in_review: 'IN_REVIEW',
  changes_requested: 'NEEDS_CHANGES',
  done: 'COMPLETED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const TASK_PRIORITY_TO_UI = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

const TASK_PRIORITY_TO_API = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
};

export function mapTask(record) {
  if (!record) return null;

  const assigneeName = record.assignee?.fullName ?? '';
  const initials = assigneeName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: `tsk-${record.id}`,
    serverId: record.id,
    title: record.title,
    description: record.description ?? '',
    brandId: String(record.contentItem?.contentPlan?.brandId ?? ''),
    brandName: record.contentItem?.contentPlan?.brand?.name ?? '',
    contentItemId: record.contentItemId ? String(record.contentItemId) : '',
    contentTitle: record.contentItem?.title ?? '',
    priority: TASK_PRIORITY_TO_UI[record.priority] ?? 'medium',
    status: TASK_STATUS_TO_UI[record.status] ?? 'to_do',
    backendStatus: record.status,
    deadline: record.plannedDeadline,
    assigneeId: String(record.assignedTo ?? ''),
    assigneeName,
    assigneeRole: record.assignee?.jobTitle?.name ?? 'Employee',
    assigneeAvatar: initials,
    revisionNote: record.description ?? '',
    createdAt: record.createdAt,
  };
}

export async function fetchTasksApi(params = {}) {
  if (!apiEnabled()) return null;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const suffix = query.toString();
  const body = await apiRequest(`/tasks${suffix ? `?${suffix}` : ''}`);
  return listFrom(body, 'tasks').map(mapTask);
}

export async function createDirectTaskApi({
  title,
  description,
  assignedTo,
  priority,
  plannedDeadline,
}) {
  const numericAssignee = toNumericId(assignedTo);
  if (!numericAssignee) {
    throw new ApiError('Select a workspace member to assign this task.', 400);
  }

  const body = await apiRequest('/tasks/direct', {
    method: 'POST',
    body: {
      title: String(title).trim(),
      description: description ? String(description).trim() : null,
      assignedTo: numericAssignee,
      priority: TASK_PRIORITY_TO_API[priority] ?? 'MEDIUM',
      plannedDeadline: plannedDeadline || new Date().toISOString(),
    },
  });

  return mapTask(unwrap(body));
}

export async function updateTaskApi(taskId, patch) {
  const body = {};

  if (patch.title !== undefined) body.title = String(patch.title).trim();
  if (patch.description !== undefined) body.description = patch.description || null;
  if (patch.priority !== undefined) {
    body.priority = TASK_PRIORITY_TO_API[patch.priority] ?? 'MEDIUM';
  }
  if (patch.deadline !== undefined) body.plannedDeadline = patch.deadline;
  if (patch.assigneeId !== undefined && toNumericId(patch.assigneeId)) {
    body.assignedTo = toNumericId(patch.assigneeId);
  }

  if (!Object.keys(body).length) return null;

  const result = await apiRequest(`/tasks/${toNumericId(taskId)}`, {
    method: 'PATCH',
    body,
  });

  return mapTask(unwrap(result));
}

export async function updateTaskStatusApi(taskId, status) {
  const result = await apiRequest(`/tasks/${toNumericId(taskId)}/status`, {
    method: 'PATCH',
    body: { status: TASK_STATUS_TO_API[status] ?? 'TODO' },
  });

  return mapTask(unwrap(result));
}

export async function deleteTaskApi(taskId) {
  await apiRequest(`/tasks/${toNumericId(taskId)}`, { method: 'DELETE' });
  return true;
}

export async function assignContentItemTasksApi(contentItemId, payload = {}) {
  const body = await apiRequest(
    `/tasks/content-items/${toNumericId(contentItemId)}/assign`,
    { method: 'POST', body: payload },
  );

  return unwrap(body);
}

/* -------------------------------- campaigns ------------------------------- */

export function mapCampaign(record) {
  if (!record) return null;

  return {
    id: `cmp-${record.id}`,
    serverId: record.id,
    brandId: String(record.contentPlan?.brandId ?? ''),
    contentPlanId: record.contentPlanId,
    name: record.name,
    objective: record.objective ?? '',
    goal: record.objective ?? 'Awareness',
    startDate: record.startDate ? String(record.startDate).slice(0, 10) : '',
    endDate: record.endDate ? String(record.endDate).slice(0, 10) : '',
    createdAt: record.createdAt,
  };
}

export async function fetchCampaignsApi(query = {}) {
  if (!apiEnabled()) return null;

  const params = new URLSearchParams();
  if (query.contentPlanId) params.append('contentPlanId', query.contentPlanId);

  const suffix = params.toString();
  const body = await apiRequest(`/campaigns${suffix ? `?${suffix}` : ''}`);
  return listFrom(body, 'campaigns').map(mapCampaign);
}

export async function createCampaignApi(payload) {
  let contentPlanId = toNumericId(payload.contentPlanId);

  // Campaigns hang off a content plan. When the caller only knows the brand,
  // resolve the brand's first plan instead of failing the whole action.
  if (!contentPlanId && toNumericId(payload.brandId)) {
    const plansBody = await apiRequest(
      `/content-plans?brandId=${toNumericId(payload.brandId)}`,
    ).catch(() => null);

    contentPlanId = plansBody?.data?.plans?.[0]?.id ?? null;
  }

  if (!contentPlanId) {
    throw new ApiError(
      'Create a content plan for this brand before adding a campaign.',
      400,
    );
  }

  const body = await apiRequest('/campaigns', {
    method: 'POST',
    body: {
      contentPlanId,
      name: String(payload.name).trim(),
      objective: payload.objective ? String(payload.objective).trim() : null,
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  });

  return mapCampaign(unwrap(body));
}

export async function updateCampaignApi(campaignId, patch) {
  const body = {};

  if (patch.name !== undefined) body.name = String(patch.name).trim();
  if (patch.objective !== undefined) body.objective = patch.objective || null;
  if (patch.startDate !== undefined) body.startDate = patch.startDate;
  if (patch.endDate !== undefined) body.endDate = patch.endDate;

  if (!Object.keys(body).length) return null;

  const result = await apiRequest(`/campaigns/${toNumericId(campaignId)}`, {
    method: 'PATCH',
    body,
  });

  return mapCampaign(unwrap(result));
}

export async function deleteCampaignApi(campaignId) {
  await apiRequest(`/campaigns/${toNumericId(campaignId)}`, { method: 'DELETE' });
  return true;
}

/* --------------------------------- files ---------------------------------- */

export async function uploadFileApi(file) {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: form,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || 'Could not upload the file.',
      response.status,
    );
  }

  return unwrap(payload);
}

export function fileUrlFor(filename) {
  return `${API_BASE}/files/${encodeURIComponent(filename)}`;
}

/* ----------------------------- client onboarding -------------------------- */

export async function fetchOnboardingCategoriesApi() {
  if (!apiEnabled()) return null;
  const body = await apiRequest('/client-onboarding/categories');
  return unwrap(body);
}

export async function fetchOnboardingTemplateApi({ mainCategory, activityType }) {
  if (!apiEnabled()) return null;

  const params = new URLSearchParams({ mainCategory });
  if (activityType) params.append('activityType', activityType);

  const body = await apiRequest(`/client-onboarding/template?${params}`);
  return unwrap(body);
}

export async function fetchMyOnboardingApi() {
  if (!apiEnabled()) return null;
  const body = await apiRequest('/client-onboarding/me');
  return unwrap(body);
}

export async function saveOnboardingSelectionApi({ mainCategory, activityType }) {
  const body = await apiRequest('/client-onboarding/selection', {
    method: 'PUT',
    body: { mainCategory, ...(activityType ? { activityType } : {}) },
  });
  return unwrap(body);
}

export async function saveOnboardingAnswersApi(answers) {
  const body = await apiRequest('/client-onboarding/answers', {
    method: 'PUT',
    body: { answers },
  });
  return unwrap(body);
}

export async function submitOnboardingApi() {
  const body = await apiRequest('/client-onboarding/submit', { method: 'POST' });
  return unwrap(body);
}

/* ------------------------------ notifications ----------------------------- */

export async function fetchNotificationsListApi() {
  if (!apiEnabled()) return null;

  const body = await apiRequest('/notifications');
  const data = unwrap(body);
  return Array.isArray(data) ? data : [];
}

export { fetchCurrentUserApi };
