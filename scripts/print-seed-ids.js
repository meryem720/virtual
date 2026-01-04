const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'eleve@ecole.fr' },
    include: { studentProfile: true },
  });

  const exercise = await prisma.exercise.findUnique({
    where: { id: 'cmk00a20v000q10trwhveiph0' },
  });

  console.log(
    JSON.stringify(
      {
        userId: user?.id ?? null,
        studentId: user?.studentProfile?.id ?? null,
        exerciseId: exercise?.id ?? null,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
