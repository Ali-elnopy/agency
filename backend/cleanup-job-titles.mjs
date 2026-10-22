import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.$transaction(async (tx) => {
    const oldTitles = await tx.jobTitle.findMany({
      where: { id: { in: [2, 3] } },
      select: { id: true, name: true },
    });

    const users = await tx.user.count({
      where: { jobTitleId: { in: [2, 3] } },
    });

    if (users > 0) {
      throw new Error(
        `Cannot delete old titles: ${users} user(s) are still assigned to them.`,
      );
    }

    const contentTitle = await tx.jobTitle.findUnique({
      where: { id: 10 },
    });

    if (!contentTitle || contentTitle.name !== 'Content') {
      throw new Error(
        'Expected Content job title with ID 10 was not found. No changes made.',
      );
    }

    // Delete the old records first to avoid the unique-name conflict.
    await tx.jobTitle.deleteMany({
      where: { id: { in: [2, 3] } },
    });

    // Rename the existing Content record, preserving its ID.
    await tx.jobTitle.update({
      where: { id: 10 },
      data: { name: 'Content Creator', isActive: true },
    });

    console.log('Deleted old titles:', oldTitles);
    console.log('Renamed Content (ID 10) to Content Creator.');
  });

  console.log('Job titles updated successfully.');
} catch (error) {
  console.error('Job title update failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
