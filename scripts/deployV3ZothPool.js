const hre = require("hardhat");
const whiteListeManagerPlume = "0xc23bcA1E5F1a9b9e155B472ED5bA3EA77DB939c8";
const whiteListeManagerBerachain = "0x0479EcAfF5C672c8528371cB66C07af4E7914dF2";
const whiteListeManagerMumbai = "0xA0a506286ce61b94BC079F31319780aD5968aba4"
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const poolName = "Zoth Pool #2";
  const poolSymbol = "ZP2";
  const baseUri="https://resources.zoth.io/docs";
  const ZothPool = await hre.ethers.deployContract("ZothPool", [
    whiteListeManagerMumbai,
    10,
    poolName,
    poolSymbol,
    baseUri,
    15,
    ["0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97"],
    15,
    60,
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
    constructorArguments: [
      whiteListeManagerMumbai,
      10,
      poolName,
      poolSymbol,
      baseUri,
      15,
      ["0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97"],
      15,
      60,
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
