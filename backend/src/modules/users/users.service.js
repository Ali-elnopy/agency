import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { audit } from '../../utils/audit.js';

const select = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function list({ page, limit, role, search }) {
  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function create(actor, { password, ...data }) {
  const user = await prisma.user.create({
    data: { ...data, passwordHash: await bcrypt.hash(password, 12) },
    select,
  });
  await audit({
    actorId: actor.id,
    action: 'USER_CREATED',
    entity: 'User',
    entityId: user.id,
    meta: { role: user.role },
  });
  return user;
}

export async function update(actor, id, data) {
  if (id === actor.id && (data.isActive === false || (data.role && data.role !== actor.role))) {
    throw ApiError.badRequest('You cannot deactivate or change the role of your own account');
  }
  const user = await prisma.user.update({ where: { id }, data, select });
  if (data.isActive === false) {
    await prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await audit({ actorId: actor.id, action: 'USER_UPDATED', entity: 'User', entityId: id, meta: data });
  return user;
}
