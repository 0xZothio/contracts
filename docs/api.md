# Contract Docs for ZothPool

## IV3ZothPool (Interface V3)

### Lender

```solidity
struct Lender {
  uint256 startId;
  uint256 currentId;
  mapping(uint256 => struct IV3ZothPool.Deposit) deposits;
}
```

### Deposit

```solidity
struct Deposit {
  uint256 amount;
  uint256 apr;
  uint256 lockingDuration;
  uint256 startDate;
  uint256 endDate;
  uint256 tokenId;
}
```

### RateInfo

```solidity
struct RateInfo {
  uint256 stableApr;
  uint256 startDate;
}
```

### depositByLockingPeriod

```solidity
function depositByLockingPeriod(uint256 _amount, uint256 _lockingDuration, uint256 _tokenId) external returns (uint256 nftId, uint256 depositId)
```

_Creates a deposit to the pool : default tenure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | Amount of USDC that user wants to deposit to the pool |
| _lockingDuration | uint256 | Duration of the deposit which user chooses (number of days) conditions : amount > 0 allowance >= amount transfer should be successfull |
| _tokenId | uint256 |  |

### reInvest

```solidity
function reInvest(address _userAddrress, uint256 _depositId, uint256 _amount) external
```

_Creates a deposit to the pool : default tenure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _userAddrress | address |  |
| _depositId | uint256 | Represents the ID of deposit |
| _amount | uint256 |  |

### emergencyWithdraw

```solidity
function emergencyWithdraw(uint256 id) external
```

Withdraws principal total deposit minus fee that is a percentage of total deposit for a specific deposit

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | Represents the ID of deposit that lender tries to emergency withdraw before locking period Requirements: - Should be called before locking period ends - 'msg.sender' should have deposit with specific id - Lender should have enough stable token to transfer |

### changeBaseRates

```solidity
function changeBaseRates(uint256 baseStableApr) external
```

_Changes the APR that calculates stable and bonus rewards_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| baseStableApr | uint256 | is the new apr percentage with 2 decimals |

### setWithdrawRate

```solidity
function setWithdrawRate(uint256 newRate) external
```

_Changes the withdraw rate for the emergencyWithdraw_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newRate | uint256 | is the new apr percentage with 2 decimals |

### getBaseApr

```solidity
function getBaseApr() external view returns (uint256)
```

_Returns the base apr in the current rate cycle_

### getActiveDeposits

```solidity
function getActiveDeposits(address lender) external view returns (uint256[])
```

_returns an id array of the active deposits for a lender_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lender | address | Represents the address of lender |

## IWhitelistManager

### isWhitelisted

```solidity
function isWhitelisted(address _address) external view returns (bool)
```

### isFundManager

```solidity
function isFundManager(address _address) external view returns (bool)
```

### isPoolManager

```solidity
function isPoolManager(address _address) external view returns (bool)
```

### isVerifier

```solidity
function isVerifier(address _address) external view returns (bool)
```

### isHr

```solidity
function isHr(address _address) external view returns (bool)
```

### isOwner

```solidity
function isOwner(address _address) external view returns (bool)
```

## ZothPool

This contract is a pool contract that inherits the properties of the ERC721 token standard.

### ONE_YEAR

```solidity
uint256 ONE_YEAR
```

### whitelistManager

```solidity
contract IWhitelistManager whitelistManager
```

### owner

```solidity
address owner
```

### lenders

```solidity
mapping(address => struct IV3ZothPool.Lender) lenders
```

_mapping for pool
- lenders : To keep track for lenders
- rateRounds : To keep track for rate rounds_

### rateRounds

```solidity
mapping(uint256 => struct IV3ZothPool.RateInfo) rateRounds
```

### tokenAddresses

```solidity
address[] tokenAddresses
```

### _currentRateRound

```solidity
uint256 _currentRateRound
```

### Unauthorized

```solidity
error Unauthorized(string reason)
```

### DepositAmount

```solidity
event DepositAmount(address user, uint256 tokenId, uint256 amount, uint256 lockingDuration)
```

### Withdraw

```solidity
event Withdraw(address user, uint256 tokenId, uint256 amount)
```

### EmergencyWithdraw

```solidity
event EmergencyWithdraw(address user, uint256 tokenId, uint256 amount)
```

