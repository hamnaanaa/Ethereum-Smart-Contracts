const HAMToken = artifacts.require("HAMToken");
const HBank = artifacts.require("HBank");

contract("HBank", (accounts) => {
  let hamToken, hBank;

  // Success scenarios
  describe("success", () => {
    /* A new instance of HAMToken and HBank contracts set before each test case.
     * The minter role is initially passed to HBank such that it can mint tokens
     * when paying out the interests.
     */
    beforeEach(async () => {
      hamToken = await HAMToken.new();
      hBank = await HBank.new(hamToken.address, 10); // Sets the yearly return rate to 10
      await hamToken.passMinterRole(hBank.address, { from: accounts[0] });
    });

    it("should set the yearly return rate correctly", async () => {
      assert.equal(await hBank.yearlyReturnRate(), 10);
    });

    it("should deposit correctly", async () => {
      await hBank.deposit({ value: 10 ** 18, from: accounts[1] }); // Decimal is set to 18 by default in ERC20 OpenZeppelin (Unit = Wei)
      const investor = await hBank.investors(accounts[1]);
      assert.equal(investor.hasActiveDeposit, true);
      assert.equal(Number(investor.amount), 10 ** 18); // Since the amount is a big number (BN), it is better be cast to a Number for convenience
      expect(Number(investor.startTime)).to.be.above(0);
      expect(Number(await web3.eth.getBalance(hBank.address))).to.be.above(
        0
      ); // Use web3 to find the Ether balance of any account
    });

    it("should withdraw correctly", async () => {
      await hBank.deposit({ value: 10 ** 18, from: accounts[1] });
      await hBank.deposit({ value: 10 ** 18, from: accounts[2] });

      const oldEthBalance = Number(await web3.eth.getBalance(accounts[1]));
      await hBank.withdraw({
        from: accounts[1],
      });
      const newEthBalance = Number(await web3.eth.getBalance(accounts[1]));
      expect(Number(newEthBalance)).to.be.above(oldEthBalance);

      const tokenBalance = Number(await hamToken.balanceOf(accounts[1]));
      expect(tokenBalance).to.be.above(0);

      const investor = await hBank.investors(accounts[1]);
      assert.equal(investor.hasActiveDeposit, false);
      assert.equal(investor.amount, 0);

      // Only the deposited amount by accounts[2] should be left in the contract balance
      assert.equal(
        Number(await web3.eth.getBalance(hBank.address)),
        10 ** 18
      );
    });
  });

  // Failure scenarios
  describe("failure", () => {
    it("should reject invalid yearly return rate", async () => {
      let err;
      try {
        hamToken = await HAMToken.new();
        hBank = await HBank.new(hamToken.address, 1000);
      } catch (e) {
        err = e;
      }
      assert.notEqual(err, undefined, "Error must be thrown");
      assert.equal(err.reason, "Yearly return rate must be between 1 and 100"); // Use this error message in your HBank constructor
    });

    it("should reject invalid deposit amount", async () => {
      let err;
      try {
        hamToken = await HAMToken.new();
        hBank = await HBank.new(hamToken.address, 10);
        await hBank.deposit({ value: 10 ** 17, from: accounts[1] });
      } catch (e) {
        err = e;
      }
      assert.notEqual(err, undefined, "Error must be thrown");
      assert.equal(err.reason, "Minimum deposit amount is 1 Ether"); // Use this error message in your deposit function
    });

    it("should reject account having multiple active deposit", async () => {
      let err;
      try {
        hamToken = await HAMToken.new();
        hBank = await HBank.new(hamToken.address, 10);
        await hBank.deposit({ value: 10 ** 18, from: accounts[1] });
        await hBank.deposit({ value: 10 ** 18, from: accounts[1] });
      } catch (e) {
        err = e;
      }
      assert.notEqual(err, undefined, "Error must be thrown");
      assert.equal(err.reason, "Account can't have multiple active deposits"); // Use this error message in your deposit function
    });

    it("should reject withdraw with no active deposit", async () => {
      let err;
      try {
        hamToken = await HAMToken.new();
        hBank = await HBank.new(hamToken.address, 10);
        await hBank.withdraw({ from: accounts[1] });
      } catch (e) {
        err = e;
      }
      assert.notEqual(err, undefined, "Error must be thrown");
      assert.equal(
        err.reason,
        "Account must have an active deposit to withdraw" // Use this error message in your withdraw function
      );
    });
  });
});
