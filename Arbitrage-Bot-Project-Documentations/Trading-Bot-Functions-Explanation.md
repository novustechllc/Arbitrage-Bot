# Trading Bot Functions

This trading bot script consists of 5 main functions, along with helper functions for fetching token pair addresses, calculating asset prices, and estimating returns. You can find these helper functions in the [Helpers](./helpers/helpers.js) script.

## Main Function

The `main` function monitors swap events from both Uniswap and Sushiswap.

## Check Price Function

Upon a swap event, the script calls the `checkPrice` function. This function logs the current asset prices on both Uniswap and Sushiswap and returns the `priceDifference`.

## Determine Direction Function

Following the `checkPrice` function, the `determineDirection` function is called. This function determines the order in which we should buy and sell. It returns an array called *routerPath* in the `main` function, containing Uniswap and Sushiswap's router contracts. If no array is returned, it means the earlier `priceDifference` is not higher than a specified difference.

## Determine Profitability

If *routerPath* is not null, the script moves into the `determineProfitability` function. Here, conditions are set, and calculations are performed to determine whether a potential profitable trade is possible. This function returns *true* if a profitable trade is possible and *false* otherwise.

## Execute Trade Function

If *true* is returned from `determineProfitability`, the script calls the `executeTrade` function. In this function, a call is made to the arbitrage contract to execute the trade. Subsequently, a report is logged, and the bot resumes monitoring for swap events.