### ReInvest

```solidity
event ReInvest(address user, uint256 tokenId, uint256 amount)
```

### constructor

```solidity
constructor(address _whitelistManager, uint256 _withdrawPenaltyPercent, string _erc721Name, string _erc721Symbol, string _baseURI, uint256 _hotPeriod, address[] _tokenAddresses, uint256 _minLockingPeriod, uint256 _maxLockingPeriod) public
```

### depositByLockingPeriod

```solidity
function depositByLockingPeriod(uint256 _amount, uint256 _lockingDuration, uint256 _tokenId) public returns (uint256 nftId, uint256 depositId)
```

_Refer : IV3ZothPool : deposit_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | : Amount to be deposited |
| _lockingDuration | uint256 | : Locking duration for the deposit (if it Zero then it will take the default tenure) |
| _tokenId | uint256 | : Token address to be deposited ID (Only Whitelisted) |

### withdrawUsingDepositId

```solidity
function withdrawUsingDepositId(uint256 id) external
```

_Refer : IV3ZothPool : withdraw_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | is the id of deposit |

### reInvest

```solidity
function reInvest(address _userAddrress, uint256 _depositId, uint256 _amount) external
```

_Refer : IV3ZothPool : reInvest_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _userAddrress | address |  |
| _depositId | uint256 | : deposit id of the deposits |
| _amount | uint256 |  |

### emergencyWithdraw

```solidity
function emergencyWithdraw(uint256 id) external
```

_Refer : IV3ZothPool : emergencyWithdraw_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | is the id of deposit |

### changeBaseRates

```solidity
function changeBaseRates(uint256 baseStableApr) external
```

_Refer : IV3ZothPool : changeBaseRates (Owners)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| baseStableApr | uint256 | is the new stable apr |

### setWithdrawRate

```solidity
function setWithdrawRate(uint256 newRate) external
```

_Refer : IV3ZothPool : setWithdrawRate_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newRate | uint256 | is the new withdraw rate |

### getBaseApr

```solidity
function getBaseApr() public view returns (uint256)
```

_Refer : IV3ZothPool : getBaseApr_

### getActiveDeposits

```solidity
function getActiveDeposits(address lender) external view returns (uint256[])
```

_Refer : IV3ZothPool : getActiveDeposits_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lender | address | is the address of lender |

### _transfer

```solidity
function _transfer(uint256 _amount, address _receiver, uint256 _tokenId) public
```

__transfer funds from contract to owner (Fund Manager)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | Amount Transfer |
| _receiver | address | to addrress Transfer |
| _tokenId | uint256 | Token ID of transfer |

