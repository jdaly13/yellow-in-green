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
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [processStage, setProcessStage] = React.useState(0);

  const [tokenAddress, setTokenAddress] = React.useState("");
  const [modalIsOpen, setModalOpen] = React.useState(false);

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
    }
  }, [fetcher]);
  const checkAddressAndSend = (event) => {
    event.preventDefault();
    const inputVal = inputEl.current.value;
    const addressValid = ethers.utils.isAddress(inputVal);

    if (addressValid) {
      setButtonDisabled(true);
      setModalOpen(true);
      setProcessStage(1);
      fetcher.submit(
        {
          address: inputVal,
        },
        { method: "post" }
      );
    } else {
      setModalOpen(true);
      setProcessStage(2);
      setToastMessage("Please enter a valid wallet address");
    }
  };
  React.useEffect(() => {
    document
      .querySelector("#faucet-modal")
      .classList.toggle("modal-open", modalIsOpen);
  }, [modalIsOpen]);
  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-center px-2 lg:px-0">
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
      <div className="modal modal-bottom sm:modal-middle" id="faucet-modal">
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
              <label
                htmlFor="my-modal-6"
                onClick={() => setModalOpen(false)}
                className="btn"
              >
                Close
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
