import { createGame } from "~/models/game.server";

export async function loader({ request }) {
  const urlToSearch = new URL(request.url);
  const game = urlToSearch.searchParams.get("game");
  console.log("game", game);
  return createGame(game);
}
