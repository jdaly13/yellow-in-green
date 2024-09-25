const { Wallet } = require("ethers");
require("dotenv").config();
async function main() {
  //const random = ethers.Wallet.createRandom().mnemonic;

  try {
    const wallet = Wallet.fromMnemonic(process.env.testmneomonic);

    console.log(wallet);
  } catch (e) {
    console.log({ e });
  }
}

main();
