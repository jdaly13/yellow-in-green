const { ethers } = require("ethers");
require("dotenv").config();

// const poolJson = require(`../contracts/deployments/${process.env.NETWORK}/Pool`);
// const triviaToken = require(`../contracts/deployments/${process.env.NETWORK}/TriviaToken`);

let provider;
let signer;
let pool;
let trivia;
let poolJson;
let triviaToken;

const tokenAmount = "10.0";

if (process.env.NETWORK === "goerli") {
  poolJson = require(`../contracts/deployments/${process.env.NETWORK}/Pool`);
  triviaToken = require(`../contracts/deployments/${process.env.NETWORK}/TriviaToken`);
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.GOERLI_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else if (process.env.NETWORK === "polygon") {
  poolJson = require(`../contracts/deployments/matic/Pool`);
  triviaToken = require(`../contracts/deployments/matic/TriviaToken`);
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
  provider = new ethers.providers.JsonRpcProvider();
  signer = provider.getSigner();
}

console.log(poolJson.address, triviaToken.address);

try {
  pool = new ethers.Contract(poolJson.address, poolJson.abi, signer);
  trivia = new ethers.Contract(triviaToken.address, triviaToken.abi, signer);
} catch (e) {
  console.log("ERROR", e);
}

async function main() {
  try {
    const fees = (await provider.getFeeData()).maxFeePerGas.toString();
    const gas = await provider.getGasPrice();
    const gasLimit = 2200000;
    // const changeDepositAmounntTx = await pool.setDepositAmount(
    //   ethers.utils.parseEther(tokenAmount),
    //   {
    //     maxPriorityFeePerGas: fees,
    //   }
    // );
    // const changeDepositReceipt = await changeDepositAmounntTx.wait();
    // console.log({ changeDepositReceipt });

    const tx = await trivia.approve(
      pool.address,
      ethers.utils.parseEther(tokenAmount),
      {
        gasPrice: gas,
        gasLimit: gasLimit,
      }
    );
    const receipt = await tx.wait();
    console.log("receipt", receipt);

    const tx1 = await pool.deposit("clmxtmdo80006s2w4uxww44oa", {
      gasPrice: gas,
      gasLimit: gasLimit,
    });
    const tx1Receipt = await tx1.wait();
    console.log("receipt tx1", tx1Receipt);

    const changeDepositAmounntTxTwo = await pool.setDepositAmount(
      ethers.utils.parseEther("1.0"),
      {
        gasPrice: gas,
        gasLimit: gasLimit,
      }
    );
    const changeDepositReceipTwo = await changeDepositAmounntTxTwo.wait();
    console.log({ changeDepositReceipTwo });
  } catch (e) {
    console.log({ e });
  }
}

main();
