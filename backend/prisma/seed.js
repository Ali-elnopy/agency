import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create the roles required by the application.
  const roleNames = ['ADMIN', 'ACCOUNT_MANAGER', 'CLIENT', 'EMPLOYEE'];

  const roles = {};

  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Create the core content permissions.
  const contentPermissions = [
    { code: 'CREATE_CONTENT', description: 'Create content plans, campaigns, and content items' },
    { code: 'MANAGE_CONTENT', description: 'Manage and update content items, campaigns, and content plans' },
    { code: 'REVIEW_CONTENT', description: 'Review and approve or request changes on content' },
    { code: 'PUBLISH_CONTENT', description: 'Publish approved content' },
  ];

  for (const perm of contentPermissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  // 2. Create and activate the current job titles.
  const jobTitles = [
    'Media Buyer',
    'Photographer',
    'Video Editor',
    'Social Media Specialist',
    'Marketing Manager',
    'Content Creator',
    'Graphic Designer',
  ];

  for (const name of jobTitles) {
    await prisma.jobTitle.upsert({
      where: { name },
      update: { isActive: true },
      create: { name },
    });
  }

  // 3. Keep Account Manager active.
  // Deactivate only the outdated job titles.
  await prisma.jobTitle.upsert({
    where: { name: 'Account Manager' },
    update: { isActive: true },
    create: {
      name: 'Account Manager',
      isActive: true,
    },
  });

  await prisma.jobTitle.updateMany({
    where: {
      name: {
        in: ['Designer'],
      },
    },
    data: { isActive: false },
  });

  // 4. Create the local admin account.
  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@agency.local').trim().toLowerCase();

  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      roleId: roles.ADMIN.id,
      isActive: true,
      failedLoginAttempts: 0,
      failedLoginWindowStart: null,
      loginLockedUntil: null,
    },
    create: {
      fullName: 'System Admin',
      email,
      passwordHash,
      roleId: roles.ADMIN.id,
      isActive: true,
      failedLoginAttempts: 0,
    },
  });

  console.log('Seed completed successfully.');
  console.log(`Admin account ready: ${email}`);
  console.log(`Roles ready: ${roleNames.join(', ')}`);
  console.log(`Job titles ready: ${[...jobTitles, 'Account Manager'].join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
