import { useEffect, useState } from "react";
import { Container, Table, Button } from "react-bootstrap";
import useNftList from "../hooks/useNftList";
import useERC721 from "../hooks/useERC721";
import useP2PLoan from "../hooks/useP2PLoan";
import { useAppContext } from "../AppContext";
import { useWeb3React } from "@web3-react/core";
import { P2PLoanAddress } from "../static/addresses";
import { BigNumber } from "ethers";


const MyNftListOfferRow = ({offer}) => {
	const { active, account } = useWeb3React();
	const { getApproved, approve } = useERC721(offer.collateral);
	const { acceptLoanOffer } = useP2PLoan();
	const [state, setState] = useState("LOADING");
	const { lastTxnHash } = useAppContext();
	const decimals = BigNumber.from(10).pow(18);

	useEffect(() => {
		fetchApprovedAddress();
  	}, [lastTxnHash]);

  	async function fetchApprovedAddress() {
  		const approved = await getApproved(offer.collateralId);

  		if (approved == P2PLoanAddress) {
  			setState("APPROVED");
  		} else {
  			setState("NEED_APPROVE");
  		}
  	}

	return (
		<tr key={"offer" + offer.id}>
			<td>{offer.id}</td>
			<td>{BigNumber.from(offer.creditAmount).div(decimals).toNumber()}</td>
			<td>{BigNumber.from(offer.creditToBePaidAmount).div(decimals).toNumber()}</td>
			<td>{offer.duration / 86400} days</td>
			<td>
				{state == "LOADING" && <p>loading...</p>}
				{state == "NEED_APPROVE" && <Button size="sm" variant="warning" onClick={() => approve(P2PLoanAddress, offer.collateralId)}>Approve</Button>}
				{state == "APPROVED" && <Button size="sm" variant="success" onClick={() => acceptLoanOffer(offer.id)}>Accept</Button>}
			</td>
    	</tr>
 	);
};

const MyNftList = () => {
	const { fetchNftList, nftList } = useNftList();
	const { active, account } = useWeb3React();
	const { useOfferList, acceptLoanOffer, useLoanList } = useP2PLoan();
	const { fetchOfferList, offerList } = useOfferList();
	const { lastTxnHash } = useAppContext();

	useEffect(() => {
		fetchNftList();
  	}, [account, active, lastTxnHash]);


	function tokenOffers(token) {
		return offerList.filter((offer) => {
			return offer.collateral.toLowerCase() == token.address.toLowerCase()
				&& offer.collateralId == token.id
				&& offer.state == "1";
		});
	}

	function renderTableData(list) {
		return list.map((token, index) => {
        	const offers = tokenOffers(token);
        	return (
        		<>
					<tr key={"nft" + token.id}>
		            	<td>{token.id}</td>
		               	<td>{token.symbol}</td>
		               	<td>{token.name}</td>
		               	<td>{token.address}</td>
		            </tr>
		            <tr>
						<td></td>
						<td colSpan="3">
							<Table>
								<thead>
									<tr>
										<th>ID #</th>
										<th>Amount</th>
										<th>Repay</th>
										<th>Duration</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
								{renderOfferData(offers)}
								</tbody>
							</Table>
							{offers.length == 0 &&
						  		<Container className="text-center">
							  		<p>You have no pending offer for this NFT</p>
							  	</Container>
						  	}
						</td>
					</tr>
	            </>
         	);
      	});
	}

	function renderOfferData(offers) {
		return offers.map((offer) => {
			return (
				<MyNftListOfferRow offer={offer}/>
			);
		});
	}

	return (
		<Container className="p-3">
			<h2>My NFTs ({nftList.length})</h2>
			<Table>
				<thead>
			    	<tr>
				      	<th>ID #</th>
						<th>Symbol</th>
						<th>Name</th>
						<th>Address</th>
			    	</tr>
			  	</thead>
			  	<tbody>
					{renderTableData(nftList)}
				</tbody>
			</Table>
			{nftList.length == 0 &&
		  		<Container className="text-center">
			  		<p>You have no NFTs</p>
			  	</Container>
		  	}
		</Container>
	);
};

export default MyNftList;
