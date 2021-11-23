import { useEffect, useState } from "react";
import useP2PLoan from "../hooks/useP2PLoan";
import { useWeb3React } from "@web3-react/core";
import { Container, Table, Form, Button, Card } from "react-bootstrap";
import { useAppContext } from '../AppContext';
import useERC20 from "../hooks/useERC20";
import { P2PLoanAddress } from "../static/addresses";
import { shortenAddress } from "../utils/shortenAddress";
import { BigNumber } from "ethers";


const MyBorrowingListRow = ({loan, offer}) => {
	const { active, account } = useWeb3React();
	const { repay, useOfferList } = useP2PLoan();
	const [state, setState] = useState("LOADING");
	const { lastTxnHash } = useAppContext();
	const { fetchOfferList, offerList } = useOfferList();
	const { allowance, approve } = useERC20(offer.credit);
	const decimals = BigNumber.from(10).pow(18);


	useEffect(() => {
		fetchAllowance();
  	}, [account, active, lastTxnHash]);

  	async function fetchAllowance() {
		const allowanceValue = await allowance(account, P2PLoanAddress);

		if (allowanceValue.lt(BigNumber.from(offer.creditToBePaidAmount))) {
			setState("NEED_APPROVE");
		} else {
			setState("APPROVED");
		}
	}

	function loanState(loan) {
		switch (loan.state) {
			case 0: return "dead";
			case 1: return "running";
			case 2: return "paid back";
			case 3: return "expired";
			default: return "---";
		}
	}

	function loanAction(loan) {
		if (loan.state == 1) {
			return (
				<>
					{state == "LOADING" && <Button size="sm" variant="success" disabled>Repay</Button>}
					{state == "NEED_APPROVE" && <Button size="sm" variant="warning" onClick={onApprove}>Approve</Button>}
					{state == "APPROVED" && <Button size="sm" variant="success" onClick={onRepay}>Repay</Button>}
				</>
			);
		}
	}

	function expirationDate() {
		return (new Date(loan.expiration * 1000)).toLocaleString();
	}

	async function onApprove() {
		await approve(P2PLoanAddress, offer.creditToBePaidAmount);
	}

	async function onRepay() {
		await repay(loan.id, offer.credit, offer.creditToBePaidAmount)
	}

	return (
		<>
			<th>{loan.id}</th>
			<th>{shortenAddress(offer.collateral)}</th>
			<th>{offer.collateralId}</th>
			<th>{BigNumber.from(offer.creditToBePaidAmount).div(decimals).toNumber()}</th>
			<th>{expirationDate()}</th>
			<th>{loanState(loan)}</th>
			<th>{loanAction(loan)}</th>
    	</>
	);
}

const MyBorrowingListRowWrapper = ({loan}) => {
	const { active, account } = useWeb3React();
	const { useOfferList } = useP2PLoan();
	const [state, setState] = useState("LOADING");
	const { fetchOfferList, offerList } = useOfferList();

	useEffect(() => {
		waitForOffers();
  	}, [account, active, offerList]);

  	function waitForOffers() {
  		if (offerList != null && offerList.length > 0) {
  			setState("LOADED");
  		}
  	}

	return (
		<tr key={loan.id}>
			{state == "LOADING" &&
				<>
					<th>{loan.id}</th>
					<th colSpan="6">Loading...</th>
				</>
			}
			{state == "LOADED" && <MyBorrowingListRow loan={loan} offer={offerList[loan.acceptedOfferId - 1]} />}
    	</tr>
	);
}

const MyBorrowingList = () => {
	const { useLoanList, useOfferList, repay } = useP2PLoan();
	const { fetchLoanList, loanList } = useLoanList();
	const { fetchOfferList, offerList } = useOfferList();
	const { active, account } = useWeb3React();
	const { lastTxnHash } = useAppContext();

	useEffect(() => {
		if (active) {
			fetchLoanList();
		}
  	}, [active, account, offerList, lastTxnHash]);

  	function myBorrowingList() {
		return loanList.filter((loan) => {
			if (account != null) {
				return loan.state != 0 && loan.borrower.toLowerCase() == account.toLowerCase();
			}
		});
	}

	function renderTableData(list) {
		return myBorrowingList().map((loan) => {
			return (
				<MyBorrowingListRowWrapper loan={loan}/>
			);
		});
	}

	return (
		<Container className="p-3">
			<h2>My borrowing ({myBorrowingList().length})</h2>
			<Table>
				<thead>
			    	<tr>
				      	<th>ID #</th>
				      	<th>Coll Addr</th>
				      	<th>Coll ID</th>
				      	<th>Debt</th>
				      	<th>Expiration</th>
						<th>State</th>
						<th>Action</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			  	{renderTableData(myBorrowingList())}
				</tbody>
			</Table>
			{myBorrowingList().length == 0 &&
		  		<Container className="text-center">
			  		<p>You have no borrowing at the moment</p>
			  	</Container>
		  	}
		</Container>
	);
};

export default MyBorrowingList;
