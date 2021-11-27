const P2PLoan = artifacts.require("P2PLoan");
const ERC20Faucet = artifacts.require("ERC20Faucet");
const ERC721Faucet = artifacts.require("ERC721Faucet");

module.exports = function(deployer) {
  deployer.deploy(P2PLoan);
  deployer.deploy(ERC20Faucet);
  deployer.deploy(ERC721Faucet);
};
