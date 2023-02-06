const { ethers } = require("ethers");
require("dotenv").config();

let provider;
let signer;
let faucet;
let faucetJson;

if (process.env.NETWORK === "goerli") {
  faucetJson = require(`../../contracts/deployments/goerli/Faucet.json`);
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.GOERLI_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
  faucetJson = require(`../../contracts/deployments/localhost/Faucet.json`);
  provider = new ethers.providers.JsonRpcProvider();
  signer = provider.getSigner();
}
try {
  faucet = new ethers.Contract(faucetJson.address, faucetJson.abi, signer);
} catch (e) {
  console.log("ERROR", e);
}

export async function makeItRain(address) {
  try {
    const balance = await faucet.balance();
    console.log("balance", ethers.utils.formatEther(balance));
    const tx = await faucet.fund(address);

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    return {
      receipt,
      balance,
    };
  } catch (e) {
    return {
      e,
    };
  }
}
