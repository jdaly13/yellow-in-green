// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Pool is Ownable {
    IERC20 public immutable trivia;
    mapping(string => mapping(address => uint256)) public depositPerUserperGame;
    mapping(string => uint256) public depositsPerGame;

    mapping(string => address[]) public listOfAllUsersPerGame;

    enum State {InProgress, Finished}

    mapping(string => State) public isGameActive;

    uint256 depositAmount;

    constructor(address _token, uint256 _amount) {
        trivia = IERC20(_token);
        depositAmount = _amount;
    }

    function deposit(string memory gameId) external notInState(State.Finished, gameId) {
        if (depositPerUserperGame[gameId][msg.sender] > 0) revert AlreadyDepositedForThisGame();
        isGameActive[gameId] = State.InProgress;
        depositPerUserperGame[gameId][msg.sender] = depositAmount;
        depositsPerGame[gameId] += depositAmount;
        listOfAllUsersPerGame[gameId].push(msg.sender);

        trivia.transferFrom(msg.sender, address(this), depositAmount);
    }

    function withdrawToWinner(address winner, string memory gameId ) external onlyOwner inState(State.InProgress, gameId) {
            uint256 totalDepositsForGame = depositsPerGame[gameId];
            trivia.transfer(winner, totalDepositsForGame);

            isGameActive[gameId] = State.Finished;
    }

    function setDepositAmount(uint256 _amount) external onlyOwner {
        depositAmount = _amount;
    }

    modifier inState(State expectedState, string memory gameId) {
        require(isGameActive[gameId] == expectedState, "Invalid state Withdraw");
        _;
    }

    modifier notInState(State expectedState, string memory gameId) {
        require(isGameActive[gameId] != expectedState, "Invalid state Deposit");
        _;
    }

    error AlreadyDepositedForThisGame();
    error GameIsNoLongerActive();
}

