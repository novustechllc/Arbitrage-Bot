// Import required dependencies
const hre = require("hardhat");
require("dotenv").config();

/**
 * This file serves the purpose of initializing key contracts, 
 * including the V2 router and factory, and also 
 * initializing the `Arbitrage.sol` contract.
 */

// Load configuration from the config.json file
const config = require('../config.json');

// Import Ethereum and Uniswap/Sushiswap contract ABIs
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");

let provider;

// Check if the project is running locally or on a live network
if (config.PROJECT_SETTINGS.isLocal) {
  // Use a local WebSocket provider
  provider = new hre.ethers.WebSocketProvider(`ws://127.0.0.1:8545/`);
} else {
  // Use Infura WebSocket provider with the specified API key
  provider = new hre.ethers.WebSocketProvider(`wss://eth-mainnet.g.alchemy.com/v2/${process.env.Infura_API_KEY}`);
}

// -- SETUP UNISWAP/SUSHISWAP CONTRACTS -- //

// Create Ethereum contract instances for Uniswap and Sushiswap factory and router
const uFactory = new hre.ethers.Contract(config.UNISWAP.FACTORY_ADDRESS, IUniswapV2Factory.abi, provider);
const uRouter = new hre.ethers.Contract(config.UNISWAP.V2_ROUTER_02_ADDRESS, IUniswapV2Router02.abi, provider);
const sFactory = new hre.ethers.Contract(config.SUSHISWAP.FACTORY_ADDRESS, IUniswapV2Factory.abi, provider);
const sRouter = new hre.ethers.Contract(config.SUSHISWAP.V2_ROUTER_02_ADDRESS, IUniswapV2Router02.abi, provider);

// Import the Arbitrage contract ABI
const IArbitrage = require('../artifacts/contracts/Arbitrage.sol/Arbitrage.json');

// Create an instance of the Arbitrage contract
const arbitrage = new hre.ethers.Contract(config.PROJECT_SETTINGS.ARBITRAGE_ADDRESS, IArbitrage.abi, provider);

// Export the initialized provider and contract instances for external use
module.exports = {
  provider,
  uFactory,
  uRouter,
  sFactory,
  sRouter,
  arbitrage
};
