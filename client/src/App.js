import { ethers } from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";
import { Web3ReactProvider } from '@web3-react/core';

import { AppContextProvider, useAppContext } from './AppContext';
import Home from './pages/Home';
import Header from './components/Header';
import TransactionState from "./components/TransactionState";
import { useEffect, useState } from 'react';
import { injected } from './connectors';
import { useWeb3React } from '@web3-react/core';


function MetamaskProvider({ children }) {
    const { active, error, activate } = useWeb3React()

    useEffect(() => {
        injected.isAuthorized()
            .then((isAuthorized) => {
                const providerActivated = window.localStorage.getItem("providerActivated");
                if (isAuthorized && !active && !error && providerActivated) {
                    activate(injected);
                }
            });
    }, [activate, active, error]);

    return children;
}

function getLibrary(provider) {
    return new ethers.providers.Web3Provider(provider);
}

const App = () => (
    <AppContextProvider>
        <Web3ReactProvider getLibrary={getLibrary}>
            <MetamaskProvider>
                <Container className="pb-5 pt-3">
                    <TransactionState />
                    <Header />
                    <Home />
                </Container>
            </MetamaskProvider>
        </Web3ReactProvider>
    </AppContextProvider>
);

export default App;
