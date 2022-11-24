import { useWeb3Modal } from "@web3modal/react";
import { truncateAddress } from "~/utils";
export default function Header({
  address,
  disconnect,
  isConnected,
  chains,
  chain,
}) {
  const { open } = useWeb3Modal();
  return (
    <header className="my-8 flex justify-end ">
      {!isConnected && (
        <button className="btn-primary btn" onClick={() => open()}>
          Connect Wallet
        </button>
      )}
      {isConnected && (
        <div className="flex flex-col justify-end">
          {chain && <p className="pb-1">Connected to: {chain.name}</p>}
          {address && (
            <p className="mb-4">Address: {truncateAddress(address)} </p>
          )}
          <button onClick={disconnect} className="btn-primary btn block py-2">
            Disconnect
          </button>
        </div>
      )}
    </header>
  );
}
