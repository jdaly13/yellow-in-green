const { ethers } = require("ethers");
require("dotenv").config();

const poolJson = require(`../contracts/deployments/${process.env.NETWORK}/Pool`);
const triviaToken = require(`../contracts/deployments/${process.env.NETWORK}/TriviaToken`);

console.log(poolJson.address, triviaToken.address);

let provider;
let signer;
let pool;
let trivia;

if (process.env.NETWORK === "goerli") {
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.GOERLI_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
  provider = new ethers.providers.JsonRpcProvider();
  signer = provider.getSigner();
}
try {
  pool = new ethers.Contract(poolJson.address, poolJson.abi, signer);
  trivia = new ethers.Contract(triviaToken.address, triviaToken.abi, signer);
} catch (e) {
  console.log("ERROR", e);
}

console.log({ pool });

async function main() {
  try {
    // const balance = await faucet.balance();
    // console.log("balance", ethers.utils.formatEther(balance));
    // const tx = await faucet.fund("0xA12C13bCdfe2C6E2dFDA3Ea1767e0d8f93817Aa2");

    const tx = await trivia.approve(pool.address, ethers.utils.parseEther("1"));

    const receipt = await tx.wait();
    console.log("receipt", receipt);
    const tx1 = await pool.deposit("clm5cnfuv0000s2woayrn3adu");
    const tx1Receipt = await tx1.wait();
    console.log("receipt tx1", tx1Receipt);
  } catch (e) {
    console.log({ e });
  }
}

main();
