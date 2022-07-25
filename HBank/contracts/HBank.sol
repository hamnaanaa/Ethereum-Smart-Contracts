// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./HAMToken.sol";

contract HBank {
    // HAM Token Contract instance
    HAMToken private hamTokenContract;

    // Yearly return rate of the bank
    uint32 public yearlyReturnRate;

    // Seconds in a year
    uint32 public constant YEAR_SECONDS = 31536000;

    // Average block time in Ethereum
    uint8 public constant AVG_BLOCK_TIME = 14;

    // Minimum deposit amount (1 Ether, expressed in Wei)
    uint256 public constant MIN_DEPOSIT_AMOUNT = 10**18;

    /* Interest earned per second for a minumum deposit amount.
     * Equals to the yearly return of the minimum deposit amount
     * divided by the number of seconds in a year.
     */
    uint256 public interestPerSecondForMinDeposit;

    // Represents an investor record
    struct Investor {
        bool hasActiveDeposit;
        uint amount;
        uint256 startTime;
    }

    // Address to investor mapping
    mapping(address => Investor) public investors;

    /**
     * @dev Initializes the hamTokenContract with the provided contract address.
     * Sets the yearly return rate for the bank.
     * Yearly return rate must be between 1 and 100.
     * Calculates and sets the interest earned per second for a minumum deposit amount
     * based on the yearly return rate.
     * @param _hamTokenContract address of the deployed HAMToken contract
     * @param _yearlyReturnRate yearly return rate of the bank
     */
    constructor(address _hamTokenContract, uint32 _yearlyReturnRate) public {
        hamTokenContract = HAMToken(_hamTokenContract);

        require(_yearlyReturnRate > 0 && _yearlyReturnRate <= 100, "Yearly return rate must be between 1% and 100%");
        yearlyReturnRate = _yearlyReturnRate;

        // Calculate interest per second for min deposit (1 Ether)
        interestPerSecondForMinDeposit = ((MIN_DEPOSIT_AMOUNT * yearlyReturnRate) / 100) / YEAR_SECONDS;
    }

    /**
     * @dev Initializes the respective investor object in investors mapping for the caller of the function.
     * Sets the amount to message value and starts the deposit time.
     * Minimum deposit amount is 1 Ether (be careful about decimals!)
     * Investor can't have an already active deposit.
     */
    function deposit() public payable {
      require(msg.value >= MIN_DEPOSIT_AMOUNT, "Minimum deposit amount is 1 Ether");
      require(investors[msg.sender].hasActiveDeposit != true, "Account can't have multiple active deposits");

      investors[msg.sender].amount = msg.value;
      investors[msg.sender].hasActiveDeposit = true;
      // Use block number as the start time
      investors[msg.sender].startTime = block.number;
    }

    /**
     * @dev Calculates the interest to be paid out based
     * on the deposit amount and duration.
     * Transfers back the deposited amount in Ether.
     * Mints HAM tokens to investor to pay the interest (1 token = 1 interest).
     * Resets the respective investor object in investors mapping.
     * Investor must have an active deposit.
     */
    function withdraw() public {
        require(investors[msg.sender].hasActiveDeposit == true, "Account must have an active deposit to withdraw");

        Investor storage investor = investors[msg.sender];
        uint depositedAmount = investor.amount;
        uint depositDuration = (block.number - investor.startTime) * AVG_BLOCK_TIME;

        // Calculate interest per second
        uint interestPerSecond = interestPerSecondForMinDeposit * (depositedAmount / MIN_DEPOSIT_AMOUNT);
        uint interest = interestPerSecond * depositDuration;

        // Send back deposited Ether to investor
        payable(msg.sender).transfer(depositedAmount);
        // Mint HAM Tokens to investor, to pay out the interest
        hamTokenContract.mint(msg.sender, interest);

        // Reset the investor object
        investor.amount = 0;
        investor.hasActiveDeposit = false;
        investor.startTime = 0;
    }
}
