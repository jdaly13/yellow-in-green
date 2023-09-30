const { ethers } = require("ethers");
require("dotenv").config();

let provider;
let signer;
let trophyJson;
let trophy;

if (process.env.NETWORK === "goerli") {
  trophyJson = require(`../../contracts/deployments/goerli/Trophy.json`);
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.GOERLI_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else if (process.env.NETWORK === "polygon") {
  trophyJson = require(`../../contracts/deployments/matic/Trophy.json`);
  provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
  signer = new ethers.Wallet(privateKey, provider);
} else {
  //localhost
  trophyJson = require(`../../contracts/deployments/localhost/Trophy.json`);
  provider = new ethers.providers.JsonRpcProvider();
  signer = provider.getSigner();
}
try {
  trophy = new ethers.Contract(trophyJson.address, trophyJson.abi, signer);
} catch (e) {
  console.log("ERROR", e);
}

export function ipfsUpload(body) {
  const blob = new Blob([body], { type: "application/json" });
  const file = new File([blob], "file.json");
  const formData = new FormData();
  formData.append("file", file);

  const auth =
    "Basic " +
    Buffer.from(
      process.env.IPFS_PROJECT_ID + ":" + process.env.IPFS_PROJECT_SECRET
    ).toString("base64");

  return fetch("https://ipfs.infura.io:5001/api/v0/add", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: auth,
    },
    mode: "cors",
    body: formData,
  });
}

export async function mintNFT(winnerAddress, tokenUri) {
  const gas = await provider.getGasPrice();
  const gasLimit = 2200000;
  try {
    const tx = await trophy.awardWinner(winnerAddress, tokenUri, {
      gasPrice: gas,
      gasLimit: gasLimit,
    });

    const receipt = await tx.wait();
    console.log("receipt", receipt);

    return {
      receipt,
      tokenUri,
    };
  } catch (e) {
    return {
      e,
    };
  }
}
