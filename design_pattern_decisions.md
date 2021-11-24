# Design pattern decisions

## Inheritance and Interfaces
P2PLoan contract inherits from [OpenZeppelins ERC721](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol) implementation which comes with [IERC165](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/introspection/IERC165.sol) under the hood. Also implements [IERC721Receiver interface](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721Receiver.sol) to support safe transfers of ERC721 tokens.

## Optimizing Gas
`LoanOffer` and `Loan` structs have their state, which is `uint8`, next to address of lender / borrower. This property order saves one storage word by concating address (20 bytes) with state (1 byte) and making any transaction that stores `LoanOffer` or `Loan` cheaper.
