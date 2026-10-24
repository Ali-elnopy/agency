const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'admin@agency.local' },
    data: {
      failedLoginAttempts: 0,
      loginLockedUntil: null,
      failedLoginWindowStart: null
    }
  });
  console.log('done');
}

main()
  .catch(e => { console.error(e.message); })
  .finally(() => prisma.$disconnect());
