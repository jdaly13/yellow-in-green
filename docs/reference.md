https://github.com/wighawag/hardhat-deploy/tree/master

## SQL

access db based on how you're logged in (currently logged in via prod)
`fly ssh console -C database-cli`
https://www.sqlitetutorial.net/sqlite-create-view/
https://www.sqlitetutorial.net/sqlite-commands/
tutorial how to dump
https://www.sqlitetutorial.net/?s=dump

https://flaviocopes.com/sqlite-user-permissions/
https://www.prisma.io/dataguide/postgresql/authentication-and-authorization/intro-to-authn-and-authz

PRISMA STUDIO (for Prod)
https://stackoverflow.com/questions/73335287/how-to-access-prisma-studio-when-the-app-is-already-deployed-on-heroku
https://www.prisma.io/docs/data-platform/about

https://github.com/prisma/studio/issues/895#issuecomment-1083051249
https://github.com/prisma/studio/issues/790

## FAUCET

https://raw.githubusercontent.com/harmony-one/token-faucet-demo-dapp/main/contracts/Faucet.sol
https://github.com/harmony-one/token-faucet-demo-dapp
https://cryptomarketpool.com/create-a-crypto-faucet-using-a-solidity-smart-contract/

https://goerlifaucet.com/

deploying "TriviaToken" (tx: 0xf1a69a9a0ad33d10029cfd4acb4adb62e77279be5595a4d2ccdf8a2c41e48143)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 1177948 gas

deploying "Faucet" (tx: 0x37fa792d1cc46bed0d8c07fc5a7f9a28a9c24f875b2992c079f9efbea61822dc)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 840029 gas

## Process

deploy token and faucet contract using hardhat `npx hardhat node`
tokens get deployed to Account 18 - 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
reset account in metamask if needed
send tokens from that account to faucet contract 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
fund ether to this account - 0xA12C13bCdfe2C6E2dFDA3Ea1767e0d8f93817Aa2 (not in list of 20 hardhat default accounts)
run script `fund-protocol.js` that will give 1 TRIVIA to 0xA12C13bCdfe2C6E2dFDA3Ea1767e0d8f93817Aa2

## Run locally

`npm run dev`

# LINKS - FYI

Remix - Docker - FLY.io
https://remix.run/docs/en/v1/tutorials/jokes#deployment
https://github.com/kentcdodds/onewheel-blog/blob/main/.github/workflows/deploy.yml
https://egghead.io/lessons/remix-deploy-a-remix-application-to-fly-io

https://medium.com/@prashantramnyc/difference-between-session-cookies-vs-jwt-json-web-tokens-for-session-management-4be67d2f066e

Wagmi docs version
https://0.7.x.wagmi.sh/docs/WagmiConfig

Wallet Connect Web3 modal
https://docs.walletconnect.com/2.0/web3modal/react/installation

Tutorial - sports betting daPP - https://medium.com/coinmonks/create-a-sports-betting-dapp-on-the-ethereum-blockchain-part-1-1f69f908b939

Hardhat Deploy and Etherscan verify
https://blog.chain.link/how-to-verify-smart-contract-on-etherscan-hardhat/

`npx hardhat --network goerli etherscan-verify --api-key {api-key}`

HQ TRIVIA -
https://www.tiktok.com/@scottrogowsky/video/7196486765388287278?_r=1&_t=8Zdw0ewlTy7

ETHEREUM TASKS -
https://blockzeit.com/why-account-abstraction-is-a-game-changer-in-crypto-adoption/
https://speedrunethereum.com/challenge/simple-nft-example

## Store Secret on EVM Chain

https://stackoverflow.com/questions/69060605/store-secret-in-evm-blockchain
https://github.com/pubkey/eth-crypto/blob/master/tutorials/encrypted-message.md

encrypting question data
https://www.pinata.cloud/blog/introducing-submarining-what-it-is-why-you-need-it
https://www.section.io/engineering-education/data-encryption-and-decryption-in-node-js-using-crypto/

so each trivia question as an nft in metadata - is encrypted on blockchain and the the answer is descrypted through a form like a password but instead it's an answer to a question
for example algorand you would get that nft using indexer and then transfer that NFT to trivia person

Interesting article
https://medium.com/coinmonks/how-to-find-your-nft-on-ipfs-e51bc5e7c8a1

## External Scripts Wallet Connect - WAGMI

// Script using for testing purposes to test a backend call of 5 seconds

```
return new Promise((resolve) => {
  setTimeout(resolve, 5000);
}).then(() => {
  return json({ test: "test" });
});
```

