import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { ClientOnly } from "remix-utils";

import { Web3Modal } from "@web3modal/react";

import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
  defaultChains,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const chains = [
  ...defaultChains,
  chain.polygon,
  chain.hardhat,
  chain.localhost,
];

export default function WalletProvider({ children }) {
  // Wagmi client
  const { provider } = configureChains(chains, [
    publicProvider(),
    // walletConnectProvider({ projectId: "84492e8bb8d816b88bfdb4789ee16d17" }),
  ]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({ appName: "web3Modal", chains }),
    provider,
  });

  // Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiClient, chains);

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
            <Web3Modal
              projectId="84492e8bb8d816b88bfdb4789ee16d17"
              ethereumClient={ethereumClient}
            />
          </>
        );
      }}
    </ClientOnly>
  );
}
