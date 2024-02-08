// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

interface IV3ZothPool {
    struct Lender {
        uint256 amount;
        uint256 startId;
        uint256 currentId;
        mapping(uint256 => Deposit) deposits;
    }

    struct Deposit {
        uint256 amount;
        uint256 apr;
        uint256 lockingDuration;
        uint256 startDate;
        uint256 endDate;
        uint256 lastClaimDate;
        uint256 tokenId;
    }

    struct RateInfo {
        uint256 stableApr;
        uint256 startDate;
    }

    /**
     * @dev Set the variables for the pool cycle - Start Date, End Date and Reward Rate
     * @param _tenure tenure 1 variable (number of days)
     * @param _poolId Pool Identifier number
     * @param _hotPeriod Period till which the yield can be claimed
     * @param _coolDownPeriod Period after which the reward calculation will start
     */
    function setContractVariables(
        uint256 _tenure,
        uint256 _poolId,
        uint256 _hotPeriod,
        uint256 _coolDownPeriod,
        address[] memory _tokenAddresses
    ) external;

    /**
     * @dev Creates a deposit to the pool : default tenure
     * @param _amount Amount of USDC that user wants to deposit to the pool
     * @param _lockingDuration Duration of the deposit which user chooses (number of days)
     * conditions :
     * amount > 0
     * allowance >= amount
     * transfer should be successfull
     */
    function depositByLockingPeriod(
        uint256 _amount,
        uint256 _lockingDuration,
        uint256 _tokenId
    ) external returns (uint256);

    
    /**
    * @dev Creates a deposit to the pool : default tenure
    * @param _depositId Represents the ID of deposit  
    */


    function reInvest(uint256 _depositId) external ;
    /**
     * @notice Withdraws principal total deposit minus fee that is a percentage of total deposit for a specific deposit
     * @param id Represents the ID of deposit that lender tries to emergency withdraw before locking period
     * Requirements:
     * - Should be called before locking period ends
     * - 'msg.sender' should have deposit with specific id
     * - Lender should have enough stable token to transfer
     */
    function emergencyWithdraw(uint256 id) external;

    /**
     * @dev Changes the APR that calculates stable and bonus rewards
     * @param baseStableApr is the new apr percentage with 2 decimals
     */
    function changeBaseRates(uint256 baseStableApr) external;

    /**
     * @dev Changes the withdraw rate for the emergencyWithdraw
     * @param newRate is the new apr percentage with 2 decimals
     */
    function setWithdrawRate(uint256 newRate) external;

    /**
     * @dev Returns the base apr in the current rate cycle
     */
    function getBaseApr() external view returns (uint256);

    /**
     * @dev returns an id array of the active deposits for a lender
     * @param lender Represents the address of lender
     */
    function getActiveDeposits(
        address lender
    ) external view returns (uint256[] memory);
}
