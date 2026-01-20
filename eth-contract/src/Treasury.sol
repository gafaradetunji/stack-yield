// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury {

    address public admin;
    IERC20 public immutable USDC;

    event FeesReceived(uint256 amount);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event TreasuryWithdrawal(address indexed to, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC");
        USDC = IERC20(_usdc);
        admin = msg.sender;
    }

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");

        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    /// @notice Called by gateway contract when fees are sent
    function notifyFees(uint256 amount) external {
        emit FeesReceived(amount);
    }

    function withdrawFees(address to, uint256 amount) external onlyAdmin {
        require(to != address(0), "Invalid address");

        bool success = USDC.transfer(to, amount);
        require(success, "Transfer failed");

        emit TreasuryWithdrawal(to, amount);
    }

    function getBalance() external view returns (uint256) {
        return USDC.balanceOf(address(this));
    }
}
