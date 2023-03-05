import { json } from "@remix-run/node";
import { getCurrentGame } from "~/models/game.server";
import { Link, useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
  const currentGame = await getCurrentGame(request);

  return json(currentGame);
}
export default function Index() {
  const data = useLoaderData();
  return (
    <main className="relative min-h-screen bg-base-300 sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <div className="y absolute inset-0 bg-primary" />{" "}
              {/*mix-blend-multipl*/}
            </div>
            <div className="relative px-8 py-8">
              <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-8xl lg:text-6xl">
                <span className="block uppercase text-secondary drop-shadow-md">
                  Yellow in Green
                </span>
              </h1>
              <span className="mx-auto mt-4 block w-full max-w-[12rem] text-center text-4xl font-extrabold uppercase tracking-tight text-accent drop-shadow-md md:max-w-[16rem]">
                Trivia Game
              </span>
              <div className="howtoplay mx-auto my-8 w-1/2 text-base-content ">
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">Requirements</h2>
                  <ul className="list-inside list-disc">
                    <li>Ethereum Wallet like Metamask or Brave Walet</li>
                    <li>Small amount of Ethereum (Gas costs)</li>
                  </ul>
                </div>
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">
                    Steps to Play Game
                  </h2>
                  <ul className="list-inside list-decimal">
                    <li>
                      Go to{" "}
                      <Link className="underline" to="/faucet">
                        faucet
                      </Link>{" "}
                      and request TRIVIA Token, no cost to you.
                    </li>
                    <li>
                      Once you have TRIVIA token, visit current{" "}
                      {data?.id ? (
                        <Link className="underline" to={`/game/${data?.id}`}>
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
                      First Player to answer all questions correctly recieve the
                      pot of TRIVIA Tokens and an NFT for that Game
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
