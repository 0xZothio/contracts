const hre = require("hardhat");
const whiteListeManagerPlume = "0x9c3E493a92899A9943e2c8AfeB0d84C0e6E6985B";
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const ZothPool = await hre.ethers.deployContract("ZothPool", [
    whiteListeManagerPlume,
    deployer.address,
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
    constructorArguments: [whiteListeManagerPlume, deployer.address],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
