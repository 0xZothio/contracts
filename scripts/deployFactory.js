const hre = require("hardhat");
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const ZothTestLPFactory = await hre.ethers.deployContract(
    "ZothTestLPFactory"
  );

  await ZothTestLPFactory.waitForDeployment();

  console.log("ZothTestLPFactory Deployed Successfully");
  await sleep(30 * 1000);

  // // Verify the RektLock Contract
  await hre.run("verify:verify", {
    address: ZothTestLPFactory.target,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
