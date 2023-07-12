# Zoth Contracts

This repo contains the EVM-comaptible smart contracts representing the Lending Pools.

Run :

- This will compile, test and analyse all the test cases and will generate a coverge report.

```sh
yarn hardhat coverage
```

<img src="./docs/1.png"></img>

- This will generate the gas report of the functions that are to be executed on the blockchain.

```sh
REPORT_GAS=true npx hardhat test
```

<img src="./docs/2.png"></img>

## Local Audit

Folder : `/local-audit`

Tools used :

- Slither

First Iteration :

- Added Slither Report
- Added RenentrancyGuard
- Formatted Calculations
- Added Contract Graphs
