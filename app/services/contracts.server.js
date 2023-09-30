export function getContracts(network) {
  let triviaJson;
  let poolJson;
  if (network === "goerli") {
    triviaJson = require("../../contracts/deployments/goerli/TriviaToken.json");
    poolJson = require("../../contracts/deployments/goerli/Pool.json");
  } else if (network === "polygon") {
    triviaJson = require("../../contracts/deployments/matic/TriviaToken.json");
    poolJson = require("../../contracts/deployments/matic/Pool.json");
  } else {
    triviaJson = require("../../contracts/deployments/localhost/TriviaToken.json");
    poolJson = require("../../contracts/deployments/localhost/Pool.json");
  }

  return {
    triviaJson,
    poolJson,
  };
}
