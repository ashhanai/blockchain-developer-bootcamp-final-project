// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FakeERC20 is IERC20 {

    bool public transferFromCalled;
    bool public transferCalled;
    TransferFromParams public lastTransferFromCallParams;
    TransferParams public lastTransferCallParams;

    struct TransferFromParams {
        address sender;
        address recipient;
        uint256 amount;
    }

    struct TransferParams {
        address recipient;
        uint256 amount;
    }


    // Main fake functions

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) override external returns (bool) {
        transferFromCalled = true;
        lastTransferFromCallParams = TransferFromParams(sender, recipient, amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) override external returns (bool) {
        transferCalled = true;
        lastTransferCallParams = TransferParams(recipient, amount);
        return true;
    }


    // Rest of Iface

    function totalSupply() override external view returns (uint256) {
        return 0;
    }

    function balanceOf(address account) override external view returns (uint256) {
        return 0;
    }

    function allowance(address owner, address spender) override external view returns (uint256) {
        return 0;
    }

    function approve(address spender, uint256 amount) override external returns (bool) {
        return false;
    }

}
