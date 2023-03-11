import { json } from "@remix-run/node";
import { Form, useLoaderData, useFetcher } from "@remix-run/react";
import * as React from "react";

import {
  getSpecificGame,
  checkAnswer,
  createUserSubmission,
  checkAndDeclareWinner,
} from "~/models/game.server";
import { getContracts } from "~/services/contracts.server";

import ContractContextWrapper from "~/components/ContractContextWrapper";
import WalletProvider from "~/components/WalletProvider";
import Wrapper from "~/components/Wrapper";

export async function loader({ params }) {
  const network = process.env.NETWORK || "localhost";
  const game = await getSpecificGame(params.gameid);
  const contractObj = getContracts(network);
  return json({ game, contractObj, network });
}

export async function action({ request }) {
  const formData = await request.formData();
  const answer = formData.get("data");
  const question = formData.get("_question");
  const user = formData.get("user");
  const gameId = formData.get("gameId");
  console.log("data", answer, question, user, gameId);
  const isValid = await checkAnswer(question, answer);
  if (!isValid) {
    return json({
      answer: "invalid",
    });
  }
  const submission = await createUserSubmission(user, question, answer, gameId);
  if (submission) {
    return checkAndDeclareWinner(user, gameId, submission);
  } else {
    return json(
      {
        errors: {
          message: "An error in creating submission, please try again",
        },
      },
      { status: 400 }
    );
  }
}

export const meta = () => {
  return {
    title: "Game Page",
  };
};

