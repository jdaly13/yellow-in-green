require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");

require("dotenv");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    polygon: {
      url: process.env.POLYGON_URL || "",
      accounts:
        process.env.POLYGON_KEY !== undefined ? [process.env.POLYGON_KEY] : [],
    },
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts:
        process.env.GOERLI_KEY !== undefined ? [process.env.GOERLI_KEY] : [],
    },
    hardhat: {
      chainId: 31337,
      mining: {
        auto: false,
        interval: 4000,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    treasury: {
      default: 1,
    },
  },
};
