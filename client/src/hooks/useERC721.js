import ERC721_ABI from "../static/ERC721ABI";
import { useWeb3React } from "@web3-react/core";
import { useAppContext } from '../AppContext';
import { useContract } from "./useContract";


const useERC721 = (contractAddress) => {
	const { active } = useWeb3React();
	const { txnStatus, setTxnStatus, setLastTxnHash } = useAppContext();
	const contract = useContract(contractAddress, ERC721_ABI);


	const approve = async (spender, tokenId) => {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await contract.approve(spender, tokenId);
				const receipt = await tx.wait(1);
				console.log(receipt);

				setTxnStatus("COMPLETE");
				setLastTxnHash(receipt.transactionHash);
			} catch {
				setTxnStatus("ERROR");
			}
		}
	};

	const getApproved = async (tokenId) => {
		if (active) {
			return await contract.getApproved(tokenId);
		}
	};


	return {
		approve,
		getApproved,
	};

};

export default useERC721;
