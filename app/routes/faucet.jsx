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

  const [tokenAddress, setTokenAddress] = React.useState("");

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
        setTokenAddress(fetcher.data?.tokenAddress);
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
      <main className="relative flex min-h-screen flex-col items-center justify-center px-2 lg:px-0">
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
          <h2 className="mt-3 text-center text-primary">
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
          className="wrapper mx-auto flex w-full flex-wrap text-left lg:w-5/12 lg:flex-nowrap"
        >
          <input
            onChange={(e) => {}}
            className=" input-bordered input-accent input input-md w-full focus:outline-none disabled:border-slate-200  disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-50 lg:mr-2 lg:w-full"
            type="text"
            placeholder="Enter your wallet address"
            ref={inputEl}
          ></input>
          <button
            type="submit"
            disabled={buttonDisabled}
            className="btn-secondary btn mt-4 w-full lg:mt-0 lg:w-auto"
          >
            Submit
          </button>
        </Form>
        {tokenAddress && (
          <h3 className="text-md my-4 w-full break-words text-center">
            Add this token address {tokenAddress} to your wallet, go{" "}
            <a
              className="underline"
              href="https://support.ledger.com/hc/en-us/articles/6375103346077-Add-custom-tokens-to-MetaMask"
              target="_blank"
              rel="noreferrer"
            >
              Here
            </a>{" "}
            for directions on adding tokens using Metamask
          </h3>
        )}
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
