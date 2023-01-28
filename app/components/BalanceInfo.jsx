import { useContext, useEffect, useState } from "react";
import { useContractRead, useContractWrite } from "wagmi";
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
    args: [game.id, address],
  });

  // console.log("active player", activePlayer?.data);

  // console.log(utils.formatEther(activePlayer.data) >= 1);

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
  }, [activePlayer, deposit, setDeposit]);

  console.log({ deposit });
  return (
    <div>
      <h3>You have {tokenData} TRIVIA Token</h3>
      {!deposit && tokenData < 1.0 && (
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
      {poolButton && tokenData >= 1.0 && !deposit && (
        <PoolButton setPoolButton={setPoolButton} setDeposit={setDeposit} />
      )}
      {deposit && <p>You are currently playing the game</p>}
    </div>
    // <div>
    //   {tokenData >= 1.0 ? (
    //     <div>
    //       <h3>You have {tokenData} TRIVIA Token</h3>
    //       {poolButton && (
    //         <PoolButton setPoolButton={setPoolButton} setDeposit={setDeposit} />
    //       )}
    //       {deposit && <p>You can now play the game</p>}
    //     </div>
    //   ) : (
    //     <div>
    //       {deposit ? (
    //         <p>You can now play the game</p>
    //       ) : (
    // <>
    //   <h3>You need at least 1 Trivia Token to play the game</h3>
    //   <p>
    //     visit the{" "}
    //     <Link className="underline" to="/faucet">
    //       {" "}
    //       faucet for free TRIVIA token
    //     </Link>
    //   </p>
    // </>
    //       )}
    //     </div>
    //   )}
    // </div>
  );
}

export function PoolButton(props) {
  const { setPoolButton, setDeposit } = props;
  const { contracts, game } = useContext(ContractContext);
  const contractWrite = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contracts.poolJson.address,
    abi: contracts.poolJson.abi,
    functionName: "deposit",
    args: [game.id],
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
  console.log({ contractWrite });

  const buttonClicked = async () => {
    const approveTx = await triviaApprove.writeAsync();
    const tx = await contractWrite.writeAsync();
    const confirmation = await tx.wait();
    if (confirmation.blockNumber) {
      setPoolButton(false);
      setDeposit(true);
      console.log("Congrats");
      // TODO - hack good for now and myabe later
      window.location.reload();
    }
  };

  return (
    <button className="btn-primary btn my-2 block py-2" onClick={buttonClicked}>
      Play Game
    </button>
  );
}
