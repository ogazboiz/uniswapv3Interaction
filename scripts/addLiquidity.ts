// import { impersonateAccount } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import {ethers} from "hardhat"
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers")

const main = async () => {

    //contract address  for both token

    const thresholdAddress = "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5"
    const kuCoinAddress = "0xf34960d9d60be18cC1D5Afc1A6F012A723a28811"

    // uniswap router and liquidity provider
    const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    
    //liquidity provider that holds both token

    const liquidityProvider = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"


    //2) get contract

   await helpers.impersonateAccount(liquidityProvider);

    const impersonateSigner = await ethers.getSigner(liquidityProvider);
    let thresholdContract = await ethers.getContractAt("IERC20",thresholdAddress);
    let kucoinContract = await ethers.getContractAt("IERC20", kuCoinAddress)
    let uniswapRouterContract = await ethers.getContractAt("IUniswapV2Router01", uniswapRouter)

console.log("------------let fucking go 🤩-------------")


//3) get balance

const thresholdBalance = await thresholdContract.balanceOf(liquidityProvider)
const kucoinBalance =await kucoinContract.balanceOf(liquidityProvider)


console.log("\n\n---------------before 😁---------------")

console.log("before balance for impersonated threshhold " + ethers.formatUnits(thresholdBalance,18 ))
console.log("before balance for impersonated Kucoin " + ethers.formatUnits(kucoinBalance, 6 ))  


//4) add liquidity 

console.log("\n\n---------------add liquidity 🥃-------------------")



const amountADesired = ethers.parseUnits("40000000", 18)
const amountBDesired = ethers.parseUnits("50000", 6)


//min amount
const amountAMin = amountADesired * 95n/100n
//or
// const amountAMin = amountADesired - ethers.parseUnits("1000000", 18)
const amountBMin = amountBDesired * 95n/100n


console.log("\n\n---------------processing ⌛---------------")


// function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
// const quoteB = await uniswapRouterContract.quote(amountADesired, thresholdBalance, kucoinBalance,)

                                       
// function approve(address spender, uint value) external returns (bool);
console.log("threshold approve....")
const txAApprove = await thresholdContract.connect(impersonateSigner).approve(uniswapRouter, amountADesired)
await txAApprove.wait()

console.log("kucoin approve....")
const txBApprove = await kucoinContract.connect(impersonateSigner).approve(uniswapRouter, amountBDesired)
await txBApprove.wait()

const deadline = await helpers.time.latest() + 700

const addLiquidity = await uniswapRouterContract.connect(impersonateSigner).addLiquidity(
    thresholdAddress,
    kuCoinAddress,
    amountADesired,
    amountBDesired,
    amountAMin,
    amountBMin,
    liquidityProvider,
    deadline)
addLiquidity.wait()




const thresholdBalanceAfter = await thresholdContract.balanceOf(liquidityProvider)
const kucoinBalanceAfter =await kucoinContract.balanceOf(liquidityProvider)

console.log("\n\n---------------after ⏲---------------")

//5) get output
console.log("after balance for impersonated threshhold " + ethers.formatUnits(thresholdBalanceAfter,18 ))
console.log("after balance for impersonated Kucoin " + ethers.formatUnits(kucoinBalanceAfter, 6 ))  


    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});