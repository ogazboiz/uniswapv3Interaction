# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It includes:
- A sample smart contract
- A test suite for the contract
- A Hardhat Ignition module for deployment

## Getting Started

Try running some of the following Hardhat tasks:

```sh
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

---

## Requirements

### **Mandatory**
- `IUniswap`
- `IERC20`

### **Optional**
- `IUniswapFactory`

---

## Basic Steps for Interaction

1. **Addresses**  
   - Required: Liquidity provider address, token addresses, and Uniswap addresses  
   - Optional: Factory addresses  

2. **Get Contract Instances**  
   - Obtain contract instances for all addresses from Step 1, except the liquidity provider (use `getSigner` for LP)  

3. **Retrieve Balances**  
   - Fetch balances using contract instances from Step 2  

4. **Interact with Functions**  
   - Depending on the function being executed (e.g., `addLiquidity`, `removeLiquidity`, etc.)  

5. **Get the Output**  
   - Retrieve and process the output of Step 4  

---

## Scripts

Write the script for the function identified in Step 4 under **Basic Steps for Interaction**.  

---

## Terminal Commands

### **Run Hardhat Node (Forking Mainnet)**
```sh
npx hardhat node --fork <Alchemy key>
```

### **Run a Script**
```sh
npx hardhat run scripts/addLiquidity.ts --network localhost
```