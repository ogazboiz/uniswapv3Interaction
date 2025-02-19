import { ethers, network } from "hardhat";
const { impersonateAccount } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// Uniswap V3 Contract Addresses
const POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"; // Nonfungible Position Manager

// Tokens (Threshold and KuCoin)
const THRESHOLD_ADDRESS = "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5";
const KUCOIN_ADDRESS = "0xf34960d9d60be18cC1D5Afc1A6F012A723a28811";

// Liquidity Provider (Has both tokens)
const LIQUIDITY_PROVIDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

const main = async () => {
    

    console.log("\n--- Impersonating Liquidity Provider ---");
    await impersonateAccount(LIQUIDITY_PROVIDER);
    const signer = await ethers.getSigner(LIQUIDITY_PROVIDER);

    // Get Contract Instances
    console.log("\n--- Fetching Contract Instances ---");
    const thresholdContract = await ethers.getContractAt("IERC20", THRESHOLD_ADDRESS, signer);
    const kucoinContract = await ethers.getContractAt("IERC20", KUCOIN_ADDRESS, signer);
    const positionManager = await ethers.getContractAt("INonfungiblePositionManager", POSITION_MANAGER, signer);

    // Fetch Balances Before Adding Liquidity
    const thresholdBalance = await thresholdContract.balanceOf(LIQUIDITY_PROVIDER);
    const kucoinBalance = await kucoinContract.balanceOf(LIQUIDITY_PROVIDER);

    console.log("\n--- Balances Before Liquidity Provision ---");
    console.log(`Threshold Token Balance: ${ethers.formatUnits(thresholdBalance, 18)}`);
    console.log(`KuCoin Token Balance: ${ethers.formatUnits(kucoinBalance, 6)}`);

    // Ensure the provider has enough balance
    const amountThreshold = ethers.parseUnits("50106000", 18);
    const amountKucoin = ethers.parseUnits("8000", 6);

    if (thresholdBalance < amountThreshold || kucoinBalance < amountKucoin) {
        console.error("Insufficient token balance for liquidity provision.");
        return;
    }

    // Approve Tokens for the Position Manager
    console.log("\n--- Approving Tokens ---");
    await (await thresholdContract.approve(POSITION_MANAGER, amountThreshold)).wait();
    await (await kucoinContract.approve(POSITION_MANAGER, amountKucoin)).wait();
    console.log("Tokens approved successfully.");

    // Define Liquidity Parameters
    const tickLower = -587220; 
    const tickUpper = 587220; 
    const fee = 4000; 

    // Estimate Gas
    console.log("\n--- Estimating Gas for Minting Liquidity Position ---");
    try {
        const gasEstimate = await positionManager.mint({
            token0: THRESHOLD_ADDRESS,
            token1: KUCOIN_ADDRESS,
            fee,
            tickLower,
            tickUpper,
            amount0Desired: amountThreshold,
            amount1Desired: amountKucoin,
            amount0Min: amountThreshold * 95n/100n, // 5% Slippage
            amount1Min: amountKucoin * 95n/100n,
            recipient: LIQUIDITY_PROVIDER,
            deadline: Math.floor(Date.now() / 1000) + 600
        });

        console.log(`Estimated Gas: ${gasEstimate.toString()}`);
    } catch (error) {
        console.error("Gas estimation failed:", error);
        return;
    }

    // Add Liquidity
    console.log("\n--- Adding Liquidity to Uniswap V3 ---");
    try {
        const tx = await positionManager.mint({
            token0: THRESHOLD_ADDRESS,
            token1: KUCOIN_ADDRESS,
            fee,
            tickLower,
            tickUpper,
            amount0Desired: amountThreshold,
            amount1Desired: amountKucoin,
            amount0Min: amountThreshold * 95n/100n, // 5% Slippage
            amount1Min: amountKucoin * 95n/100n,
            recipient: LIQUIDITY_PROVIDER,
            deadline: Math.floor(Date.now() / 1000) + 600
        });

        console.log("Transaction sent. Waiting for confirmation...");
        await tx.wait();
        console.log(`Liquidity added successfully. Tx Hash: ${tx.hash}`);
    } catch (error) {
        console.error("Transaction failed:", error);
        return;
    }

    // Fetch Balances After Adding Liquidity
    const thresholdBalanceAfter = await thresholdContract.balanceOf(LIQUIDITY_PROVIDER);
    const kucoinBalanceAfter = await kucoinContract.balanceOf(LIQUIDITY_PROVIDER);

    console.log("\n--- Balances After Liquidity Provision ---");
    console.log(`Threshold Token Balance: ${ethers.formatUnits(thresholdBalanceAfter, 18)}`);
    console.log(`KuCoin Token Balance: ${ethers.formatUnits(kucoinBalanceAfter, 6)}`);
};

main().catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
});