Wallet Connect - https://cloud.walletconnect.com/app
Wagmi with Wallet Connect and wallet Modal
https://0.12.x.wagmi.sh/core/connectors/walletConnect
https://wagmi.sh/react/migration-guide#012x-breaking-changes

https://docs.walletconnect.com/advanced/migration-from-v1.x/dapps#web3modal-v20
https://cloud.walletconnect.com/app/project?uuid=7ec5a112-551e-4ed3-9dd2-92c0e7dbd32a
https://docs.walletconnect.com/web3modal/react/about
https://docs.walletconnect.com/web3modal/v2/react/wagmi/installation

## ICONS

https://heroicons.com/

TESTNETS
Goerli Fauces - https://goerli.etherscan.io/address/0x980aD1E1aBca7994e46702fE18A4bAF009081746
https://goerli.etherscan.io/address/0xE2a9Cc57D7d34D71F73ACa68c3e145E4d423C233

`SELECT winnerID from GAME WHERE id = "cleyxi99u0000gylt0o37nb6p";`
NODEMAILER LINKS - EMAIL
https://github.com/jdaly13/yellow-in-gree n/issues/18

## SWITCHING TO MYSQL

https://www.prisma.io/docs/concepts/components/prisma-migrate/prisma-migrate-limitations-issues#you-cannot-automatically-switch-database-providers

Steps
Database url on cloud run needs to include socket query string. Version 3
/cloudsq/{instance name}
This is stored as a secret

On cloud build database url needs to be localhost - \_DATABASE_URL_LOCALHOST
yellowingreen:us-central1:yellow-in-green-1-dev
Saved as ENV variable/secret

https://www.prisma.io/docs/concepts/database-connectors/mysql

https://stackoverflow.com/questions/74424929/what-is-the-postgres-database-url-to-connect-cloud-run-to-postgres-on-cloud-sql/74438667?noredirect=1#comment131499113_74438667
Related below
https://cloud.google.com/sql/docs/mysql/connect-run

Both explain where you need socket path you created in cloud build

Cloud build
https://stackoverflow.com/questions/74891893/google-cloud-build-cloud-run-cloud-sql-prisma-migration/74891894?noredirect=1#comment135569389_74891894

Connect from cloud run documentation
https://cloud.google.com/sql/docs/mysql/connect-run

Connect to CloudSql for mySql using the Cloud-sql auth proxy
https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy

Another somewhat. Helpful question/answer page
https://stackoverflow.com/questions/52352103/run-node-js-database-migrations-on-google-cloud-sql-during-google-cloud-build/64599510#64599510

## END OF - SWITCHING TO MYSQL

WalletConnect
https://cloud.walletconnect.com/app/project?uuid=7ec5a112-551e-4ed3-9dd2-92c0e7dbd32a


## Dev Operations

App is hosted on Cloud Run  
MySql Db is hotsted on Cloud SQL

Cloud Build is used for CI/CD Pipeline

Current Setup 

When Changed are pushed to the mySql Branch - it starts a process

Current setup is to use Cloud Sql Auth Proxy in Built Step to allow connections to DB

Cloud Build reads from our cloudbuild.yaml file in the repo

Created using inspiration from these questions
https://stackoverflow.com/questions/74891893/google-cloud-build-cloud-run-cloud-sql-prisma-migration/74891894?noredirect=1#comment135569389_74891894

https://stackoverflow.com/questions/52352103/run-node-js-database-migrations-on-google-cloud-sql-during-google-cloud-build/64599510#64599510

//Socket Part
https://stackoverflow.com/questions/72118668/cloud-functions-prismaclientinitializationerror-cant-reach-database-server-a

https://cloud.google.com/sql/docs/mysql/connect-build


cloud sql proxy links
https://cloud.google.com/sql/docs/mysql/sql-proxy
https://cloud.google.com/sql/docs/mysql/connect-auth-proxy#tcp-sockets
https://github.com/GoogleCloudPlatform/cloud-sql-proxy/blob/main/README.md
https://medium.com/google-cloud/tagged/cloud-sql-proxy

MYSQL quickstarts
https://cloud.google.com/sql/docs/mysql/quickstarts  

# Steps
in the Migrate Step
we get a copy of cloud sql auth proxy
connect via TCP using the instance name which is saved in cloud build trigger substitution variables
we then run npx prisma migrate deploy which applies the migrations file to our db

When this is complete - we build push then deploy

Cloud Build and Cloud Run use different secrets and Env Variables






