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

    function give(address _owner) external returns(uint256) {
        tokenId += 1;
        _safeMint(_owner, tokenId);
        return tokenId;
    }

    function getNFTList(address _owner) external view returns (uint256[] memory) {
        uint256[] memory list = new uint256[](tokenId);
        if (tokenId == 0) {
            return list;
        }

        for (uint256 i = 1; i <= tokenId; i++) {
            if (ownerOf(i) == _owner) {
                list[i - 1] = i;
            }
        }

        return list;
    }
}
