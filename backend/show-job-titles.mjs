import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const titles = await prisma.jobTitle.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  console.table(titles);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
