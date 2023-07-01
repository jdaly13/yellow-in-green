import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { getUser, createUserSession } from "~/session.server";
import { verifyLogin } from "~/models/monday-morning.server";
import {
  getSpecificGame,
  getAllGames,
  checkAnswers,
} from "~/models/game.server";
import { getContracts } from "~/services/contracts.server";
import { ipfsUpload, mintNFT } from "~/models/nft.server";

import * as React from "react";
import WalletProvider from "~/components/WalletProvider";
import Wrapper from "~/components/Wrapper";
import ContractContextWrapper from "~/components/ContractContextWrapper";

import { validateEmail } from "~/utils";

export async function loader({ request, params }) {
  const network = process.env.NETWORK || "localhost";
  const urlToSearch = new URL(request.url);
  const gameId = urlToSearch.searchParams.get("gameId") ?? undefined;

  const game = await getSpecificGame(gameId);
  console.log("GAME--", game);
  const allGames = await getAllGames();
  const contractObj = getContracts(network);
  const user = await getUser(request);

  return json({
    user,
    game,
    contractObj,
    network,
    allGames,
  });
}

export async function action({ request }) {
  const formData = await request.formData();

  const type = formData.get("type");
  if (type === "checkAnswers") {
    const data = formData.get("data");
    const game_name = formData.get("game_title");
    const game_id = formData.get("game_id");
    const gamer_winner = formData.get("game_winner");

    console.log({ gamer_winner });

    const parsedData = JSON.parse(data);
    console.log({ parsedData });

    const checkedData = await checkAnswers(parsedData);
    console.log({ checkedData });

    const doesItMatch = checkedData?.every((obj) => {
      return Object.values(obj)[0] === true;
    });

    console.log(
      "canwemint",
      doesItMatch && parsedData.length === checkedData.length
    );
    if (doesItMatch && parsedData.length === checkedData.length) {
      // const jsonMetaData = {
      //   author: address,
      //   name: questionTitleValue,
      //   description: questionBodyValue,
      //   program: selectedProgram?.name,
      //   date: Date.now(),
      // };
      // mint NFT
      try {
        const arrayToAdd = parsedData.map((obj) => {
          const object = {};
          Object.keys(obj).forEach((value) => {
            if (value === "questionText") {
              object.questionText = obj[value];
            } else {
              object.answer = obj[value];
            }
          });
          return object;
        });

        console.log(arrayToAdd);
        // TODO Image or some other kind of media assett
        const ipfsUploadObj = {
          date: new Date(),
          name: game_name, //
          description: `Yellow in Green Trophy for game ${game_id}`,
          attributes: arrayToAdd,
          game_winner_address: gamer_winner,
        };
        console.log({ ipfsUploadObj });
        //https://yellow-in-green.infura-ipfs.io/ipfs/QmNbAqjeS3smVEgj1mcBJWo1cuquXNaN8VRDMBQgqQBg93
        const response = await ipfsUpload(JSON.stringify(ipfsUploadObj));
        console.log(!!response, "testing");
        const ipfsResponseObj = await response.json();
        console.log({ ipfsResponseObj });

        const ipfsUrl = `https://yellow-in-green.infura-ipfs.io/ipfs/${ipfsResponseObj.Hash}`;
        console.log({ ipfsUrl });

        const nftObject = await mintNFT(gamer_winner, ipfsUrl);
        console.log({ nftObject });

        // mint token

        return nftObject;
      } catch (error) {
        console.error("err!", error);
        throw new Error(error);
      }
    }
  }

  const email = formData.get("email");
  const password = formData.get("password");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);
  console.log({ user });

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
  });
}

export const meta = () => {
  return {
    title: "portal",
  };
};

