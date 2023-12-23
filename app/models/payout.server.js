const { ethers, utils } = require("ethers");
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
} else if (process.env.NETWORK === "polygon") {
  poolJson = require(`../../contracts/deployments/matic/Pool.json`);
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
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
  const gas = await provider.getGasPrice();
  const gasLimit = 2200000;
  try {
    const tx = await pool.withdrawToWinner(address, gameId, {
      gasPrice: gas,
      gasLimit: gasLimit,
    });

    console.log("withdrawtoken", tx);

    // const receipt = await tx.wait();
    // console.log("receipt", receipt);

    return {
      success: true,
      tx,
    };
  } catch (e) {
    console.log("error", e);
    return {
      success: false,
      tx: "error",
      e,
    };
  }
}

export async function makeNativePayment(address, gameId, payoutAmount) {
  try {
    const gas = await provider.getGasPrice();
    const gasLimit = 2200000;
    const txParameters = {
      to: address,
      value: utils.parseEther(payoutAmount),
      gasPrice: gas,
      gasLimit,
    };
    const tx = await signer.sendTransaction(txParameters);
    console.log({ tx });
    const nativetxwait = await tx.wait();
    console.log({ nativetxwait });
    return tx;
  } catch (e) {
    console.log({ e });
    return e;
  }
}
