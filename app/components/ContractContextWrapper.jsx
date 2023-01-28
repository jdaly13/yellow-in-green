import { createContext } from "react";

export const ContractContext = createContext(null);

export default function ContractContextWrapper({
  children,
  network,
  contracts,
  game,
}) {
  return (
    <ContractContext.Provider
      value={{ contracts: contracts, game: game, network: network }}
    >
      {children}
    </ContractContext.Provider>
  );
}
