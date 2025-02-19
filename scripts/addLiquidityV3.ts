import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    // Token and Contract Addresses
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNI_NPM = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
    const whaleAddress = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // Impersonate whale account
    await helpers.impersonateAccount(whaleAddress);
    const whale = await ethers.getSigner(whaleAddress);

    // Get contract instances
    const usdc = await ethers.getContractAt('IERC20', USDCAddress);
    const dai = await ethers.getContractAt('IERC20', DAIAddress);
    const positionManager = await ethers.getContractAt('INonfungiblePositionManager', UNI_NPM);

    // Gas settings
    const gasOptions = {
        maxFeePerGas: ethers.parseUnits("150", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("1.5", "gwei")
    };

    // Token amounts
    const usdcAmount = ethers.parseUnits("100000", 6);
    const daiAmount = ethers.parseUnits("100000", 18);

    // Check initial balances
    console.log("\n=== Initial Balances ===");
    console.log("USDC:", ethers.formatUnits(await usdc.balanceOf(whale.address), 6));
    console.log("DAI:", ethers.formatUnits(await dai.balanceOf(whale.address), 18));

    // Sort tokens by address (Uniswap requirement)
    let token0, token1, amount0Desired, amount1Desired;
    if (USDCAddress.toLowerCase() < DAIAddress.toLowerCase()) {
        token0 = USDCAddress;
        token1 = DAIAddress;
        amount0Desired = usdcAmount;
        amount1Desired = daiAmount;
    } else {
        token0 = DAIAddress;
        token1 = USDCAddress;
        amount0Desired = daiAmount;
        amount1Desired = usdcAmount;
    }

    // Approve token spending
    console.log("\nApproving tokens...");
    await usdc.connect(whale).approve(UNI_NPM, usdcAmount, gasOptions);
    await dai.connect(whale).approve(UNI_NPM, daiAmount, gasOptions);

    // Use a wider tick range for better success chances
    // For USDC/DAI which are stablecoins, price shouldn't vary much
    // But we'll use a safe range: +/- 10% from the current price
    const tickLower = -887220;  // A much wider range
    const tickUpper = 887220;   // Allowing for significant price movements

    // Set up liquidity position parameters
    const mintParams = {
        token0: token0,
        token1: token1,
        fee: 3000, // 0.3% fee tier
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0Desired: amount0Desired,
        amount1Desired: amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        recipient: whale.address,
        deadline: Math.floor(Date.now() / 1000) + 300 // 5 minutes
    };

    // Add liquidity
    console.log("\nAdding liquidity...");
    console.log("Mint params:", mintParams);
    
    const tx = await positionManager.connect(whale).mint(mintParams, gasOptions);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();

    // Check final balances
    console.log("\n=== Final Balances ===");
    console.log("USDC:", ethers.formatUnits(await usdc.balanceOf(whale.address), 6));
    console.log("DAI:", ethers.formatUnits(await dai.balanceOf(whale.address), 18));

    console.log("\n✅ Liquidity added successfully!");
};

main().catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
});