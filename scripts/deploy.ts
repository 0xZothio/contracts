import { ethers } from "hardhat";

async function main() {
  const usdc_address = "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747";
  const lock = await ethers.deployContract("ZothTestLP", [usdc_address]);

  await lock.waitForDeployment();

  console.log("ZothTestLP Deployed Successfully");
  console.log(lock);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
