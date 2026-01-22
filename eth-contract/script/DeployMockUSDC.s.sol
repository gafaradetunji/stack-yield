// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

/**
 * @title DeployMockUSDC
 * @notice Deploy a mock USDC token for testing
 * @dev Run with: forge script script/DeployMockUSDC.s.sol:DeployMockUSDC --rpc-url $BASE_RPC_URL --private-key $DEPLOYER_PRIVATE_KEY --broadcast
 */
contract DeployMockUSDC is Script {
    MockUSDC public usdc;

    function run() public {
        address deployer = vm.addr(vm.envUint("DEPLOYER_PRIVATE_KEY"));
        
        console.log("=== Deploying Mock USDC ===");
        console.log("Deployer address:", deployer);
        console.log("");

        vm.startBroadcast();

        usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // Mint initial supply to deployer for testing
        usdc.mint(deployer, 1_000_000 * 10**6); // 1 million USDC
        console.log("Minted 1,000,000 USDC to deployer");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("MockUSDC:", address(usdc));
        console.log("Deployer balance:", usdc.balanceOf(deployer) / 10**6, "USDC");
        console.log("");
        console.log("Anyone can mint tokens by calling:");
        console.log("  - faucet() - Mints 1000 USDC to caller");
        console.log("  - mintToSelf(amount) - Mint custom amount");
        console.log("  - mint(address, amount) - Mint to any address");
        console.log("");
        console.log("Update your .env with:");
        console.log("USDC_ADDRESS=%s", address(usdc));
        console.log("");
        console.log("Verify on BaseScan:");
        console.log("https://sepolia.basescan.org/address/%s", address(usdc));
    }
}
