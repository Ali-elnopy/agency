import { prisma } from '../../config/prisma.js';

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  jobTitle: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const AuthModel = {
  findUserByEmailForPassword(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });
  },

  findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
    });
  },

  findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  },

  updateLastLogin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  },

  resetLoginFailures(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        failedLoginWindowStart: null,
        loginLockedUntil: null,
      },
    });
  },

  recordFailedLogin(userId, attempts, windowStart, lockedUntil) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        failedLoginWindowStart: windowStart,
        loginLockedUntil: lockedUntil,
      },
    });
  },

  updatePassword(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },
};
