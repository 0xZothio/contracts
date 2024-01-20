const hre = require("hardhat");

async function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const used_address = "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747";
  const _whitelistManager = "0x8Ef57Aa1999aC579FEBE779b5D81DBE73E4633f7";
  // Deploy the RektLock Contract
  const ZothTestLPMultiFreq = await hre.ethers.deployContract(
    "ZothTestLPMultiFreq",
    [used_address, _whitelistManager]
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
    constructorArguments: [used_address, _whitelistManager],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
