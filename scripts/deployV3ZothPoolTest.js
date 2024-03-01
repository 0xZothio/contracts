const hre = require("hardhat");
const whiteListeManagerPlume = "0xc23bcA1E5F1a9b9e155B472ED5bA3EA77DB939c8";
const whiteListeManagerBerachain = "0x0479EcAfF5C672c8528371cB66C07af4E7914dF2";
const whiteListeManagerMumbai = "0xCe60F35440d758714402118D03Fd79F30941f5A2"
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
    whiteListeManagerMumbai,
    0,
    poolName,
    poolSymbol,
    baseUri,
    getSecondsOfDays(7),
    ["0xe9DcE89B076BA6107Bb64EF30678efec11939234"],
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
      ["0xe9DcE89B076BA6107Bb64EF30678efec11939234"],
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
