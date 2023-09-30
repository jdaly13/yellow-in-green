const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("pool contract", function () {
  let deployer;
  let account1;
  let account2;
  let account3;
  let account4;
  let account5;
  let trivia;
  let faucet;
  let pool;

  const gameId1 = "ax8323bsdfs23";

  beforeEach(async () => {
    await network.provider.send("evm_setAutomine", [true]);

    [deployer, account1, account2, account3, account4, account5] =
      await ethers.getSigners();

    // deploy TRIVIA
    const triviaContract = await ethers.getContractFactory("TriviaToken");
    trivia = await triviaContract.deploy();

    // deploy Faucet
    const amount = ethers.utils.parseEther("1.0");
    const secondsInDay = 86400;

    const faucetContract = await ethers.getContractFactory("Faucet");
    faucet = await faucetContract.deploy(trivia.address, amount, secondsInDay);

    // deploy pool
    const poolContract = await ethers.getContractFactory("Pool");
    pool = await poolContract.deploy(trivia.address, amount);

    // transfer trivia to accounts 3,4,5 adds up to 17
    await trivia.transfer(account3.address, ethers.utils.parseEther("10"));
    await trivia.transfer(account4.address, ethers.utils.parseEther("5"));
    await trivia.transfer(account5.address, ethers.utils.parseEther("2"));
  });

  it("deployer should have total balance minus 17 given above", async () => {
    const totalSupply = await trivia.totalSupply();
    const ownerBalance = await trivia.balanceOf(deployer.address);
    const balance = totalSupply.sub(ethers.utils.parseEther("17"));
    expect(ownerBalance).to.equal(balance);
  });

  it("should dispense trivia to other accounts via faucet", async () => {
    // send tokens to faucet
    await trivia.transfer(faucet.address, ethers.utils.parseEther("20"));

    console.log(account1.address, account2.address);
    const tx = await faucet.fund(account1.address);
    await tx.wait();

    // const blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("blockNumBefore", blockNumBefore);

    // const blockNumberAfter = await ethers.provider.getBlockNumber();
    // console.log("blockNumberAfter", blockNumberAfter);

    const tx2 = await faucet.fund(account2.address);
    await tx2.wait();

    const account1Balance = await trivia.balanceOf(account1.address);

    expect(account1Balance).to.equal(ethers.utils.parseEther("1"));
  });

  it("should deposit money into pool from account 1", async () => {
    await trivia.transfer(faucet.address, ethers.utils.parseEther("20"));

    const tx = await faucet.fund(account1.address);
    await tx.wait();
    const account1Balance = await trivia.balanceOf(account1.address);

    expect(account1Balance).to.equal(ethers.utils.parseEther("1"));

    await trivia
      .connect(account1)
      .approve(pool.address, ethers.utils.parseEther("1"));

    const tx1 = await pool.connect(account1).deposit(gameId1);
    await tx1.wait();

    const getdepositPerUserperGame = await pool.depositPerUserperGame(
      gameId1,
      account1.address
    );

    console.log("getdepositPerUserperGame", getdepositPerUserperGame);

    expect(getdepositPerUserperGame).to.equal(ethers.utils.parseEther("1"));

    const account1BalanceAgain = await trivia.balanceOf(account1.address);
    expect(account1BalanceAgain).to.equal(0);
  });

  it.only("should deposit money into pool from accounts 3, 4, 5 and pay out 5 as winner", async () => {
    await trivia
      .connect(account3)
      .approve(pool.address, ethers.utils.parseEther("1"));

    const tx1 = await pool.connect(account3).deposit(gameId1);
    await tx1.wait();

    await trivia
      .connect(account4)
      .approve(pool.address, ethers.utils.parseEther("1"));

    const tx2 = await pool.connect(account4).deposit(gameId1);
    await tx2.wait();

    await trivia
      .connect(account5)
      .approve(pool.address, ethers.utils.parseEther("1"));

    const tx3 = await pool.connect(account5).deposit(gameId1);
    await tx3.wait();

    const depositsperGame = await pool.depositsPerGame(gameId1);
    expect(depositsperGame).to.equal(ethers.utils.parseEther("3"));

    const listOfAllUsers = await pool.listOfAllUsersPerGame(gameId1, 1);

    console.log({ listOfAllUsers });

    const tx4 = await pool.withdrawToWinner(account5.address, gameId1);
    await tx4.wait();

    const account5Balance = await trivia.balanceOf(account5.address);

    // started with 2 gave 1 away = 1
    // got 3 from pool (including money back)
    // total of 4
    expect(account5Balance).to.equal(ethers.utils.parseEther("4"));

    const isGameActive = await pool.isGameActive(gameId1);
    expect(isGameActive).to.equal(1);

    // if (isGameActive !== 0) {
    //   throw new Error("Game is not active")
    // }
  });
});
