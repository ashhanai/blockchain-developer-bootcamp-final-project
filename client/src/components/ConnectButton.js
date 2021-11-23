import { Button, Card }  from "react-bootstrap";
import { injected } from "../connectors";
import { shortenAddress } from '../utils/shortenAddress';
import { useWeb3React } from '@web3-react/core';


const ConnectButton = () => {
	const { activate, active, account, deactivate } = useWeb3React();

	function onDeactivate() {
		window.localStorage.removeItem("providerActivated");
		deactivate();
	}

	function onActivate() {
		window.localStorage.setItem("providerActivated", true);
		activate(injected);
	}

	if (active) {
		return (
			<Card className="d-flex flex-row justify-content-between" style={{ width: 350 }}>
				<Card.Text className="m-2">{shortenAddress(account, 5)}</Card.Text>
				<Button onClick={onDeactivate}>Disconnect</Button>
			</Card>
		);
	}

	if (typeof window.ethereum === 'undefined') {
  		return (
			<Card className="d-flex flex-row justify-content-between" style={{ width: 350 }}>
				<Card.Text className="m-2">Metamask not installed</Card.Text>
				<Button onClick={onActivate} disabled>Connect</Button>
			</Card>
		);
	}

	return (
		<Card className="d-flex flex-row justify-content-between" style={{ width: 350 }}>
			<Card.Text className="m-2">Not connected</Card.Text>
			<Button onClick={onActivate}>Connect</Button>
		</Card>
	);
};

export default ConnectButton;
