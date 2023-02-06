const { PrismaClient } = require("@prisma/client");

const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = process.env.EMAIL;
  const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);

  await prisma.adminUser.create({
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
      name: "Inaugural Trivia Game",
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
