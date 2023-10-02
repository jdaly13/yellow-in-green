import { makeGameActive } from "~/models/game.server";

export async function loader({ request }) {
  const urlToSearch = new URL(request.url);
  const gameId = urlToSearch.searchParams.get("gameId");
  return makeGameActive(gameId);
}
