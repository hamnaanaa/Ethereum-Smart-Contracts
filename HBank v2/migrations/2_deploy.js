const HAMToken = artifacts.require("HAMToken");
const HBank = artifacts.require("HBank");
const ETHHAMPriceFeedOracle = artifacts.require("ETHHAMPriceFeedOracle");

module.exports = async function (deployer) {
  // Deploy HAMToken
  await deployer.deploy(HAMToken);
  const hamToken = await HAMToken.deployed();

  // Deploy ETHHAMPriceFeedOracle
  const oracle = await deployer.deploy(ETHHAMPriceFeedOracle);

  // Deploy HBank with HAMToken contract's address, a yearly return rate of 10, and oracle address
  await deployer.deploy(HBank, hamToken.address, 10, oracle.address);
  const hBank = await HBank.deployed();

  // Pass the minter role in HAMToken to HBank
  await hamToken.passMinterRole(hBank.address);
};
