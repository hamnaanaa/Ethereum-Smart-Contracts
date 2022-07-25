const truffleAssert = require("truffle-assertions"); // Used for checking events
const ETHHAMPriceFeedOracle = artifacts.require("ETHHAMPriceFeedOracle");
const HBank = artifacts.require("HBank");
const HAMToken = artifacts.require("HAMToken");

contract("ETHHAMPriceFeedOracle", (accounts) => {
  let oracle;

  // A new instance of the ETHHAMPriceFeedOracle contract is set before each test case.
  beforeEach(async () => {
    oracle = await ETHHAMPriceFeedOracle.new();
  });

  // Success scenarios
  describe("success", () => {
    it("should initalize the lastUpdateBlock and rate correctly", async () => {
      assert.equal(await oracle.getRate.call(), 0);
      const block = await web3.eth.getBlock("latest");
      assert.equal(await oracle.lastUpdateBlock(), block.number);
    });

    it("should update the rate correctly", async () => {
      await oracle.updateRate(10, { from: accounts[0] });
      const rate = await oracle.getRate.call();
      assert.equal(rate, 10);
    });

    it("should emit GetNewRate event with ETH/HAM as the priceFeed, when getRate is called while the last rate update is older than 3 blocks", async () => {
      hamToken = await HAMToken.new();
      hBank = await HBank.new(hamToken.address, 10, oracle.address);

      // Some random transactions to increase the block number
      await hBank.deposit({ from: accounts[1], value: 10 ** 18 });
      await hBank.deposit({ from: accounts[2], value: 10 ** 18 });

      const tx = await oracle.getRate({ from: accounts[1] });

      let err;
      try {
        truffleAssert.eventEmitted(tx, "GetNewRate", (event) => {
          if (event.priceFeed == "ETH/HAM") {
            return true;
          }
          err = "GetNewRate's priceFeed should be set to ETH/HAM";
        });
      } catch (e) {
        err = e;
      }

      // If GetNewRate is emitted with ETH/HAM as the priceFeed, then err will be undefined
      assert.equal(err, undefined);
    });
  });

  // Failure scenarios
  describe("failure", () => {
    it("should reject to update the rate", async () => {
      let err;
      try {
        await oracle.updateRate(10, { from: accounts[1] });
      } catch (e) {
        err = e;
      }
      assert.notEqual(err, undefined, "Error must be thrown");
      assert.equal(err.reason, "Ownable: caller is not the owner"); // Thrown by the Ownable contract
    });

    it("should not emit GetNewRate when last rate update is not older than 3 blocks", async () => {
      hamToken = await HAMToken.new();
      hBank = await HBank.new(hamToken.address, 10, oracle.address);

      const tx = await oracle.getRate({ from: accounts[1] });

      let err;
      try {
        truffleAssert.eventEmitted(tx, "GetNewRate", (event) => {
          return true;
        });
      } catch (e) {
        err = e;
      }

      // If err = undefined, this means GetNewRate is emitted
      assert.notEqual(err, undefined);
    });
  });
});
