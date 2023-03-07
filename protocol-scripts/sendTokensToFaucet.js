// TODO
const { ethers } = require("ethers");
require("dotenv").config();

const faucetJson = require(`../contracts/deployments/${process.env.NETWORK}/Faucet.json`);
const triviaToken = require(`../contracts/deployments/${process.env.NETWORK}/TriviaToken`);

console.log(faucetJson.address, triviaToken.address);

let provider;
let signer;
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
  trivia = new ethers.Contract(triviaToken.address, triviaToken.abi, signer);
} catch (e) {
  console.log("ERROR", e);
}

console.log({ trivia });

async function main() {
  try {
    // const balance = await faucet.balance();
    // console.log("balance", ethers.utils.formatEther(balance));
    // const tx = await faucet.fund("0xA12C13bCdfe2C6E2dFDA3Ea1767e0d8f93817Aa2");
    const tx = await trivia.transfer(
      faucetJson.address,
      ethers.utils.parseEther("20")
    );

    const receipt = await tx.wait();
    console.log("receipt", receipt);
  } catch (e) {
    console.log({ e });
  }
}

main();
