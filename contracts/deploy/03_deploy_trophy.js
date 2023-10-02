module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Trophy", {
    from: deployer,
    log: true,
  });
};
module.exports.tags = ["Trophy"];
