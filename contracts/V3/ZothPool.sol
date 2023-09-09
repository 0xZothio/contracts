// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC20} from "../Interfaces/IERC20.sol";
import {IWhitelistManager} from "../Interfaces/IWhitelistManager.sol";
import {IZothPool} from "../Interfaces/IZothPool.sol";

// import "hardhat/console.sol";
// AAVE USDC : 0xe9DcE89B076BA6107Bb64EF30678efec11939234
// INSPIRED BY : polytrade finance
/**
 * @author Zoth.io
 * @notice This contract is a pool contract that inherits the properties of the ERC721 token standard.
 */

/*
Changes : 
-------

- Remove multi frequency for now ✅
- Remove the data storage from the main contract ✅
- Figure out the Bonding curve and it's implementation
- Make an interface ✅
- Add two options for deposit :
    - user based input ✅
    - default tenure
- Add emergency withdraw based fee implementation ✅
*/

contract ZothPool is ERC721URIStorage, IZothPool {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    uint256 constant ONE_YEAR = 365 days;

    IERC20 public immutable usdc;
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
    uint256 public tenure;
    uint256 public poolId;
    uint256 public hotPeriod;
    uint256 public cooldownPeriod;
    uint256 private _currentRateRound;
    uint256 private _withdrawPenaltyPercent;
    uint256 private _totalWithdrawFee;

    constructor(
        address _usdcAddress,
        address _whitelistManager
    ) ERC721("ZothInvoiceFactoringPool2", "ZIFP2") {
        usdc = IERC20(_usdcAddress);
        owner = msg.sender;
        whitelistManager = IWhitelistManager(_whitelistManager);
    }

    /**
     * @dev Checks the _owners role for the sender
     */
    modifier onlyOwners() {
        require(owner == msg.sender, "DOES_NOT_HAVE_OWNER_ROLE");
        _;
    }

    /**
     * @dev Checks the whitelisted role for the sender
     */
    modifier onlyWhitelisted() {
        require(
            whitelistManager.isWhitelisted(msg.sender),
            "USER_IS_NOT_WHITELIST"
        );
        _;
    }

    /**
     * @dev Refer : IZothPool : setContractVariables
     */
    function setContractVariables(
        uint256 _tenure,
        uint256 _poolId,
        uint256 _hotPeriod,
        uint256 _coolDownPeriod
    ) external onlyOwners {
        tenure = _tenure;
        poolId = _poolId;
        hotPeriod = _hotPeriod;
        cooldownPeriod = _coolDownPeriod;
    }

    /**
     * @dev Refer : IZothPool : deposit
     */
    function deposit(uint256 _amount) public onlyWhitelisted returns (uint256) {
        require(
            _amount > 0,
            "[deposit(uint256 amount)] : Amount check : Deposit amount must be greater than zero"
        );
        require(
            usdc.allowance(msg.sender, address(this)) >= _amount,
            "[deposit(uint256 amount)] : USDC allowance check : Contract not authorized to spend tokens"
        );
        require(
            usdc.transferFrom(msg.sender, address(this), _amount),
            "[deposit(uint256 amount)] : Transfer Check : Transfer failed"
        );

        uint256 stableReward = _calculateBaseRewards(msg.sender);
        Lender storage lenderData = lenders[msg.sender];
        lenderData.amount = lenderData.amount + _amount;
        lenderData.pendingStableReward =
            lenderData.pendingStableReward +
            stableReward;
        lenderData.lastUpdateDate = block.timestamp;
        usdc.transferFrom(msg.sender, address(this), _amount);

        // =========================================
        // NFT Mint Functions
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        // =========================================

        if (_amount <= 10000 * 10 ** 6) {
            // blue
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmWT5D4M7PhgRMMvm95moM85ea4e6ptc4eQL9YPXsTWWqf"
            );
        } else if (_amount > 10000 * 10 ** 6 && _amount <= 25000 * 10 ** 6) {
            // green
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmY6SXdLsdQCTeJFB77A1kuEJ2HSZidZBsA3mSGh1ad7yG"
            );
        } else if (_amount > 25000 * 10 ** 6 && _amount <= 50000 * 10 ** 6) {
            // pink
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmQJxvSshn64T3B6xWqk4LdbGgJWUjKEwkCjmDNaMgJEDF"
            );
        } else if (_amount > 50000 * 10 ** 6 && _amount <= 100000 * 10 ** 6) {
            // silver
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmNnfsr8NRfWCTBHnfHMN6ecru7kxgnnP6ByRET4UmAiM6"
            );
        } else {
            // gold
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmZnMPkcsbQcuMbr8tt8oC7EQinbGEog8RtTLG2gvT5V7Q"
            );
        }

        return newTokenId;
    }

    /**
     * @dev Refer : IZothPool : deposit
     */
    function deposit(
        uint256 _amount,
        uint256 _lockingDuration
    ) public onlyWhitelisted returns (uint256) {
        require(
            _amount > 0,
            "[deposit(uint256 amount)] : Amount check : Deposit amount must be greater than zero"
        );
        require(
            usdc.allowance(msg.sender, address(this)) >= _amount,
            "[deposit(uint256 amount)] : USDC allowance check : Contract not authorized to spend tokens"
        );
        require(
            usdc.transferFrom(msg.sender, address(this), _amount),
            "[deposit(uint256 amount)] : Transfer Check : Transfer failed"
        );
        require(
            _lockingDuration > 0,
            "[deposit(uint256 amount)] : Transfer Check : Transfer failed"
        );

        Lender storage lenderData = lenders[msg.sender];
        uint256 lockingPeriod = _lockingDuration * 1 days;
        uint256 currentId = lenderData.currentId;
        unchecked {
            ++lenderData.currentId;
        }

        uint256 apr = getBaseApr();

        lenderData.deposits[currentId] = Deposit(
            _amount,
            apr,
            lockingPeriod,
            block.timestamp,
            block.timestamp + lockingPeriod,
            block.timestamp
        );

        usdc.transferFrom(msg.sender, address(this), _amount);

        // =========================================
        // NFT Mint Functions
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        // =========================================

        if (_amount <= 10000 * 10 ** 6) {
            // blue
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmWT5D4M7PhgRMMvm95moM85ea4e6ptc4eQL9YPXsTWWqf"
            );
        } else if (_amount > 10000 * 10 ** 6 && _amount <= 25000 * 10 ** 6) {
            // green
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmY6SXdLsdQCTeJFB77A1kuEJ2HSZidZBsA3mSGh1ad7yG"
            );
        } else if (_amount > 25000 * 10 ** 6 && _amount <= 50000 * 10 ** 6) {
            // pink
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmQJxvSshn64T3B6xWqk4LdbGgJWUjKEwkCjmDNaMgJEDF"
            );
        } else if (_amount > 50000 * 10 ** 6 && _amount <= 100000 * 10 ** 6) {
            // silver
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmNnfsr8NRfWCTBHnfHMN6ecru7kxgnnP6ByRET4UmAiM6"
            );
        } else {
            // gold
            _setTokenURI(
                newTokenId,
                "https://gateway.pinata.cloud/ipfs/QmZnMPkcsbQcuMbr8tt8oC7EQinbGEog8RtTLG2gvT5V7Q"
            );
        }

        return newTokenId;
    }

    /**
     * @dev To calculate the base rewards as per the lender address without taking the tenure as a parameter
     * @param _lender address of the lender
     */
    function _calculateBaseRewards(
        address _lender
    ) private view returns (uint256) {
        Lender storage lenderData = lenders[_lender];
        uint256 amount = lenderData.amount;
        uint256 lastUpdate = lenderData.lastUpdateDate;
        uint256 calculatedStableReward;
        for (uint256 i = _currentRateRound; i > 0; --i) {
            uint256 endDate = (i != _currentRateRound)
                ? rateRounds[i + 1].startDate
                : block.timestamp;
            uint256 startDate = (lastUpdate > rateRounds[i].startDate)
                ? lastUpdate
                : rateRounds[i].startDate;
            uint256 diff = endDate - startDate;
            calculatedStableReward =
                calculatedStableReward +
                (_calculateFormula(amount, diff, rateRounds[i].stableApr) /
                    1E2);
            if (lastUpdate > rateRounds[i].startDate) break;
        }
        return calculatedStableReward;
    }

    /**
     * @dev Calculates both the bonus reward and stable rewards for deposits with locking period
     * @param _lender is the address of lender
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
        return (_calculateFormula(amount, stableDiff, depositData.apr) / 1E2);
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
     * @dev Refer : IZothPool : withdraw
     */
    function withdraw() external {
        Lender storage lenderData = lenders[msg.sender];
        require(lenderData.amount != 0, "You have not deposited anything");
        uint256 baseStableReward = _calculateBaseRewards(msg.sender);
        uint256 depositedAmount = lenderData.amount;
        uint256 stableAmount = depositedAmount +
            lenderData.pendingStableReward +
            baseStableReward;
        lenderData.amount = 0;
        lenderData.pendingStableReward = 0;
        usdc.transfer(msg.sender, stableAmount);
    }

    /**
     * @dev Refer : IZothPool : withdraw
     */
    function withdraw(uint256 id) external {
        Deposit memory depositData = lenders[msg.sender].deposits[id];
        uint256 depositedAmount = depositData.amount;
        uint256 depositEndDate = depositData.endDate;
        require(depositedAmount != 0, "You have nothing with this ID");
        require(block.timestamp >= depositEndDate, "You can not withdraw yet");
        uint256 stableReward = _calculateRewards(
            msg.sender,
            id,
            depositEndDate
        );
        uint256 stableAmount = depositedAmount + stableReward;
        delete lenders[msg.sender].deposits[id];
        _updateId(msg.sender);
        usdc.transfer(msg.sender, stableAmount);
    }

    /**
     * @dev Refer : IZothPool : emergencyWithdraw
     */
    function emergencyWithdraw(uint256 id) external {
        Deposit memory depositData = lenders[msg.sender].deposits[id];
        require(depositData.amount != 0, "You have nothing with this ID");
        require(
            block.timestamp <
                depositData.startDate + depositData.lockingDuration,
            "You can not emergency withdraw"
        );
        uint256 depositedAmount = depositData.amount;
        uint256 withdrawFee = (depositedAmount * _withdrawPenaltyPercent) / 1E4;
        uint256 refundAmount = depositedAmount - withdrawFee;
        delete lenders[msg.sender].deposits[id];
        _totalWithdrawFee = _totalWithdrawFee + depositedAmount - refundAmount;
        _updateId(msg.sender);
        usdc.transfer(msg.sender, refundAmount);
    }

    /**
     * @dev Updates the startId and currentId of deposits with locking period
     * @param _lender, address of lender
     */
    function _updateId(address _lender) private {
        Lender storage lenderData = lenders[_lender];
        uint256 start = lenderData.startId;
        uint256 end = lenderData.currentId;

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
     * @dev Refer : IZothPool : changeBaseRates
     */
    function changeBaseRates(uint256 baseStableApr) external onlyOwners {
        require(baseStableApr < 10_001, "Invalid Stable Apr");
        uint256 newStableApr = baseStableApr;
        unchecked {
            ++_currentRateRound;
        }
        rateRounds[_currentRateRound] = RateInfo(newStableApr, block.timestamp);
    }

    /**
     * @dev Refer : IZothPool : setWithdrawRate
     */
    function setWithdrawRate(uint256 newRate) external onlyOwners {
        require(newRate < 10_000, "Rate can not be more than 100%");
        _withdrawPenaltyPercent = newRate;
    }

    /**
     * @dev Refer : IZothPool : getBaseApr
     */
    function getBaseApr() public view returns (uint256) {
        return rateRounds[_currentRateRound].stableApr;
    }

    /**
     * @dev Refer : IZothPool : getActiveDeposits
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
}
