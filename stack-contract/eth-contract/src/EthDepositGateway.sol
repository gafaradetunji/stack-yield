// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ITreasury {
    function notifyFees(uint256 amount) external;
}

contract EthDepositGateway {

    IERC20 public immutable USDC;
    ITreasury public immutable treasury;

    uint256 public constant FEE_BPS = 20; // 0.2%
    uint256 public constant BPS_DENOMINATOR = 10000;

    uint256 public totalDeposited;
    uint256 public totalFeesCollected;

    struct Deposit {
        address user;
        uint256 amount;
        bytes stacksAddress;
        uint256 timestamp;
        bool bridged;
        bool withdrawn;
    }

    mapping(bytes32 => Deposit) public deposits;
    mapping(address => bytes32[]) public userDepositIds;

    event DepositReceived(
        bytes32 indexed depositId,
        address indexed user,
        uint256 amount,
        bytes stacksAddress
    );

    event DepositMarkedBridged(
        bytes32 indexed depositId,
        address indexed user
    );

    event UserWithdrawal(
        bytes32 indexed depositId,
        address indexed user,
        uint256 userAmount,
        uint256 feeAmount
    );

    constructor(address _usdc, address _treasury) {
        require(_usdc != address(0), "Invalid USDC");
        require(_treasury != address(0), "Invalid treasury");

        USDC = IERC20(_usdc);
        treasury = ITreasury(_treasury);
    }

    function deposit(uint256 amount, bytes calldata stacksAddress) external {

        require(amount > 0, "Amount must be > 0");
        require(stacksAddress.length > 0, "Stacks address required");

        bool success = USDC.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        bytes32 depositId = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                stacksAddress,
                block.timestamp,
                block.number
            )
        );

        deposits[depositId] = Deposit({
            user: msg.sender,
            amount: amount,
            stacksAddress: stacksAddress,
            timestamp: block.timestamp,
            bridged: false,
            withdrawn: false
        });

        userDepositIds[msg.sender].push(depositId);

        totalDeposited += amount;

        emit DepositReceived(depositId, msg.sender, amount, stacksAddress);
    }

    function markDepositBridged(bytes32 depositId) external {

        Deposit storage dep = deposits[depositId];

        require(dep.user != address(0), "Invalid deposit");
        require(!dep.bridged, "Already bridged");

        dep.bridged = true;

        emit DepositMarkedBridged(depositId, dep.user);
    }

    function withdraw(bytes32 depositId) external {

        Deposit storage dep = deposits[depositId];

        require(dep.user == msg.sender, "Not deposit owner");
        require(dep.bridged, "Not yet bridged");
        require(!dep.withdrawn, "Already withdrawn");

        dep.withdrawn = true;

        uint256 fee = (dep.amount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 userAmount = dep.amount - fee;

        totalFeesCollected += fee;

        // Send fee to treasury
        bool feeSuccess = USDC.transfer(address(treasury), fee);
        require(feeSuccess, "Fee transfer failed");

        treasury.notifyFees(fee);

        // Send remaining to user
        bool success = USDC.transfer(msg.sender, userAmount);
        require(success, "USDC transfer failed");

        emit UserWithdrawal(depositId, msg.sender, userAmount, fee);
    }

    function getUserDepositIds(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userDepositIds[user];
    }

    function getDeposits(bytes32[] calldata ids)
        external
        view
        returns (Deposit[] memory result)
    {
        result = new Deposit[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = deposits[ids[i]];
        }

        return result;
    }
}
