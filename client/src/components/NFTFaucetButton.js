import { Button, Card }  from "react-bootstrap";
import { useWeb3React } from "@web3-react/core";
import { useContract } from "../hooks/useContract";
import { NFTFaucetAddress } from "../static/addresses";
import NFTFaucetABI from "../static/ERC721FaucetABI";
import { useAppContext } from '../AppContext';


const NFTFaucetButton = () => {
	const { active, account } = useWeb3React();
	const { txnStatus, setTxnStatus, setLastTxnHash } = useAppContext();
	const faucetContract = useContract(NFTFaucetAddress, NFTFaucetABI);


	async function onMint() {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await faucetContract.get();
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

	return (
		<Button onClick={onMint} disabled={!active}>Mint faucet NFT</Button>
	);
}

export default NFTFaucetButton;
