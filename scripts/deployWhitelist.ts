
const hre = require("hardhat");

async function sleep(ms:any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Deploy the WhitelistManager Contract
  const WhitelistManager = await hre.ethers.deployContract("WhitelistManager");
  await WhitelistManager.waitForDeployment();
  console.log(
    "WhitelistManager contract deployed to:",
    WhitelistManager.target
  );

  await sleep(30 * 1000);
  // // Verify the WhitelistManager Contract
  await hre.run("verify:verify", {
    address: WhitelistManager.target,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
