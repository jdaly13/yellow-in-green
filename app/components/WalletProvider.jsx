import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { ClientOnly } from "remix-utils";

import { Web3Modal } from "@web3modal/react";

import { configureChains, createClient, WagmiConfig } from "wagmi";

import { goerli, hardhat, localhost, mainnet, polygon } from "wagmi/chains";

import { useContext } from "react";

import { ContractContext } from "~/components/ContractContextWrapper";

// import { publicProvider } from "wagmi/providers/public";
// import { infuraProvider } from "wagmi/providers/infura";

// const chains = [
//   ...defaultChains,
//   chain.polygon,
//   chain.hardhat,
//   chain.localhost,
// ];

const chains = [goerli, mainnet, polygon, hardhat, localhost];

// const infuraID = "5992eda22fc948b196ac1629655d7c8a";

const projectId = "84492e8bb8d816b88bfdb4789ee16d17";

export default function WalletProvider({ children }) {
  const { network } = useContext(ContractContext);
  const chainToUse = chains.filter((chain) => {
    return chain.network === network;
  });
  console.log(chainToUse);
  // Wagmi client
  // const { provider } = configureChains(chains, [
  //   infuraProvider({ apiKey: infuraID }),
  //   publicProvider(),
  //   // walletConnectProvider({ projectId: "84492e8bb8d816b88bfdb4789ee16d17" }),
  // ]);
  // const chainTouse = chains.map
  const { provider } = configureChains(chainToUse, [
    w3mProvider({ projectId }),
  ]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 1, chains: chainToUse }),
    provider,
  });

  // Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiClient, chainToUse);

  return (
    <ClientOnly>
      {() => {
        //   if (!network) {
        //     window.alert("Please configure Network");
        //     return null;
        //   }
        return (
          <>
            <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>
            <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
          </>
        );
      }}
    </ClientOnly>
  );
}
