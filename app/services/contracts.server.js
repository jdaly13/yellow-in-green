export function getContracts(network) {
  let triviaJson;
  if (network === "polygon") {
    // silence is golden
    triviaJson = null;
  } else {
    triviaJson = require("../../contracts/deployments/localhost/TriviaToken.json");
  }

  return {
    triviaJson,
  };
}
