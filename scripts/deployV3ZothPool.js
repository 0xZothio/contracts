const hre = require("hardhat");
const whiteListeManagerPlume = "0xc23bcA1E5F1a9b9e155B472ED5bA3EA77DB939c8";
const whiteListeManagerBerachain = "0x05A25D6357c6755Cb71DC6997D155CA9A7e3c971";
const whiteListeManagerMumbai = "0x86a6613cA80Bd3088a46974e24bC0a65Dc37f38B";
const whiteListManagerMetis = "0x1C466fab497CC9132A2Ea8FB2dF22E87740b2042";
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getSecondsOfDays(day) {
  return day * 24 * 60 * 60;
}
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const poolName = "Zoth Pool 6";
  const poolSymbol = "ZP6";
  const baseUri="https://resources.zoth.io/nft/652e8634c9e1df8d9f6f85d6";

  console.log("Deploying ZothPool Contract...");
  
  const ZothPool = await hre.ethers.deployContract("ZothPool", [
    whiteListeManagerMumbai,
    0,
    poolName,
    poolSymbol,
    baseUri,
    getSecondsOfDays(7),
    ["0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359","0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"],
    getSecondsOfDays(30),
    getSecondsOfDays(365),
  ]);

 

  await ZothPool.waitForDeployment();

  console.log(
    "ZothPool Deployed Successfully on Mentioned Network",
    ZothPool.target
  );

  console.log("Waiting for 30 Seconds to Verify the Contract on Etherscan");
  await sleep(30 * 1000);

  // // Verify the RektLock Contract
  await hre.run("verify:verify", {
    address: ZothPool.target,
    constructorArguments: [
      whiteListeManagerMumbai,
      0,
      poolName,
      poolSymbol,
      baseUri,
      getSecondsOfDays(7),
      ["0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359","0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"],
      getSecondsOfDays(30),
      getSecondsOfDays(365),
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
