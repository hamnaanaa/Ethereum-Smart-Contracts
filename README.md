[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Ethereum Smart Contracts Library
A collection of different ethereum smart contracts offering various blockchain-based functionalities.

This project utilizes a number of useful tools simplifying the whole smart contract development, testing, and deployment. Here's a list of the most important ones:

* ### [Truffle](https://trufflesuite.com/docs/truffle/quickstart/)
    Truﬄe is a development framework for Ethereum, aiming to make life as an Ethereum developer easier. 

* ### [Ganache by Truffle](https://trufflesuite.com/ganache/)
    A personal blockchain for Ethereum development that you can use to deploy contracts, develop appli-
cations, and run tests. It is available as both a desktop application as well as a command-line tool.

* ### [Infura](https://infura.io/)
    Provides instant access over HTTPS and WebSockets to the Ethereum network. Alternative to running your own full node.

After cloning this project for the first time, don't forget to run

    npm i

inside the root directory to install all dependencies.

## 1. HBank
HBank is a decentralized application (dApp) that enables users to earn interest by depositing Ether.
The interest is calculated based on a pre-defined yearly return rate. Although the users can withdraw their
Ether back anytime they want, the longer the deposit stays, the more interest they earn. The interest is paid
back not in Ether, but in the form of **HAM token** which is an _ERC20_ token.

## 2. HBank 2.0
HBank is a decentralized application (dApp) that enables users to earn interest by depositing Ether.
The interest is calculated based on a pre-defined yearly return rate. Although the users can withdraw their Ether back anytime they want, the longer the deposit stays, the more interest they earn. The interest is paid in the form of H token which is an ERC20 token. In HBank 2.0, the users can now borrow ETH by collateralizing their HAM tokens.


For more functionality details, consider reading/running

    truffle test test/hamtoken.test.js

and

    truffle test test/hbank.test.js

in the corresponding project subfolders to see the smart contract callbacks in action.

# Migration to Rinkeby

By default, Truﬄe is configured to deploy to the local Ganache network. In the provided `truffle-config.js` configuration, Rinkeby is added as another network to interact with. This project's configuration file adds a quick migration option to Rinkeby for open testing:

    rinkeby: {
      provider: function () {
        return new HDWalletProvider({
          privateKeys: [process.env.PRIVATE_KEY_1],
          providerOrUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
          numberOfAddresses: 1,
        });
    },

With that configuration, the migration is achieved in only two steps:

1. Create an `.env` file under the root directory with following content:
   
        PRIVATE_KEY_1 = <YOUR PRIVATE KEY>
        INFURA_API_KEY = <YOUR INFURA API KEY>

    Your private key `PRIVATE_KEY_1` is the key from your wallet on Rinkeby.
    The `INFURA_API_KEY` can be found in the account information of your Infura account (see the beginning of this README for more Infura details)

2. Initiate the migration to _rinkeby_ by using `truffle`:

        truffle migrate --network rinkeby

