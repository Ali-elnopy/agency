import { prisma } from '../config/prisma.js';

export const audit = ({ actorId, action, entity, entityId, meta }) =>
  prisma.auditLog.create({ data: { actorId, action, entity, entityId, meta } });
