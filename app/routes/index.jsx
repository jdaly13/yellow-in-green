import { json } from "@remix-run/node";
import { getCurrentGame } from "~/models/game.server";
import { Link, useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
  const currentGame = await getCurrentGame(request);
  const network = process.env.NETWORK || "localhost";

  return json({
    currentGame,
    network,
  });
}
export default function Index() {
  const data = useLoaderData();
  console.log({ data });
  return (
    <main className="relative min-h-screen bg-primary sm:flex sm:items-center sm:justify-center lg:bg-base-300">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative sm:overflow-hidden sm:rounded-2xl lg:shadow-xl">
            <div className="absolute inset-0">
              <div className="y absolute inset-0 lg:bg-primary" />{" "}
              {/*mix-blend-multipl*/}
            </div>
            <div className="relative py-4 px-4 lg:px-8 lg:py-8">
              <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-8xl lg:text-6xl">
                <span className="block uppercase text-secondary drop-shadow-md">
                  Yellow in Green
                </span>
              </h1>
              <span className="mx-auto mt-4 block w-full text-center text-xl font-extrabold tracking-tight text-accent drop-shadow-md ">
                A simple trivia game with a scavenger hunt component
              </span>
              <div className="howtoplay mx-auto my-8 w-full text-base-content lg:w-1/2 ">
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">Requirements</h2>
                  <ul className="ml-6 list-outside list-disc">
                    <li>Ethereum Wallet like Metamask or Brave Walet</li>
                    <li>
                      Small amount of{" "}
                      {data.network !== "polygon"
                        ? `${data.network} Ether`
                        : "Polygon Matic"}{" "}
                      to cover transaction costs
                    </li>
                  </ul>
                </div>
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">
                    Steps to Play Game
                  </h2>
                  <ul className="ml-8 list-outside list-decimal">
                    <li>
                      Go to{" "}
                      <Link className="underline" to="/faucet">
                        faucet
                      </Link>{" "}
                      and request TRIVIA Token, no cost to you.
                    </li>
                    <li>
                      Once you have TRIVIA token, visit current{" "}
                      {data?.currentGame?.id ? (
                        <Link
                          className="underline"
                          to={`/game/${data.currentGame.id}`}
                        >
                          Game
                        </Link>
                      ) : (
                        <span>
                          Game (currently there is no game ... stay tuned)
                        </span>
                      )}
                    </li>
                    <li>Connect Wallet</li>
                    <li>Add Your Ante (TRIVIA token) to the pot</li>
                    <li>
                      First Player to answer all questions correctly receives
                      the pot of TRIVIA Tokens and an NFT for that Game
                    </li>
                    <li>
                      For more info and FAQ visit{" "}
                      <Link className="underline" to={`info`}>
                        Info
                      </Link>{" "}
                      page
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
