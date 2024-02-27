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

\_Creates a deposit to the pool with specific amount & locking duration with given token selected ID .

```solidity
function depositByLockingPeriod(uint256 _amount, uint256 _lockingDuration, uint256 _tokenId) external returns (uint256 nftId, uint256 depositId)
```

#### Parameters

| Name              | Type    | Description                                                            |
| ----------------- | ------- | ---------------------------------------------------------------------- |
| \_amount          | uint256 | Amount of USDC that user wants to deposit to the pool                  |
| \_lockingDuration | uint256 | Duration of the deposit which user chooses (number of days) conditions |
| \_tokenId         | uint256 |                                                                        |

### reInvest

_Creates a deposit to the pool : default tenure_

```solidity
function reInvest(address _userAddrress, uint256 _depositId, uint256 _amount) external
```

#### Parameters

| Name           | Type    | Description                  |
| -------------- | ------- | ---------------------------- |
| \_userAddrress | address |                              |
| \_depositId    | uint256 | Represents the ID of deposit |
| \_amount       | uint256 |                              |

### emergencyWithdraw

```solidity
function emergencyWithdraw(uint256 id) external
```

Withdraws principal total deposit minus fee that is a percentage of total deposit for a specific deposit

#### Parameters

| Name | Type    | Description                                                                                                                                                                                                                                                     |
| ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id   | uint256 | Represents the ID of deposit that lender tries to emergency withdraw before locking period Requirements: - Should be called before locking period ends - 'msg.sender' should have deposit with specific id - Lender should have enough stable token to transfer |

### changeBaseRates

```solidity
function changeBaseRates(uint256 baseStableApr) external
```

_Changes the APR that calculates stable and bonus rewards_

#### Parameters

| Name          | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| baseStableApr | uint256 | is the new apr percentage with 2 decimals |

### setWithdrawRate

```solidity
function setWithdrawRate(uint256 newRate) external
```

_Changes the withdraw rate for the emergencyWithdraw_

#### Parameters

| Name    | Type    | Description                               |
| ------- | ------- | ----------------------------------------- |
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

| Name   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
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
| [0]  | bool | bool        |

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
