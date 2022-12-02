// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Faucet is Ownable {
  IERC20 public token;

  uint256 public amount;
  uint256 public frequency;
  
  mapping(address => uint) public lockTime;

  event funded(uint256 _amount);
  
  constructor(address _token, uint256 _amount, uint256 _frequency) {
    require(_token != address(0), "Faucet: can't set the token address to the zero address");
    token = IERC20(_token);
    amount = _amount;
    frequency = _frequency;
  }

  function fund(address _to) public {
    require(block.timestamp > lockTime[msg.sender], "lock time has not expired. Please try again later");
    require(balance() > amount, "Not enough token funds in the faucet");

    token.transfer(address(uint160(_to)), amount);

    lockTime[msg.sender] = block.timestamp + frequency;
    emit funded(amount);
  }

  function balance() public view returns (uint256) {
    return token.balanceOf(address(this));
  }

  function setAmount(uint256 _amount) public onlyOwner {
    amount = _amount;
  }

  function setFrequency(uint256 _frequency) public onlyOwner {
    frequency = _frequency;
  }
}