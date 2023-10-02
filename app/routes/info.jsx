import { json } from "@remix-run/node";
import { getCurrentGame } from "~/models/game.server";
import { useLoaderData, Link } from "@remix-run/react";

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
  return (
    <main className="relative min-h-screen bg-secondary sm:flex sm:items-center sm:justify-center lg:bg-base-300">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative sm:overflow-hidden sm:rounded-2xl lg:shadow-xl">
            <div className="absolute inset-0">
              <div className="y absolute inset-0 lg:bg-secondary" />{" "}
              {/*mix-blend-multipl*/}
            </div>
            <div className="relative py-4 px-4 lg:px-8 lg:py-8">
              <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-8xl lg:text-6xl">
                <span className="block uppercase text-primary drop-shadow-md">
                  Yellow in Green
                </span>
              </h1>
              <span className="mx-auto mt-4 block w-full text-center text-4xl font-extrabold uppercase tracking-tight text-accent drop-shadow-md md:max-w-[16rem]">
                Trivia Game
              </span>
              <div className="howtoplay mx-auto my-8 w-full text-base-content lg:w-1/2 ">
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">Inspiration</h2>
                  <p>
                    Most Trivia games discourage users to search the internet,
                    our game encourages using search engines and other avenues
                    of seeking info, its almost a requirement. We seek answers
                    to questions that are fun and obscure. Each question will
                    give a small clue. It's a trivia game with a scavenger hunt
                    component.
                  </p>
                </div>
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">Requirements</h2>
                </div>
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">How to play game</h2>
                  <ul className="ml-8 list-outside list-decimal">
                    <li>
                      You will need at least 1 Trivia Token to play game, head
                      over to the{" "}
                      <Link className="underline" to="/faucet">
                        faucet
                      </Link>{" "}
                      and receive a TRIVIA Token, no cost to you. (you will need
                      a wallet see below)
                    </li>
                    <li>
                      Once you have a TRIVIA token, you can go to the{" "}
                      {data?.currentGame?.id ? (
                        <Link
                          className="underline"
                          to={`/game/${data.currentGame.id}`}
                        >
                          current game
                        </Link>
                      ) : (
                        <span>
                          game (currently there is no game ... stay tuned)
                        </span>
                      )}
                    </li>
                    <li>
                      To Play the game you will need to deposit your token in
                      the pool, There are two transactions in the deposit
                      process, the first one will approve the application to
                      access your token the second transaction will transfer the
                      token to the pool which will cost small amount of{" "}
                      {data.network !== "polygon"
                        ? `${data.network} Ether`
                        : "Polygon Matic"}{" "}
                      to cover the network fees
                    </li>
                  </ul>
                </div>
                <div className="my-4">
                  <h2 className="mb-4 text-center text-xl">
                    Rules to play game
                  </h2>
                  <ul className="ml-8 list-outside list-decimal">
                    <li>
                      You are allowed 30 total attempts to answer all questions
                      before you are disqualified.
                    </li>
                    <li>
                      The winner of the Game will receive all the tokens added
                      to the pool for that Game and also an NFT with data to
                      each question.
                    </li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h2 className="mb-4 text-center text-xl">Ethereum Info</h2>
                  <ul className="ml-8 list-outside list-decimal">
                    <li>
                      <a
                        target="_blank"
                        href="https://cointelegraph.com/ethereum-for-beginners/ethereum-wallets-a-beginners-guide-to-storing-eth"
                        rel="noreferrer"
                        className="underline"
                      >
                        Ethereum wallet a begginners guide
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        href="https://levelup.gitconnected.com/how-to-use-metamask-a-step-by-step-guide-f380a3943fb1"
                        rel="noreferrer"
                        className="underline"
                      >
                        How to set up MetaMask
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        href="https://learn.metamask.io/lessons/what-is-web3"
                        rel="noreferrer"
                        className="underline"
                      >
                        What is Web 3
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        href="https://ethereum.org/en/get-eth/"
                        rel="noreferrer"
                        className="underline"
                      >
                        Where to get/purchase ETH
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h2 className="mb-4 text-center text-xl">
                    Inspiration for site
                  </h2>
                  <p className="text-center">
                    <a
                      target="_blank"
                      href="https://www.youtube.com/watch?v=QsvwRur6Ibg"
                      rel="noreferrer"
                      className="underline"
                    >
                      Yellow in Green
                    </a>
                  </p>
                </div>
                <div className="mb-4">
                  <h2 className="mb-4 text-center text-xl">
                    Support/Inquries/Questions/Comments
                  </h2>
                  <p className="text-center">
                    <a
                      target="_blank"
                      href="https://twitter.com/yellow_in_green"
                      rel="noreferrer"
                      className="underline"
                    >
                      @yellow_in_green
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
