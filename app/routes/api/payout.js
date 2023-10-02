import { json } from "@remix-run/server-runtime";
import { checkWinner } from "~/models/game.server";
import { makePayment, makeSureGameIsActive } from "~/models/payout.server";

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
      const isGameActive = await makeSureGameIsActive(game);
      console.log({ isGameActive });
      if (isGameActive) {
        const receipt = await makePayment(address, game);
        return json({
          success: true,
          receipt,
          message: "Payment has been made",
        });
      } else {
        return json({
          success: false,
          message:
            "This game is no longer Active! Payment has either been made or will be",
        });
      }
    }
  } catch (error) {
    console.log("ERRRORORORORO", error);
    return json({
      success: false,
      error: error,
      message:
        "An Error occurred with our servers - payment will be made manually if not done already",
    });
  }
}
