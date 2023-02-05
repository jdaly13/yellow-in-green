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
  const [questions, setQuestions] = React.useState(data.game.questions);
  const [gameSubmitButton, setGameSubmitButton] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const previousDepositState = usePrevious(deposit);

  if (address && deposit & (previousDepositState !== deposit) && data.game.id) {
    async function upsertUser() {
      const fetchUrl = `/api/user?address=${address}&game=${data.game.id}`;
      const response = await fetch(fetchUrl);
      const content = await response.json();
      console.log(content);
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
      if (questions.length === submissions.length) {
        setGameSubmitButton(true);
      }
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

  const checkAnswers = async (event) => {
    event.preventDefault();
    const fetchUrl = `/api/game-submission?id=${user.id}&game=${data.id}`;
    const response = await fetch(fetchUrl);
    const checkEnding = await response.json();
    if (checkEnding.winnerId && !checkEnding.current) {
      setGameSubmitButton(false);
      setSuccessMessage(
        "Congrats You win The Game you will be receiving tokens soon"
      );
    } else {
      setAnswerError(checkAnswer);
    }
  };

  const checkFinalStatus = () => {
    if (
      !data.game.current &&
      data.game.winnerId &&
      data.game.winnerId === address
    ) {
      return (
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
              Congrats You won The Game you will be receiving tokens soon!
            </span>
          </div>
        </div>
      );
    }
    if (
      !data.game.current &&
      data.game.winnerId &&
      data.game.winnerId !== address
    ) {
      return (
        <h2>
          we Apologize this game is not current and not playable stay tuned for
          upcoming games
        </h2>
      );
    }
    return <></>;
  };

  return (
    <section className="mx-auto mb-6 flex flex-col justify-center text-center text-secondary-content">
      {errorAnswer && (
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
      )}

      {successMessage && (
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
      )}

      <h1 className="mb-8 text-center text-4xl uppercase">{data.game.name}</h1>
      {checkFinalStatus()}

      {!isConnected && !deposit && (
        <h1 className="mx-auto mb-8 w-1/2 text-lg uppercase text-error">
          Connect your wallet and Add Your TRIVIA token to see full list of
          questions and your chance to earn more TRIVIA Tokens and a free NFT
        </h1>
      )}
      {data.game.current &&
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
              {deposit ? (
                <div className="text-left">
                  <div className="mb-6 block max-w-md text-left ">
                    {question.content}
                  </div>
                  <input
                    onChange={(e) => {
                      updateValue(e, index);
                    }}
                    className="input-bordered input-accent input input-md mr-2 w-full max-w-xs focus:outline-none disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-50"
                    type="text"
                    name={question.id}
                    disabled={question.answer}
                  ></input>
                  <button
                    type="submit"
                    className="btn-secondary btn"
                    disabled={question.answer}
                  >
                    Submit
                  </button>
                  {question.answer && (
                    <h1 className="my-4 text-primary">
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
      {gameSubmitButton && data.game.current && (
        <Form onSubmit={checkAnswers} className="flex flex-col text-left">
          <p className="mb-4 font-bold uppercase">
            You have successfully answered all questions!
          </p>
          <button type="submit" className="btn-primary btn">
            submit game
          </button>
        </Form>
      )}
    </section>
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
