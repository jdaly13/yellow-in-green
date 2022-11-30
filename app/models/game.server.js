import { json } from "@remix-run/server-runtime";
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

export async function checkAnswer(question, answer) {
  const questionWithAnswer = await prisma.question.findUnique({
    where: { id: question },
    include: {
      answer: true,
    },
  });

  if (!questionWithAnswer || !questionWithAnswer.answer) {
    return null;
  }

  const isValid = await bcrypt.compare(answer, questionWithAnswer.answer.hash);

  console.log({ isValid });
  return isValid;
}

export async function createUserSubmission(user, question, answer, gameId) {
  const hashedAnswer = await bcrypt.hash(answer, 10);
  return prisma.submission.create({
    data: {
      answer: hashedAnswer,
      createdById: user,
      questionId: question,
      gameId,
    },
  });
}

export async function checkWinner(userId, game) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      submissions: {
        where: {
          gameId: game,
        },
      },
    },
  });
  const gameWithQuestions = await prisma.game.findFirst({
    where: {
      id: game,
    },
    include: {
      questions: true,
    },
  });
  if (gameWithQuestions.questions.length === user.submissions.length) {
    return true;
  }
  return false;
}

export async function declareWinner(game, userId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  console.log(user);

  return prisma.game.update({
    where: {
      id: game,
    },
    data: {
      winnerId: user.address,
      current: false,
    },
  });
}

export async function checkAndDeclareWinner(id, game, submission) {
  const isWinner = await checkWinner(id, game);
  if (isWinner) {
    const declaredWinner = await declareWinner(game, id);
    if (declareWinner) {
      return json(declaredWinner);
    } else {
      return json({
        error: "questions and submissions matched up but not declared winner",
      });
    }
  } else {
    if (submission) {
      return submission;
    } else {
      return json({
        error: "Questions and submissions did not match up",
      });
    }
  }
}
