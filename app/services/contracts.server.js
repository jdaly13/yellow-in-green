export function getContracts(network) {
  let triviaJson;
  let poolJson;
  if (network === "goerli") {
    triviaJson = require("../../contracts/deployments/goerli/TriviaToken.json");
    poolJson = require("../../contracts/deployments/goerli/Pool.json");
  } else {
    triviaJson = require("../../contracts/deployments/localhost/TriviaToken.json");
    poolJson = require("../../contracts/deployments/localhost/Pool.json");
  }

  return {
    triviaJson,
    poolJson,
  };
}
