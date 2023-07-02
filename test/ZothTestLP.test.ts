import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("testUSDC", function () {
  async function runEveryTime() {
    const [owner, otherAccount] = await ethers.getSigners();

    const testUSDCContract = await ethers.getContractFactory("TestUSDC");
    const testUSDC = await testUSDCContract.deploy();

    const testUSDCAddress = await testUSDC.getAddress();

    const zothTestLPContract = await ethers.getContractFactory("ZothTestLP");
    const ZothTestLP = await zothTestLPContract.deploy(testUSDCAddress);

    return { owner, otherAccount, testUSDC, ZothTestLP };
  }

  describe("Deployment", async () => {
    it("Should initiate the contract with provided USDC address", async () => {
      const { ZothTestLP } = await loadFixture(runEveryTime);
      expect(await ZothTestLP.getAddress()).to.not.null;
    });
  });

  describe("Variable Initiation", async () => {
    it("Should Initiate the variables properly for the contract", async () => {
      const { ZothTestLP } = await loadFixture(runEveryTime);

      // Setting contract variables
      const tenure1 = (2629743 * 3).toString(); // 3 months
      const tenure2 = (2629743 * 6).toString(); // 6 months
      const tenure3 = (2629743 * 9).toString(); // 9 months

      const reward = "10";
      const freq = "4";
      const poolId = "100001";
      const coolDownPeriod = (86400 * 4).toString(); // 4 days

      await ZothTestLP.setContractVariables(
        tenure1,
        tenure2,
        tenure3,
        reward,
        freq,
        poolId,
        coolDownPeriod
      );

      const vars = await ZothTestLP.getContractVariables();
      expect(vars[0]).to.equal("7889229");
      expect(vars[1]).to.equal("15778458");
      expect(vars[2]).to.equal("23667687");
      expect(vars[3]).to.equal("10");
      expect(vars[4]).to.equal("4");
      expect(vars[5]).to.equal("100001");
      expect(vars[6]).to.equal("345600");
    });
  });

  describe("Governance", async () => {
    it("Assigns the address to verifier role by owner", async () => {
      const { ZothTestLP, otherAccount } = await loadFixture(runEveryTime);
      await ZothTestLP.addVerifierRole(otherAccount.address);
    });
    it("Assigns the address to whitelist role by authorities", async () => {
      const { ZothTestLP, otherAccount } = await loadFixture(runEveryTime);
      await ZothTestLP.addWhitelistAddress(otherAccount.address);
    });
  });
});
