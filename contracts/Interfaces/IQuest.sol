// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

interface IQuest {
   struct Deposit {
        uint256 id;
        address depositor;
        uint256 amount;
        uint256 tokenId;
        uint256 apr;
        uint256 startDate;
        bool withdrawn;
    }

    struct RateInfo {
        uint256 stableApr;
        uint256 startDate;
    }


    /**
     * @dev Creates a deposit to the pool : default tenure
     * @param _amount Amount of USDC that user wants to deposit to the pool
     * conditions :
     * amount > 0
     * allowance >= amount
     * transfer should be successfull
     */
    function depositAmount(
        uint256 _amount,
        uint256 _tokenId
    ) external returns (uint256);

 

    /** 
        * @dev Withdraws the principal amount after the locking period ends
        * @param id Represents the ID of deposit that lender tries to withdraw after locking period
        * Requirements:
        * - Should be called after locking period ends
        * - 'msg.sender' should have deposit with specific id
        * - Lender should have enough stable token to transfer
    */


    function withdrawAmount(uint256 id) external returns (bool);


    /**
     * @dev Changes the APR that calculates stable and bonus rewards
     * @param baseStableApr is the new apr percentage with 2 decimals
     */
    function changeBaseRates(uint256 baseStableApr) external;

    /**
     * @dev Returns the base apr in the current rate cycle
     */
    function getBaseApr() external view returns (uint256);

    /**
     * @dev returns an id array of the active deposits for a lender
     */
    function getActiveDeposits() external view returns (Deposit[] memory);
}
