# YELLOWINGREEN -

![ORIGINALLY SCAFFOLDED FROM REMIX INDIE STACK](https://repository-images.githubusercontent.com/465928257/a241fa49-bd4d-485a-a2a5-5cb8e4ee0abf)

````

## What's in the stack

- Deployment via Google Cloud Build and Run
- Production-ready MySQL database
- Database ORM with [Prisma](https://prisma.io)
- Styling with [Tailwind](https://tailwindcss.com/)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)

Not a fan of bits of the stack? Fork it, change it, and use `npx create-remix --template your/repo`! Make it your own.

## Quickstart

## Development

- This step only applies if you've opted out of having the CLI install dependencies for you:

  ```sh
  npm i
  npm run dev
````

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

### Relevant code:

NEEDS TO BE UPDATED!!!!!!

## Deployment

### Connecting to your database

### Getting Help with Deployment

If you run into any issues deploying to Fly, make sure you've followed all of the steps above and if you have, then post as many details about your deployment (including your app name) to [the Fly support community](https://community.fly.io). They're normally pretty responsive over there and hopefully can help resolve any of your deployment issues and questions.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project. - again

## NEEDS TO BE UPDATED

to crate locally cd in contracts and run
`npx hardhat node`
any hardhat accounts that are imported to metamask you should clear nonce data
send money to faucet say 100 tokens
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
from account that deployed contract on hardhat `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
next send another set of tokens to another hardhat account to perhaps
`0x71bE63f3384f5fb98995898A86B02Fb2426c5788`

in seperate tab in main dirctory
first time running you need to run seed script to create an admin account to create games

You can view UX of DB state by running in a seperate tab
`npm run open-studio`

go to monday-morning route
and make sure you're wallet is connected to account that deployed contract
From here you can create a game
