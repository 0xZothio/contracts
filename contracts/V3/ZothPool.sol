// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC20} from "../Interfaces/IERC20.sol";
import {IWhitelistManager} from "../Interfaces/IWhitelistManager.sol";
import {IV3ZothPool} from "../Interfaces/IV3ZothPool.sol";

/**
 * @author Zoth.io
 * @notice This contract is a pool contract that inherits the properties of the ERC721 token standard.
 */

contract ZothPool is ERC721URIStorage, IV3ZothPool {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    uint256 constant ONE_YEAR = 365 days;

    IWhitelistManager public immutable whitelistManager;
    address public immutable owner;

    Counters.Counter private _tokenIds;

    /**
     * @dev mapping for pool
     * - lenders : To keep track for lenders
     * - rateRounds : To keep track for rate rounds
     */
    mapping(address => Lender) public lenders;
    mapping(uint256 => RateInfo) public rateRounds;

    /**
     * @dev Vars for the pool
     */
    uint256 public hotPeriod;
    address[] public tokenAddresses;
    uint256 public _currentRateRound;
    uint256 private withdrawPenaltyPercent;
    uint256 private _decimal;
    uint256 private  minLockingPeriod ;
    uint256 private  maxLockingPeriod ;
    /**
     * @dev vars for the nft
     */

    string private baseURI;

    // custom errors

    error Unauthorized(string reason);

    // Custom Events for the pool

    event DepositAmount(address indexed user, uint256 indexed tokenId, uint256 amount, uint256 lockingDuration);
    event Withdraw(address indexed user, uint256 indexed tokenId, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed tokenId, uint256 amount);
    event ReInvest(address indexed user, uint256 indexed tokenId, uint256 amount);

    constructor(
        address _whitelistManager,
        uint _withdrawPenaltyPercent,
        string memory _erc721Name,
        string memory _erc721Symbol,
        string memory _baseURI,
        uint256 _hotPeriod,
        address[] memory _tokenAddresses,
        uint256 _minLockingPeriod,
        uint256 _maxLockingPeriod
    ) ERC721(_erc721Name, _erc721Symbol) {
        owner = msg.sender;
        whitelistManager = IWhitelistManager(_whitelistManager);
        baseURI = _baseURI;
        withdrawPenaltyPercent = _withdrawPenaltyPercent;
        hotPeriod = _hotPeriod;
        tokenAddresses = _tokenAddresses;
        minLockingPeriod = _minLockingPeriod;
        maxLockingPeriod = _maxLockingPeriod;
    }

    /**
     * @dev Refer : IV3ZothPool : deposit
     * @param _amount : Amount to be deposited
     * @param _tokenId : Token address to be deposited ID (Only Whitelisted)
     * @param _lockingDuration : Locking duration for the deposit (if it Zero then it will take the default tenure)
     */
    function depositByLockingPeriod(
        uint256 _amount,
        uint256 _lockingDuration,
        uint256 _tokenId
    ) public returns (uint256) {
        if (!whitelistManager.isWhitelisted(msg.sender)) {
            revert Unauthorized(
                "Only whitelisted users can call this function"
            );
        }
        require(
            _amount > 0,
            "[deposit(uint256 amount)] : Amount check : Deposit amount must be greater than zero"
        );
        require(
            _lockingDuration >= minLockingPeriod,
            "Locking period below minimum allowed"
        );
        require(
            _lockingDuration <= maxLockingPeriod,
            "Locking period exceeds maximum allowed"
        );
       
        require(
            IERC20(tokenAddresses[_tokenId]).transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "[deposit(uint256 amount)] : Transfer Check : Transfer failed"
        );

        Lender storage lenderData = lenders[msg.sender];
        uint256 currentId = lenderData.currentId;
        unchecked {
            ++lenderData.currentId;
        }

        uint256 apr = getBaseApr();

        uint256 _endDate = block.timestamp + _lockingDuration;
        lenderData.deposits[currentId] = Deposit(
            _amount,
            apr,
            _lockingDuration,
            block.timestamp,
            _endDate,
            block.timestamp,
            _tokenId
        );

        emit DepositAmount(msg.sender, _tokenId, _amount, _lockingDuration);
        _decimal =  IERC20(tokenAddresses[_tokenId]).decimals();
        return _mintNFTAfterDeposit(_amount);
    }

    /**
     * @dev Refer : IV3ZothPool : withdraw
     * @param id is the id of deposit
     */
    function withdrawUsingDepositId(uint256 id) external {
        Deposit memory depositData = lenders[msg.sender].deposits[id];
        uint256 depositedAmount = depositData.amount;
        uint256 depositEndDate = depositData.endDate;
        uint256 depositTokenId = depositData.tokenId;
        require(depositedAmount != 0, "You have nothing with this ID");
        require(
            block.timestamp >= depositEndDate + hotPeriod,
            "You can not withdraw yet"
        );

        uint256 stableReward = _calculateRewards(
            msg.sender,
            id,
            depositEndDate
        );
        uint256 stableAmount = depositedAmount + stableReward;

        delete lenders[msg.sender].deposits[id];
        _updateId(msg.sender);

        require(
            IERC20(tokenAddresses[depositTokenId]).transferFrom(
                address(this),
                msg.sender,
                stableAmount
            ),
            "[withdrawUsingDepositId(uint256 amount)] : Transfer Check : Transfer failed"
        );

        emit Withdraw(msg.sender, depositTokenId, stableAmount);
    }

    /**
     * @dev Refer : IV3ZothPool : reInvest
     * @param _depositId : deposit id of the deposits
     */

    function reInvest(address _userAddrress, uint _depositId) external {
        if (!whitelistManager.isFundManager(msg.sender)) {
            revert Unauthorized("Only fund manager can call this function");
        }

        Deposit storage depositData = lenders[_userAddrress].deposits[
            _depositId
        ];
        uint256 depositEndDate = depositData.endDate;
        uint256 depositedAmount = depositData.amount;

        require(depositedAmount != 0, "You have nothing with this ID");
        require(block.timestamp >= depositEndDate, "Tenure is not over yet");
        uint256 stableReward = _calculateRewards(
            _userAddrress,
            _depositId,
            depositEndDate
        );

        uint256 stableAmount = depositedAmount + stableReward;

        depositData.amount = stableAmount;
        depositData.endDate = depositData.endDate.add(
            depositData.lockingDuration
        );
        depositData.startDate = block.timestamp;

        emit ReInvest(_userAddrress, depositData.tokenId, stableAmount);
    }

    /**
     * @dev Refer : IV3ZothPool : emergencyWithdraw
     * @param id is the id of deposit
     */
    function emergencyWithdraw(uint256 id) external {
        Deposit memory depositData = lenders[msg.sender].deposits[id];
        uint256 depositTokenId = depositData.tokenId;
        require(depositData.amount != 0, "You have nothing with this ID");
        require(
            block.timestamp <
                depositData.startDate + depositData.lockingDuration,
            "You can not emergency withdraw"
        );
        require(withdrawPenaltyPercent > 0, "Withdraw Penalty is not set");

        uint256 depositedAmount = depositData.amount;

        uint256 withdrawFee = (depositedAmount * withdrawPenaltyPercent) / 1E2;
        uint256 refundAmount = depositedAmount - withdrawFee;
        delete lenders[msg.sender].deposits[id];

        _updateId(msg.sender);

        require(
            IERC20(tokenAddresses[depositTokenId]).balanceOf(address(this)) >=
                refundAmount,
            "[emergencyWithdraw(uint256 id)] : Insufficient balance : Insufficient balance to emergencyWithdraw"
        );

        require(
            IERC20(tokenAddresses[depositTokenId]).transferFrom(
                address(this),
                msg.sender,
                refundAmount
            ),
            "[emergencyWithdraw(uint256 amount)] : Transfer Check : Transfer failed"
        );

        emit EmergencyWithdraw(msg.sender, depositTokenId, refundAmount);
    }

    /**
     * @dev Refer : IV3ZothPool : changeBaseRates (Owners)
     * @param baseStableApr is the new stable apr
     */
    function changeBaseRates(uint256 baseStableApr) external {
        if (!whitelistManager.isPoolManager(msg.sender)) {
            revert Unauthorized("Only pool manager can call this function");
        }

        require(baseStableApr <= 10_000, "Invalid Stable Apr");
        uint256 newStableApr = baseStableApr;
        unchecked {
            ++_currentRateRound;
        }
        rateRounds[_currentRateRound] = RateInfo(newStableApr, block.timestamp);
    }

    /**
     * @dev Refer : IV3ZothPool : setWithdrawRate
     * @param newRate is the new withdraw rate
     */

    // 1 in this context would represent 0.01%.
    // 100 would represent 1%.
    // 1,000 would represent 10%.
    // 10,000 represents 100%, which is equivalent to 1 in traditional percentage terms.

    function setWithdrawRate(uint256 newRate) external {
        if (!whitelistManager.isOwner(msg.sender)) {
            revert Unauthorized("Only owner can call this function");
        }
        require(newRate <= 10_000, "Rate can not be more than 100%");
        withdrawPenaltyPercent = newRate;
    }
   

    /**
     * @dev Refer : IV3ZothPool : getBaseApr
     */
    function getBaseApr() public view returns (uint256) {
        return rateRounds[_currentRateRound].stableApr;
    }

    /**
     * @dev Refer : IV3ZothPool : getActiveDeposits
     * @param lender is the address of lender
     */
    function getActiveDeposits(
        address lender
    ) external view returns (uint256[] memory) {
        Lender storage lenderData = lenders[lender];
        uint256 actives = _activeCount(lender);
        uint256 j;
        uint256[] memory activeDeposits = new uint256[](actives);
        for (uint256 i = lenderData.startId; i < lenderData.currentId; ) {
            if (lenderData.deposits[i].amount != 0) activeDeposits[j++] = i;
            unchecked {
                ++i;
            }
        }
        return activeDeposits;
    }

    /**
     * @dev  _transfer funds from contract to owner (Fund Manager)
     * @param _tokenId Token ID of transfer
     * @param _amount Amount Transfer
     * @param _receiver to addrress Transfer
     */

    function _transfer(
        uint256 _amount,
        address _receiver,
        uint256 _tokenId
    ) public {
        if (!whitelistManager.isFundManager(msg.sender)) {
            revert Unauthorized("Only fund manager can call this function");
        }
        require(
            IERC20(tokenAddresses[_tokenId]).balanceOf(address(this)) >=
                _amount,
            "Insufficient Balance"
        );
        require(
            IERC20(tokenAddresses[_tokenId]).transfer(
                _receiver,
                _amount * IERC20(tokenAddresses[_tokenId]).decimals()
            ),
            "TRANSFER FAILED"
        );
    }

    /**
     * @dev Calculates number of active deposits by lender
     * @dev Loops through all deposits from start and end and updates count
     * @param _lender, address of lender
     */
    function _activeCount(address _lender) private view returns (uint256) {
        uint256 count;
        Lender storage lenderData = lenders[_lender];
        for (uint256 i = lenderData.startId; i < lenderData.currentId; ) {
            if (lenderData.deposits[i].amount != 0) {
                unchecked {
                    ++count;
                }
            }
            unchecked {
                ++i;
            }
        }
        return count;
    }

    /**
     * @dev Updates the startId and currentId of deposits with locking period
     * @param _lender, address of lender
     */
    function _updateId(address _lender) private {
        Lender storage lenderData = lenders[_lender];
        uint256 start = lenderData.startId; //0
        uint256 end = lenderData.currentId; // 3

        while (start < end && lenderData.deposits[start].amount == 0) {
            ++start;
        }

        while (start < end && lenderData.deposits[end - 1].amount == 0) {
            --end;
        }

        uint256 reset = (end == start) ? 0 : end;
        lenderData.startId = reset == 0 ? 0 : start;
        lenderData.currentId = reset;
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
     * @dev mint an NFT Based on Amount Deposit
     * @param _amount is the amount of deposit
     */
    function _mintNFTAfterDeposit(uint _amount) private returns (uint256) {
        // =========================================
        // NFT Mint Functions
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        // =========================================

        if (_amount <= 10000 * _decimal) {
            // blue
            _setTokenURI(
                newTokenId,
                string(abi.encodePacked(baseURI, "/blue.json"))
            );
        } else if (_amount > 10000 * _decimal && _amount <= 25000 * _decimal) {
            // green
            _setTokenURI(
                newTokenId,
                string(abi.encodePacked(baseURI, "/green.json"))
            );
        } else if (_amount > 25000 * _decimal && _amount <= 50000 * _decimal) {
            // pink
            _setTokenURI(
                newTokenId,
                string(abi.encodePacked(baseURI, "/pink.json"))
            );
        } else if (_amount > 50000 * _decimal && _amount <= 100000 * _decimal) {
            // silver
            _setTokenURI(
                newTokenId,
                string(abi.encodePacked(baseURI, "/silver.json"))
            );
        } else {
            // gold
            _setTokenURI(
                newTokenId,
                string(abi.encodePacked(baseURI, "/gold.json"))
            );
        }

        return newTokenId;
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
        Deposit memory depositData = lenders[_lender].deposits[_id];
        uint256 amount = depositData.amount;
        uint256 stableDiff = _endDate - depositData.startDate;
        return (_calculateFormula(amount, stableDiff, depositData.apr));
    }
}
