const hre = require("hardhat");

async function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const used_address = "0x765de816845861e75a25fca122bb6898b8b1282a";
  const _whitelistManager = "0x6063cF446a3033CD75853729F0B20F6dc1789696";
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
