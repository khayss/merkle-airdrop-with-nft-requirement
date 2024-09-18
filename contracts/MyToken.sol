// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(address owner) ERC20("MyToken", "MTK") Ownable(owner) {
        _mint(owner, 10 ** 6 * 10 ** 18);
    }
}
