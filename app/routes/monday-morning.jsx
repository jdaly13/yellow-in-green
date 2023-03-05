import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUser, createUserSession } from "~/session.server";
import { verifyLogin } from "~/models/monday-morning.server";
import { getSpecificGame } from "~/models/game.server";
import { getContracts } from "~/services/contracts.server";

import * as React from "react";
import WalletProvider from "~/components/WalletProvider";
import Wrapper from "~/components/Wrapper";
import ContractContextWrapper from "~/components/ContractContextWrapper";

import { validateEmail } from "~/utils";

export async function loader({ request, params }) {
  const network = process.env.NETWORK || "localhost";
  console.log("gameid", params.gameid);

  const game = await getSpecificGame(params.gameid);
  console.log("GAME--", game);
  const contractObj = getContracts(network);
  const user = await getUser(request);
  // if (user) {
  //   return json({
  //     user,
  //   });
  // } else {
  //   return json({
  //     user: null,
  //   });
  // }
  return json({
    user,
    game,
    contractObj,
    network,
  });
}

export async function action({ request }) {
  const formData = await request.formData();
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
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const gameRef = React.useRef(null);
  const questionRef = React.useRef(null);
  const answerRef = React.useRef(null);
  const gameToReferenceRef = React.useRef(null);
  const makeGameActiveRef = React.useRef(null);
  const { address } = props;
  const previousAddress = usePrevious(address);
  const [recentGameCreated, setRecentGameCreated] = React.useState(null);
  const [recentQuestionCreated, setRecentQuestionCreated] =
    React.useState(null);
  const [currentErrorMessage, setCurrentErrorMessage] = React.useState(null);
  const [mostCurrentGame, setMostCurrentGame] = React.useState(false);

  React.useEffect(() => {
    async function checkAddress() {
      const content = await fetch(`api/portal?address=${address}`);
      const data = await content.json();
      console.log("data", data, address);
      if (!data?.match) {
        window.location.href = window.location.origin;
      }
    }
    // if (!address) {
    //   window.location.href = window.location.origin;
    // }
    if (address && previousAddress !== address) {
      console.log("address", address, "previousaddress", previousAddress);
      checkAddress();
    }
  }, [address, previousAddress, props]);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      // emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
    console.log({ actionData });
  }, [actionData]);

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
                  <label for="make-active">Make Game active</label>
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
