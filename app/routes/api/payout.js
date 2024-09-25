import { json } from "@remix-run/server-runtime";
import { checkWinner } from "~/models/game.server";
import { updateTxInGame } from "~/models/winner.server";
import {
  makeNativePayment,
  makePayment,
  makeSureGameIsActive,
} from "~/models/payout.server";

export async function loader({ request }) {
  try {
    const urlToSearch = new URL(request.url);
    const game = urlToSearch.searchParams.get("game");
    const user = urlToSearch.searchParams.get("user");
    const address = urlToSearch.searchParams.get("address");
    console.log({ game }, { user }, { address });
    const winnerObj = await checkWinner(user, game);
    console.log("confirmWinner", winnerObj);

    if (winnerObj) {
      const isGameActive = await makeSureGameIsActive(game);
      console.log({ isGameActive });
      if (isGameActive) {
        let payoutTx = false;
        if (winnerObj.nativePayout) {
          payoutTx = await makeNativePayment(
            address,
            game,
            winnerObj.nativePayout
          );
        }
        const makePaymentResponse = await makePayment(address, game);

        await updateTxInGame(makePaymentResponse.tx, payoutTx, game, address);
        return json({
          success: true,
          receipt: makePaymentResponse.tx,
          message: "Payment is being processed",
          payoutTx: payoutTx,
        });
      } else {
        return json({
          success: false,
          message:
            "This game is no longer Active! Payment has either been made or will be",
        });
      }
    } else {
      return json({
        success: false,
        message: "We can't confirm winner of this game",
      });
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
