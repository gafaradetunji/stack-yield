// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Treasury} from "../src/Treasury.sol";

contract MockUSDC {
    mapping(address => uint256) public balanceOf;

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
}

contract TreasuryTest is Test {

    Treasury treasury;
    MockUSDC usdc;

    address admin = address(this);
    address user = address(0x1234);

    function setUp() public {
        usdc = new MockUSDC();
        treasury = new Treasury(address(usdc));

        usdc.mint(address(treasury), 5000e6);
    }

    function testInitialAdmin() public view {
        assertEq(treasury.admin(), admin);
    }

    function testWithdrawFees() public {
        uint256 before = usdc.balanceOf(user);

        treasury.withdrawFees(user, 1000e6);

        assertEq(usdc.balanceOf(user), before + 1000e6);
    }

    function testChangeAdmin() public {
        treasury.changeAdmin(user);
        assertEq(treasury.admin(), user);
    }

    function testOnlyAdminWithdraw() public {
        vm.prank(user);
        vm.expectRevert("Not admin");
        treasury.withdrawFees(user, 100e6);
    }

    function testChangeAdminEmitsEvent() public {
        vm.expectEmit(false, true, false, true);
        emit Treasury.AdminChanged(admin, user);
        treasury.changeAdmin(user);
    }

    function testWithdrawFeesEmitsEvent() public {
        uint256 before = usdc.balanceOf(user);

        vm.expectEmit(true, false, false, true);
        emit Treasury.TreasuryWithdrawal(user, 1000e6);
        treasury.withdrawFees(user, 1000e6);

        assertEq(usdc.balanceOf(user), before + 1000e6);
    }

    function testNotifyFeesEmitsEvent() public {
        vm.expectEmit(false, false, false, true);
        emit Treasury.FeesReceived(777);
        treasury.notifyFees(777);
    }

    // ===== FUZZ TESTS =====

    function testFuzzWithdraw(uint256 amount) public {
        amount = bound(amount, 1, 5000e6);

        uint256 before = usdc.balanceOf(user);

        treasury.withdrawFees(user, amount);

        assertEq(usdc.balanceOf(user), before + amount);
    }

    // ===== INVARIANTS =====

    function testInvariantBalanceNeverNegative() public {
        uint256 bal = usdc.balanceOf(address(treasury));
        treasury.withdrawFees(user, bal);

        assertEq(usdc.balanceOf(address(treasury)), 0);
    }

    function testInvariantAdminAlwaysSet() public {
        treasury.changeAdmin(user);
        assertTrue(treasury.admin() != address(0));
    }
}
