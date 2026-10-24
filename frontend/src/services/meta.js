import { apiRequest } from './http';

/** Reference data used by the user and team forms. */

function unwrap(body) {
  return body?.data ?? body;
}

export async function getRoles() {
  const data = unwrap(await apiRequest('/meta/roles'));
  return Array.isArray(data?.roles) ? data.roles : [];
}

export async function getJobTitleOptions() {
  const data = unwrap(await apiRequest('/meta/job-titles'));
  return Array.isArray(data?.jobTitles) ? data.jobTitles : [];
}
