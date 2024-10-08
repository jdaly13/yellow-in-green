import { createGame } from "~/models/game.server";

export async function loader({ request }) {
  const urlToSearch = new URL(request.url);
  const game = urlToSearch.searchParams.get("game");
  const makeActive = urlToSearch.searchParams.get("makeCurrent");
  const nativeTokenAmount = urlToSearch.searchParams.get("nativeAmount");

  return createGame(game, makeActive, nativeTokenAmount);
}
