// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC20} from "../Interfaces/IERC20.sol";
import {ReentrancyGuard} from "../utils/ReentrancyGuard.sol";
import {IWhitelistManager} from "../Interfaces/IWhitelistManager.sol";
import {IZothPool} from "../Interfaces/IZothPool.sol";

// import "hardhat/console.sol";
// AAVE USDC : 0xe9DcE89B076BA6107Bb64EF30678efec11939234
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
     * @dev Updates the startId and currentId of deposits with lokcing period
     * @dev Loops through all deposits from start and end and updates id
     * @dev Called after a deposit has been withdrawn
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

    // function _inCooldown(
    //     uint256 _depositNumber
    // ) public view onlyWhitelisted returns (bool) {
    //     uint256 _userStartTime = userStartTime[msg.sender][_depositNumber];
    //     if (block.timestamp > _userStartTime) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // /**
    //  * @dev Gets the yield claim details
    //  * @param _depositNumber Deposit Number for which one wants to get the yield details
    //  * conditions :
    //  * balance > 0
    //  * elapsedTime > 0
    //  * timeInterval > 0
    //  * cyclesElapsed <= freq
    //  */
    // function yieldClaimDetails(
    //     uint256 _depositNumber
    // ) public view onlyWhitelisted returns (YieldDetails memory _yieldDetails) {
    //     uint256 _userStartTime = userStartTime[msg.sender][_depositNumber];
    //     uint256 _userEndTime = userEndTime[msg.sender][_depositNumber];
    //     uint256 balance = userDepositAmount[msg.sender][_depositNumber];

    //     require(_inCooldown(_depositNumber), "Loan still in cooldown period");

    //     uint256 elapsedTime = block.timestamp - _userStartTime;
    //     uint256 timeInterval = (_userEndTime - _userStartTime) / freq;
    //     uint256 cyclesElapsed = elapsedTime / timeInterval;

    //     uint256 _timeFraction = ((_userEndTime - _userStartTime) * (10 ** 6)) /
    //         SECS_IN_YEAR;

    //     uint256 totalYield = (balance * reward * _timeFraction) / (10 ** 8);

    //     uint256 unlockedYield = 0;

    //     uint256 _cyclesClaimed = _getCyclesClaimed(_depositNumber);

    //     uint256 nextTransferTime = 0;

    //     if (cyclesElapsed > 0) {
    //         uint256 lastTransferTime = (_userStartTime +
    //             (_cyclesClaimed * timeInterval));
    //         nextTransferTime = lastTransferTime + timeInterval;
    //         if (block.timestamp < lastTransferTime) {
    //             nextTransferTime = lastTransferTime;
    //         }
    //         unlockedYield = ((cyclesElapsed * totalYield) / freq);
    //     }

    //     uint256 cyclesLeft;
    //     uint256 lockedYield;
    //     if (freq >= cyclesElapsed && totalYield >= unlockedYield) {
    //         cyclesLeft = freq - cyclesElapsed;
    //         lockedYield = totalYield - unlockedYield;
    //     } else {
    //         unlockedYield = totalYield;
    //         nextTransferTime = _userEndTime;
    //     }
    //     uint256 timeLeft = cyclesLeft * timeInterval;

    //     _yieldDetails.balance = balance;
    //     _yieldDetails.totalYield = totalYield;
    //     _yieldDetails.unlockedYield = unlockedYield;
    //     _yieldDetails.lockedYield = lockedYield;
    //     _yieldDetails.cyclesLeft = cyclesLeft;
    //     _yieldDetails.timeLeft = timeLeft;
    //     _yieldDetails.cyclesElapsed = cyclesElapsed;
    //     _yieldDetails.nextTransferTime = nextTransferTime;

    //     return _yieldDetails;
    // }

    // /**
    //  * @dev Returns the number of cycles
    //  * @param _depositNumber Deposit Number for which one wants to claim the yield.
    //  */

    // function _getCyclesClaimed(
    //     uint256 _depositNumber
    // ) private view returns (uint256) {
    //     return cyclesClaimed[msg.sender][_depositNumber];
    // }

    // /**
    //  * @dev Allows user to claim the yield
    //  * @param _depositNumber Deposit Number for which one wants to claim the yield.
    //  * conditions :
    //  * balance > 0
    //  * elapsedTime > 0
    //  * timeInterval > 0
    //  * cyclesElapsed <= freq
    //  */
    // function yieldClaim(uint256 _depositNumber) public onlyWhitelisted {
    //     YieldDetails memory _details = yieldClaimDetails(_depositNumber);

    //     require(
    //         block.timestamp >= _details.nextTransferTime,
    //         "[yieldClaim(uint256 _depositNumber)] : Last Transfer check : not enough time has passed since last transfer"
    //     );

    //     require(
    //         yieldClaimed[msg.sender][_depositNumber] < _details.totalYield,
    //         "[yieldClaim(uint256 _depositNumber)] : User Claim Check : total yield already claimed"
    //     );

    //     uint256 _prevClaimed = prevClaimed[msg.sender][_depositNumber];
    //     cyclesClaimed[msg.sender][_depositNumber] += 1;
    //     require(
    //         usdc.transfer(msg.sender, _details.unlockedYield - _prevClaimed),
    //         "TRANSFER FAILED"
    //     );

    //     prevClaimed[msg.sender][_depositNumber] = _details.unlockedYield;

    //     if (_details.cyclesElapsed < freq) {
    //         yieldClaimed[msg.sender][_depositNumber] +=
    //             _details.unlockedYield -
    //             _prevClaimed;
    //     } else {
    //         yieldClaimed[msg.sender][_depositNumber] = _details.unlockedYield;
    //     }
    // }

    // /**
    //  * @dev Get the total portfolio balance ivensted in the pool
    //  */
    // function getportfoliobalance() public view returns (uint256) {
    //     return (stakingBalance[msg.sender]);
    // }

    // /**
    //  * @dev Allows user withdraw the total pool amount in deposit
    //  * @param _depositNumber Deposit Number for which one wants to claim the yield.
    //  * conditions :
    //  * deposit > 0
    //  * block.timestamp >= end tenure of the pool deposit
    //  */
    // function withdraw(uint256 _depositNumber) public onlyWhitelisted {
    //     require(
    //         userDepositAmount[msg.sender][_depositNumber] > 0,
    //         "[withdraw(uint256 _depositNumber)] : Insufficient balance in staking amount."
    //     );
    //     require(
    //         block.timestamp >= userEndTime[msg.sender][_depositNumber],
    //         "[withdraw(uint256 _depositNumber)] : Loan Tenure is not over"
    //     );
    //     require(
    //         withdrawClaimed[msg.sender][_depositNumber] == false,
    //         "[withdraw(uint256 _depositNumber)] : Loan Tenure is already withdrawed"
    //     );
    //     require(
    //         block.timestamp <=
    //             userEndTime[msg.sender][_depositNumber] + hotPeriod,
    //         "[yieldClaimDetails(uint256 _depositNumber)] : Deposit Hot period check"
    //     );

    //     uint256 _amountToTransfer = userDepositAmount[msg.sender][
    //         _depositNumber
    //     ];

    //     userDepositAmount[msg.sender][_depositNumber] = 0;
    //     withdrawClaimed[msg.sender][_depositNumber] = true;
    //     stakingBalance[msg.sender] -= _amountToTransfer;

    //     require(
    //         usdc.transfer(msg.sender, _amountToTransfer),
    //         "withdraw(uint256 _depositNumber) : TRANSFER FAILED"
    //     );
    // }

    // /**
    //  * @dev Allows the owners to transfer the funds from the contract to any reciever
    //  * @param _amount Amount you want to withdraw
    //  * @param _receiver Reciever account
    //  * conditions :
    //  * contract balance >= amount
    //  */
    // function _transfer(uint256 _amount, address _receiver) public onlyOwners {
    //     uint256 contractBalance = usdc.balanceOf(address(this));
    //     require(contractBalance >= _amount, "Insufficient Balance");
    //     require(usdc.transfer(_receiver, _amount * 10 ** 6), "TRANSFER FAILED");
    // }
}
