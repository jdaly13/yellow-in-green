import { checkAndDeclareWinner } from "~/models/game.server";

export async function loader({ request }) {
  const urlToSearch = new URL(request.url);
  const id = urlToSearch.searchParams.get("id");
  const game = urlToSearch.searchParams.get("game");

  return checkAndDeclareWinner(id, game);
  // const isWinner = await checkWinner(id, game);
  // if (isWinner) {
  //   const declaredWinner = await declareWinner(game, id);
  //   if (declareWinner) {
  //     return json(declaredWinner);
  //   } else {
  //     return json({
  //       error: "questions and submissions matched up but not declared winner",
  //     });
  //   }
  // } else {
  //   return json({
  //     error: "Questions and submissions did not match up",
  //   });
  // }

  // const game = urlToSearch.searchParams.get("game");
  // const user = await prisma.user.findFirst({
  //   where: {
  //     address: address,
  //   },
  //   include: {
  //     submissions: {
  //       where: {
  //         gameId: game,
  //       },
  //     },
  //   },
  // });
  // const gameWithQuestions = await prisma.game.findFirst({
  //   where: {
  //     id: game,
  //   },
  //   include: {
  //     questions: true,
  //   },
  // });
  // if (gameWithQuestions.length === user.submissions.length) {
  // }
  // return gameWithQuestions;
}
