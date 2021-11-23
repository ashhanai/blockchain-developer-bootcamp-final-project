import { useEffect, useState } from "react";
import useP2PLoan from "../hooks/useP2PLoan";
import { useWeb3React } from "@web3-react/core";
import { shortenAddress } from "../utils/shortenAddress";
import { Container, Table, Form, Button, Card } from "react-bootstrap";
import { useAppContext } from '../AppContext';
import { BigNumber } from "ethers";


const MyLendingListRow = ({loan, offer}) => {
	const { claim } = useP2PLoan();
	const decimals = BigNumber.from(10).pow(18);


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
		if (loan.state == 2 || loan.state == 3) {
			return (
				<Button size="sm" variant="success" onClick={() => claim(loan.id)}>Claim</Button>
			);
		}
	}

	function expirationDate() {
		return new Date(loan.expiration * 1000).toLocaleString();
	}

	return (
		<>
			<th>{loan.id}</th>
			<th>{shortenAddress(loan.borrower)}</th>
			<th>{shortenAddress(offer.collateral)}</th>
			<th>{offer.collateralId}</th>
			<th>{BigNumber.from(offer.creditToBePaidAmount).div(decimals).toNumber()}</th>
			<th>{expirationDate()}</th>
			<th>{loanState(loan)}</th>
			<th>{loanAction(loan)}</th>
    	</>
	);
}

const MyLendingListRowWrapper = ({loan}) => {
	const { active, account } = useWeb3React();
	const { useOfferList } = useP2PLoan();
	const [state, setState] = useState("LOADING");
	const { fetchOfferList, offerList } = useOfferList();

	useEffect(() => {
		waitForOffers();
  	}, [account, active, offerList]);

	function waitForOffers() {
		console.log("waitForOffers: ");
  		if (offerList != null && offerList.length > 0) {
  			console.log("waitForOffers: LOADED");
  			setState("LOADED");
  		}
  	}

  	console.log("MyLendingListRowWrapper: ", state);

  	return (
		<>
			{state == "LOADING" &&
				<>
					<th>{loan.id}</th>
					<th colSpan="7">Loading...</th>
				</>
			}
			{state == "LOADED" && <MyLendingListRow loan={loan} offer={offerList[loan.acceptedOfferId - 1]} />}
    	</>
	);
}

const MyLendingList = () => {
	const { useLoanList, useOfferList } = useP2PLoan();
	const { fetchLoanList, loanList } = useLoanList();
	const { fetchOfferList, offerList } = useOfferList();
	const { active, account } = useWeb3React();
	const { lastTxnHash } = useAppContext();

	useEffect(() => {
		if (active) {
			fetchLoanList();
		}
  	}, [active, account, offerList, lastTxnHash]);


	function myLoanList() {
		return loanList.filter((loan, index) => {
			if (account != null && offerList[loan.acceptedOfferId - 1] != null) {
				return loan.state != 0 && offerList[loan.acceptedOfferId - 1].lender.toLowerCase() == account.toLowerCase();
			}
		});
	}

	function renderTableData(list) {
		return list.map((loan) => {
			return (
				<tr key={loan.id}>
					<MyLendingListRowWrapper loan={loan} />
				</tr>
			);
		});
	}

	return (
		<Container className="p-3">
			<h2>My lending ({myLoanList().length})</h2>
			<Table>
				<thead>
			    	<tr>
				      	<th>ID #</th>
				      	<th>Borrower</th>
				      	<th>Coll Addr</th>
				      	<th>Coll Id</th>
				      	<th>Debt</th>
				      	<th>Expiration</th>
						<th>State</th>
						<th>Action</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			  	{renderTableData(myLoanList())}
				</tbody>
			</Table>
			{myLoanList().length == 0 &&
		  		<Container className="text-center">
			  		<p>You have no lending at the moment</p>
			  	</Container>
		  	}
		</Container>
	);
};

export default MyLendingList;
