const hre = require("hardhat");

async function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Deploying Quest Contract...");

  const Quest = await hre.ethers.deployContract("Quest", [
    ["0x6581e59A1C8dA66eD0D313a0d4029DcE2F746Cc5"],
  ]);
  await Quest.waitForDeployment();

  console.log(
    `Quest Deployed Successfully on Mentioned Network: ${hre.network.name
      .toString()
      .toUpperCase()} `,
    Quest.target
  );

  console.log("Waiting for 30 Seconds to Verify the Contract on Etherscan");
  await sleep(30 * 1000);

  // Verify the Quest Contract
  await hre.run("verify:verify", {
    address: Quest.target,
    constructorArguments: [["0x6581e59A1C8dA66eD0D313a0d4029DcE2F746Cc5"]],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
