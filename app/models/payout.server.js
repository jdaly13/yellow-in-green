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

export async function makeSureGameIsActive(gameId) {
  const isGameActive = await pool.isGameActive(gameId);
  if (isGameActive === 0) {
    //ongoing state
    return true;
  } else {
    return false;
  }
}

// TODO CHANGE WHEN LAUNCHING NEW CONTRACT
export async function makePayment(address, gameId) {
  try {
    const tx = await pool.withdrawToWinner(address, gameId); // add gameID next launch

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    return {
      success: true,
      receipt,
    };
  } catch (e) {
    console.log("error", e);
    return {
      success: false,
      e,
    };
  }
}
