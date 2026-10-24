const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'admin@agency.local' }, 
    include: { role: true } 
  });
  console.log(JSON.stringify(user ? {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    role: user.role?.name,
    hasHash: !!user.passwordHash,
    hashPrefix: user.passwordHash ? user.passwordHash.substring(0, 7) : null
  } : null, null, 2));
  
  if (user && user.passwordHash) {
    const valid = await bcrypt.compare('ChangeMe123!', user.passwordHash);
    console.log('Password valid:', valid);
  }
}

main()
  .catch(e => { console.error(e.message); })
  .finally(() => prisma.$disconnect());
