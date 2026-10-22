const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  const titles = await prisma.jobTitle.findMany({
    where: { isActive: true },
  });

  const admin = await prisma.user.findUnique({
    where: { email: "admin@agency.local" },
  });

  if (!admin) {
    throw new Error(
      "Admin not found. Check the admin email in your database."
    );
  }

  const roleMap = Object.fromEntries(
    roles.map((role) => [role.name, role.id])
  );

  if (!roleMap.ACCOUNT_MANAGER || !roleMap.EMPLOYEE) {
    throw new Error("Required roles are missing from the database.");
  }

  const accountManagerTitle = titles.find(
    (title) => title.name === "Account Manager"
  );

  const employeeTitles = titles.filter(
    (title) => title.name !== "Account Manager"
  );

  if (!accountManagerTitle || employeeTitles.length === 0) {
    throw new Error("Required active job titles are missing.");
  }

  const passwordHash = await bcrypt.hash("Test1234!", 12);
  let created = 0;
  let existing = 0;

  for (let i = 1; i <= 20; i++) {
    const isManager = i <= 2;
    const number = String(i).padStart(2, "0");
    const email = `test.user${number}@agency.local`;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      existing++;
      continue;
    }

    const jobTitle = isManager
      ? accountManagerTitle
      : employeeTitles[(i - 3) % employeeTitles.length];

    await prisma.user.create({
      data: {
        fullName: isManager
          ? `Test Account Manager ${number}`
          : `Test Employee ${number}`,
        email,
        passwordHash,
        phone: `0100000${String(i).padStart(4, "0")}`,
        roleId: isManager
          ? roleMap.ACCOUNT_MANAGER
          : roleMap.EMPLOYEE,
        jobTitleId: jobTitle.id,
        isActive: i % 5 !== 0,
        createdBy: admin.id,
      },
    });

    created++;
  }

  console.log(`Created: ${created}`);
  console.log(`Already existed, skipped: ${existing}`);
  console.log("Test password for newly created users: Test1234!");
  console.log("Inactive test users: test.user05, 10, 15, 20");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
