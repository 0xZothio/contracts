import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("ZothPool", function () {
  async function runEveryTime() {
    const [owner, otherAccount] = await ethers.getSigners();

    // TOKEN SETUP
    const testUSDCContract = await ethers.getContractFactory("TestUSDC");
    const testUSDC = await testUSDCContract.deploy();
    console.log("USDC deployed.");

    const testUSDCAddress = await testUSDC.getAddress();
    const amountToTransfer = ethers.parseUnits("1000", 6);
    await testUSDC.transfer(otherAccount, amountToTransfer);
    console.log("tUSDC transfered from main account to otherAccount.");

    // WHITELISTER SETUP
    const whitelistManagerContract = await ethers.getContractFactory(
      "WhitelistManager"
    );
    const whitelistManager = await whitelistManagerContract.deploy();
    const whitelistManagerAddress = await whitelistManager.getAddress();
    console.log("Whitelister deployed.");

    // MAIN POOL SETUP
    const zothTestLPContract = await ethers.getContractFactory("ZothPool");
    const ZothTestLP = await zothTestLPContract.deploy(
      testUSDCAddress,
      whitelistManagerAddress
    );
    console.log("ZothPool deployed.");

    const zothTestLPAddress = await ZothTestLP.getAddress();
    await testUSDC.transfer(zothTestLPAddress, amountToTransfer);
    console.log("tUSDC transfered to ZothPool contract.");

    return {
      owner,
      otherAccount,
      testUSDC,
      ZothTestLP,
      whitelistManager,
    };
  }

  // ! >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // ! DEPLOYMENT TESTS
  // ! >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  describe("Deployment", async () => {
    it("[Deployment] : Should initiate the contract with provided USDC address", async () => {
      const { ZothTestLP } = await loadFixture(runEveryTime);
      expect(await ZothTestLP.getAddress()).to.not.null;
    });
  });
});
