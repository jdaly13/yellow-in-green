module.exports = async (hre) => {
  const { getNamedAccounts, deployments, getChainId } = hre;
  console.log({ getNamedAccounts, deployments });
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const trivia = await deploy("TriviaToken", {
    from: deployer,
    log: true,
  });

  if (
    chainId !== "31337" &&
    hre.network.name !== "localhost" &&
    hre.network.name !== "hardhat"
  ) {
    try {
      await hre.run("verify:verify", {
        address: trivia.address,
        contract: "contracts/TriviaToken.sol:TriviaToken",
      });
    } catch (error) {
      console.log("error:", error.message);
    }
  }
};
module.exports.tags = ["TriviaToken"];
