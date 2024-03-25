const hre = require("hardhat");

async function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Deploying Quest Contract...");

  const Quest = await hre.ethers.deployContract("Quest", [
    [
      "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ],
  ]);
  await Quest.waitForDeployment();

  console.log(
    "ZothPool Deployed Successfully on Mentioned Network",
    Quest.target
  );

  console.log("Waiting for 30 Seconds to Verify the Contract on Etherscan");
  await sleep(30 * 1000);

  // Verify the Quest Contract
  await hre.run("verify:verify", {
    address: Quest.target,
    constructorArguments: [
      [
        "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      ],
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
