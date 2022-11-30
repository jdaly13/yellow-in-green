const { PrismaClient } = require("@prisma/client");

const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = process.env.EMAIL;
  const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);

  // cleanup the existing database
  await prisma.user
    .delete({
      where: { address: "0xA12C13bCdfe2C6E2dFDA3Ea1767e0d8f93817Aa2" },
    })
    .catch(() => {
      // no worries if it doesn't exist yet
    });

  await prisma.user
    .delete({
      where: { address: "0xA17E0E2732Dde986c5A328277d3e922471F83a11" },
    })
    .catch(() => {
      // no worries if it doesn't exist yet
    });

  await prisma.adminUser.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.game
    .delete({ where: { id: "clb1blnbz0004s2v2chdujr0i" } })
    .catch((error) => {
      console.log("error", error);
      // no worries if it doesn't exist yet
    });

  // LEGACY
  const user = await prisma.user.create({
    data: {
      address: "0xA12C13bCdfe2C6E2dFDA3Ea1767e0d8f93817Aa2", //hardhat 17
    },
  });

  console.log({ user });

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
