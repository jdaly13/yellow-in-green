// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Pool is Ownable {
    IERC20 public immutable trivia;
    mapping(string => mapping(address => uint256)) public depositPerUserperGame;
    mapping(string => uint256) public depositsPerGame;

    mapping(string => address[]) public listOfAllUsersPerGame;

    uint256 depositAmount;

    constructor(address _token, uint256 _amount) {
        trivia = IERC20(_token);
        depositAmount = _amount;
    }

    function deposit(string memory gameId) external {
       if (depositPerUserperGame[gameId][msg.sender] > 0) revert AlreadyDepositedForThisGame();

        depositPerUserperGame[gameId][msg.sender] = depositAmount;
        depositsPerGame[gameId] += depositAmount;
        listOfAllUsersPerGame[gameId].push(msg.sender);

        trivia.transferFrom(msg.sender, address(this), depositAmount);
    }

    function withdrawToWinner(address winner) external onlyOwner {
        uint256 tokenBalanceAmount = trivia.balanceOf(address(this));
        trivia.transfer(winner, tokenBalanceAmount);
    }

    function setDepositAmount(uint256 _amount) external onlyOwner {
        depositAmount = _amount;
    }

    error AlreadyDepositedForThisGame();
}

