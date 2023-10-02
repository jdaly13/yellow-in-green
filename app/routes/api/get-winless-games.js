import { getWinlessGames } from "~/models/game.server";

export async function loader({ request }) {
  return getWinlessGames();
}
