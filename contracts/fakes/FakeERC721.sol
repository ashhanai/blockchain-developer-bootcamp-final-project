// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract FakeERC721 is IERC721 {

    address public owner;
    bool public safeTransferFromCalled;
    SafeTransferFromParams public lastSafeTransferFromCallParams;

    struct SafeTransferFromParams {
        address from;
        address to;
        uint256 tokenId;
    }


    // Main fake functions

    function ownerOf(uint256 tokenId) override external view returns (address) {
        return owner;
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) override external {
        safeTransferFromCalled = true;
        lastSafeTransferFromCallParams = SafeTransferFromParams(from, to, tokenId);
    }

    
    // Rest of Iface

    function balanceOf(address owner) override external view returns (uint256 balance) {
        return 0;
    }

    function transferFrom(address from, address to, uint256 tokenId) override external {}

    function approve(address to, uint256 tokenId) override external {}

    function getApproved(uint256 tokenId) override external view returns (address operator) {
        return address(0);
    }

    function setApprovalForAll(address operator, bool _approved) override external {}

    function isApprovedForAll(address owner, address operator) override external view returns (bool) {
        return false;
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) override external {}

    function supportsInterface(bytes4 interfaceId) override external view returns (bool) {
        return false;
    }


    // Fake setters

    function setOwnerOf(address _owner) external {
        owner = _owner;
    }

}
