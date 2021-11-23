import { Alert } from "react-bootstrap";
import { useAppContext } from '../AppContext';


const TransactionState = () => {
    const { txnStatus, setTxnStatus } = useAppContext();


    function resetTxnStatus() {
        setTxnStatus("NOT_SUBMITTED");
    }

    if (txnStatus == "LOADING") {
        return (
            <Alert variant="warning">
                Transaction is loading...
            </Alert>
        );
    }

    if (txnStatus == "ERROR") {
        return (
            <Alert variant="danger" onClose={resetTxnStatus} dismissible>
                Transaction failed!
            </Alert>
        );
    }

    if (txnStatus == "COMPLETE") {
        return (
            <Alert variant="success" onClose={resetTxnStatus} dismissible>
                Transaction successfully mined 🎉
            </Alert>
        );
    }

    return null;
};

export default TransactionState;
