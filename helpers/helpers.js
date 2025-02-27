// Import necessary dependencies
const ethers = require("ethers");
const Big = require('big.js');

/**
 * This file is designed for housing functions that you might want to reuse 
 * frequently or for the purpose of separating out and organizing logic from 
 * the bot. Feel free to include any additional functions you find necessary.
 */

// Import contract ABIs (Application Binary Interface)
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

/**
 * Fetch information about two tokens and their contracts.
 *
 * @param {string} _token0Address - Address of the first token.
 * @param {string} _token1Address - Address of the second token.
 * @param {ethers.providers.JsonRpcProvider} _provider - Ethereum provider.
 * @returns {Object} - An object containing information about the tokens and their contracts.
 */

async function getTokenAndContract(_token0Address, _token1Address, _provider) {
    // Create contract instances for both tokens
    const token0Contract = new ethers.Contract(_token0Address, IERC20.abi, _provider);
    const token1Contract = new ethers.Contract(_token1Address, IERC20.abi, _provider);

    // Fetch and structure token information
    const token0 = {
        address: _token0Address,
        decimals: 18,
        symbol: await token0Contract.symbol(),
        name: await token0Contract.name()
    }

    const token1 = {
        address: _token1Address,
        decimals: 18,
        symbol: await token1Contract.symbol(),
        name: await token1Contract.name()
    }

    return { token0Contract, token1Contract, token0, token1 };
}

/**
 * Get the address of a Uniswap V2 pair for two tokens.
 *
 * @param {ethers.Contract} _V2Factory - Uniswap V2 Factory contract instance.
 * @param {string} _token0 - Address of the first token.
 * @param {string} _token1 - Address of the second token.
 * @returns {string} - Address of the pair contract.
 */

async function getPairAddress(_V2Factory, _token0, _token1) {
    const pairAddress = await _V2Factory.getPair(_token0, _token1);
    return pairAddress;
}

/**
 * Get the contract instance for a Uniswap V2 pair.
 *
 * @param {ethers.Contract} _V2Factory - Uniswap V2 Factory contract instance.
 * @param {string} _token0 - Address of the first token.
 * @param {string} _token1 - Address of the second token.
 * @param {ethers.providers.JsonRpcProvider} _provider - Ethereum provider.
 * @returns {ethers.Contract} - Uniswap V2 pair contract instance.
 */

async function getPairContract(_V2Factory, _token0, _token1, _provider) {
    const pairAddress = await getPairAddress(_V2Factory, _token0, _token1);
    const pairContract = new ethers.Contract(pairAddress, IUniswapV2Pair.abi, _provider);
    return pairContract;
}

/**
 * Get the reserves of a Uniswap V2 pair.
 *
 * @param {ethers.Contract} _pairContract - Uniswap V2 pair contract instance.
 * @returns {Array} - An array containing reserves of the pair [reserve0, reserve1].
 */

async function getReserves(_pairContract) {
    const reserves = await _pairContract.getReserves();
    return [reserves.reserve0, reserves.reserve1];
}

/**
 * Calculate the price of one token in terms of the other token in a Uniswap pair.
 *
 * @param {ethers.Contract} _pairContract - Uniswap V2 pair contract instance.
 * @returns {Big} - The token price ratio.
 */

async function calculatePrice(_pairContract) {
    const [x, y] = await getReserves(_pairContract);
    return Big(x).div(Big(y));
}

/**
 * Calculate the percentage difference between two prices.
 *
 * @param {Big} _uPrice - The "current" price.
 * @param {Big} _sPrice - The "starting" price.
 * @returns {string} - The percentage difference as a string.
 */

async function calculateDifference(_uPrice, _sPrice) {
    return (((_uPrice - _sPrice) / _sPrice) * 100).toFixed(2);
}

/**
 * Simulate a token swap.
 *
 * @param {Big} _amount - The amount to swap.
 * @param {Array} _routerPath - An array of router path contracts.
 * @param {Object} _token0 - Information about the first token.
 * @param {Object} _token1 - Information about the second token.
 * @returns {Object} - Object containing the input and output amounts of the swap.
 */

async function simulate(_amount, _routerPath, _token0, _token1) {
    // Get amount of tokens in and out of the swap
    const trade1 = await _routerPath[0].getAmountsOut(_amount, [_token0.address, _token1.address]);
    const trade2 = await _routerPath[1].getAmountsOut(trade1[1], [_token1.address, _token0.address]);

    // Format amounts as readable strings
    const amountIn = ethers.formatUnits(trade1[0], 'ether');
    const amountOut = ethers.formatUnits(trade2[1], 'ether');

    return { amountIn, amountOut };
}

// Export the functions for use in other modules
module.exports = {
    getTokenAndContract,
    getPairAddress,
    getPairContract,
    getReserves,
    calculatePrice,
    calculateDifference,
    simulate
}
