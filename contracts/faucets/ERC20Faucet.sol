// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Faucet is ERC20 {

    constructor() ERC20("ERC20Faucet", "TKNF") {}

    function get(uint256 _amount) external returns(bool) {
        _mint(msg.sender, _amount);
        return true;
    }

    function give(address _owner, uint256 _amount) external returns(bool) {
        _mint(_owner, _amount);
        return true;
    }

}
