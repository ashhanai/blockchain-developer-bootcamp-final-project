# P2P lending

## Motivation
Pool based lending protocols are a great way for people to get a loan and keep their long crypto position. Unfortunately, to be able to get a loan, person needs to have a collateral which is approved by a protocol. It makes borrowing with community tokens, NFTs and not-so-mainstream assets difficult. That is where P2P lending can help. 

## Idea
Users will be able to make loans without pool restricting them about assets they can use as a collateral or as a credit and still be in the trustless environment.

There will be no loan liquidations as it is almost impossible to correctly price all tokens in the ecosystem. Lender has to make his/her own risk assessment about future price change of the collateral and act accordingly.

## Flow
* Lender creates a loan offer with collateral of his/her choice, credit asset that he/she is offering to lend, duration and interest rate.
* Borrower chooses and accepts offer that he/she see profitable.
* Protocol will mint a token, that represents the loan, transfers credit to borrower and lock the collateral in a contract.
* After borrower pays back the loan, lender can claim the credit + interest via loan token.
* If borrower is not able to pay back in time and the loan expires, lender can claim the collateral

## Nice to have
There is place for further development:

* **Perpetual lending** Lender can accept loan extension under some conditions (e.g. pay just the interest or 30% of the loan).

## Live testnet instance
Rinkeby: https://ashhanai.github.io/blockchain-developer-bootcamp-final-project/

Projects UI had to make some compromises to fit into projects scope:
1. To create the best user experience, project would have to implement NFT browser similar to Opensea and be able to make offers on NFT detail. It was altered with offer form, that includes collateral and credit addresses.
2. To get user offers and loans, project would need to implement own backend which would listen to events from contract and cache offers and loans for UI. This was altered with utility functions on contract iterating through all ids to last id used, `loanId` and `offerId`.
3. To get users NFTs, project would need to implement same mechanism as for loans and offers (loans are NFTs as well). Opensea public API is used for this purpose. It could take about 5 min before Opensea updates users balance, so please be patient if you don't see your new NFT in the list. Same applies for 2PL tokens, which are tokenized loans.

## Recorded walk through
https://youtu.be/fFA3Dh5JnhY

## Directory structure
- `client` - UI code
- `contracts` - smart contract code
	- `fakes` - fake contracts for unit testing
	- `faucets` - faucet contracts for integration testing and testnets
- `migrations` - scripts for smart contract deployment
- `test` - smart contract unit and integration tests

## Local environment

### Install dependencies
1. clone repo `git clone git@github.com:ashhanai/blockchain-developer-bootcamp-final-project.git`
2. move to root dir `cd blockchain-developer-bootcamp-final-project`
3. install contract dependecies `npm install`
4. move to client dir `cd client`
5. install client dependencies `npm install`
6. all set 🥳

### Contract unit tests
1. open terminal and run `ganache-cli -p 8545`
2. open another terminal window and from project root dir run tests `npm run test`, it will compile contracts and run unit tests

### Contract interaction
1. open terminal and run `ganache-cli -p 8545` (don't need to do that if you already have running ganache on port `8545`)
2. open another terminal window and from project root dir open truffle console `npm run console`, it will open console connected to your local ganache
3. in console run `migrate` to compile and migrate P2PLoan, ERC20Faucet & ERC721Faucet contracts
4. all contracts are deployed and you are ready to interact with them

### UI interaction
UI is using opensea API, which would not work if connected to local blockchain. Because of that, UI is by default connected to Rinkeby testnet and you can run it locally by running `npm run start` in client directory. All contracts are already deployed to Rinkeby testnet so you don't need to worry about that. 

## Public Ethereum wallet for certification
ashhanai.eth - `0x8ea42a3334E2AaB7d144990FDa6afE67a85E2a5c`
