module.exports = async (hre) => {
  const { getNamedAccounts, deployments, getChainId, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const triviaDeployment = await deployments.get("TriviaToken");
  const amount = ethers.utils.parseEther("1.0");

  const secondsInDay = 86400;
  const faucet = await deploy("Faucet", {
    from: deployer,
    log: true,
    args: [triviaDeployment.address, amount, secondsInDay],
  });

  if (
    chainId !== "31337" &&
    hre.network.name !== "localhost" &&
    hre.network.name !== "hardhat"
  ) {
    try {
      await hre.run("verify:verify", {
        address: faucet.address,
        contract: "contracts/Faucet.sol:Faucet",
      });
    } catch (error) {
      console.log("error:", error.message);
    }
  }
};
module.exports.tags = ["Faucet"];
