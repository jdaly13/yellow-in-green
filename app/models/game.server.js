import { prisma } from "~/db.server";
import bcrypt from "bcryptjs";
export async function getCurrentGame() {
  return prisma.game.findFirst({
    where: {
      current: true,
    },
    include: {
      questions: true,
    },
  });
}

export async function getSpecificGame(id) {
  return prisma.game.findFirst({
    where: {
      id,
    },
    include: {
      questions: true,
    },
  });
}

export async function checkAnswers(data) {
  const array = [];
  for (var i = 0; i < data.length; i++) {
    console.log("id", Object.keys(data[i])[0]);
    console.log("testing", data[i]);
    const questionWithAnswer = await prisma.question.findUnique({
      where: { id: Object.keys(data[i])[0] },
      include: {
        answer: true,
      },
    });
    console.log({ questionWithAnswer });

    if (!questionWithAnswer || !questionWithAnswer.answer) {
      return null;
    }

    console.log(data[i][questionWithAnswer.id]);

    const isValid = await bcrypt.compare(
      data[i][questionWithAnswer.id],
      questionWithAnswer.answer.hash
    );

    console.log({ isValid });

    array.push({
      [data[i][questionWithAnswer.id]]: isValid,
    });
    return array;
  }
}
