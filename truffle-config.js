const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

let provider;
if (fs.existsSync(".secrets")) {
  const mnemonic = fs.readFileSync(".secrets/mnemonic").toString().trim();
  const projectId = fs.readFileSync(".secrets/infura-project-id").toString().trim();

  provider = () => new HDWalletProvider({
    mnemonic: mnemonic,
    providerOrUrl: "https://rinkeby.infura.io/v3/" + projectId,
  });
}

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      provider: provider,
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
