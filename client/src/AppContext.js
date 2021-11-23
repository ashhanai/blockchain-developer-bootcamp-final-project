import React, { createContext, useReducer } from 'react';

const initialContext = {
    nftList: [],
    setNftList: () => {},
    offerList: [],
    setOfferList: () => {},
    loanList: [],
    setLoanList: () => {},
    txnStatus: 'NOT_SUBMITTED',
    setTxnStatus: () => {},
    lastTxnHash: "",
    setLastTxnHash: () => {},
};

const appReducer = (state, { type, payload }) => {
    switch (type) {
        case 'SET_NFT_LIST':
            return {
                ...state,
                nftList: payload,
            };

        case 'SET_OFFER_LIST':
            return {
                ...state,
                offerList: payload,
            };

        case 'SET_LOAN_LIST':
            return {
                ...state,
                loanList: payload,
            };

        case 'SET_TXN_STATUS':
            return {
                ...state,
                txnStatus: payload,
            };

        case 'SET_LAST_TXN_HASH':
            return {
                ...state,
                lastTxnHash: payload,
            };

        default:
            return state;
    }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);
export const AppContextProvider = ({ children }) => {
    const [store, dispatch] = useReducer(appReducer, initialContext);

    const contextValue = {
        nftList: store.nftList,
        setNftList: (list) => {
            dispatch({ type: 'SET_NFT_LIST', payload: list });
        },
        offerList: store.offerList,
        setOfferList: (list) => {
            dispatch({ type: 'SET_OFFER_LIST', payload: list });
        },
        loanList: store.loanList,
        setLoanList: (list) => {
            dispatch({ type: 'SET_LOAN_LIST', payload: list });
        },
        txnStatus: store.txnStatus,
        setTxnStatus: (status) => {
            dispatch({ type: 'SET_TXN_STATUS', payload: status });
        },
        lastTxnHash: store.lastTxnHash,
        setLastTxnHash: (hash) => {
            dispatch({ type: 'SET_LAST_TXN_HASH', payload: hash });
        },
    };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
