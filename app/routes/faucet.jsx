import { json } from "@remix-run/node";
import { useFetcher, Form } from "@remix-run/react";
import { ethers } from "ethers";
import * as React from "react";
import { makeItRain } from "~/models/faucet.server";

export async function action({ request }) {
  const formData = await request.formData();
  const address = formData.get("address");
  const response = await makeItRain(address);
  return json(response);
}

export default function Index() {
  // const data = useLoaderData();
  const fetcher = useFetcher();
  const inputEl = React.useRef(null);
  const [message, setMessage] = React.useState(false);

  React.useEffect(() => {
    if (fetcher.state === "submitting") {
      console.log("submitting", fetcher);
    }
    if (fetcher.type === "done" && fetcher.data) {
      console.log("fetcherdata", fetcher.data);
      if (fetcher.data.error) {
        setMessage("Transaction did not happen");
      } else {
        setMessage("Success Check your wallet for token");
      }
    }
  }, [fetcher]);
  const checkAddressAndSend = (event) => {
    event.preventDefault();
    const inputVal = inputEl.current.value;
    const addressValid = ethers.utils.isAddress(inputVal);

    if (addressValid) {
      fetcher.submit(
        {
          address: inputVal,
        },
        { method: "post" }
      );
    }
  };
  return (
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
        <button type="submit" className="btn-secondary btn">
          Submit
        </button>
      </Form>
    </main>
  );
}
