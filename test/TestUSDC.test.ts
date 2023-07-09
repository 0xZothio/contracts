import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("testUSDC", function () {
  async function runEveryTime() {
    const [owner, otherAccount] = await ethers.getSigners();

    const testUSDCContract = await ethers.getContractFactory("TestUSDC");
    const testUSDC = await testUSDCContract.deploy();

    return { owner, otherAccount, testUSDC };
  }

  describe("Deployment", function () {
    it("Should mint 10000000000 tUSDC to the owner", async () => {
      const { owner, testUSDC } = await loadFixture(runEveryTime);
      const balanceOfOwner = await testUSDC.balanceOf(owner.address);
      const formattedBalance = ethers.parseUnits("10000000000", 6);
      expect(balanceOfOwner).to.equal(formattedBalance);
    });
    it("Mint 100 tUSDC to otherAddress", async () => {
      const { otherAccount, testUSDC } = await loadFixture(runEveryTime);

      const toMintBalance = ethers.parseUnits("100", 6);
      await testUSDC.mint(otherAccount.address, toMintBalance);

      const otherAccountBalance = await testUSDC.balanceOf(
        otherAccount.address
      );
      expect(toMintBalance).to.equal(otherAccountBalance);
    });
  });
});
