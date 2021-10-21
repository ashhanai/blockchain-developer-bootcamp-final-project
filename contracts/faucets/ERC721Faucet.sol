// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Faucet is ERC721 {

    uint256 public tokenId;

    constructor() ERC721("ERC721Faucet", "NFTF") {}

    function get() external returns(uint256) {
        tokenId += 1;
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

}
