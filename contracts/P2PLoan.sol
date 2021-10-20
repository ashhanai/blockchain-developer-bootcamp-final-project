// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract P2PLoan is ERC721, IERC721Receiver, Ownable {

	uint256 public offerId;
	uint256 public loanId;
	
	enum LoanOfferState {
		Dead, Open, Accepted
	}

	struct LoanOffer {
		LoanOfferState state;
		address collateral; // ERC721 token address
		uint256 collateralId; // ERC721 token id
		address credit; // ERC20 address
		uint256 creditAmount;
		uint256 creditToBePaidAmount;
		uint256 duration;
		address lender;
	}

	enum LoanState {
		Dead, Running, PaidBack, Expired
	}

	struct Loan {
		LoanState state;
		address borrower;
		uint256 expiration;
		uint256 acceptedOfferId;
	}

	mapping(uint256 => LoanOffer) public offers;
	mapping(uint256 => Loan) public loans;

	event LoanOfferCreated(uint256 offerId, address indexed lender, address indexed collateral, uint256 indexed collateralId);
	event LoanOfferRevoked(uint256 offerId, address indexed lender);
	event LoanOfferAccepted(uint256 offerId, uint256 loanId, address indexed lender, address indexed collateral, uint256 indexed collateralId);
	event LoanPaidBack(uint256 loanId, address indexed collateral, uint256 indexed collateralId);

	constructor() ERC721("P2PLoan", "2PL") Ownable() {

	}


	function createLoanOffer(
		address _collateral,
		uint256 _collateralId,
		address _credit,
		uint256 _creditAmount,
		uint256 _creditToBePaidAmount,
		uint256 _duration
	) external returns(uint256) {
		offerId += 1;

		LoanOffer memory offer = LoanOffer(
			LoanOfferState.Open,
			_collateral,
			_collateralId,
			_credit,
			_creditAmount,
			_creditToBePaidAmount,
			_duration,
			msg.sender
		);
		offers[offerId] = offer;

		emit LoanOfferCreated(offerId, msg.sender, _collateral, _collateralId);

		return offerId;
	}

	function revokeLoanOffer(uint256 _offerId) external {
		require(msg.sender == offers[_offerId].lender, "Sender is not a loan offeror");

		delete offers[_offerId];

		emit LoanOfferRevoked(_offerId, msg.sender);
	}

	function acceptLoanOffer(uint256 _offerId) external returns(uint256) {
		LoanOffer storage offer = offers[_offerId];
		require(offer.state == LoanOfferState.Open, "Loan offer is not in Open state");
		require(msg.sender == IERC721(offer.collateral).ownerOf(offer.collateralId), "Sender is not a collateral owner");
	
		loanId += 1;
		Loan memory loan = Loan(
			LoanState.Running,
			msg.sender,
			block.timestamp + offer.duration,
			_offerId
		);
		loans[loanId] = loan;

		offer.state = LoanOfferState.Accepted;

		IERC721(offer.collateral).safeTransferFrom(msg.sender, address(this), offer.collateralId);

		IERC20(offer.credit).transferFrom(offer.lender, msg.sender, offer.creditAmount);

		_safeMint(offer.lender, loanId);

		emit LoanOfferAccepted(_offerId, loanId, offer.lender, offer.collateral, offer.collateralId);

		return loanId;
	}

	function payBackLoan(uint256 _loanId) external {
		require(getLoanStatus(_loanId) != LoanState.Expired, "Loan is expired");
		require(getLoanStatus(_loanId) == LoanState.Running, "Loan is not running");

		Loan storage loan = loans[_loanId];
		loan.state = LoanState.PaidBack;

		LoanOffer memory offer = offers[loan.acceptedOfferId];
		IERC20(offer.credit).transferFrom(loan.borrower, address(this), offer.creditToBePaidAmount);

		IERC721(offer.collateral).safeTransferFrom(address(this), loan.borrower, offer.collateralId);

		emit LoanPaidBack(_loanId, offer.collateral, offer.collateralId);
	}

	function claim(uint256 _loanId) external {
		// 1. check if sender is loan token owner
		// 2. check if loan expired
		// 2.1 transfer collateral to lender
		// 2.2 transfer creditToBePaidAmount to lender
		// 3. burn loan token
		// 4. delete loan data
	}


	function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) override external pure returns (bytes4) {
		return this.onERC721Received.selector;
	}


	function getLoanStatus(uint256 _loanId) public view returns (LoanState) {
		if (loans[_loanId].state != LoanState.PaidBack && loans[_loanId].expiration > 0 && loans[_loanId].expiration <= block.timestamp) {
			return LoanState.Expired;
		} else {
			return loans[_loanId].state;
		}
	}

}
