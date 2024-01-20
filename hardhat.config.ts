import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
const { PRIVATE_KEY, POLYGON_API_KEY } = process.env;
const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: " http://127.0.0.1:8545/",
    },
    hardhat: {},
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY],
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: POLYGON_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.16",
      },
      {
        version: "0.8.16",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    overrides: {
      "contracts/V3/ZothPool.sol": {
        version: "0.8.16",
      },
      "contracts/V1/ZothTestLP.sol": {
        version: "0.8.16",
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./client/artifacts"
  },
};

export default config;
