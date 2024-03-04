import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import 'solidity-docgen';
require("dotenv").config();
const {
  PRIVATE_KEY,
  POLYGON_API_KEY,
  PLUME_TESTNET_API,
  BERA_TESTNET_API,
  ALFAJORES_API_KEY,
} = process.env;
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
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [PRIVATE_KEY],
      chainId: 44787,
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [PRIVATE_KEY],
    },
    plume_testnet: {
      url: "https://plume-testnet.rpc.caldera.xyz/http",
      accounts: [PRIVATE_KEY],
    },
    berachainArtio: {
      url: "https://rpc.ankr.com/berachain_testnet",
      accounts: [PRIVATE_KEY],
      gasPrice: 10000000000,
    },
    
    celo: {
      url: "https://forno.celo.org",
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      plume_testnet: PLUME_TESTNET_API,
      polygonMumbai: POLYGON_API_KEY,
      polygon: POLYGON_API_KEY,
      berachainArtio: "berachainArtio",
      alfajores: ALFAJORES_API_KEY,
      celo: ALFAJORES_API_KEY,
    },
    customChains: [
      {
        network: "plume_testnet",
        chainId: 161221135,
        urls: {
          apiURL: "https://plume-testnet.explorer.caldera.xyz/api",
          browserURL: "https://plume-testnet.explorer.caldera.xyz",
        },
      },

      {
        network: "berachainArtio",
        chainId: 80085,
        urls: {
          apiURL:
            "https://api.routescan.io/v2/network/testnet/evm/80085/etherscan",
          browserURL: "https://artio.beratrail.io",
        },
      },
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io/",
        },
      },
    ],
  },
  gasReporter: { enabled: true },
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
  docgen: {
    output: 'docs',
    pages: () => 'api.md',
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
