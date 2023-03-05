module.exports = async (hre) => {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const triviaDeployment = await deployments.get("TriviaToken");
  const amount = ethers.utils.parseEther("1.0");

  await deploy("Pool", {
    from: deployer,
    log: true,
    args: [triviaDeployment.address, amount],
  });
};
module.exports.tags = ["Pool"];
