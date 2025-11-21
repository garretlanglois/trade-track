import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add allowed emails here
  const allowedEmails = [
    'gaslanglois@gmail.com',
    'example2@gmail.com',
    'example3@gmail.com',
    // Add more emails as needed
  ];

  console.log('Seeding allowed emails...');

  for (const email of allowedEmails) {
    await prisma.allowedEmail.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    console.log(`Added: ${email}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
