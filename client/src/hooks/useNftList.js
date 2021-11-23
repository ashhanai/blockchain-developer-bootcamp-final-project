import { useAppContext } from "../AppContext";
import { useWeb3React } from "@web3-react/core";


const useNftList = () => {
	const { account } = useWeb3React();
	const { nftList, setNftList } = useAppContext();

	const fetchNftList = async () => {
		if (account) {
			const res = await fetch("https://rinkeby-api.opensea.io/api/v1/assets?owner=" + account);
			const list = (await res.json()).assets.map((token) => {
				return {
					id: token.token_id,
					address: token.asset_contract.address,
					symbol: token.asset_contract.symbol,
					name: token.asset_contract.name
				}
			});

			console.log("Fetched nft list:");
			console.log(list);

			setNftList(list);
		} else {
			setNftList([]);
		}
	};
	return { nftList, fetchNftList };
};

export default useNftList;
