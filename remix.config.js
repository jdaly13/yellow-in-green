/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  serverDependenciesToBundle: [
    "@wagmi/core",
    "@web3modal/ethereum",
    "wagmi",
    "@web3modal/react",
    "@web3modal/core",
  ],
};
