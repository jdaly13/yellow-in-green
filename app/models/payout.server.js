const { ethers } = require("ethers");
require("dotenv").config();

let provider;
let signer;
let pool;
let poolJson;

if (process.env.NETWORK === "goerli") {
  poolJson = require(`../../contracts/deployments/goerli/Pool.json`);
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.GOERLI_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
  poolJson = require(`../../contracts/deployments/localhost/Pool.json`);
  provider = new ethers.providers.JsonRpcProvider();
  signer = provider.getSigner();
}
try {
  pool = new ethers.Contract(poolJson.address, poolJson.abi, signer);
} catch (e) {
  console.log("ERROR", e);
}

// TODO CHANGE WHEN LAUNCHING NEW CONTRACT
export async function makePayment(address, gameId) {
  try {
    // check here if game is active
    // const isGameActive = await pool.isGameActive(gameId); should return 0 if game is in progress
    // if (isGameActive !== 0) {
    //   throw new Error("Game is not active")
    // }
    const tx = await pool.withdrawToWinner(address, gameId); // add gameID next launch

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    return {
      receipt,
    };
  } catch (e) {
    return {
      e,
    };
  }
}
