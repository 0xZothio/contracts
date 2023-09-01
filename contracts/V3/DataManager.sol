// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.5;

import {IAccessControl} from "../Interfaces/IAccessControl.sol";

contract DataManager {
    IAccessControl public immutable accessControl;
    uint256 constant SECS_IN_YEAR = 31536000;

    // Vars for the pool
    uint256 public tenure1;
    uint256 public tenure2;
    uint256 public tenure3;
    uint256 public reward;
    uint256 public freq;
    uint256 public poolId;
    uint256 public hotPeriod;
    uint256 public cooldownPeriod;

    // Mappings for data storage
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public balances;
    mapping(address => mapping(uint256 => uint256)) public cyclesClaimed;
    mapping(address => mapping(uint256 => uint256)) public prevClaimed;
    mapping(address => mapping(uint256 => uint256)) public yieldClaimed;
    mapping(address => mapping(uint256 => bool)) public withdrawClaimed;

    // Mappings for User Deposits
    mapping(address => mapping(uint256 => uint256)) public userStartTime;
    mapping(address => mapping(uint256 => uint256)) public userEndTime;
    mapping(address => mapping(uint256 => uint256)) public userDepositAmount;
    mapping(address => uint256) public totalUserDeposits;

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

    constructor(address _accessControlAddress) {
        accessControl = IAccessControl(_accessControlAddress);
    }

    /**
     * @dev Checks the _owners role for the sender (access control)
     */
    modifier onlyOwners() {
        require(accessControl.isOwner(msg.sender), "DOES_NOT_HAVE_OWNER_ROLE");
        _;
    }

    function setContractVariables(
        uint256 _tenure1,
        uint256 _tenure2,
        uint256 _tenure3,
        uint256 _reward,
        uint256 _freq,
        uint256 _poolId,
        uint256 _hotPeriod,
        uint256 _coolDownPeriod
    ) external onlyOwners {
        tenure1 = _tenure1;
        tenure2 = _tenure2;
        tenure3 = _tenure3;
        reward = _reward;
        freq = _freq;
        poolId = _poolId;
        hotPeriod = _hotPeriod;
        cooldownPeriod = _coolDownPeriod;
    }

    function _inCooldown(
        uint256 _depositNumber,
        address _account
    ) public view returns (bool) {
        uint256 _userStartTime = userStartTime[_account][_depositNumber];
        if (block.timestamp > _userStartTime) {
            return true;
        } else {
            return false;
        }
    }

    function _getCyclesClaimed(
        uint256 _depositNumber,
        address _account
    ) private view returns (uint256) {
        return cyclesClaimed[_account][_depositNumber];
    }

    function _getStaticDetails(
        uint256 _depositNumber,
        address _account
    )
        internal
        view
        returns (uint256, uint256, uint256, uint256, uint256, uint256)
    {
        uint256 _userStartTime = userStartTime[_account][_depositNumber];
        uint256 _userEndTime = userEndTime[_account][_depositNumber];
        uint256 balance = userDepositAmount[_account][_depositNumber];

        require(
            _inCooldown(_depositNumber, _account),
            "Loan still in cooldown period"
        );

        uint256 elapsedTime = block.timestamp - _userStartTime;
        uint256 timeInterval = (_userEndTime - _userStartTime) / freq;
        uint256 cyclesElapsed = elapsedTime / timeInterval;

        uint256 _timeFraction = ((_userEndTime - _userStartTime) * (10 ** 6)) /
            SECS_IN_YEAR;

        uint256 totalYield = (balance * reward * _timeFraction) / (10 ** 8);

        return (
            _userStartTime,
            _userEndTime,
            balance,
            timeInterval,
            cyclesElapsed,
            totalYield
        );
    }

    function yieldClaimDetails(
        uint256 _depositNumber,
        address _account
    ) public view returns (YieldDetails memory _yieldDetails) {
        (
            uint256 _userStartTime,
            uint256 _userEndTime,
            uint256 balance,
            uint256 timeInterval,
            uint256 cyclesElapsed,
            uint256 totalYield
        ) = _getStaticDetails(_depositNumber, _account);

        uint256 unlockedYield = 0;

        uint256 _cyclesClaimed = _getCyclesClaimed(_depositNumber, _account);

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

        uint256 cyclesLeft;
        uint256 lockedYield;
        if (freq >= cyclesElapsed && totalYield >= unlockedYield) {
            cyclesLeft = freq - cyclesElapsed;
            lockedYield = totalYield - unlockedYield;
        } else {
            unlockedYield = totalYield;
            nextTransferTime = _userEndTime;
        }
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
}
