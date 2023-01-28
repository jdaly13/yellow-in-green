export function getContracts(network) {
  let triviaJson;
  let poolJson;
  if (network === "polygon") {
    // silence is golden
    triviaJson = null;
  } else {
    triviaJson = require("../../contracts/deployments/localhost/TriviaToken.json");
    poolJson = require("../../contracts/deployments/localhost/Pool.json");
  }

  return {
    triviaJson,
    poolJson,
  };
}
