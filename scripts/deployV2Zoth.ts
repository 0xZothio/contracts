const hre = require("hardhat");

async function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const used_address = "0xEa237441c92CAe6FC17Caaf9a7acB3f953be4bd1";
  const _whitelistManager = "0xe6d602De78a7a46F072B117A99b7e45640aB5E7C";
  // Deploy the RektLock Contract
  const [deployer] = await hre.ethers.getSigners();
  const ZothTestLPMultiFreq = await hre.ethers.deployContract(
    "ZothTestLPMultiFreq",
    [used_address, _whitelistManager, deployer.address]
  );
  await ZothTestLPMultiFreq.waitForDeployment();
  console.log(
    "ZothTestLPMultiFreq contract deployed to:",
    ZothTestLPMultiFreq.target
  );

  // Sleep for 30 seconds to let Etherscan catch up with the deployments
  await sleep(30 * 1000);

  // // Verify the RektLock Contract
  await hre.run("verify:verify", {
    address: ZothTestLPMultiFreq.target,
    constructorArguments: [used_address, _whitelistManager, deployer.address],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
