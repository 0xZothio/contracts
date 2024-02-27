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
