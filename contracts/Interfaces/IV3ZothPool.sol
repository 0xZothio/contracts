// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

interface IV3ZothPool {
    struct Lender {
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
        uint256 tokenId;
    }

    struct RateInfo {
        uint256 stableApr;
        uint256 startDate;
    }


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
    ) external returns (uint256 nftId,uint256 depositId);

    
    /**
    * @dev Creates a deposit to the pool : default tenure
    * @param _depositId Represents the ID of deposit  
    */


    function reInvest(address _userAddrress, uint _depositId,uint _amount) external ;
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
