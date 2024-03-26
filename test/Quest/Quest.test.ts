import { expect, assert } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
function getSecondsOfDays(day: number) {
  return day * 24 * 60 * 60;
}

describe("Quest-Contract", function () {
  async function runEveryTime() {
    const [owner, otherAccount] = await ethers.getSigners();

    // TOKEN SETUP
    const testUSDCContract = await ethers.getContractFactory("TestUSDC");
    const testUSDC1 = await testUSDCContract.deploy();
    const testUSDC2 = await testUSDCContract.deploy();
    const testUSDC3 = await testUSDCContract.deploy();
    const testUSDC4 = await testUSDCContract.deploy();
    const testUSDC5 = await testUSDCContract.deploy();
    console.log("USDC deployed.");

    const testUSDCAddress1 = await testUSDC1.getAddress();
    const testUSDCAddress2 = await testUSDC2.getAddress();
    const testUSDCAddress3 = await testUSDC3.getAddress();
    const testUSDCAddress4 = await testUSDC4.getAddress();
    const testUSDCAddress5 = await testUSDC5.getAddress();

    const amountToTransfer = ethers.parseUnits("1000", 18);

    await testUSDC1.transfer(otherAccount, amountToTransfer);
    await testUSDC2.transfer(otherAccount, amountToTransfer);
    await testUSDC3.transfer(otherAccount, amountToTransfer);
    await testUSDC4.transfer(otherAccount, amountToTransfer);
    await testUSDC5.transfer(otherAccount, amountToTransfer);

    const tokenAddresses = [
      testUSDCAddress1,
      testUSDCAddress2,
      testUSDCAddress3,
      testUSDCAddress4,
      testUSDCAddress5,
    ];

    console.log("Tokens transfered from main account to otherAccount.");

    const questContract = await ethers.getContractFactory("Quest");
    const Quest = await questContract.connect(owner).deploy(tokenAddresses);

    console.log("Quest deployed.");

    const questDeployedAddress = await Quest.getAddress();
    await testUSDC1.transfer(questDeployedAddress, amountToTransfer);
    await testUSDC2.transfer(questDeployedAddress, amountToTransfer);
    await testUSDC3.transfer(questDeployedAddress, amountToTransfer);
    await testUSDC4.transfer(questDeployedAddress, amountToTransfer);
    await testUSDC5.transfer(questDeployedAddress, amountToTransfer);

    console.log("TEST-USDC transfered to Quest contract.");

    return {
      owner,
      otherAccount,
      Quest,
      questDeployedAddress,
      tokenAddresses,
      testUSDC1,
      testUSDC2,
      testUSDC3,
      testUSDC4,
      testUSDC5,
    };
  }

  describe("Deployment", async () => {
    it("[Deployment] : Contract is successfully Deployed !!!", async () => {
      const { Quest } = await loadFixture(runEveryTime);
      expect(await Quest.getAddress()).to.not.null;
    });

    it("[Testing] : Should have tokenAddresses", async () => {
      const { Quest, owner, tokenAddresses } = await loadFixture(runEveryTime);
      expect(await Quest.tokenAddresses(0)).to.be.equal(tokenAddresses[0]);
    });

    it("[Testing] : Should not deposit tokens : invalid token ID", async () => {
      const {
        Quest,
        owner,
        tokenAddresses,
        testUSDC1,
        otherAccount,
        questDeployedAddress,
      } = await loadFixture(runEveryTime);
      const spender_amount = ethers.parseUnits("1000", 18);
      await testUSDC1
        .connect(otherAccount)
        .approve(questDeployedAddress, spender_amount);

      await expect(
        Quest.connect(otherAccount).depositAmount(
          ethers.parseUnits("400", 18),
          5 // invalid token address
        )
      ).revertedWithCustomError(Quest, "InvalidTokenId");
    });
    it("[Testing] : Should deposit tokens", async () => {
      const {
        Quest,
        owner,
        tokenAddresses,
        testUSDC1,
        otherAccount,
        questDeployedAddress,
      } = await loadFixture(runEveryTime);
      const spender_amount = ethers.parseUnits("1000", 18);
      await testUSDC1
        .connect(otherAccount)
        .approve(questDeployedAddress, spender_amount);

      await Quest.connect(otherAccount).depositAmount(
        ethers.parseUnits("400", 18),
        0 // 1st token address
      );

      expect(await testUSDC1.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("600", 18)
      );
    });

    it("[Testing] : Should not deposit tokens : invalid amount", async () => {
      const {
        Quest,
        owner,
        tokenAddresses,
        testUSDC1,
        otherAccount,
        questDeployedAddress,
      } = await loadFixture(runEveryTime);
      const spender_amount = ethers.parseUnits("1000", 18);
      await testUSDC1
        .connect(otherAccount)
        .approve(questDeployedAddress, spender_amount);

      await expect(
        Quest.connect(otherAccount).depositAmount(
          ethers.parseUnits("0", 18),
          0 // 1st token address
        )
      ).revertedWithCustomError(Quest, "InvalidDepositAmount");
    });

    it("[Testing] : Should withdraw tokens", async () => {
      const {
        Quest,
        owner,
        tokenAddresses,
        testUSDC1,
        otherAccount,
        questDeployedAddress,
      } = await loadFixture(runEveryTime);
      const spender_amount = ethers.parseUnits("1000", 18);
      await testUSDC1
        .connect(otherAccount)
        .approve(questDeployedAddress, spender_amount);

      await Quest.connect(owner).changeBaseRates(10);
      await Quest.connect(otherAccount).depositAmount(
        ethers.parseUnits("400", 18),
        0 // 1st token address
      );

      const unlockTime = (await time.latest()) + getSecondsOfDays(30);

      await time.increaseTo(unlockTime);

      await Quest.connect(otherAccount).withdrawAmount(
        0 // Deposit Id
      );

      expect(await testUSDC1.balanceOf(otherAccount.address)).to.equal(
        "1003287672501268391679"
      );
    });

    it("Setting Apr Test", async () => {
      const {
        Quest,
        owner,
        tokenAddresses,
        testUSDC1,
        otherAccount,
        questDeployedAddress,
      } = await loadFixture(runEveryTime);
      const spender_amount = ethers.parseUnits("1000", 18);
      await testUSDC1
        .connect(otherAccount)
        .approve(questDeployedAddress, spender_amount);

      await Quest.connect(owner).changeBaseRates(1250);
      await Quest.connect(otherAccount).depositAmount(
        ethers.parseUnits("200", 18),
        0 // 1st token address
      );

      const unlockTime = (await time.latest()) + getSecondsOfDays(90);

      await time.increaseTo(unlockTime);

      await Quest.connect(otherAccount).withdrawAmount(
        0 // Deposit Id
      );

      expect(await testUSDC1.balanceOf(otherAccount.address)).to.equal(
        "1003287672501268391679"
      );
    });
    
  });
});
