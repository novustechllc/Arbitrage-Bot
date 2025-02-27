// We explicitly include the Hardhat Runtime Environment in this code, which is not 
// mandatory but proves useful for running the script independently using `node <script>`. 
// Alternatively, you can execute the script using `npx hardhat run <script>`, which, in 
// this case, compiles your smart contracts, integrates the Hardhat Runtime Environment's 
// functionality into the global scope, and proceeds to execute the script.

const hre = require("hardhat")

// Import a configuration file (config.json) which seems to store addresses.
const config = require("../config.json")

async function main() {
  // Deploy the "Arbitrage" contract using Hardhat's ethers library.
  // The contract is deployed with an array of constructor parameters.
  const arbitrage = await hre.ethers.deployContract(
    "Arbitrage",
    [
      config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
      config.UNISWAP.V2_ROUTER_02_ADDRESS
    ]
  )

  // Wait for the deployment to complete.
  await arbitrage.waitForDeployment()

  // Print the address where the Arbitrage contract was deployed.
  console.log(`Arbitrage contract deployed to ${await arbitrage.getAddress()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  // Handle any errors that occur during deployment and log them.
  console.error(error);

  // Set the process exit code to 1 to indicate an error.
  process.exitCode = 1;
});
