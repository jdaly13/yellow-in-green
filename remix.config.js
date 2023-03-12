/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  // serverDependenciesToBundle: [
  //   "@web3modal/ethereum",
  //   "@web3modal/react",
  //   "@web3modal/core",
  //   "/^@?wagmi.*/",
  //   "@wagmi/core",
  //   "wagmi",
  //   "@wagmi/connectors",
  // ],
  serverDependenciesToBundle: [/.*/],
};
