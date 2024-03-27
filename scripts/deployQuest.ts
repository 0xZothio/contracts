const hre = require("hardhat");

async function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Deploying Quest Contract...");

  const Quest = await hre.ethers.deployContract("Quest", [
    ["0x7EeCA4205fF31f947EdBd49195a7A88E6A91161B"],
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
    constructorArguments: [["0x7EeCA4205fF31f947EdBd49195a7A88E6A91161B"]],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
