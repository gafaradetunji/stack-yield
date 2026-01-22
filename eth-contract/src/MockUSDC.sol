// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing on Base Sepolia
 * @dev Allows anyone to mint tokens for testing purposes
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals;

    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        _decimals = 6; // USDC uses 6 decimals
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint tokens to any address (public for testing)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (in USDC units, e.g., 1000000 = 1 USDC)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Mint tokens to caller (convenience function)
     * @param amount Amount to mint (in USDC units, e.g., 1000000 = 1 USDC)
     */
    function mintToSelf(uint256 amount) external {
        _mint(msg.sender, amount);
    }

    /**
     * @notice Mint 1000 USDC to caller (quick test function)
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**6); // 1000 USDC
    }
}
