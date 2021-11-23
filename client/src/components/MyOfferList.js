import { useEffect, useState } from "react";
import { Container, Table, Form, Button, Card } from "react-bootstrap";
import useP2PLoan from "../hooks/useP2PLoan";
import { useWeb3React } from "@web3-react/core";
import { shortenAddress } from "../utils/shortenAddress";
import { useAppContext } from "../AppContext";
import FormSubmitButton from "./FormSubmitButton";
import { BigNumber } from "ethers";


const MyOfferList = () => {
	const { createLoanOffer, useOfferList, revokeOffer } = useP2PLoan();
	const { fetchOfferList, offerList } = useOfferList();
	const { active, account } = useWeb3React();
	const { lastTxnHash } = useAppContext();

	const [collAddr, setCollAddr] = useState("");
	const [collId, setCollId] = useState();
	const [creditAddr, setCreditAddr] = useState("");
	const [creditAmount, setCreditAmount] = useState();
	const [creditToBePaidAmount, setCreditToBePaidAmount] = useState();
	const [duration, setDuration] = useState();
	const decimals = BigNumber.from(10).pow(18);

	useEffect(() => {
		if (active) {
			fetchOfferList();
		}
  	}, [account, lastTxnHash]);

	const handleMakeOfferSubmit = () => createLoanOffer(
		collAddr,
		collId,
		creditAddr,
		decimals.mul(creditAmount),
		decimals.mul(creditToBePaidAmount),
		duration
	);

	function myOfferList() {
		return offerList.filter((offer, index) => {
			if (account != null) {
				return offer.state == 1 && offer.lender.toLowerCase() == account.toLowerCase();
			}
		});
	}

	function offerState(offer) {
		switch (offer.state) {
			case 0: return "dead";
			case 1: return "open";
			case 2: return "accepted";
			default: return "---";
		}
	}

	function renderTableData(list) {
		return myOfferList().map((offer, index) => {
			return (
				<tr key={offer.id}>
					<th>{offer.id}</th>
					<th>{shortenAddress(offer.collateral)}</th>
					<th>{offer.collateralId}</th>
					<th>{BigNumber.from(offer.creditAmount).div(decimals).toNumber()}</th>
					<th>{BigNumber.from(offer.creditToBePaidAmount).div(decimals).toNumber()}</th>
					<th>{offer.duration / 86400} days</th>
					<th>{offerState(offer)}</th>
					<th>{offerAction(offer)}</th>
		    	</tr>
         	);
      	});
	}

	function offerAction(offer) {
		if (offer.state == 1) {
			return (
				<>
					<Button size="sm" variant="danger" onClick={() => revokeOffer(offer.id)}>Revoke</Button>
				</>
			);
		}
	}


	return (
		<Container className="p-3">
			<h2>My Offers ({myOfferList().length})</h2>
			<Table>
				<thead>
			    	<tr>
				      	<th>ID #</th>
				      	<th>Coll Addr</th>
						<th>Coll ID</th>
						<th>Amount</th>
						<th>Repay</th>
						<th>Duration</th>
						<th>State</th>
						<th>Action</th>
			    	</tr>
			  	</thead>
			  	<tbody>
			  		{renderTableData(myOfferList())}
				</tbody>
			</Table>
			{myOfferList().length == 0 &&
		  		<Container className="text-center">
			  		<p>You have no pending offer</p>
			  	</Container>
		  	}

			<h4>New offer</h4>
			<Card className="p-3">
				<Form>
					<Form.Control type="text" value={collAddr} onChange={(e) => { setCollAddr(e.target.value) }} placeholder="Collateral address" />
					<Form.Control type="number" value={collId} onChange={(e) => { setCollId(e.target.value) }} placeholder="Collateral id" />
					<Form.Control type="text" value={creditAddr} onChange={(e) => { setCreditAddr(e.target.value) }} placeholder="Credit address" />
					<Form.Control type="number" value={creditAmount} onChange={(e) => { setCreditAmount(e.target.value) }} placeholder="Credit amount" />
					<Form.Control type="number" value={creditToBePaidAmount} onChange={(e) => { setCreditToBePaidAmount(e.target.value) }} placeholder="Credit amount to be paid back" />
					<Form.Control type="number" value={duration} onChange={(e) => { setDuration(e.target.value) }} placeholder="Duration (s)" />

					<FormSubmitButton creditAddr={creditAddr} creditAmount={creditAmount} onSubmit={handleMakeOfferSubmit} />
				</Form>
			</Card>
		</Container>
	);
};

export default MyOfferList;