## TestUSDC

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint(address to, uint256 amount) public
```

## IZothPool

### Lender

```solidity
struct Lender {
  uint256 amount;
  uint256 pendingStableReward;
  uint256 lastUpdateDate;
  uint256 startId;
  uint256 currentId;
  mapping(uint256 => struct IZothPool.Deposit) deposits;
}
```

### Deposit

```solidity
struct Deposit {
  uint256 amount;
  uint256 apr;
  uint256 lockingDuration;
  uint256 startDate;
  uint256 endDate;
  uint256 lastClaimDate;
}
```

### RateInfo

```solidity
struct RateInfo {
  uint256 stableApr;
  uint256 startDate;
}
```

### setContractVariables

```solidity
function setContractVariables(uint256 _tenure, uint256 _poolId, uint256 _hotPeriod, uint256 _coolDownPeriod) external
```

_Set the variables for the pool cycle - Start Date, End Date and Reward Rate_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tenure | uint256 | tenure 1 variable (number of days) |
| _poolId | uint256 | Pool Identifier number |
| _hotPeriod | uint256 | Period till which the yield can be claimed |
| _coolDownPeriod | uint256 | Period after which the reward calculation will start |

### deposit

```solidity
function deposit(uint256 _amount) external returns (uint256)
```

_Creates a deposit to the pool : default tenure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | Amount of USDC that user wants to deposit to the pool conditions : amount > 0 allowance >= amount transfer should be successfull |

### depositByLockingPeriod

```solidity
function depositByLockingPeriod(uint256 _amount, uint256 _lockingDuration) external returns (uint256)
```

_Creates a deposit to the pool : default tenure_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | Amount of USDC that user wants to deposit to the pool |
| _lockingDuration | uint256 | Duration of the deposit which user chooses (number of days) conditions : amount > 0 allowance >= amount transfer should be successfull |

### withdraw

```solidity
function withdraw() external
```

_To withdraw all the calculated yield across all the rate rounds_

### emergencyWithdraw

```solidity
function emergencyWithdraw(uint256 id) external
```

Withdraws principal total deposit minus fee that is a percentage of total deposit for a specific deposit

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | Represents the ID of deposit that lender tries to emergency withdraw before locking period Requirements: - Should be called before locking period ends - 'msg.sender' should have deposit with specific id - Lender should have enough stable token to transfer |

### changeBaseRates

```solidity
function changeBaseRates(uint256 baseStableApr) external
```

_Changes the APR that calculates stable and bonus rewards_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| baseStableApr | uint256 | is the new apr percentage with 2 decimals |

### setWithdrawRate

```solidity
function setWithdrawRate(uint256 newRate) external
```

_Changes the withdraw rate for the emergencyWithdraw_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newRate | uint256 | is the new apr percentage with 2 decimals |

### getBaseApr

```solidity
function getBaseApr() external view returns (uint256)
```

_Returns the base apr in the current rate cycle_

### getActiveDeposits

```solidity
function getActiveDeposits(address lender) external view returns (uint256[])
```

_returns an id array of the active deposits for a lender_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lender | address | Represents the address of lender |

## ZothTestLPMultiFreq

This contract is a pool contract that inherits the properties of the ERC721 token standard.

### SECS_IN_YEAR

```solidity
uint256 SECS_IN_YEAR
```

### usdc

```solidity
contract IERC20 usdc
```

### whitelistManager

```solidity
contract IWhitelistManager whitelistManager
```

### owner

```solidity
address owner
```

### stakingBalance

```solidity
mapping(address => uint256) stakingBalance
```

### balances

```solidity
mapping(address => uint256) balances
```

### cyclesClaimed

```solidity
mapping(address => mapping(uint256 => uint256)) cyclesClaimed
```

### prevClaimed

```solidity
mapping(address => mapping(uint256 => uint256)) prevClaimed
```

### yieldClaimed

```solidity
mapping(address => mapping(uint256 => uint256)) yieldClaimed
```

### withdrawClaimed

```solidity
mapping(address => mapping(uint256 => bool)) withdrawClaimed
```

### tenure1

```solidity
uint256 tenure1
```

### tenure2

```solidity
uint256 tenure2
```

### tenure3

```solidity
uint256 tenure3
```

### reward

```solidity
uint256 reward
```

### freq

```solidity
uint256 freq
```

### poolId

```solidity
uint256 poolId
```

### hotPeriod

```solidity
uint256 hotPeriod
```

### cooldownPeriod

```solidity
uint256 cooldownPeriod
```

### userStartTime

```solidity
mapping(address => mapping(uint256 => uint256)) userStartTime
```

### userEndTime

```solidity
mapping(address => mapping(uint256 => uint256)) userEndTime
```

### userDepositAmount

```solidity
mapping(address => mapping(uint256 => uint256)) userDepositAmount
```

### totalUserDeposits

```solidity
mapping(address => uint256) totalUserDeposits
```

### YieldDetails

```solidity
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
```

### constructor

```solidity
constructor(address _usdcAddress, address _whitelistManager, address _owner) public
```

### onlyOwners

```solidity
modifier onlyOwners()
```

_Checks the _owners role for the sender_

### onlyWhitelisted

```solidity
modifier onlyWhitelisted()
```

### setContractVariables

```solidity
function setContractVariables(uint256 _tenure1, uint256 _tenure2, uint256 _tenure3, uint256 _reward, uint256 _freq, uint256 _poolId, uint256 _hotPeriod, uint256 _coolDownPeriod) external
```

_Set the variables for the pool cycle - Start Date, End Date and Reward Rate_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tenure1 | uint256 | tenure 1 variable |
| _tenure2 | uint256 | tenure 2 variable |
| _tenure3 | uint256 | tenure 3 variable |
| _reward | uint256 | reward percentage of the pool |
| _freq | uint256 | frequency of the withdrawl |
| _poolId | uint256 | Pool Identifier number |
| _hotPeriod | uint256 | Cooldown Period after which rewards can be claimed |
| _coolDownPeriod | uint256 |  |

### deposit

```solidity
function deposit(uint256 amount, uint256 _tenureOption) public returns (uint256)
```

_Creates a deposit to the pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | Amount of USDC that user wants to deposit to the pool |
| _tenureOption | uint256 | Tenure Option conditions : tenureOption = 1 | 2 | 3 amount > 0 allowance >= amount transfer should be successfull |

### _inCooldown

```solidity
function _inCooldown(uint256 _depositNumber) public view returns (bool)
```

### yieldClaimDetails

```solidity
function yieldClaimDetails(uint256 _depositNumber) public view returns (struct ZothTestLPMultiFreq.YieldDetails _yieldDetails)
```

_Gets the yield claim details_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _depositNumber | uint256 | Deposit Number for which one wants to get the yield details conditions : balance > 0 elapsedTime > 0 timeInterval > 0 cyclesElapsed <= freq |

### yieldClaim

```solidity
function yieldClaim(uint256 _depositNumber) public
```

_Allows user to claim the yield_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _depositNumber | uint256 | Deposit Number for which one wants to claim the yield. conditions : balance > 0 elapsedTime > 0 timeInterval > 0 cyclesElapsed <= freq |

### getportfoliobalance

```solidity
function getportfoliobalance() public view returns (uint256)
```

_Get the total portfolio balance ivensted in the pool_

### withdraw

```solidity
function withdraw(uint256 _depositNumber) public
```

_Allows user withdraw the total pool amount in deposit_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _depositNumber | uint256 | Deposit Number for which one wants to claim the yield. conditions : deposit > 0 block.timestamp >= end tenure of the pool deposit |

### _transfer

```solidity
function _transfer(uint256 _amount, address _receiver) public
```

_Allows the owners to transfer the funds from the contract to any reciever_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | Amount you want to withdraw |
| _receiver | address | Reciever account conditions : contract balance >= amount |

## ReentrancyGuard

_Contract module that helps prevent reentrant calls to a function.

Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
available, which can be applied to functions to make sure there are no nested
(reentrant) calls to them.

Note that because there is a single `nonReentrant` guard, functions marked as
`nonReentrant` may not call one another. This can be worked around by making
those functions `private`, and then adding `external` `nonReentrant` entry
points to them.

TIP: If you would like to learn more about reentrancy and alternative ways
to protect against it, check out our blog post
https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul]._

### ReentrancyGuardReentrantCall

```solidity
error ReentrancyGuardReentrantCall()
```

_Unauthorized reentrant call._

### constructor

```solidity
constructor() internal
```

### nonReentrant

```solidity
modifier nonReentrant()
```

_Prevents a contract from calling itself, directly or indirectly.
Calling a `nonReentrant` function from another `nonReentrant`
function is not supported. It is possible to prevent this from happening
by making the `nonReentrant` function external, and making it call a
`private` function that does the actual work._

### _reentrancyGuardEntered

```solidity
function _reentrancyGuardEntered() internal view returns (bool)
```

_Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
`nonReentrant` function in the call stack._

## Roles

_Library for managing addresses assigned to a Role._

### Role

```solidity
struct Role {
  mapping(address => bool) bearer;
}
```

### add

```solidity
function add(struct Roles.Role role, address account) internal
```

_give an account access to this role_

### remove

```solidity
function remove(struct Roles.Role role, address account) internal
```

_remove an account's access to this role_

### has

```solidity
function has(struct Roles.Role role, address account) internal view returns (bool)
```

_check if an account has this role_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool |

## WhitelistManager

### constructor

```solidity
constructor() public
```

### onlyHr

```solidity
modifier onlyHr()
```

_Modifier for only HR calling_

### onlyOwners

```solidity
modifier onlyOwners()
```

_Modifier for only owner calling_

### onlyPoolManagers

```solidity
modifier onlyPoolManagers()
```

_Modifier for only pool manager calling_

### onlyFundManagers

```solidity
modifier onlyFundManagers()
```

_Modifier for only fund manager calling_

### onlyVerifiers

```solidity
modifier onlyVerifiers()
```

_Modifier for only verifier calling_

### isWhitelisted

```solidity
function isWhitelisted(address _address) external view returns (bool)
```

_To check whether the address is whitelisted or not_

### isFundManager

```solidity
function isFundManager(address _address) external view returns (bool)
```

_To check whether the address is FundManger or not_

### isPoolManager

```solidity
function isPoolManager(address _address) external view returns (bool)
```

_To check whether the address is PoolManager or not_

### isVerifier

```solidity
function isVerifier(address _address) external view returns (bool)
```

_To check whether the address is Verified or not_

### isOwner

```solidity
function isOwner(address _address) external view returns (bool)
```

_To check whether the address is Owner or not_

### isHr

```solidity
function isHr(address _address) external view returns (bool)
```

_To check whether the address is HR or not_

### addHr

```solidity
function addHr(address _address) public
```

_To add an address to HR role_

### removeHr

```solidity
function removeHr(address _address) public
```

_To remove an address from HR role_

### addVerifier

```solidity
function addVerifier(address _address) public
```

_To add an address to verifier role_

### removeVerifier

```solidity
function removeVerifier(address _address) public
```

_To remove an address from verifier role_

### addPoolManager

```solidity
function addPoolManager(address _address) public
```

_To add an address to PoolManager role_

### removePoolManager

```solidity
function removePoolManager(address _address) public
```

_To remove an address from PoolManager role_

### addFundManager

```solidity
function addFundManager(address _address) public
```

_To add an address to FundManager role_

### removeFundManager

```solidity
function removeFundManager(address _address) public
```

_To remove an address from FundManager role_

### addWhitelist

```solidity
function addWhitelist(address _address) public
```

_To add a single address to whitelist_

### removeWhitelist

```solidity
function removeWhitelist(address _address) public
```

_To remove an address from whitelist_

## ZothTestLP

This contract is a pool contract that inherits the properties of the ERC721 token standard.

### SECS_IN_YEAR

```solidity
uint256 SECS_IN_YEAR
```

### usdc

```solidity
contract IERC20 usdc
```

### owner

```solidity
address owner
```

### stakingBalance

```solidity
mapping(address => uint256) stakingBalance
```

### balances

```solidity
mapping(address => uint256) balances
```

### yieldClaimed

```solidity
mapping(uint256 => bool) yieldClaimed
```

### withdrawClaimed

```solidity
mapping(uint256 => bool) withdrawClaimed
```

### tenure1

```solidity
uint256 tenure1
```

### tenure2

```solidity
uint256 tenure2
```

### tenure3

```solidity
uint256 tenure3
```

### reward

```solidity
uint256 reward
```

### freq

```solidity
uint256 freq
```

### poolId

```solidity
uint256 poolId
```

### hotPeriod

```solidity
uint256 hotPeriod
```

### userStartTime

```solidity
mapping(address => mapping(uint256 => uint256)) userStartTime
```

### userEndTime

```solidity
mapping(address => mapping(uint256 => uint256)) userEndTime
```

### userDepositAmount

```solidity
mapping(address => mapping(uint256 => uint256)) userDepositAmount
```

### totalUserDeposits

```solidity
mapping(address => uint256) totalUserDeposits
```

### YieldDetails

```solidity
struct YieldDetails {
  uint256 balance;
  uint256 totalYield;
  uint256 unlockedYield;
  uint256 lockedYield;
  uint256 cyclesLeft;
  uint256 timeLeft;
}
```

### ClaimUSDCDetails

```solidity
struct ClaimUSDCDetails {
  uint256 balance;
  uint256 yield;
  uint256 startDate;
  uint256 cyclesRemaining;
  uint256 yieldGenerated;
  uint256 nextUnlockDate;
}
```

### WithdrawUSDCDetails

```solidity
struct WithdrawUSDCDetails {
  uint256 balance;
  uint256 yield;
  uint256 startDate;
  uint256 unlockDate;
}
```

### constructor

```solidity
constructor(address _usdcAddress) public
```

### onlyOwners

```solidity
modifier onlyOwners()
```

_Checks the _owners role for the sender_

### onlyVerifiers

```solidity
modifier onlyVerifiers()
```

_Checks the _verifiers role for the sender_

### onlyWhitelisted

```solidity
modifier onlyWhitelisted()
```

_Checks the _whitelisted role for the sender_

### onlyAuthorities

```solidity
modifier onlyAuthorities()
```

_Checks the _verifier or _owner role for the sender_

### setContractVariables

```solidity
function setContractVariables(uint256 _tenure1, uint256 _tenure2, uint256 _tenure3, uint256 _reward, uint256 _freq, uint256 _poolId, uint256 _hotPeriod) external
```

_Set the variables for the pool cycle - Start Date, End Date and Reward Rate_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tenure1 | uint256 | tenure 1 variable |
| _tenure2 | uint256 | tenure 2 variable |
| _tenure3 | uint256 | tenure 3 variable |
| _reward | uint256 | reward percentage of the pool |
| _freq | uint256 | frequency of the withdrawl |
| _poolId | uint256 | Pool Identifier number |
| _hotPeriod | uint256 | Cooldown Period after which rewards can be claimed |

### getContractVariables

```solidity
function getContractVariables() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)
```

_Get the variables for the pool cycle - Tenures, Reward Rate, Freq, PoolId and hotPeriod_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | _tenure1 tenure 1 variable |
| [1] | uint256 | _tenure2 tenure 2 variable |
| [2] | uint256 | _tenure3 tenure 3 variable |
| [3] | uint256 | _reward reward percentage of the pool |
| [4] | uint256 | _freq frequency of the withdrawl |
| [5] | uint256 | _poolId Pool Identifier number |
| [6] | uint256 | _hotPeriod Cooldown Period after which rewards start to be calculated |

### addWhitelistAddress

```solidity
function addWhitelistAddress(address _address) external
```

_Adds a address to the whitelisted role | only authorities are allowed to execute the function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | Address which is to be whitelisted |

### addVerifierRole

```solidity
function addVerifierRole(address _address) external
```

_Adds a address to the verifier role | only owners are allowed to execute the function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | Address which is to be added as verifier |

### removeWhitelistAddress

```solidity
function removeWhitelistAddress(address _address) external
```

_Removes a address to the whitelisted role | only authorities are allowed to execute the function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | Address which is to be removed from whitelisted role |

### deposit

```solidity
function deposit(uint256 amount, uint256 _tenureOption) public returns (uint256)
```

_Creates a deposit to the pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | Amount of USDC that user wants to deposit to the pool in 6 decimals | 10 USDC = 10 * 10 ** 6 |
| _tenureOption | uint256 | Tenure Option conditions : tenureOption = 1 | 2 | 3 amount > 0 allowance >= amount transfer should be successfull |

### yieldClaimDetails

```solidity
function yieldClaimDetails(uint256 _depositNumber) public view returns (struct ZothTestLP.YieldDetails _yieldDetails)
```

_Gets the yield claim details_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _depositNumber | uint256 | Deposit Number for which one wants to get the yield details conditions : balance > 0 elapsedTime > 0 timeInterval > 0 cyclesElapsed <= freq |

### yieldClaim

```solidity
function yieldClaim(uint256 _depositNumber) public
```

_Allows user to claim the yield_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _depositNumber | uint256 | Deposit Number for which one wants to claim the yield. |

### getportfoliobalance

```solidity
function getportfoliobalance() public view returns (uint256)
```

_Get the total portfolio balance ivensted in the pool_

### getClaimUSDCDetails

```solidity
function getClaimUSDCDetails(uint256 _depositNumber) public view returns (struct ZothTestLP.ClaimUSDCDetails _claimUSDCDetails)
```

### getWithdrawUSDCDetails

```solidity
function getWithdrawUSDCDetails(uint256 _depositNumber) public view returns (struct ZothTestLP.WithdrawUSDCDetails _withdrawUSDCDetails)
```

struct WithdrawUSDCDetails {
        uint256 balance;
        uint256 yield;
        uint256 startDate;
        uint256 unlockDate;
    }

### withdraw

```solidity
function withdraw(uint256 _depositNumber) public
```

_Allows user withdraw the total pool amount in deposit_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _depositNumber | uint256 | Deposit Number for which one wants to claim the yield. conditions : deposit > 0 block.timestamp >= end tenure of the pool deposit |

### _transfer

```solidity
function _transfer(uint256 _amount, address _receiver) public
```

_Allows the owners to transfer the funds from the contract to any reciever_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | Amount you want to withdraw |
| _receiver | address | Reciever account conditions : contract balance >= amount |

