import { json } from "@remix-run/server-runtime";
import { checkWinner } from "~/models/game.server";
import { makePayment } from "~/models/payout.server";

export async function loader({ request }) {
  try {
    const urlToSearch = new URL(request.url);
    const game = urlToSearch.searchParams.get("game");
    const user = urlToSearch.searchParams.get("user");
    const address = urlToSearch.searchParams.get("address");
    console.log({ game }, { user }, { address });
    const confirmWinner = await checkWinner(user, game);
    console.log("confirmWinner", confirmWinner);

    if (confirmWinner) {
      const receipt = await makePayment(address, game);
      return json({
        success: true,
        receipt,
      });
    }
  } catch (error) {
    console.log("ERRRORORORORO", error);
    return json({
      error: error,
    });
  }
}
