
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create the roles required by the application.
  const roleNames = [
    'ADMIN',
    'CLIENT',
    'ACCOUNT_MANAGER',
    'CONTENT_CREATOR',
    'CREATIVE',
  ];

  const roles = {};

  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Create and activate the three CREATIVE job titles.
  const jobTitles = [
    'Graphic Designer',
    'Video Editor',
    'Motion Designer',
  ];

  for (const name of jobTitles) {
    await prisma.jobTitle.upsert({
      where: { name },
      update: { isActive: true },
      create: {
        name,
        isActive: true,
      },
    });
  }

  // 3. Create the local admin account.
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? 'admin@agency.local'
  )
    .trim()
    .toLowerCase();

  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      'Set SEED_ADMIN_PASSWORD in your environment before running the seed.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      fullName: 'System Admin',
      email,
      passwordHash,
      roleId: roles.ADMIN.id,
    },
  });

  console.log('Seed completed successfully.');
  console.log(`Admin account ready: ${email}`);
  console.log(`Roles ready: ${roleNames.join(', ')}`);
  console.log(`Job titles ready: ${jobTitles.join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
