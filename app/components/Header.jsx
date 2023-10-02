import { useWeb3Modal } from "@web3modal/react";
import { useContext } from "react";
import { truncateAddress } from "~/utils";
import BalanceInfo from "./BalanceInfo";
import { ContractContext } from "~/components/ContractContextWrapper";
export default function Header({
  address,
  disconnect,
  isConnected,
  chains,
  chain,
  tokenData,
  setTokenData,
  setDeposit,
  deposit,
}) {
  const { open } = useWeb3Modal();
  const { network } = useContext(ContractContext);
  const checkChain = () => {
    if (isConnected && address && chain?.name.toLowerCase() !== network) {
      setDeposit(false);
      return <p> Please connect your wallet to the {network} network</p>;
    } else {
      return null;
    }
  };
  return (
    <header className="my-4 flex flex-col-reverse px-4 lg:my-8 lg:flex-row lg:justify-between lg:px-0 ">
      {isConnected && address && chain?.name.toLowerCase() === network && (
        <BalanceInfo
          setTokenData={setTokenData}
          tokenData={tokenData}
          address={address}
          setDeposit={setDeposit}
          deposit={deposit}
          chain={chain}
        />
      )}
      {checkChain()}
      {!isConnected && (
        <button className="btn-primary btn" onClick={() => open()}>
          Connect Wallet
        </button>
      )}
      {isConnected && (
        <div className="mb-4 flex flex-col justify-center lg:mb-0 lg:justify-end">
          {chain && (
            <p className="pb-1 text-center lg:text-left">
              Connected to: {chain.name}
            </p>
          )}
          {address && (
            <p className="mb-4 text-center lg:text-left">
              Address: {truncateAddress(address)}{" "}
            </p>
          )}
          <button onClick={disconnect} className="btn-primary btn block py-2">
            Disconnect
          </button>
        </div>
      )}
    </header>
  );
}
