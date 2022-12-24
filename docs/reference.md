https://github.com/wighawag/hardhat-deploy/tree/master

https://flaviocopes.com/sqlite-user-permissions/
https://www.prisma.io/dataguide/postgresql/authentication-and-authorization/intro-to-authn-and-authz

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

# LINKS - FYI

https://medium.com/@prashantramnyc/difference-between-session-cookies-vs-jwt-json-web-tokens-for-session-management-4be67d2f066e
