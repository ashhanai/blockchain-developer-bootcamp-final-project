import ERC20_ABI from "../static/ERC20ABI";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from "../AppContext";
import { useContract } from "./useContract";


const useERC20 = (contractAddress) => {
	const { active, account } = useWeb3React();
	const { txnStatus, setTxnStatus, setLastTxnHash } = useAppContext();
	const contract = useContract(contractAddress, ERC20_ABI);


	const approve = async (spender, allowance) => {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await contract.approve(spender, allowance);
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch {
				setTxnStatus("ERROR");
			}
		}
	};

	const allowance = async (owner, spender) => {
		if (active) {
			return await contract.callStatic.allowance(owner, spender);
		}
	};


	return {
		approve,
		allowance,
	};

};

export default useERC20;
