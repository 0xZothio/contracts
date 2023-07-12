# Audit

First Iteration Changes

- Added Reentrancy Guard

```ts
import {ReentrancyGuard} from "./ReentrancyGuard.sol";
contract ZothTestLP is ERC721URIStorage, ReentrancyGuard {....
```

- Added immutable tag to non modifiable vars

```ts
IERC20 public immutable usdc;
address public immutable owner;
```

- Added `nonReentrant` to deposit()

```ts
function deposit(
        uint256 amount,
        uint256 _tenureOption
    ) public onlyWhitelisted nonReentrant returns (uint256)
```

- Added Transfer check for usdc.transfer

```ts
require(usdc.transfer(msg.sender, unlockedYield * 10 ** 6), "TRANSFER FAILED");
```

- Added call graphs

```sh
slither contracts/ZothTestLP.sol --solc-remaps @openzeppelin=node_modules/@openzeppelin --print contract-summary
```
