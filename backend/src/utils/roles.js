export function getRoleName(user) {
  const raw =
    typeof user?.role === 'string'
      ? user.role
      : user?.role?.name;

  return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
}

export function getJobTitleName(user) {
  const raw =
    typeof user?.jobTitle === 'string'
      ? user.jobTitle
      : user?.jobTitle?.name;

  return typeof raw === 'string' ? raw.trim() : '';
}

export function isManagementRole(user) {
  const role = getRoleName(user);
  return role === 'ADMIN' || role === 'ACCOUNT_MANAGER';
}

export function isContentCreatorUser(user) {
  const role = getRoleName(user);
  const jobTitle = getJobTitleName(user).toLowerCase();

  if (role === 'CONTENT_CREATOR' || role === 'CREATOR') {
    return true;
  }

  // Backward compatibility for legacy EMPLOYEE users with Content Creator job title.
  return role === 'EMPLOYEE' && jobTitle === 'content creator';
}
