import ERC20_ABI from "../static/ERC20ABI";
import { Contract } from "@ethersproject/contracts";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useWeb3React } from "@web3-react/core";
import { isAddress } from "@ethersproject/address";
import { P2PLoanAddress } from "../static/addresses";
import { useAppContext } from '../AppContext';
import { BigNumber } from "ethers";


const FormSubmitButton = ({creditAddr, creditAmount, onSubmit}) => {
	const [state, setState] = useState("NEED_APPROVE");
	const { active, account, library } = useWeb3React();
	const { txnStatus, setTxnStatus, lastTxnHash, setLastTxnHash } = useAppContext();
	const decimals = BigNumber.from(10).pow(18);

	useEffect(() => {
		fetchAllowance();
  	}, [account, active, creditAddr, creditAmount, lastTxnHash]);

	async function fetchAllowance() {
		if (isAddress(creditAddr) && account != null) {
			const allowanceValue = await contract(creditAddr).allowance(account, P2PLoanAddress);

			if (allowanceValue.lt(decimals.mul(creditAmount))) {
				setState("NEED_APPROVE");
			} else {
				setState("APPROVED");
			}
		} else {
			setState("NOT_CONNECTED");
		}
	}

	async function approveAllowance() {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await contract(creditAddr).approve(P2PLoanAddress, decimals.mul(creditAmount));
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch(error) {
				console.log(error);
				setTxnStatus("ERROR");
			}
		}
	}

	function contract(creditAddr) {
		const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;
		return new Contract(creditAddr, ERC20_ABI, signerOrProvider);
	}

	return (
		<>
			{state == "NOT_CONNECTED" && <Button disabled>Make a new offer</Button>}
			{state == "NEED_APPROVE" && <Button onClick={approveAllowance} variant="warning">Approve credit</Button>}
			{state == "APPROVED" && <Button onClick={onSubmit}>Make a new offer</Button>}
		</>
	);

};

export default FormSubmitButton;
