import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { checkAccount } from "~/utils";
export async function verifyLogin(email, password) {
  const userWithPassword = await prisma.adminUser.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function getUserById(id) {
  return prisma.adminUser.findUnique({ where: { id } });
}

export async function createGame(address, name) {
  if (checkAccount(address)) {
    return prisma.game.create({
      data: {
        name: "first game",
        current: true,
      },
    });
  } else {
    return null;
  }
}

export async function createQuestion(address, content, gameId, answer) {
  if (checkAccount(address)) {
    return prisma.question.create({
      data: {
        content: "Who was prom king of Weymouth High School in 1992?",
        gameId: gameId,
        answer: {
          create: {
            hash: await bcrypt.hash(answer, 10),
          },
        },
      },
    });
  } else {
    return null;
  }
}
