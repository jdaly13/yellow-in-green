module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("TriviaToken", {
    from: deployer,
    log: true,
  });
};
module.exports.tags = ["TriviaToken"];
