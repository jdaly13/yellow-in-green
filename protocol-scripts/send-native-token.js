const { ethers, utils } = require("ethers");
require("dotenv").config();

let provider;
let signer;

if (process.env.NETWORK === "goerli") {
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.GOERLI_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else if (process.env.NETWORK === "polygon") {
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
  provider = new ethers.providers.JsonRpcProvider();
  signer = provider.getSigner();
}

async function main() {
  try {
    const gas = await provider.getGasPrice();
    const gasLimit = 2200000;
    const txParameters = {
      to: process.env.test_account_receiver,
      value: utils.parseEther("0.1"),
      gasPrice: gas,
      gasLimit,
    };
    const tx = await signer.sendTransaction(txParameters);
    console.log({ tx });
    const txwait = await tx.wait();
    console.log({ txwait });
  } catch (e) {
    console.log({ e });
  }
}

main();
