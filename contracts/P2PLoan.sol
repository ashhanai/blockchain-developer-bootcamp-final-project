// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract P2PLoan is ERC721, Ownable {

	uint256 public offerId;
	
	struct LoanOffer {
		uint256 id;
		address collateral; // ERC721 address
		address credit; // ERC20 address
		uint256 creditAmount;
		uint256 creditToBePaidAmount;
		uint256 duration;
		address lender;
	}

	enum LoanState {
		Dead, Open, Running, PaidBack, Expired
	}

	struct Loan {
		uint256 id;
		LoanState state;
		address borrower;
		uint256 expiration;
		LoanOffer acceptedOffer;
	}

	mapping(uint256 => LoanOffer) public offers;
	mapping(uint256 => Loan) public loans;

	event LoanOfferCreated(uint256 offerId, address indexed lender, address indexed collateral);
	event LoanOfferRevoked(uint256 offerId, address indexed lender);
	event LoanAccepted();
	event LoanPaidBack();

	constructor() ERC721("P2PLoan", "2PL") Ownable() {

	}


	function createLoanOffer(
		address _collateral,
		address _credit,
		uint256 _creditAmount,
		uint256 _creditToBePaidAmount,
		uint256 _duration
	) external returns(uint256) {
		offerId += 1;

		LoanOffer memory offer = LoanOffer(
			offerId,
			_collateral,
			_credit,
			_creditAmount,
			_creditToBePaidAmount,
			_duration,
			msg.sender
		);

		offers[offerId] = offer;

		emit LoanOfferCreated(offerId, msg.sender, _collateral);

		return offerId;
	}

	function revokeLoanOffer(uint256 _offerId) external {
		require(offers[_offerId].lender == msg.sender, "Sender is not a loan offeror");

		delete offers[_offerId];

		emit LoanOfferRevoked(_offerId, msg.sender);
	}

	function acceptLoanOffer(uint256 _offerId) external returns(uint256) {
		// 1. check that sender is loan offer collateral owner
		// 2. mint loan token for lender
		// 3. update loan data
		// 4. delete loan offer data
		// 5. transfer collateral to contract
		// 6. transfer credit to borrower
		// 7. emit `LoanAccepted` event
		// 8. return loan id
	}

	function payBackLoan(uint256 _loanId) external {
		// 1. check if loan expired
		// 2. update loan state
		// 3. transfer creditToBePaidAmount to contract
		// 4. transfer collateral back to borrower
		// 5. emit `LoanPaidBack` event
	}

	function claim(uint256 _loanId) external {
		// 1. check if sender is loan token owner
		// 2. check if loan expired
		// 2.1 transfer collateral to lender
		// 2.2 transfer creditToBePaidAmount to lender
		// 3. burn loan token
		// 4. delete loan data
	}

}
