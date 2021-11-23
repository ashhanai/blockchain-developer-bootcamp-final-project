import P2PLOAN_ABI from "../static/P2PLoanABI";
import { useAppContext } from '../AppContext';
import { P2PLoanAddress } from "../static/addresses";
import { useWeb3React } from "@web3-react/core";
import { useContract } from "./useContract";


const useP2PLoan = () => {
	const { active, account } = useWeb3React();
	const p2ploanContract = useContract(P2PLoanAddress, P2PLOAN_ABI);
	const { txnStatus, setTxnStatus, setLastTxnHash } = useAppContext();


	const useOfferList = () => {
		const { offerList, setOfferList } = useAppContext();

		const fetchOfferList = async () => {
			console.log("Fetching offer list...");

			const list = (await p2ploanContract.callStatic.getOfferList()).map((offer) => {
				return {
					id: offer.id.toNumber(),
					collateral: offer.collateral,
					collateralId: offer.collateralId.toNumber(),
					credit: offer.credit,
					creditAmount: offer.creditAmount.toString(),
					creditToBePaidAmount: offer.creditToBePaidAmount.toString(),
					duration: offer.duration.toNumber(),
					state: offer.state,
					lender: offer.lender
				}
			});

			console.log("Fetched offer list:");
			console.log(list);

			setOfferList(list);
		};
		return { offerList, fetchOfferList };
	};

	const useLoanList = () => {
		const { loanList, setLoanList } = useAppContext();

		const fetchLoanList = async () => {
			console.log("Fetching loan list...");

			const list = (await p2ploanContract.callStatic.getLoanList()).map((loan) => {
				return {
					id: loan.id.toNumber(),
					acceptedOfferId: loan.acceptedOfferId.toNumber(),
					borrower: loan.borrower,
					expiration: loan.expiration.toNumber(),
					state: loan.state
				}
			});
			console.log("Fetched loan list:");
			console.log(list);

			setLoanList(list);
		};
		return { loanList, fetchLoanList };
	};

	const createLoanOffer = async (
		collateralAddress,
		collateralId,
		creditAddress,
		creditAmount,
		creditToBePaidAmount,
		duration,
	) => {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await p2ploanContract.createLoanOffer(
					collateralAddress,
					collateralId,
					creditAddress,
					creditAmount,
					creditToBePaidAmount,
					duration
				);
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch(error) {
				console.log(error);
				setTxnStatus("ERROR");
			}
		}
	};

	const revokeOffer = async (offerId) => {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await p2ploanContract.revokeLoanOffer(offerId);
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch(error) {
				console.log(error);
				setTxnStatus("ERROR");
			}
		}
	};

	const acceptLoanOffer = async (offerId) => {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await p2ploanContract.acceptLoanOffer(offerId);
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch(error) {
				console.log(error);
				setTxnStatus("ERROR");
			}
		}
	};

	const repay = async (loanId, creditAddress, creditToBePaidAmount) => {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await p2ploanContract.payBackLoan(loanId);
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch(error) {
				console.log(error);
				setTxnStatus("ERROR");
			}
		}
	};

	const claim = async (loanId) => {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await p2ploanContract.claim(loanId);
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch(error) {
				console.log(error);
				setTxnStatus("ERROR");
			}
		}
	};


	return {
		useOfferList,
		useLoanList,
		createLoanOffer,
		revokeOffer,
		acceptLoanOffer,
		repay,
		claim,
	};
};

export default useP2PLoan;
