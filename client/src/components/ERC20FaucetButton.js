import { Button, Card }  from "react-bootstrap";
import { useWeb3React } from "@web3-react/core";
import { useContract } from "../hooks/useContract";
import { ERC20FaucetAddress } from "../static/addresses";
import ERC20FaucetABI from "../static/ERC20FaucetABI";
import { useAppContext } from '../AppContext';
import { BigNumber } from "ethers";


const ERC20FaucetButton = () => {
	const { active, account } = useWeb3React();
	const { txnStatus, setTxnStatus, setLastTxnHash } = useAppContext();
	const faucetContract = useContract(ERC20FaucetAddress, ERC20FaucetABI);


	async function onMint() {
		if (active) {
			try {
				setTxnStatus("LOADING");

				const tx = await faucetContract.get(BigNumber.from(10).pow(18).mul(100));
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
		<Button onClick={onMint} disabled={!active}>Mint 100 faucet ERC20 token</Button>
	);
}

export default ERC20FaucetButton;
