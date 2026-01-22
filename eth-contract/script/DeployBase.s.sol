// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Treasury} from "../src/Treasury.sol";
import {EthDepositGateway} from "../src/EthDepositGateway.sol";

/**
 * @title DeployBase
 * @notice Deployment script for Stack Yield contracts on Base Sepolia
 * @dev Run with: forge script script/DeployBase.s.sol:DeployBase --rpc-url $BASE_RPC_URL --private-key $DEPLOYER_PRIVATE_KEY --broadcast
 */
contract DeployBase is Script {
    // Contracts to deploy
    Treasury public treasury;
    EthDepositGateway public gateway;

    // Environment variables
    address public usdcAddress;

    function setUp() public {
        // Load USDC address from environment
        usdcAddress = vm.envAddress("USDC_ADDRESS");
        require(usdcAddress != address(0), "USDC_ADDRESS not set");
    }

    function run() public {
        // Get deployer address
        address deployer = vm.addr(vm.envUint("DEPLOYER_PRIVATE_KEY"));
        
        console.log("=== Stack Yield Deployment to Base Sepolia ===");
        console.log("Deployer address:", deployer);
        console.log("USDC address:", usdcAddress);
        console.log("");

        vm.startBroadcast();

        // 1. Deploy Treasury
        console.log("Deploying Treasury...");
        treasury = new Treasury(usdcAddress);
        console.log("Treasury deployed at:", address(treasury));
        console.log("");

        // 2. Deploy EthDepositGateway
        console.log("Deploying EthDepositGateway...");
        gateway = new EthDepositGateway(usdcAddress, address(treasury));
        console.log("EthDepositGateway deployed at:", address(gateway));
        console.log("");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("=== Deployment Summary ===");
        console.log("Treasury:", address(treasury));
        console.log("EthDepositGateway:", address(gateway));
        console.log("");
        console.log("Save these addresses for your frontend/backend configuration!");
        console.log("Verify contracts on BaseScan:");
        console.log("https://sepolia.basescan.org/address/%s", address(treasury));
        console.log("https://sepolia.basescan.org/address/%s", address(gateway));
    }
}
