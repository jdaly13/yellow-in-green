import { cloneElement, isValidElement, useState } from "react";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import Header from "./Header";

export default function Wrapper({ children }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const [tokenData, setTokenData] = useState(null);
  const [deposit, setDeposit] = useState(false);
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }
  return (
    <div className="container mx-auto max-w-screen-lg">
      <Header
        address={address}
        disconnect={disconnect}
        isConnected={isConnected}
        chains={chains}
        chain={chain}
        tokenData={tokenData}
        setTokenData={setTokenData}
        setDeposit={setDeposit}
        deposit={deposit}
      ></Header>
      {isValidElement(children) &&
        cloneElement(children, {
          address,
          disconnect,
          isConnected,
          chains,
          chain,
          deposit,
        })}
    </div>
  );
}
