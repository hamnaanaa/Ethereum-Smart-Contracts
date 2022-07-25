const HAMToken = artifacts.require("HAMToken");

contract("HAMToken", (accounts) => {
  let hamToken;

  // A new instance of the HAMToken contract is set before each test case.
  beforeEach(async () => {
    hamToken = await HAMToken.new();
  });

  /* Some methods called on hamToken are not directly implemented
   * by the HAMToken contract itself. They are inherited from the ERC20
   * implementation of OpenZeppelin.
   */

  // Success scenarios
  describe("success", () => {
    it("should set the token name correctly", async () => {
      assert.equal(await hamToken.name(), "HAM TOKEN");
    });

    it("should set the token symbol correctly", async () => {
      assert.equal(await hamToken.symbol(), "HAM");
    });

    it("should set the minter correctly", async () => {
      assert.equal(await hamToken.minter(), accounts[0]); // accounts[0] is the default deployer account
    });

    it("should pass minter role to second account in accounts", async () => {
      await hamToken.passMinterRole(accounts[1], { from: accounts[0] });
      assert.equal(await hamToken.minter(), accounts[1]);
    });

    it("should mint 10 tokens to second account in accounts", async () => {
      await hamToken.mint(accounts[1], 10, { from: accounts[0] });
      assert.equal(await hamToken.balanceOf(accounts[1]), 10);
    });
  });

  // Failure scenarios
  describe("failure", () => {
    it("should reject minter role passing", async () => {
      let err;
      try {
        await hamToken.passMinterRole(accounts[1], { from: accounts[1] });
      } catch (e) {
        err = e;
      }
      assert.notEqual(err, undefined, "Error must be thrown");
      assert.equal(err.reason, "You are not the minter"); // Use this error message in your passMinterRole function
    });

    it("should reject token minting", async () => {
      let err;
      try {
        await hamToken.mint(accounts[1], 10, { from: accounts[1] });
      } catch (e) {
        err = e;
      }
      assert.notEqual(err, undefined, "Error must be thrown");
      assert.equal(err.reason, "You are not the minter"); // Use this error message in your mint function
    });
  });
});
