const hre = require("hardhat");
const whiteListeManagerPlume = "0xc23bcA1E5F1a9b9e155B472ED5bA3EA77DB939c8";
const whiteListeManagerBerachain = "0x371907DA46F9771189C068864115a4e84a227469";
const whiteListeManagerMumbai = "0xCe60F35440d758714402118D03Fd79F30941f5A2";
const deployedBerachainPool="0x8Fc89849cdd463c9d75a9973C9683064FAa887e4";
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
  const ZothPool = await hre.ethers.deployContract("ZothPool", [
    whiteListeManagerBerachain,
    0,
    poolName,
    poolSymbol,
    baseUri,
    getSecondsOfDays(7),
    ["0x6581e59A1C8dA66eD0D313a0d4029DcE2F746Cc5"],
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
      whiteListeManagerBerachain,
      0,
      poolName,
      poolSymbol,
      baseUri,
      getSecondsOfDays(7),
      ["0x6581e59A1C8dA66eD0D313a0d4029DcE2F746Cc5"],
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
