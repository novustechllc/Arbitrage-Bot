// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

// Importing necessary interfaces and contracts from external libraries.
import "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

// The Arbitrage contract implements the IFlashLoanRecipient interface.
contract Arbitrage is IFlashLoanRecipient {
    // Define the Balancer Vault contract address as a constant.
    IVault private constant vault = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

    // Define Uniswap and Sushiswap router contracts and an owner address.
    IUniswapV2Router02 public immutable sRouter;
    IUniswapV2Router02 public immutable uRouter;
    address public owner;

    // Constructor that initializes the router contracts and owner address.
    constructor(address _sRouter, address _uRouter) {
        sRouter = IUniswapV2Router02(_sRouter); // Sushiswap
        uRouter = IUniswapV2Router02(_uRouter); // Uniswap
        owner = msg.sender;
    }

    // Function to execute an arbitrage trade.
    function executeTrade(
        bool _startOnUniswap,
        address _token0,
        address _token1,
        uint256 _flashAmount
    ) external {
        // Encode trade data for the flash loan.
        bytes memory data = abi.encode(_startOnUniswap, _token0, _token1);

        // Specify the token to flash loan and the flash loan amount.
        IERC20[] memory tokens = new IERC20[](1);
        tokens[0] = IERC20(_token0);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = _flashAmount;

        // Initiate the flash loan from the Balancer Vault.
        vault.flashLoan(this, tokens, amounts, data);
    }

    // Function to receive the flash loan and execute the arbitrage trade.
    function receiveFlashLoan(
        IERC20[] memory tokens,
        uint256[] memory amounts,
        uint256[] memory feeAmounts,
        bytes memory userData
    ) external override {
        require(msg.sender == address(vault));

        uint256 flashAmount = amounts[0];

        (bool startOnUniswap, address token0, address token1) = abi.decode(
            userData,
            (bool, address, address)
        );

        // Trade tokens based on the arbitrage strategy.
        address[] memory path = new address[](2);

        path[0] = token0;
        path[1] = token1;

        if (startOnUniswap) {
            // Execute the trade on Uniswap and then Sushiswap.
            _swapOnUniswap(path, flashAmount, 0);

            path[0] = token1;
            path[1] = token0;

            _swapOnSushiswap(
                path,
                IERC20(token1).balanceOf(address(this)),
                flashAmount
            );
        } else {
            // Execute the trade on Sushiswap and then Uniswap.
            _swapOnSushiswap(path, flashAmount, 0);

            path[0] = token1;
            path[1] = token0;

            _swapOnUniswap(
                path,
                IERC20(token1).balanceOf(address(this)),
                flashAmount
            );
        }

        // Transfer the remaining tokens and the profit back to the Vault and the owner.
        IERC20(token0).transfer(address(vault), flashAmount);
        IERC20(token0).transfer(owner, IERC20(token0).balanceOf(address(this)));
    }

    // Internal function to execute a trade on Uniswap.
    function _swapOnUniswap(
        address[] memory _path,
        uint256 _amountIn,
        uint256 _amountOut
    ) internal {
        require(
            IERC20(_path[0]).approve(address(uRouter), _amountIn),
            "Uniswap approval failed."
        );

        uRouter.swapExactTokensForTokens(
            _amountIn,
            _amountOut,
            _path,
            address(this),
            (block.timestamp + 1200)
        );
    }

    // Internal function to execute a trade on Sushiswap.
    function _swapOnSushiswap(
        address[] memory _path,
        uint256 _amountIn,
        uint256 _amountOut
    ) internal {
        require(
            IERC20(_path[0]).approve(address(sRouter), _amountIn),
            "Sushiswap approval failed."
        );

        sRouter.swapExactTokensForTokens(
            _amountIn,
            _amountOut,
            _path,
            address(this),
            (block.timestamp + 1200)
        );
    }
}
