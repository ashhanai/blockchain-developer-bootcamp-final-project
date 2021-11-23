const HDWalletProvider = require('@truffle/hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync(".secrets/mnemonic").toString().trim();
const projectId = fs.readFileSync(".secrets/infura-project-id").toString().trim();

module.exports = {
  networks: {
    rinkeby: {
      provider: () => new HDWalletProvider({
        mnemonic: mnemonic,
        providerOrUrl: "https://rinkeby.infura.io/v3/" + projectId
      }),
      network_id: 4,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.4"
    }
  },
};
