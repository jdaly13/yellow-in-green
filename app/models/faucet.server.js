const { ethers } = require("ethers");
require("dotenv").config();

let provider;
let signer;
let faucet;
let faucetJson;
let triviaJson;

if (process.env.NETWORK === "goerli") {
  faucetJson = require(`../../contracts/deployments/goerli/Faucet.json`);
  triviaJson = require("../../contracts/deployments/goerli/TriviaToken.json");
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.GOERLI_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else if (process.env.NETWORK === "polygon") {
  faucetJson = require(`../../contracts/deployments/matic/Faucet.json`);
  triviaJson = require("../../contracts/deployments/matic/TriviaToken.json");
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
  faucetJson = require(`../../contracts/deployments/localhost/Faucet.json`);
  triviaJson = require("../../contracts/deployments/localhost/TriviaToken.json");
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
      tokenAddress: triviaJson.address,
    };
  } catch (e) {
    return {
      e,
    };
  }
}
