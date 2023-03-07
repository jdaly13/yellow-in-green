import { json } from "@remix-run/node";
import { useFetcher, Form, useLoaderData, Link } from "@remix-run/react";
import { ethers } from "ethers";
import * as React from "react";
import { makeItRain } from "~/models/faucet.server";
import { getCurrentGame } from "~/models/game.server";

export async function action({ request }) {
  const formData = await request.formData();
  const address = formData.get("address");
  const response = await makeItRain(address);
  return json(response);
}

export async function loader({ request }) {
  const currentGame = await getCurrentGame(request);
  console.log({ currentGame });
  return json(currentGame);
}

export default function Index() {
  // const data = useLoaderData();
  const data = useLoaderData();
  const fetcher = useFetcher();
  const inputEl = React.useRef(null);
  const [message, setMessage] = React.useState(false);
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [processStage, setProcessStage] = React.useState(0);

  React.useEffect(() => {
    if (fetcher.state === "submitting") {
      console.log("submitting", fetcher);
    }
    if (fetcher.type === "done" && fetcher.data) {
      console.log("fetcherdata", fetcher.data.e);
      if (fetcher.data.e) {
        setButtonDisabled(false);
        setProcessStage(2);
        setToastMessage(
          `Transaction did not happen - ${fetcher.data.e.reason}`
        );
      } else {
        setButtonDisabled(false);
        setProcessStage(3);
        setToastMessage("Success Check your wallet for token");
      }
      setTimeout(() => {
        setProcessStage(0);
      }, 10000);
    }
  }, [fetcher]);
  const checkAddressAndSend = (event) => {
    event.preventDefault();
    const inputVal = inputEl.current.value;
    const addressValid = ethers.utils.isAddress(inputVal);

    if (addressValid) {
      setButtonDisabled(true);
      setProcessStage(1);
      fetcher.submit(
        {
          address: inputVal,
        },
        { method: "post" }
      );
    }
  };
  return (
    <>
      <main className="relative min-h-screen flex-col sm:flex sm:items-center sm:justify-center">
        {message && (
          <div>
            <h3 className="text-center text-xl">{message}</h3>
          </div>
        )}
        <div className="relative ">
          <h1 className="text-center text-2xl font-extrabold tracking-tight">
            <span className="block uppercase text-yellow-500 drop-shadow-md">
              Yellow in Green TRIVIA Faucet
            </span>
          </h1>
          <h2 className="mt-3 text-primary">
            Once you have received token go to current{" "}
            <Link className="underline" to={`/game/${data.id}`}>
              Game
            </Link>
          </h2>
          <h3 className="text-md my-4 text-center">
            1 TRIVIA Token per 24 hour period
          </h3>
        </div>
        <Form
          onSubmit={checkAddressAndSend}
          method="post"
          className="wrapper mx-auto flex w-5/12 text-left"
        >
          <input
            onChange={(e) => {}}
            className=" input-bordered input-accent input input-md mr-2 w-3/4 w-full  focus:outline-none disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-50"
            type="text"
            placeholder="Enter your wallet address"
            ref={inputEl}
          ></input>
          <button
            type="submit"
            disabled={buttonDisabled}
            className="btn-secondary btn"
          >
            Submit
          </button>
        </Form>
      </main>
      {processStage > 0 && (
        <div className="toast-end toast">
          {processStage === 1 && (
            <div className="alert alert-info">
              <div>
                <span>Trasaction Processing</span>
              </div>
            </div>
          )}
          {processStage === 2 && (
            <div className="alert alert-error">
              <div>
                <span>{toastMessage}</span>
              </div>
            </div>
          )}
          {processStage === 3 && (
            <div className="alert alert-success">
              <div>
                <span>{toastMessage}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
