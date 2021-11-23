const abiJson = [
	{
	    "inputs": [
	      {
	        "internalType": "address",
	        "name": "to",
	        "type": "address"
	      },
	      {
	        "internalType": "uint256",
	        "name": "tokenId",
	        "type": "uint256"
	      }
	    ],
	    "name": "approve",
	    "outputs": [],
	    "stateMutability": "nonpayable",
	    "type": "function"
	  },
	  {
	    "inputs": [
	      {
	        "internalType": "uint256",
	        "name": "tokenId",
	        "type": "uint256"
	      }
	    ],
	    "name": "getApproved",
	    "outputs": [
	      {
	        "internalType": "address",
	        "name": "",
	        "type": "address"
	      }
	    ],
	    "stateMutability": "view",
	    "type": "function",
	    "constant": true
	  }
];

export default abiJson;