// TODO ADD TO UTILS
export function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function MondayMorning(props) {
  const data = useLoaderData();
  console.log({ data }, props);
  const actionData = useActionData();

  const fetcher = useFetcher();
  const { address } = props;

  // REFS
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const gameRef = React.useRef(null);
  const questionRef = React.useRef(null);
  const answerRef = React.useRef(null);
  const gameToReferenceRef = React.useRef(null);
  const makeGameActiveRef = React.useRef(null);

  const makeGameInactiveRef = React.useRef(null);
  const winlessGameIdRef = React.useRef(null);

  // CUSTOM HOOK
  const previousAddress = usePrevious(address);

  //STATE
  const [recentGameCreated, setRecentGameCreated] = React.useState(null);
  const [recentQuestionCreated, setRecentQuestionCreated] =
    React.useState(null);
  const [currentErrorMessage, setCurrentErrorMessage] = React.useState(null);
  const [mostCurrentGame, setMostCurrentGame] = React.useState(false);

  const [allActiveGames, setAllActiveGames] = React.useState(null);
  const [winlessGames, setAllWinlessGames] = React.useState(null);

  // HOOKS
  React.useEffect(() => {
    async function checkAddress() {
      const content = await fetch(`/api/portal?address=${address}`);
      const addressData = await content.json();
      console.log({ addressData }, address);
      if (!addressData?.match) {
        window.location.href = window.location.origin;
      }
    }
    if (address && previousAddress !== address) {
      console.log("address", address, "previousaddress", previousAddress);
      checkAddress();
    }
  }, [address, previousAddress]);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      // emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
    console.log({ actionData });
  }, [actionData]);

  // END HOOKS

  const createGame = async (event) => {
    event.preventDefault();
    const nameOfGame = gameRef.current.value;
    const makeGameActive = makeGameActiveRef.current.checked;
    if (nameOfGame.length > 7) {
      const fetchUrl = `/api/game-creation?game=${nameOfGame}&makeCurrent=${makeGameActive}`;
      const response = await fetch(fetchUrl);
      const gameJson = await response.json();
      console.log(gameJson);
      if (gameJson.id) {
        setRecentGameCreated(gameJson.id);
        gameRef.current.value = "";
        setCurrentErrorMessage("");
      } else {
        setCurrentErrorMessage("error in creating game");
      }
    }
  };

  const createQuestionAndAnswer = async (event) => {
    event.preventDefault();
    const questionText = questionRef.current.value;
    const answerText = answerRef.current.value;
    const gameReference = gameToReferenceRef.current.value || recentGameCreated;
    if (questionText.length > 7 || answerText.length > 2) {
      const postResponse = await fetch("/api/question-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionText,
          answerText,
          gameId: gameReference,
        }),
      });
      const postResponseJson = await postResponse.json();
      console.log("postresponse", postResponseJson);

      if (postResponseJson) {
        setRecentQuestionCreated(postResponseJson.id);
        questionRef.current.value = "";
        answerRef.current.value = "";
        setCurrentErrorMessage("");
      } else {
        setCurrentErrorMessage("error in creating question");
      }
    }
  };

  const getCurrentGame = async () => {
    try {
      const response = await fetch("/api/get-current-game");
      const json = await response.json();
      console.log("json--", json);
      setMostCurrentGame(JSON.stringify(json));
    } catch (error) {
      console.log("ERR -", error);
      setMostCurrentGame(JSON.stringify(false));
    }
  };

  const getActiveGames = async () => {
    try {
      const response = await fetch("/api/get-active-games");
      const json = await response.json();
      console.log("json--", json);
      setAllActiveGames(JSON.stringify(json));
    } catch (error) {
      console.log("ERR -", error);
      setAllActiveGames(JSON.stringify(false));
    }
  };

  const makeGameInactive = async () => {
    const gameId = makeGameInactiveRef.current.value;
    try {
      const response = await fetch(`/api/make-game-inactive?gameId=${gameId}`);
      const json = await response.json();
      console.log("json--", json);
      if (json.current === false) {
        alert("updated success");
      }
      // setAllActiveGames(JSON.stringify(json));
    } catch (error) {
      console.log("ERR -", error);
      // setAllActiveGames(JSON.stringify(false));
    }
  };

  const getGamesWithNoWinner = async () => {
    try {
      const response = await fetch("/api/get-winless-games");
      const json = await response.json();
      console.log("json--", json);
      setAllWinlessGames(JSON.stringify(json));
    } catch (error) {
      console.log("ERR -", error);
      setAllWinlessGames(JSON.stringify(false));
    }
  };

  const makeWinlessGameActive = async () => {
    const gameId = winlessGameIdRef.current.value;
    try {
      const response = await fetch(
        `/api/make-winless-game-active?gameId=${gameId}`
      );
      const json = await response.json();
      console.log("json--", json);
      if (json.current === true) {
        alert("updated success");
      }
      // setAllActiveGames(JSON.stringify(json));
    } catch (error) {
      console.log("ERR -", error);
      // setAllActiveGames(JSON.stringify(false));
    }
  };

  const checkAnswersToGame = async (e) => {
    e.preventDefault();
    const submissionData = data.game?.questions.map((question) => {
      const obj = {};
      console.log(question.id);
      obj[question.id] = document.getElementById(question.id).value;
      obj.questionText = question.content;
      return obj;
    });

    fetcher.submit(
      {
        type: "checkAnswers",
        data: JSON.stringify(submissionData),
        game_id: document.querySelector(`[name=game_id]`)?.value,
        game_title: document.querySelector(`[name=game_title]`)?.value,
        game_winner: document.querySelector(`[name=game_winner]`)?.value,
      },
      { method: "post" }
    );
  };

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        {data.user ? (
          <>
            {currentErrorMessage && (
              <h1 className="pt-1 text-lg text-red-700">
                Error Message {currentErrorMessage}{" "}
              </h1>
            )}
            <Form onSubmit={createGame} className="space-y-6">
              <div>
                <label
                  htmlFor="game"
                  className="block text-sm font-medium text-gray-700"
                >
                  Create Game
                </label>
                <div className="mb-1">
                  <input
                    ref={gameRef}
                    id="game"
                    defaultValue=""
                    name="game"
                    type="text"
                    className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                    placeholder="Name of new game"
                  />
                </div>
              </div>
              {JSON.parse(mostCurrentGame) === null && (
                <>
                  <label htmlFor="make-active">Make Game active</label>
                  <input
                    name="make-active"
                    ref={makeGameActiveRef}
                    type="checkbox"
                  />
                </>
              )}
              <button
                type="submit"
                disabled={mostCurrentGame === false}
                className="w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-50"
              >
                Create Game
              </button>
            </Form>
            <button
              onClick={getCurrentGame}
              className="mt-6 w-full rounded bg-blue-500 py-2 px-4 text-white"
            >
              Get Current Game
            </button>
            {mostCurrentGame !== false && (
              <p>Most current Game: {mostCurrentGame.toString()}</p>
            )}
            <div className="my-6 border border-black p-4">
              <h1 className="mb-2 font-bold">Manage Active Games</h1>
              <button
                onClick={getActiveGames}
                className="mt-6 w-full rounded bg-blue-500 py-2 px-4 text-white"
              >
                Get Active Games
              </button>
              {allActiveGames && (
                <div>
                  {allActiveGames}
                  <div className="flex flex-wrap p-4">
                    <input
                      ref={makeGameInactiveRef}
                      type="text"
                      placeholder="Game ID"
                      className="w-full p-2"
                    />
                    <button
                      className="mt-6 w-full rounded bg-blue-500 py-2 px-4 text-white "
                      onClick={makeGameInactive}
                    >
                      Make Inactive
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="my-6 border border-black p-4">
              <h1 className="mb-2 font-bold">get all games with no winner</h1>
              <button
                onClick={getGamesWithNoWinner}
                className="mt-6 w-full rounded bg-blue-500 py-2 px-4 text-white"
              >
                Get Games with no Winner
              </button>
              {winlessGames && (
                <div>
                  {winlessGames}
                  <div className="flex flex-wrap p-4">
                    <input
                      type="text"
                      className="w-full p-2"
                      placeholder="make game active"
                      ref={winlessGameIdRef}
                    />
                    <button
                      className="mt-6 w-full rounded bg-blue-500 py-2 px-4 text-white"
                      onClick={makeWinlessGameActive}
                    >
                      Make Game active game
                    </button>
                  </div>
                </div>
              )}
            </div>
            {recentGameCreated && (
              <>
                <h4 className="mb-2">
                  Most recent game created is {recentGameCreated}
                </h4>
                <Form onSubmit={createQuestionAndAnswer} className="space-y-6">
                  <div>
                    <label
                      htmlFor="question"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Create Question
                    </label>
                    <div className="mb-1">
                      <input
                        ref={questionRef}
                        id="question"
                        defaultValue=""
                        name="question"
                        type="text"
                        className="mb-4 w-full rounded border border-gray-500 px-2 py-1 text-lg"
                        placeholder="Question Title"
                      />
                      <input
                        ref={answerRef}
                        id="answer"
                        defaultValue=""
                        name="answer"
                        type="text"
                        className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                        placeholder="Answer to Question"
                      />
                      <input
                        ref={gameToReferenceRef}
                        id="gameToReference"
                        defaultValue=""
                        name="gameToReference"
                        type="text"
                        className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                        placeholder="Add question to this game id"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                  >
                    Create Question with Answer
                  </button>
                  {recentQuestionCreated && (
                    <h4 className="mt-1">
                      Most recent question created ID is {recentQuestionCreated}
                    </h4>
                  )}
                </Form>
              </>
            )}
            <section className="m-8 border border-black p-6">
              <h1 className="mb-2 text-xl font-bold">
                Game requested in url query string default to first
              </h1>
              <p>Game requested in url - name: {data.game?.name}</p>
              <p>Game requested in url - id: {data.game?.id}</p>
              <h4 className="my-4">QUESTIONS!</h4>
              <Form onSubmit={checkAnswersToGame}>
                {data.game?.questions.map((question) => {
                  return (
                    <div key={question.id}>
                      <p>
                        question id: {question.id} - question text:{" "}
                        {question.content}
                      </p>
                      <input type="text" id={question.id} name={question.id} />
                    </div>
                  );
                })}
                <input
                  type="hidden"
                  name="game_title"
                  value={data.game?.name}
                />
                <input type="hidden" name="game_id" value={data.game?.id} />
                <input
                  type="hidden"
                  name="game_winner"
                  value={data.game?.winnerId}
                />
                <button className="btn my-4" type="submit">
                  submit
                </button>
              </Form>
            </section>
            <section className="m-4 border border-black p-6">
              <h1>All Games</h1>
              <div className="flex flex-wrap justify-between">
                {data.allGames.map((game, index) => {
                  return (
                    <div key={index} className="mb-4">
                      <p className="font-bold">name: {game.name}</p>
                      <p className="italic">id: {game.id}</p>
                      <p className="pt-2">winner: {game.winnerId}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <Form method="post" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                User
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  required
                  name="email"
                  type="email"
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby="email-error"
                  className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                />

                {actionData?.errors?.email && (
                  <div className="pt-1 text-red-700" id="email-error">
                    {actionData.errors.email}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  ref={passwordRef}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={actionData?.errors?.password ? true : undefined}
                  aria-describedby="password-error"
                  className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                />

                {actionData?.errors?.password && (
                  <div className="pt-1 text-red-700" id="password-error">
                    {actionData.errors.password}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Log in
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}

export default function Container() {
  const data = useLoaderData();
  return (
    <ContractContextWrapper
      contracts={data.contractObj}
      game={data.game}
      network={data.network}
    >
      <WalletProvider>
        <Wrapper>
          <MondayMorning />
        </Wrapper>
      </WalletProvider>
    </ContractContextWrapper>
  );
}
