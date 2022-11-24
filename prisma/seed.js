const { PrismaClient } = require("@prisma/client");

const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = process.env.EMAIL;
  const dummyEmail = "rachel@remix.run";
  const dummyPassword = await bcrypt.hash("racheliscool", 10);
  const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);

  // cleanup the existing database
  await prisma.user.delete({ where: { email: dummyEmail } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.adminUser.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.game.delete({ where: { name: "first game" } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  // LEGACY
  const user = await prisma.user.create({
    data: {
      email: dummyEmail,
      password: {
        create: {
          hash: dummyPassword,
        },
      },
    },
  });

  console.log({ user });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  // END OF LEGACY

  const adminUser = await prisma.adminUser.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const firstGame = await prisma.game.create({
    data: {
      name: "first game",
      current: true,
    },
  });

  const firstQuestion = await prisma.question.create({
    data: {
      content: "Who was prom king of Weymouth High School in 1992?",
      gameId: firstGame.id,
      answer: {
        create: {
          hash: await bcrypt.hash(process.env.ANSWER, 10),
        },
      },
    },
  });

  const secondQuestion = await prisma.question.create({
    data: {
      content:
        "In the great state of Florida between what road and Gateway Boulevard is there a Pet Friendly Shelter Location",
      gameId: firstGame.id,
      answer: {
        create: {
          hash: await bcrypt.hash(process.env.ANSWER2, 10),
        },
      },
    },
  });

  const thirdQuestion = await prisma.question.create({
    data: {
      content:
        "According to the 1980 census what was the population of Japer MO per square mile",
      gameId: firstGame.id,
      answer: {
        create: {
          hash: await bcrypt.hash(process.env.ANSWER3, 10),
        },
      },
    },
  });

  const test = await prisma.game.findFirst({
    where: {
      current: true,
    },
    include: {
      questions: true,
    },
  });

  console.log({ test });

  console.log({ firstQuestion });
  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
