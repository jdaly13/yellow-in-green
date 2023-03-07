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
  const { contracts, game } = useContext(ContractContext);

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

  useEffect(() => {
    if (data) {
      const formattedData = utils.formatEther(data);
      setTokenData(formattedData);
    }
  }, [data, setTokenData]);

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
      <h3>You have {tokenData} TRIVIA Token</h3>
      {!deposit && tokenData < 1.0 && game?.current && (
        <>
          <h3>You need at least 1 Trivia Token to play the game</h3>
          <p>
            visit the{" "}
            <Link className="underline" to="/faucet">
              {" "}
              faucet for free TRIVIA token
            </Link>
          </p>
        </>
      )}
      {poolButton && tokenData >= 1.0 && !deposit && game?.current && (
        <PoolButton
          setPoolButton={setPoolButton}
          address={address}
          setTokenData={setTokenData}
          setDeposit={setDeposit}
        />
      )}
      {deposit && <p>You are currently playing the game</p>}
    </div>
  );
}

export function PoolButton(props) {
  const [toastMessage, setToastMessage] = useState("");
  const [processStage, setProcessStage] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
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
        setToastMessage("Transaction Success");
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
  };

  return (
    <>
      <button
        disabled={buttonDisabled}
        className="btn-primary btn my-2 block py-2"
        onClick={buttonClicked}
      >
        Play Game
      </button>
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
