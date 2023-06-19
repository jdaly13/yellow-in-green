import { json } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import bcrypt from "bcryptjs";
import { sendEmail } from "~/services/email.server";
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
  console.log("ID", id);
  return prisma.game.findFirst({
    where: {
      id,
    },
    include: {
      questions: true,
    },
  });
}

export async function getAllGames() {
  return prisma.game.findMany();
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
  }
  return array;
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

export async function createIncorrectSubmission(
  user,
  question,
  answer,
  gameId
) {
  return prisma.indecentProposal.create({
    data: {
      answer: answer,
      createdById: user,
      questionId: question,
      gameId,
    },
  });
}

export async function getIncorrectSubmissionsByUserAndGameId(user, gameId) {
  return prisma.indecentProposal.count({
    where: {
      createdById: user,
      gameId: gameId,
    },
  });
}

export async function createUserSubmission(user, question, answer, gameId) {
  //TODO call getIncorrectSubmissionsByUserAndGameId to make sure user can't submit if they have already surpassed limit
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

  const winnerUpdate = await prisma.game.update({
    where: {
      id: game,
    },
    data: {
      winnerId: user.address,
      current: false,
    },
  });
  try {
    await sendEmail({ gameId: game, winnerId: user.address });
  } catch (error) {
    console.log(error);
    return {
      winnerUpdate,
      winnerAddress: user.address,
      emailSuccess: false,
    };
  }

  return {
    winnerUpdate,
    winnerAddress: user.address,
    emailSuccess: true,
  };
}

export async function getAllWinlessGames() {
  return prisma.game.findMany({
    where: {
      winnerId: null,
    },
  });
}

export async function checkAndDeclareWinner(id, game, submission) {
  const isWinner = await checkWinner(id, game);
  if (isWinner) {
    const { winnerUpdate } = await declareWinner(game, id);
    if (winnerUpdate) {
      return json(winnerUpdate);
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

export async function createGame(game, makeActive) {
  const active = makeActive === "true" ? true : false;
  return prisma.game.create({
    data: {
      name: game,
      current: active,
    },
  });
}

export async function createQuestion(questionText, answerText, gameId) {
  return prisma.question.create({
    data: {
      content: questionText,
      gameId: gameId,
      answer: {
        create: {
          hash: await bcrypt.hash(answerText, 10),
        },
      },
    },
  });
}
