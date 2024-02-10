const hre = require("hardhat");
const whiteListeManagerPlume = "0xc23bcA1E5F1a9b9e155B472ED5bA3EA77DB939c8";
const whiteListeManagerBerachain="0xbF60897dC64FC4a2675b141D24B962008Fe46926";
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const blueURI =
    "https://gateway.pinata.cloud/ipfs/QmeRhd2icJLyNbD9yzKoiJUvxtBw4u43JB25jzt73vMv28";
  const pinkURI =
    "https://gateway.pinata.cloud/ipfs/QmQJxvSshn64T3B6xWqk4LdbGgJWUjKEwkCjmDNaMgJEDF";
  const silverURI =
    "https://gateway.pinata.cloud/ipfs/QmNnfsr8NRfWCTBHnfHMN6ecru7kxgnnP6ByRET4UmAiM6";
  const goldURI =
    "https://gateway.pinata.cloud/ipfs/QmZnMPkcsbQcuMbr8tt8oC7EQinbGEog8RtTLG2gvT5V7Q";
  const greenURI =
    "https://gateway.pinata.cloud/ipfs/QmY6SXdLsdQCTeJFB77A1kuEJ2HSZidZBsA3mSGh1ad7yG";

  const poolName = "Zoth Pool #2";
  const poolSymbol = "ZP2";

  const ZothPool = await hre.ethers.deployContract("ZothPool", [
    whiteListeManagerBerachain,
    deployer.address,
    poolName,
    poolSymbol,
    blueURI,
    pinkURI,
    silverURI,
    goldURI,
    greenURI,
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
      whiteListeManagerBerachain,
      deployer.address,
      poolName,
      poolSymbol,
      blueURI,
      pinkURI,
      silverURI,
      goldURI,
      greenURI,
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
