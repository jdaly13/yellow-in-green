import { useContext, useEffect, useState } from "react";
import {
  useContractRead,
  useContractWrite,
  useContract,
  useProvider,
} from "wagmi";
import { Link } from "@remix-run/react";
import { utils } from "ethers";
import { ContractContext } from "~/components/ContractContextWrapper";

export default function BalanceInfo({
  address,
  setTokenData,
  tokenData,
  setDeposit,
  deposit,
}) {
  const [poolButton, setPoolButton] = useState(false);
  const [prizeAmount, setPrizeAmount] = useState(null);
  const { contracts, game } = useContext(ContractContext);
  console.log({ game });

  const { data } = useContractRead({
    address: contracts.triviaJson.address,
    abi: contracts.triviaJson.abi,
    functionName: "balanceOf",
    args: [address],
  });

  const activePlayer = useContractRead({
    address: contracts.poolJson.address,
    abi: contracts.poolJson.abi,
    functionName: "depositPerUserperGame",
    args: [game?.id, address],
  });

  const poolAmount = useContractRead({
    address: contracts.poolJson.address,
    abi: contracts.poolJson.abi,
    functionName: "depositsPerGame",
    args: [game?.id],
  });

  useEffect(() => {
    if (data) {
      const formattedData = utils.formatEther(data);
      setTokenData(formattedData);
    }
  }, [data, setTokenData]);

  useEffect(() => {
    if (poolAmount?.data) {
      const formatedData = utils.formatEther(poolAmount.data);
      setPrizeAmount(formatedData);
    }
  }, [poolAmount]);

  useEffect(() => {
    if (activePlayer?.data && utils.formatEther(activePlayer.data) < 1) {
      setPoolButton(true);
    }
    if (activePlayer?.data && utils.formatEther(activePlayer.data) >= 1) {
      setDeposit(true);
    }
    if (activePlayer?.data && utils.formatEther(activePlayer.data) < 1) {
      setDeposit(false);
    }
  }, [activePlayer, deposit, setDeposit]);

  // TODO REFACTOR
  return (
    <div>
      <h3 className="text-center lg:text-left">
        You have {tokenData} TRIVIA Token
      </h3>
      {!deposit && tokenData < 1.0 && game?.current && (
        <>
          <h3 className="text-center lg:text-left">
            You need at least 1 Trivia Token to play the game
          </h3>
          <p className="text-center lg:text-left">
            visit the{" "}
            <Link className="underline" to="/faucet">
              {" "}
              faucet for free TRIVIA token
            </Link>
          </p>
        </>
      )}
      {prizeAmount && game?.current && (
        <p className="font-bold">
          Current prize amount: {prizeAmount} TRIVIA Tokens
        </p>
      )}
      {game?.user?.length > 3 && game?.current && (
        <p className="">There are currently {game.user.length} players</p>
      )}
      {poolButton && tokenData >= 1.0 && !deposit && game?.current && (
        <PoolButton
          setPoolButton={setPoolButton}
          address={address}
          setTokenData={setTokenData}
          setDeposit={setDeposit}
        />
      )}
      {deposit && game?.current && (
        <p className="font-bold">You are currently playing the game</p>
      )}
    </div>
  );
}

export function PoolButton(props) {
  const [toastMessage, setToastMessage] = useState("");
  const [processStage, setProcessStage] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const { setPoolButton, setDeposit } = props;
  const { contracts, game } = useContext(ContractContext);
  const provider = useProvider();
  const contractWrite = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contracts.poolJson.address,
    abi: contracts.poolJson.abi,
    functionName: "deposit",
    args: [game?.id],
    onError: (err) => {
      console.error(err);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
    onSuccess(data) {
      console.log("Success", data);
    },
  });

  const triviaApprove = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contracts.triviaJson.address,
    abi: contracts.triviaJson.abi,
    functionName: "approve",
    args: [contracts.poolJson.address, utils.parseEther("1")],
    onError: (err) => {
      console.error(err);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
    onSuccess(data) {
      console.log("Success", data);
    },
  });

  const tokenContract = useContract({
    address: contracts.triviaJson.address,
    abi: contracts.triviaJson.abi,
    signerOrProvider: provider,
  });

  const buttonClicked = async () => {
    setButtonDisabled(true);
    setProcessStage(1);
    setPlayModalOpen(true);
    try {
      const approveTx = await triviaApprove.writeAsync();
      const approveConfirmation = await approveTx?.wait();
      if (approveConfirmation.blockNumber) {
        const tx = await contractWrite.writeAsync();
        const confirmation = await tx.wait();
        if (confirmation.blockNumber) {
          setPoolButton(false);
          setDeposit(true);
          console.log("Congrats");
          setProcessStage(3);
          setToastMessage(
            "Transaction Success, if Balance information isn't immediately reflected please wait and refresh browser"
          );
          const currentTriviaBalance = await tokenContract.balanceOf(
            props.address
          );
          const formattedData = utils.formatEther(currentTriviaBalance);
          props.setTokenData(formattedData);
          // TODO - hack good for now and myabe later
          window.location.reload();
        } else {
          setProcessStage(2);
          setToastMessage(
            "Transaction to add Token to Game bettin pool did not go through - try again"
          );
        }
      } else {
        setProcessStage(2);
        setToastMessage("Approval did not go through - try again");
      }
    } catch (error) {
      setProcessStage(2);
      setToastMessage("An Error occurred! Please try again later");
    }
  };

  useEffect(() => {
    document
      .querySelector("#modal-play-game")
      .classList.toggle("modal-open", playModalOpen);
  }, [playModalOpen]);

  return (
    <>
      <button
        disabled={buttonDisabled}
        className="btn-primary btn my-2 mx-auto block py-2 lg:mx-0"
        onClick={buttonClicked}
      >
        Play Game
      </button>
      <div className="modal modal-bottom sm:modal-middle" id="modal-play-game">
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
              <label onClick={() => setPlayModalOpen(false)} className="btn">
                Close
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
