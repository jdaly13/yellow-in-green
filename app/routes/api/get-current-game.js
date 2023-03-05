import { getCurrentGame } from "~/models/game.server";

export async function loader({ request }) {
  return getCurrentGame();
}
