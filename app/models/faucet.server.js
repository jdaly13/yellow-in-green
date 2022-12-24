const { ethers } = require("ethers");
require("dotenv").config();

const faucetJson = require(`../../contracts/deployments/localhost/Faucet.json`);

let provider;
let signer;
let faucet;

if (process.env.NETWORK === "polygon") {
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
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
