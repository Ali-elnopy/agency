import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const titles = await prisma.jobTitle.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, isActive: true },
  });

  const counts = await prisma.user.groupBy({
    by: ['jobTitleId'],
    _count: { _all: true },
  });

  const result = titles.map((title) => ({
    id: title.id,
    name: title.name,
    isActive: title.isActive,
    usersCount: counts.find(
      (item) => item.jobTitleId === title.id
    )?._count._all ?? 0,
  }));

  console.table(result);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
