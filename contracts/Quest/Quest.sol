// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

import "@openzeppelin/contracts/utils/Counters.sol";
import {IERC20} from "../Interfaces/IERC20.sol";
import {IQuest} from "../Interfaces/IQuest.sol";

contract Quest is IQuest {
    address public owner;
    address[] public tokenAddresses;
    uint256 private nextDepositId;
    uint256 constant ONE_YEAR = 365 days;

    constructor(address[] memory _tokenAddresses) {
        owner = msg.sender;
        tokenAddresses = _tokenAddresses;
    }

    mapping(uint256 => RateInfo) public rateRounds;
    mapping(address => Deposit[]) public userDeposits;
    uint256 public _currentRateRound;

    event DepositAmount(
        address indexed user,
        uint256 indexed tokenId,
        uint256 indexed amount
    );

    event WithdrawAmount(
        address indexed user,
        uint256 indexed tokenId,
        uint256 amount
    );

    error InvalidTokenId(string reason);
    error InvalidDepositAmount(string reason);
    error InvalidWithdrawPenaltyRate(string reason);
    error InvalidStableApr(string reason);
  

    function depositAmount(
        uint256 _amount,
        uint256 _tokenId
    ) public returns (uint256) {
        if (_amount <= 0) {
            revert InvalidDepositAmount(
                "[depositAmount(uint256 amount,uint tokenId)] : Amount check : Deposit amount must be greater than zero"
            );
        }

        if (_tokenId >= tokenAddresses.length) {
            revert InvalidTokenId("Invalid Token Id");
        }

        require(
            IERC20(tokenAddresses[_tokenId]).transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "[depositAmount(uint256 amount,uint tokenId)] : Transfer Check : Transfer failed"
        );
        uint256 apr = getBaseApr();
        userDeposits[msg.sender].push(
            Deposit(
                nextDepositId,
                msg.sender,
                _amount,
                _tokenId,
                apr,
                block.timestamp,
                false
            )
        );
        unchecked {
            ++nextDepositId;
        }

        emit DepositAmount(msg.sender, _tokenId, _amount);
        return nextDepositId - 1;
    }

    function withdrawAmount(uint _depositId) public returns (bool) {
        Deposit[] storage deposits = userDeposits[msg.sender];
        require(_depositId < deposits.length, "Invalid deposit ID");
        require(!deposits[_depositId].withdrawn, "Deposit already withdrawn");
        uint256 depositedAmount = deposits[_depositId].amount;
        uint256 depositTokenId = deposits[_depositId].tokenId;
        if (depositedAmount <= 0) {
            revert InvalidDepositAmount("You have Nothing With This ID");
        }
        uint256 stableReward = _calculateRewards(
            msg.sender,
            _depositId,
            block.timestamp
        );
        uint256 stableAmount = depositedAmount + stableReward;
        require(
            IERC20(tokenAddresses[depositTokenId]).transfer(
                msg.sender,
                stableAmount
            ),
            "withdraw(uint256 _depositNumber) : TRANSFER FAILED"
        );

        emit WithdrawAmount(msg.sender, depositTokenId, stableAmount);
        deposits[_depositId].withdrawn = true;
        return true;
    }

    function getActiveDeposits(
    ) external view returns (Deposit[] memory) {
        Deposit[] storage deposits = userDeposits[msg.sender];
        Deposit[] memory activeDeposits = new Deposit[](deposits.length);
        
        uint256 index = 0;
        for (uint256 i = 0; i < deposits.length; i++) {
            if (!deposits[i].withdrawn) {
                activeDeposits[index] = deposits[i];
                index++;
            }
        }
        
        // Resize the array to remove any empty slots
        assembly {
            mstore(activeDeposits, index)
        }
        
        return activeDeposits;
    }

    function getBaseApr() public view returns (uint256) {
        return rateRounds[_currentRateRound].stableApr;
    }

    /**
     * @dev Refer : IV3ZothPool : changeBaseRates (Owners)
     * @param baseStableApr is the new stable apr
     */
    function changeBaseRates(uint256 baseStableApr) external {
        require(msg.sender==owner, "Only owner can change the base rates");
        if (baseStableApr > 10_000) {
            revert InvalidStableApr("Stable Apr can not be more than 100%");
        }
        uint256 newStableApr = baseStableApr;
        unchecked {
            ++_currentRateRound;
        }
        rateRounds[_currentRateRound] = RateInfo(newStableApr, block.timestamp);
    }

    /**
     * @dev To calculate the base rewards as per the lender address without taking the tenure as a parameter
     * @param amount Amount deposited
     * @param duration Duration of the deposit
     * @param rate Rate of the deposit
     */
    function _calculateFormula(
        uint256 amount,
        uint256 duration,
        uint256 rate
    ) private pure returns (uint256) {
        return ((amount * duration * rate) / 1E2) / ONE_YEAR;
    }

    /**
     * @dev Calculates stable rewards for deposits with locking period
     * @param _lender is the address of lender (Fund Manager)
     * @param _id is the id of deposit
     * @param _endDate is the end date of calculation
     */
    function _calculateRewards(
        address _lender,
        uint256 _id,
        uint256 _endDate
    ) private view returns (uint256) {
        Deposit memory depositData = userDeposits[_lender][_id];
        uint256 amount = depositData.amount;
        uint256 stableDiff = _endDate - depositData.startDate;
        return (_calculateFormula(amount, stableDiff, depositData.apr));
    }
}