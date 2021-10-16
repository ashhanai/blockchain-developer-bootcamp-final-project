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
