module.exports = async (hre) => {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const triviaDeployment = await deployments.get("TriviaToken");
  const amount = ethers.utils.parseEther("1.0");

  const secondsInDay = 86400;
  await deploy("Faucet", {
    from: deployer,
    log: true,
    args: [triviaDeployment.address, amount, secondsInDay],
  });
};
module.exports.tags = ["Faucet"];
