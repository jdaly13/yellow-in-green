# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

## Deploying Contracts

We use hardhat-deploy package
`npx hardhat --network goerli deploy`  
Make sure you set up your hardhat config to use proper private keys and  
after deployment verify on etherscan
npx hardhat --network goerli etherscan-verify --api-key {etherScanApiKey}`  
output like below

```
already verified: Faucet (0x980aD1E1aBca7994e46702fE18A4bAF009081746), skipping.
already verified: Pool (0xE2a9Cc57D7d34D71F73ACa68c3e145E4d423C233), skipping.
already verified: TriviaToken (0x277D2B5E401652D613A638980973Be9B716d817e), skipping.
verifying Trophy (0xCCC905F928BD7379ebDf7cA124f8Fb647Ec06425) ...
waiting for result...
```
