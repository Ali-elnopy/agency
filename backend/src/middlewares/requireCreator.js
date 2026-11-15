import { requirePermission } from './requirePermission.js';

/**
 * @deprecated Legacy middleware replaced by requirePermission('CREATE_CONTENT', 'MANAGE_CONTENT').
 * Maintained as an alias to avoid breaking external callers.
 */
export const requireCreator = requirePermission(
  'CREATE_CONTENT',
  'MANAGE_CONTENT',
);
