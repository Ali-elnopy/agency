const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'admin@agency.local' }
  });
  console.log(JSON.stringify({
    failedLoginAttempts: user.failedLoginAttempts,
    loginLockedUntil: user.loginLockedUntil,
    failedLoginWindowStart: user.failedLoginWindowStart,
    isActive: user.isActive
  }, null, 2));
}

main()
  .catch(e => { console.error(e.message); })
  .finally(() => prisma.$disconnect());
