import { json } from "@remix-run/node";
import { getCurrentGame } from "~/models/game.server";
import { Link, useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
  const currentGame = await getCurrentGame(request);
  console.log({ currentGame });
  return json(currentGame);
}
export default function Index() {
  const data = useLoaderData();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[color:rgba(254,204,27,0.5)] mix-blend-multiply" />
            </div>
            <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-yellow-500 drop-shadow-md">
                  Yellow in Green
                </span>
              </h1>
              <a href="https://remix.run">
                <span className="mx-auto mt-16 block w-full max-w-[12rem] text-center text-2xl font-extrabold uppercase tracking-tight text-yellow-500 drop-shadow-md md:max-w-[16rem]">
                  Trivia Game
                </span>
              </a>
              <Link to={`/game/${data.id}`}>
                <button className="btn-lg btn mx-auto mt-16 block bg-white text-center text-yellow-500">
                  Play Current Game
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
