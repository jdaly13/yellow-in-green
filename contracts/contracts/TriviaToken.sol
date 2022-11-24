// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TriviaToken is ERC20 {
    constructor() ERC20("Trivia", "TRIVIA") {
        _mint(msg.sender, 9999999999 * 10**decimals());
    }
}
