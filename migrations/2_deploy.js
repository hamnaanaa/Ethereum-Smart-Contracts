const HAMToken = artifacts.require("HAMToken");
const HBank = artifacts.require("HBank");

module.exports = async function (deployer) {
  // Deploy HAMToken
  await deployer.deploy(HAMToken);
  const hamToken = await HAMToken.deployed();

  // Deploy HBank with HAMToken contract's address
  // and a yearly return rate of 10
  await deployer.deploy(HBank, hamToken.address, 10);
  const hBank = await HBank.deployed();

  // Pass the minter role in HAMToken to HBank
  await hamToken.passMinterRole(hBank.address);
};
