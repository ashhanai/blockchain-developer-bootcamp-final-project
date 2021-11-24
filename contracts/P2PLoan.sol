// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title A peer to peer loan contract
/// @author Naim Ashhab
/// @notice You can create loan offers to any ERC721 token
contract P2PLoan is ERC721, IERC721Receiver {

	/// @notice Offer id counter. Current value represents last existing offer id.
	uint256 public offerId;

	/// @notice Loan if counter. Current value represents last existing loan id.
	uint256 public loanId;
	
	enum LoanOfferState {
		Dead, Open, Accepted
	}

	struct LoanOffer {
		uint256 id;
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
		uint256 id;
		LoanState state;
		address borrower;
		uint256 expiration;
		uint256 acceptedOfferId;
	}

	/// @notice Mapping offer id to offer data
	mapping(uint256 => LoanOffer) public offers;

	/// @notice Mapping loan id to loan data
	mapping(uint256 => Loan) public loans;

	/// @notice Emit when new offer is created
	/// @param offerId Created offer id
	/// @param lender Address that created the offer
	/// @param collateral Address of a token that should be used as a collateral in the offered loan
	/// @param collateralId Collateral token id
	event LoanOfferCreated(uint256 offerId, address indexed lender, address indexed collateral, uint256 indexed collateralId);

	/// @notice Emit when offer is revoked
	/// @param offerId Revoked offer id
	/// @param lender Address that created the offer
	event LoanOfferRevoked(uint256 offerId, address indexed lender);

	/// @notice Emit when offer is accepted and loan started
	/// @param offerId Accepted offer id
	/// @param loanId Created loan id
	/// @param lender Address that created the offer
	/// @param collateral Address of a token that is used as a collateral in the loan
	/// @param collateralId Collateral token id
	event LoanOfferAccepted(uint256 offerId, uint256 loanId, address indexed lender, address indexed collateral, uint256 indexed collateralId);

	/// @notice Emit when loan is paid back
	/// @param loanId Paid back loan id
	/// @param collateral Address of a token that was used as a collateral in the loan
	/// @param collateralId Collateral token id
	event LoanPaidBack(uint256 loanId, address indexed collateral, uint256 indexed collateralId);


	constructor() ERC721("P2PLoan", "2PL") {

	}


	/// @notice Creates a new loan offer
	/// @dev P2PLoan contract need to have approve to transfer lenders credit asset
	/// @param _collateral Address of a token that should be used as a collateral in the offered loan
	/// @param _collateralId Collateral token id
	/// @param _credit Address of a token that should be used as a credit in the offered loan
	/// @param _creditAmount Amount of credit asset that is offered to lend
	/// @param _creditToBePaidAmount Amount of credit asset that should be paid back if offer is accepted
	/// @param _duration Duration of a loan in seconds
	/// @return Id of a created loan offer
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
			offerId,
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

	/// @notice Revokes existing loan offer
	/// @dev Sender has to be the original offer creator
	/// @param _offerId Id of a revoking offer
	function revokeLoanOffer(uint256 _offerId) external {
		require(msg.sender == offers[_offerId].lender, "Sender is not a loan offeror");

		delete offers[_offerId];

		emit LoanOfferRevoked(_offerId, msg.sender);
	}

	/// @notice Accepts loan offer, locks collateral in contract and mint P2PLoan token to a lender
	/// @dev P2PLoan contract need to have approve to transfer borrowers collateral asset
	/// @param _offerId Id of an accepting offer
	/// @return Id of a created loan
	function acceptLoanOffer(uint256 _offerId) external returns(uint256) {
		LoanOffer storage offer = offers[_offerId];
		require(offer.state == LoanOfferState.Open, "Loan offer is not in Open state");
		require(msg.sender == IERC721(offer.collateral).ownerOf(offer.collateralId), "Sender is not a collateral owner");
	
		loanId += 1;
		Loan memory loan = Loan(
			loanId,
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

	/// @notice Pays back accepted loan
	/// @dev P2PLoan contract need to have approve to transfer borrowed credit asset
	/// @dev Cannot pay back expired loan
	/// @param _loanId Id of a loan that should be repaid
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

	/// @notice Claims paid back loan or defaulted collateral
	/// @dev Any user that owns the P2PLoan token can claim loan (even if it's not the original lender)
	/// @param _loanId Id of a loan that should be claimed
	function claim(uint256 _loanId) external {
		require(ownerOf(_loanId) == msg.sender, "Sender is not loan token owner");
		
		LoanOffer memory offer = offers[loans[_loanId].acceptedOfferId];
		if (getLoanStatus(_loanId) == LoanState.Expired) {
			IERC721(offer.collateral).safeTransferFrom(address(this), msg.sender, offer.collateralId);
		} else if (getLoanStatus(_loanId) == LoanState.PaidBack) {
			IERC20(offer.credit).transfer(msg.sender, offer.creditToBePaidAmount);
		} else {
			revert("Loan cannot be claimed");
		}
		
		_burn(_loanId);

		delete loans[_loanId];
	}	


	/// @inheritdoc IERC721Receiver
	function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) override external pure returns (bytes4) {
		return this.onERC721Received.selector;
	}


	/// @dev Utility function to determine correct loan status
	/// @dev Used to examine if loan expired or not
	/// @param _loanId Id of a loan of interest
	/// @return Calculated loan status
	function getLoanStatus(uint256 _loanId) public view returns (LoanState) {
		if (loans[_loanId].state != LoanState.PaidBack && loans[_loanId].expiration > 0 && loans[_loanId].expiration <= block.timestamp) {
			return LoanState.Expired;
		} else {
			return loans[_loanId].state;
		}
	}

	/// @dev Utility function to get whole offer list
	/// @dev Offer list should be got from events, but this project doesn't develop custom server so it uses this workaround
	/// @return Loan offer list
	function getOfferList() external view returns (LoanOffer[] memory) {
		LoanOffer[] memory offerList = new LoanOffer[](offerId);
		if (offerId == 0) {
			return offerList;
		}

		for (uint256 i = 1; i <= offerId; i++) {
			offerList[i - 1] = offers[i];
		}
		return offerList;
	}

	/// @dev Utility function to get whole loan list
	/// @dev Loan list should be got from events, but this project doesn't develop custom server so it uses this workaround
	/// @return Loan list
	function getLoanList() external view returns (Loan[] memory) {
		Loan[] memory loanList = new Loan[](loanId);
		if (loanId == 0) {
			return loanList;
		}

		for (uint256 i = 1; i <= loanId; i++) {
			loanList[i - 1] = loans[i];
			loanList[i - 1].state = getLoanStatus(i);
		}
		return loanList;
	}


	/// @inheritdoc IERC165
	function supportsInterface(bytes4 interfaceId) override public view returns (bool) {
		return super.supportsInterface(interfaceId)
			|| interfaceId == type(IERC721Receiver).interfaceId;
	}

}