export function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function GameBody(props) {
  const { address, isConnected, deposit } = props;
  console.log("deposit", deposit);
  const data = useLoaderData();
  const fetcher = useFetcher();
  const [answerObj, setAnswerObj] = React.useState({});
  const [user, setUser] = React.useState("");
  const [errorAnswer, setAnswerError] = React.useState(false);
  const [questions, setQuestions] = React.useState(data.game?.questions);

  const previousDepositState = usePrevious(deposit);

  const [toastMessage, setToastMessage] = React.useState("");
  const [processStage, setProcessStage] = React.useState(0);
  const [buttonDisabled, setButtonDisabled] = React.useState(false);

  const [prizeModalOpen, setPrizeModalOpen] = React.useState(false);

  if (
    address &&
    deposit & (previousDepositState !== deposit) &&
    data.game?.id
  ) {
    async function upsertUser() {
      const fetchUrl = `/api/user?address=${address}&game=${data.game.id}`;
      const response = await fetch(fetchUrl);
      const content = await response.json();
      console.log("testing !!!!!!!!", content);
      setUser(content);
    }
    upsertUser();
  }

  React.useEffect(() => {
    if (user) {
      console.log("user use effect", user.submissions, questions);
      const { submissions } = user;

      /* REFACTOR */
      const mapped = questions.map((question) => {
        console.log({ question });
        let match = false;
        for (const sub of submissions) {
          if (sub.questionId === question.id) {
            question.answer = true;
            match = true;
          } else {
            if (!match) {
              question.answer = false;
              match = true;
            }
          }
        }
        if (!submissions.length) {
          question.answer = false;
        }
        return question;
      });
      console.log("mapped", mapped);
      setQuestions(mapped);
    }
  }, [user]);

  React.useEffect(() => {
    if (errorAnswer) {
      setTimeout(() => {
        setAnswerError(false);
      }, 3000);
    }
  }, [errorAnswer]);

  React.useEffect(() => {
    if (fetcher.state === "submitting") {
      console.log("submitting", fetcher);
    }
    if (fetcher.type === "done" && fetcher.data) {
      console.log("fetcherdata", fetcher.data);
      if (fetcher.data.answer === "invalid") {
        setAnswerError(true);
      }
      if (fetcher.data?.questionId) {
        const filtered = questions.map((question) => {
          if (fetcher.data?.questionId === question.id) {
            question.answer = true;
          }
          return question;
        });
        setQuestions(filtered);
      }
    }
  }, [fetcher]);

  React.useEffect(() => {
    document
      .querySelector("#prize-modal")
      .classList.toggle("modal-open", prizeModalOpen);
  }, [prizeModalOpen]);

  const submitForm = (event) => {
    event.preventDefault();
    console.log("DONE", event.target);
    console.log(answerObj[event.target.id]);
    fetcher.submit(
      {
        _question: event.target.id,
        data: answerObj[event.target.id],
        user: user.id,
        gameId: data.game.id,
      },
      { method: "post" }
    );
  };

  const updateValue = (event, index) => {
    setAnswerObj((oldArray) => {
      return { ...oldArray, [event.target.name]: event.target.value };
    });
  };

  const payoutWinner = async () => {
    const userID = user.id;
    const gameID = data.game?.id;
    setButtonDisabled(true);
    setProcessStage(1);
    console.log({ userID }, { gameID }, { address });
    try {
      const repsonse = await fetch(
        `/api/payout?game=${gameID}&user=${userID}&address=${address}`
      );
      const json = await repsonse.json();
      console.log({ json });
      setButtonDisabled(true);
      setProcessStage(3);
      setToastMessage("Success Check your wallet for prize");
      setTimeout(() => {
        setProcessStage(0);
      }, 10000);
    } catch (error) {
      console.log(error);
      setButtonDisabled(false);
      setProcessStage(2);
      setToastMessage(`Transaction did not happen - ${fetcher.data.e.reason}`);
    }
    return null;
  };

  const checkFinalStatus = () => {
    if (
      !data.game?.current &&
      data.game?.winnerId &&
      data.game?.winnerId === address
    ) {
      return (
        <>
          <div className="alert alert-success shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="uppercase">
                Congrats You won The Game - Claim your prize below!
              </span>
            </div>
          </div>
          <div className="my-4">
            <button
              className="btn-success btn border-primary disabled:opacity-50"
              onClick={payoutWinner}
              disabled={buttonDisabled}
            >
              Claim Your Tokens!
            </button>
          </div>
          {/* TODO CREATE BUTTON FOR USER TO RECEIVE FUNDS*/}
        </>
      );
    }
    if (
      !data.game?.current &&
      data.game?.winnerId &&
      data.game?.winnerId !== address
    ) {
      return (
        <h2>
          This game is not current and not playable stay tuned for more upcoming
          games
        </h2>
      );
    }
    return <></>;
  };

  return (
    <>
      <section className="mx-auto mb-6 flex flex-col justify-center px-4 text-center text-secondary-content lg:px-0">
        <h1 className="mb-8 text-center text-4xl uppercase">
          {data.game?.name}
        </h1>
        {checkFinalStatus()}

        {!isConnected && !deposit && data.game?.current && (
          <h1 className="mx-auto mb-8 w-full text-lg uppercase text-error lg:w-1/2">
            Connect your wallet and Add Your TRIVIA token to see full list of
            questions and your chance to earn more TRIVIA Tokens and a free NFT
          </h1>
        )}
        {data.game?.current &&
          !data.game.winnerId &&
          questions.map((question, index) => {
            return (
              <Form
                id={question.id}
                key={question.id}
                className="wrapper mx-auto mb-12 flex flex-col"
                onSubmit={submitForm}
                method="post"
              >
                {deposit && isConnected ? (
                  <div className="text-left">
                    <div className="mb-6 block max-w-md text-left ">
                      {question.content}
                    </div>
                    <input
                      onChange={(e) => {
                        updateValue(e, index);
                      }}
                      className="input-bordered input-accent input input-md w-full focus:outline-none disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-50 lg:mr-2 lg:max-w-xs"
                      type="text"
                      name={question.id}
                      disabled={question.answer}
                    ></input>
                    <button
                      type="submit"
                      className="btn-secondary btn mt-4 w-full lg:mt-0 lg:w-auto"
                      disabled={question.answer}
                    >
                      Submit
                    </button>
                    {question.answer && (
                      <h1 className="my-4 text-center text-primary lg:text-left">
                        You have answered this question correctly
                      </h1>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 block max-w-md text-left ">
                    {question.content.split(" ").splice(0, 5).join(" ")} ...
                  </div>
                )}
              </Form>
            );
          })}
        {!data.game && <p>This is not the game you are looking for</p>}
      </section>
      <div className="modal modal-bottom sm:modal-middle" id="prize-modal">
        <div className="modal-box">
          {processStage === 1 && (
            <div className="pending flex items-center">
              <svg
                aria-hidden="true"
                class="mr-2 inline h-8 w-8 animate-spin fill-green-500 text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="pl-4">Transaction Processing</span>
            </div>
          )}
          {processStage === 2 && (
            <div className="error flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="pl-4">{toastMessage}</span>
            </div>
          )}
          {processStage === 3 && (
            <div className="success flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="pl-4">{toastMessage}</span>
            </div>
          )}
          {processStage > 1 && (
            <div className="modal-action">
              <label onClick={() => setPrizeModalOpen(false)} className="btn">
                Close
              </label>
            </div>
          )}
        </div>
      </div>

      {errorAnswer && (
        <div className="toast-end toast">
          <div className="alert alert-error mb-4 shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Error! Wrong Answer to Question</span>
            </div>
          </div>
        </div>
      )}

      {/* {successMessage && (
        <div className="toast-end toast">
          <div className="alert alert-success shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}

export default function GamePage() {
  const data = useLoaderData();
  return (
    <ContractContextWrapper
      contracts={data.contractObj}
      game={data.game}
      network={data.network}
    >
      <WalletProvider>
        <Wrapper>
          <GameBody />
        </Wrapper>
      </WalletProvider>
    </ContractContextWrapper>
  );
}
