import { getAllActiveGames } from "~/models/game.server";

export async function loader({ request }) {
  return getAllActiveGames();
}
