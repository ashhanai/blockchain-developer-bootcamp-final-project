import { Navbar } from "react-bootstrap";
import ConnectButton from "./ConnectButton";
import NFTFaucetButton from "./NFTFaucetButton";
import ERC20FaucetButton from "./ERC20FaucetButton";


const Header = () => {
    return (
        <>
            <Navbar className="justify-content-between" bg="white">
                <h1>P2P Loan protocol</h1>
                <NFTFaucetButton />
                <ERC20FaucetButton />
                <ConnectButton />
            </Navbar>
        </>
    );
};

export default Header;