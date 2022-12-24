import { useContext } from "react";
import { useContractRead } from "wagmi";
import { utils } from "ethers";
import { ContractContext } from "~/components/ContractContextWrapper";

export default function BalanceInfo({ address, setTokenData, tokenData }) {
  const { contracts } = useContext(ContractContext);
  const { data } = useContractRead({
    address: contracts.triviaJson.address,
    abi: contracts.triviaJson.abi,
    functionName: "balanceOf",
    args: [address],
  });
  const formattedData = utils.formatEther(data);
  setTokenData(formattedData);

  return (
    <div>
      {formattedData >= 1.0 ? (
        <div>
          <h3>You have {formattedData} TRIVIA Token</h3>
        </div>
      ) : (
        <h3>You need Trivia Token to play the game</h3>
      )}
    </div>
  );
}
