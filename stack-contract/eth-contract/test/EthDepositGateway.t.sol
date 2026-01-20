// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {EthDepositGateway} from "../src/EthDepositGateway.sol";
import {Treasury} from "../src/Treasury.sol";

// Mock USDC for testing
contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;

        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
}

contract EthDepositGatewayTest is Test {

    EthDepositGateway gateway;
    Treasury treasury;
    MockUSDC usdc;

    address user1 = address(0x1111);
    address user2 = address(0x2222);

    function setUp() public {
        usdc = new MockUSDC();
        treasury = new Treasury(address(usdc));
        gateway = new EthDepositGateway(address(usdc), address(treasury));

        usdc.mint(user1, 10000e6);
        usdc.mint(user2, 20000e6);

        vm.prank(user1);
        usdc.approve(address(gateway), type(uint256).max);

        vm.prank(user2);
        usdc.approve(address(gateway), type(uint256).max);
    }

    function testDepositFlow() public {
        vm.prank(user1);
        gateway.deposit(100e6, "STACKS1");

        bytes32[] memory ids = gateway.getUserDepositIds(user1);
        assertEq(ids.length, 1);

        EthDepositGateway.Deposit[] memory deps = gateway.getDeposits(ids);
        assertEq(deps[0].amount, 100e6);
        assertEq(deps[0].user, user1);
    }

    function testMarkBridged() public {
        vm.prank(user1);
        gateway.deposit(100e6, "STACKS1");

        bytes32 id = gateway.getUserDepositIds(user1)[0];

        gateway.markDepositBridged(id);

        bytes32[] memory single = new bytes32[](1);
        single[0] = id;
        EthDepositGateway.Deposit[] memory deps = gateway.getDeposits(single);
        assertTrue(deps[0].bridged);
    }

    function testWithdrawWithFee() public {
        vm.prank(user1);
        gateway.deposit(1000e6, "STACKS1");

        bytes32 id = gateway.getUserDepositIds(user1)[0];

        gateway.markDepositBridged(id);

        uint256 userStart = usdc.balanceOf(user1);
        uint256 treasuryStart = usdc.balanceOf(address(treasury));

        vm.prank(user1);
        gateway.withdraw(id);

        uint256 fee = (1000e6 * 20) / 10000;
        uint256 userAmount = 1000e6 - fee;

        assertEq(usdc.balanceOf(user1), userStart + userAmount);
        assertEq(usdc.balanceOf(address(treasury)), treasuryStart + fee);
    }

    function testCannotWithdrawTwice() public {
        vm.prank(user1);
        gateway.deposit(500e6, "STACKS");

        bytes32 id = gateway.getUserDepositIds(user1)[0];
        gateway.markDepositBridged(id);

        vm.prank(user1);
        gateway.withdraw(id);

        vm.prank(user1);
        vm.expectRevert("Already withdrawn");
        gateway.withdraw(id);
    }

    function testOnlyOwnerCanWithdraw() public {
        vm.prank(user1);
        gateway.deposit(500e6, "STACKS");

        bytes32 id = gateway.getUserDepositIds(user1)[0];
        gateway.markDepositBridged(id);

        vm.prank(user2);
        vm.expectRevert("Not deposit owner");
        gateway.withdraw(id);
    }

    // ===== FUZZ TESTS =====

    function testFuzzDepositAndWithdraw(uint256 amount) public {
        amount = bound(amount, 1e6, 5000e6);

        vm.prank(user1);
        gateway.deposit(amount, "STACKS");

        bytes32 id = gateway.getUserDepositIds(user1)[0];
        gateway.markDepositBridged(id);

        uint256 userStart = usdc.balanceOf(user1);

        vm.prank(user1);
        gateway.withdraw(id);

        uint256 fee = (amount * 20) / 10000;
        uint256 userAmount = amount - fee;

        assertEq(usdc.balanceOf(user1), userStart + userAmount);
    }

    // ===== INVARIANT TESTS =====

    function testInvariantFeesAccumulateCorrectly() public {
        vm.prank(user1);
        gateway.deposit(1000e6, "A");

        vm.prank(user2);
        gateway.deposit(2000e6, "B");

        bytes32 id1 = gateway.getUserDepositIds(user1)[0];
        bytes32 id2 = gateway.getUserDepositIds(user2)[0];

        gateway.markDepositBridged(id1);
        gateway.markDepositBridged(id2);
        vm.prank(user1);
        gateway.withdraw(id1);

        vm.prank(user2);
        gateway.withdraw(id2);

        uint256 expectedFees =
            ((1000e6 * 20) / 10000) +
            ((2000e6 * 20) / 10000);

        assertEq(usdc.balanceOf(address(treasury)), expectedFees);
    }

    function testInvariantCannotBypassFee() public {
        vm.prank(user1);
        gateway.deposit(1000e6, "A");

        bytes32 id = gateway.getUserDepositIds(user1)[0];
        gateway.markDepositBridged(id);

        uint256 treasuryBefore = usdc.balanceOf(address(treasury));

        vm.prank(user1);
        gateway.withdraw(id);

        uint256 treasuryAfter = usdc.balanceOf(address(treasury));

        assertTrue(treasuryAfter > treasuryBefore);
    }

    /* ===== Event tests ===== */

    function testDepositEmitsEvent() public {
        uint256 amount = 123e6;
        bytes memory stacksAddress = "STACKS_EVT";

        // compute expected deposit id using same inputs used in contract
        bytes32 expectedId = keccak256(abi.encodePacked(user1, amount, stacksAddress, block.timestamp, block.number));

        vm.expectEmit(true, true, false, true);
        emit EthDepositGateway.DepositReceived(expectedId, user1, amount, stacksAddress);
        vm.prank(user1);
        gateway.deposit(amount, stacksAddress);
    }

    function testMarkDepositEmitsEvent() public {
        uint256 amount = 200e6;
        bytes memory stacksAddress = "STACKS_MARK";

        vm.prank(user1);
        gateway.deposit(amount, stacksAddress);

        bytes32 id = gateway.getUserDepositIds(user1)[0];

        vm.expectEmit(true, true, false, true);
        emit EthDepositGateway.DepositMarkedBridged(id, user1);
        gateway.markDepositBridged(id);
    }

    function testWithdrawEmitsEvent() public {
        uint256 amount = 1000e6;
        bytes memory stacksAddress = "STACKS_WITH";

        vm.prank(user1);
        gateway.deposit(amount, stacksAddress);

        bytes32 id = gateway.getUserDepositIds(user1)[0];
        gateway.markDepositBridged(id);

        uint256 fee = (amount * 20) / 10000;
        uint256 userAmount = amount - fee;

        vm.expectEmit(true, true, false, true);
        emit EthDepositGateway.UserWithdrawal(id, user1, userAmount, fee);

        vm.prank(user1);
        gateway.withdraw(id);
    }
}
