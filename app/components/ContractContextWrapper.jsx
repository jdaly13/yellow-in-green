import { createContext } from "react";

export const ContractContext = createContext(null);

export default function ContractContextWrapper({
  children,
  network,
  contracts,
}) {
  return (
    <ContractContext.Provider
      value={{ contracts: contracts, network: network }}
    >
      {children}
    </ContractContext.Provider>
  );
}
