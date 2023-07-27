// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Roles} from "./Roles.sol";
import {IERC20} from "./IERC20.sol";
import {ReentrancyGuard} from "./ReentrancyGuard.sol";
import "hardhat/console.sol";

/**
 * @author Zoth.io
 * @notice This contract is a pool contract that inherits the properties of the ERC721 token standard.
 */

contract ZothTestLPMultiFreq is ERC721URIStorage, ReentrancyGuard {
    using Roles for Roles.Role;
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    uint256 constant SECS_IN_YEAR = 31536000;

    IERC20 public immutable usdc;
    address public immutable owner;

    Counters.Counter private _tokenIds;

    Roles.Role private _verifiers;
    Roles.Role private _owners;
    Roles.Role private _whitelisted;

    // Mappings for data storage
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public balances;
    mapping(address => mapping(uint256 => uint256)) public cyclesClaimed;
    mapping(uint256 => bool) public withdrawClaimed;

    // Vars for the pool
    uint256 public tenure1;
    uint256 public tenure2;
    uint256 public tenure3;
    uint256 public reward;
    uint256 public freq;
    uint256 public poolId;
    uint256 public hotPeriod;

    // Mappings for User Deposits
    mapping(address => mapping(uint256 => uint256)) public userStartTime;
    mapping(address => mapping(uint256 => uint256)) public userEndTime;
    mapping(address => mapping(uint256 => uint256)) public userDepositAmount;
    mapping(address => uint256) public totalUserDeposits;

    // Structs

    struct YieldDetails {
        uint256 balance;
        uint256 totalYield;
        uint256 unlockedYield;
        uint256 lockedYield;
        uint256 cyclesLeft;
        uint256 timeLeft;
        uint256 cyclesElapsed;
        uint256 nextTransferTime;
    }

    struct ClaimUSDCDetails {
        uint256 balance;
        uint256 yield;
        uint256 startDate;
        uint256 cyclesRemaining;
        uint256 yieldGenerated;
        uint256 nextUnlockDate;
    }

    struct WithdrawUSDCDetails {
        uint256 balance;
        uint256 yield;
        uint256 startDate;
        uint256 unlockDate;
    }

    constructor(address _usdcAddress) ERC721("ZothTestLP", "ZUSDC") {
        usdc = IERC20(_usdcAddress);
        owner = msg.sender;
        _whitelisted.add(msg.sender);
        _owners.add(msg.sender);
        _verifiers.add(msg.sender);
    }

    /**
     * @dev Checks the _owners role for the sender
     */
    modifier onlyOwners() {
        require(_owners.has(msg.sender), "DOES_NOT_HAVE_OWNER_ROLE");
        _;
    }
    /**
     * @dev Checks the _verifiers role for the sender
     */
    modifier onlyVerifiers() {
        require(_verifiers.has(msg.sender), "DOES_NOT_HAVE_VERIFIER_ROLE");
        _;
    }
    /**
     * @dev Checks the _whitelisted role for the sender
     */
    modifier onlyWhitelisted() {
        require(_whitelisted.has(msg.sender), "USER_IS_NOT_WHITELISTED");
        _;
    }

    /**
     * @dev Checks the _verifier or _owner role for the sender
     */
    modifier onlyAuthorities() {
        require(
            _verifiers.has(msg.sender) || _owners.has(msg.sender),
            "ONLY_AUTHORITIES_ARE_ALLOWED_TO_EXECUTE_THIS_FUNC"
        );
        _;
    }

    /**
     * @dev Set the variables for the pool cycle - Start Date, End Date and Reward Rate
     * @param _tenure1 tenure 1 variable
     * @param _tenure2 tenure 2 variable
     * @param _tenure3 tenure 3 variable
     * @param _reward reward percentage of the pool
     * @param _freq frequency of the withdrawl
     * @param _poolId Pool Identifier number
     * @param _hotPeriod Cooldown Period after which rewards can be claimed
     */
    function setContractVariables(
        uint256 _tenure1,
        uint256 _tenure2,
        uint256 _tenure3,
        uint256 _reward,
        uint256 _freq,
        uint256 _poolId,
        uint256 _hotPeriod
    ) external onlyOwners {
        tenure1 = _tenure1;
        tenure2 = _tenure2;
        tenure3 = _tenure3;
        reward = _reward;
        freq = _freq;
        poolId = _poolId;
        hotPeriod = _hotPeriod;
    }

    /**
     * @dev Get the variables for the pool cycle - Tenures, Reward Rate, Freq, PoolId and Cooldownperiod
     * @return _tenure1 tenure 1 variable
     * @return _tenure2 tenure 2 variable
     * @return _tenure3 tenure 3 variable
     * @return _reward reward percentage of the pool
     * @return _freq frequency of the withdrawl
     * @return _poolId Pool Identifier number
     * @return _hotPeriod Cooldown Period after which rewards start to be calculated
     */
    function getContractVariables()
        external
        view
        returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)
    {
        return (tenure1, tenure2, tenure3, reward, freq, poolId, hotPeriod);
    }

    /**
     * @dev Adds a address to the whitelisted role | only authorities are allowed to execute the function
     * @param _address Address which is to be whitelisted
     */
    function addWhitelistAddress(address _address) external onlyAuthorities {
        _whitelisted.add(_address);
    }

    /**
     * @dev Adds a address to the verifier role | only owners are allowed to execute the function
     * @param _address Address which is to be added as verifier
     */
    function addVerifierRole(address _address) external onlyOwners {
        _verifiers.add(_address);
    }

    /**
     * @dev Removes a address to the whitelisted role | only authorities are allowed to execute the function
     * @param _address Address which is to be removed from whitelisted role
     */
    function removeWhitelistAddress(address _address) external onlyAuthorities {
        _whitelisted.remove(_address);
    }

    /**
     * @dev Creates a deposit to the pool
     * @param amount Amount of USDC that user wants to deposit to the pool
     * @param _tenureOption Tenure Option
     * conditions :
     * tenureOption = 1 | 2 | 3
     * amount > 0
     * allowance >= amount
     * transfer should be successfull
     */
    function deposit(
        uint256 amount,
        uint256 _tenureOption
    ) public onlyWhitelisted nonReentrant returns (uint256) {
        require(
            _tenureOption == 1 || _tenureOption == 2 || _tenureOption == 3,
            "[deposit(uint256 amount,uint256 _tenureOption)] : Tenure Option check : Tenure options should be between 1 and 3"
        );
        require(
            amount > 0,
            "[deposit(uint256 amount,uint256 _tenureOption)] : Amount check : Deposit amount must be greater than zero"
        );
        require(
            usdc.allowance(msg.sender, address(this)) >= amount,
            "[deposit(uint256 amount,uint256 _tenureOption)] : USDC allowance check : Contract not authorized to spend tokens"
        );
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "[deposit(uint256 amount,uint256 _tenureOption)] : Transfer Check : Transfer failed"
        );

        uint256 currentTimestamp = block.timestamp;

        uint256 tenure = (_tenureOption == 1)
            ? tenure1
            : ((_tenureOption == 2) ? tenure2 : tenure3);

        uint256 endLend = currentTimestamp + tenure;

        // Mapping Updates Deposits
        totalUserDeposits[msg.sender]++;
        userStartTime[msg.sender][
            totalUserDeposits[msg.sender]
        ] = currentTimestamp;
        userEndTime[msg.sender][totalUserDeposits[msg.sender]] = endLend;
        userDepositAmount[msg.sender][totalUserDeposits[msg.sender]] = amount;

        stakingBalance[msg.sender] += amount;
        balances[msg.sender] += amount;

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);

        if (amount <= 10000 * 10 ** 6) {
            // blue
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmZYPhDWWjK3QDxiZJuRwhyAaFYhS1mx8x5uNZfhRnPLEh"
            );
        } else if (amount > 10000 * 10 ** 6 && amount <= 25000 * 10 ** 6) {
            // green
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmPV668ZHNhKVxAiTbh3etZYhqaq4jfi8UZoeMjydQZvjF"
            );
        } else if (amount > 25000 * 10 ** 6 && amount <= 50000 * 10 ** 6) {
            // pink
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmZz39biRbQ4ADgiLyUhc2yTerwRyB43Rj1ddnD6jfK9KS"
            );
        } else if (amount > 50000 * 10 ** 6 && amount <= 100000 * 10 ** 6) {
            // silver
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmfJJo8DGWAVUEDAJvZMySWoZ1SDVJ8vEds9h2TJ5FKTHv"
            );
        } else {
            // gold
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmQcAaVr54LkSDZoqTxk6TRSnwMHD2jTX6t8VEenWeyvPd"
            );
        }

        return newTokenId;
    }

    /**
     * @dev Gets the yield claim details
     * @param _depositNumber Deposit Number for which one wants to get the yield details
     * conditions :
     * balance > 0
     * elapsedTime > 0
     * timeInterval > 0
     * cyclesElapsed <= freq
     */
    function yieldClaimDetails(
        uint256 _depositNumber
    ) public view onlyWhitelisted returns (YieldDetails memory _yieldDetails) {
        uint256 _userStartTime = userStartTime[msg.sender][_depositNumber];
        uint256 _userEndTime = userEndTime[msg.sender][_depositNumber];
        uint256 balance = userDepositAmount[msg.sender][_depositNumber];

        require(
            balance > 0,
            "[yieldClaimDetails(uint256 _depositNumber)] : Staking Balance check : staking balance cannot be 0"
        );

        uint256 elapsedTime = block.timestamp - _userStartTime;

        require(
            elapsedTime > 0,
            "[yieldClaimDetails(uint256 _depositNumber)] : Elapsed Time check : elapsed time must be greater than 0"
        );

        uint256 timeInterval = (_userEndTime - _userStartTime) / freq;

        require(
            timeInterval > 0,
            "[yieldClaimDetails(uint256 _depositNumber)] : Time Interval check : time interval must be greater than 0"
        );

        uint256 cyclesElapsed = elapsedTime / timeInterval;
        console.log("CYCLES ELAPSED", cyclesElapsed);
        require(
            cyclesElapsed <= freq + 1,
            "[yieldClaimDetails(uint256 _depositNumber)] : Cycles Elapsed check : maximum frequency reached"
        );

        uint256 _timeFraction = ((_userEndTime - _userStartTime) * (10 ** 6)) /
            SECS_IN_YEAR;

        uint256 totalYield = (balance * reward * _timeFraction) / (10 ** 8);
        uint256 unlockedYield = 0;

        uint256 _cyclesClaimed = _getCyclesClaimed(_depositNumber);
        uint256 nextTransferTime = 0;
        if (cyclesElapsed > 0) {
            uint256 lastTransferTime = (_userStartTime +
                (_cyclesClaimed * timeInterval));
            nextTransferTime = lastTransferTime + timeInterval;
            if (block.timestamp < lastTransferTime) {
                nextTransferTime = lastTransferTime;
            }
            unlockedYield = ((cyclesElapsed * totalYield) / freq);
        }

        uint256 cyclesLeft = freq - cyclesElapsed;
        uint256 lockedYield = totalYield - unlockedYield;
        uint256 timeLeft = cyclesLeft * timeInterval;

        _yieldDetails.balance = balance;
        _yieldDetails.totalYield = totalYield;
        _yieldDetails.unlockedYield = unlockedYield;
        _yieldDetails.lockedYield = lockedYield;
        _yieldDetails.cyclesLeft = cyclesLeft;
        _yieldDetails.timeLeft = timeLeft;
        _yieldDetails.cyclesElapsed = cyclesElapsed;
        _yieldDetails.nextTransferTime = nextTransferTime;

        return _yieldDetails;
    }

    /**
     * @dev Returns the number of cycles
     * @param _depositNumber Deposit Number for which one wants to claim the yield.
     */

    function _getCyclesClaimed(
        uint256 _depositNumber
    ) private view returns (uint256) {
        return cyclesClaimed[msg.sender][_depositNumber];
    }

    /**
     * @dev Allows user to claim the yield
     * @param _depositNumber Deposit Number for which one wants to claim the yield.
     * conditions :
     * balance > 0
     * elapsedTime > 0
     * timeInterval > 0
     * cyclesElapsed <= freq
     */
    function yieldClaim(uint256 _depositNumber) public onlyWhitelisted {
        YieldDetails memory _details = yieldClaimDetails(_depositNumber);

        require(
            block.timestamp >= _details.nextTransferTime,
            "[yieldClaim(uint256 _depositNumber)] : Last Transfer check : not enough time has passed since last transfer"
        );

        cyclesClaimed[msg.sender][_depositNumber] = _details.cyclesElapsed;
        require(
            usdc.transfer(msg.sender, _details.unlockedYield),
            "TRANSFER FAILED"
        );
    }

    /**
     * @dev Get the total portfolio balance ivensted in the pool
     */
    function getportfoliobalance() public view returns (uint256) {
        return (stakingBalance[msg.sender]);
    }

    /**
     * @dev Gets the Deposit Details
     * @param _depositNumber Deposit Number for which one wants to claim the yield.
     */
    function getClaimUSDCDetails(
        uint256 _depositNumber
    ) public view returns (ClaimUSDCDetails memory _claimUSDCDetails) {
        uint256 _balance = userDepositAmount[msg.sender][_depositNumber];
        uint256 _userStartTime = userStartTime[msg.sender][_depositNumber];
        uint256 _userEndTime = userEndTime[msg.sender][_depositNumber];

        YieldDetails memory _details = yieldClaimDetails(_depositNumber);

        _claimUSDCDetails.balance = _balance;
        _claimUSDCDetails.yield = _details.totalYield;
        _claimUSDCDetails.startDate = _userStartTime;
        _claimUSDCDetails.cyclesRemaining = 1;
        _claimUSDCDetails.yieldGenerated = _details.unlockedYield;
        _claimUSDCDetails.nextUnlockDate = _userEndTime;

        return _claimUSDCDetails;
    }

    function getWithdrawUSDCDetails(
        uint256 _depositNumber
    ) public view returns (WithdrawUSDCDetails memory _withdrawUSDCDetails) {
        uint256 _balance = userDepositAmount[msg.sender][_depositNumber];
        uint256 _userStartTime = userStartTime[msg.sender][_depositNumber];
        uint256 _userEndTime = userEndTime[msg.sender][_depositNumber];

        YieldDetails memory _details = yieldClaimDetails(_depositNumber);

        _withdrawUSDCDetails.balance = _balance;
        _withdrawUSDCDetails.yield = _details.totalYield;
        _withdrawUSDCDetails.startDate = _userStartTime;
        _withdrawUSDCDetails.unlockDate = _userEndTime;

        return _withdrawUSDCDetails;
    }

    /**
     * @dev Allows user withdraw the total pool amount in deposit
     * @param _depositNumber Deposit Number for which one wants to claim the yield.
     * conditions :
     * deposit > 0
     * block.timestamp >= end tenure of the pool deposit
     */
    function withdraw(uint256 _depositNumber) public onlyWhitelisted {
        require(
            userDepositAmount[msg.sender][_depositNumber] > 0,
            "[withdraw(uint256 _depositNumber)] : Insufficient balance in staking amount."
        );
        require(
            block.timestamp >= userEndTime[msg.sender][_depositNumber],
            "[withdraw(uint256 _depositNumber)] : Loan Tenure is not over"
        );
        require(
            withdrawClaimed[_depositNumber] == false,
            "[withdraw(uint256 _depositNumber)] : Loan Tenure is already withdrawed"
        );
        require(
            block.timestamp <=
                userEndTime[msg.sender][_depositNumber] + hotPeriod,
            "[yieldClaimDetails(uint256 _depositNumber)] : Deposit Hot period check"
        );

        uint256 _amountToTransfer = userDepositAmount[msg.sender][
            _depositNumber
        ];

        userDepositAmount[msg.sender][_depositNumber] = 0;
        withdrawClaimed[_depositNumber] = true;

        require(
            usdc.transfer(msg.sender, _amountToTransfer),
            "withdraw(uint256 _depositNumber) : TRANSFER FAILED"
        );
    }

    /**
     * @dev Allows the owners to transfer the funds from the contract to any reciever
     * @param _amount Amount you want to withdraw
     * @param _receiver Reciever account
     * conditions :
     * contract balance >= amount
     */
    function _transfer(uint256 _amount, address _receiver) public onlyOwners {
        uint256 contractBalance = usdc.balanceOf(address(this));
        require(contractBalance >= _amount, "Insufficient Balance");
        require(usdc.transfer(_receiver, _amount * 10 ** 6), "TRANSFER FAILED");
    }
}
