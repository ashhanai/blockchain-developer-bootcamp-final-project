# P2P lending

## Motivation

Pool based lending protocols are a great way for people to get a loan and keep their long crypto position. Unfortunately, to be able to get a loan, person needs to have a collateral which is approved by a protocol. It makes borrowing with community tokens, NFTs and not-so-mainstream assets difficult. That is where P2P lending can help. 

## Idea

Users will be able to make loans without pool restricting them about assets they can use as a collateral or as a credit and still be in the trustless environment.

There will be no loan liquidations as it is almost impossible to correctly price all tokens in the ecosystem. Lender has to make his/her own risky assessment about future price change of the collateral and act accordingly.

## Flow

* Borrower creates a loan request with collateral of his/her choice, credit asset that he/she is requesting to borrow, duration and interest rate.
* Lender choose and accepts request that he/she see profitable.
* Protocol will mint a token, that represents the deed, transfer credit to borrower and lock the collateral.
* After borrower pays back the loan, lender can claim the credit + interest via deed token.
* If borrower is not able to pay back in time and the loan expires, lender can claim the collateral

## Nice to have

There is place for further development:

* **Perpetual lending** Lender can accept loan extension under some conditions (e.g. pay just the interest or 30% of the loan).
* **Offering system** Better offering system for lenders, where they can offer their interes rate and credit asset which could differ from what is requested (e.g. USDC instead of Dai).
