import { json } from "@remix-run/node";
import { Form, useLoaderData, useFetcher } from "@remix-run/react";
import * as React from "react";

import { getSpecificGame, checkAnswers } from "~/models/game.server";

import WalletProvider from "~/components/WalletProvider";
import Wrapper from "~/components/Wrapper";

export async function loader({ params }) {
  const game = await getSpecificGame(params.gameid);
  return json(game);
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = formData.get("data");
  console.log("data", JSON.parse(data));
  await checkAnswers(JSON.parse(data));
  return null;
}

export const meta = () => {
  return {
    title: "Game Page",
  };
};

function GameBody(props) {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const [answerObjArr, setAnswerArrObj] = React.useState([]);
  console.log({ props });

  const submitForm = (event) => {
    event.preventDefault();
    console.log("DONE", event.target);
    console.log(answerObjArr);
    fetcher.submit(
      {
        _action: "answer",
        data: JSON.stringify(answerObjArr),
      },
      { method: "post" }
    );
  };

  React.useEffect(() => {
    console.log(answerObjArr);
  }, [answerObjArr]);

  const updateValue = (event, index) => {
    let arrOfObjects = [...answerObjArr];
    if (!arrOfObjects[index]) {
      setAnswerArrObj((oldArray) => [
        ...oldArray,
        { [event.target.name]: event.target.value },
      ]);
    } else {
      arrOfObjects[index][event.target.name] = event.target.value;
      setAnswerArrObj(arrOfObjects);
    }
  };
  return (
    <section className="mx-auto flex flex-col justify-center text-center">
      <h1 className="my-6 text-4xl uppercase">{data.name}</h1>
      <Form id={data.id} onSubmit={submitForm}>
        <ul className="wrapper flex flex-col justify-start">
          {data.questions.map((question, index) => {
            return (
              <li key={question.id} className="mb-8 block text-left">
                <div className="py-4">{question.content}</div>
                <div>
                  <input
                    onChange={(e) => {
                      updateValue(e, index);
                    }}
                    className="input-bordered input input-md w-full max-w-xs"
                    type="text"
                    name={question.id}
                  ></input>
                </div>
              </li>
            );
          })}
        </ul>
        <button type="submit" className="btn-primary btn">
          Submit
        </button>
      </Form>
    </section>
  );
}

export default function GamePage() {
  return (
    <WalletProvider>
      <Wrapper>
        <GameBody />
      </Wrapper>
    </WalletProvider>
  );
}
