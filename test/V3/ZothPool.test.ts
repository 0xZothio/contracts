import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
function formatTimestamp(timestamp: any) {
  const date = new Date(timestamp * 1000);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Add leading zero for single-digit numbers
  const formattedMonth = month.padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  const formattedDate = `${formattedMonth} ${formattedDay}, ${year}`;
  const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  return `${formattedDate} ${formattedTime}`;
}

describe("ZothPool", function () {
  async function runEveryTime() {
    const [
      owner,
      hr,
      poolmanager,
      fundmanager,
      verifier,
      whitelister,
      otherAccount,
    ] = await ethers.getSigners();

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

    const amountToTransfer = ethers.parseUnits("1000", 6);

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

    console.log("tUSDC transfered from main account to otherAccount.");

    // WHITELISTER SETUP
    const whitelistManagerContract = await ethers.getContractFactory(
      "WhitelistManager"
    );
    const whitelistManager = await whitelistManagerContract
      .connect(owner)
      .deploy();
    const whitelistManagerAddress = await whitelistManager.getAddress();
    console.log("Whitelister deployed.");

    // MAIN POOL SETUP
    const zothTestLPContract = await ethers.getContractFactory("ZothPool");
    const ZothTestLP = await zothTestLPContract.deploy(
      whitelistManagerAddress,
      poolmanager
    );

    console.log("ZothPool deployed.");

    const zothTestLPAddress = await ZothTestLP.getAddress();

    // Assigning Roles
    await whitelistManager.connect(owner).addHr(hr.address);
    await whitelistManager.connect(hr).addFundManager(fundmanager.address);
    await whitelistManager.connect(hr).addPoolManager(poolmanager.address);
    await whitelistManager.connect(hr).addVerifier(verifier.address);

    await testUSDC1.transfer(zothTestLPAddress, amountToTransfer);
    await testUSDC2.transfer(zothTestLPAddress, amountToTransfer);
    await testUSDC3.transfer(zothTestLPAddress, amountToTransfer);
    await testUSDC4.transfer(zothTestLPAddress, amountToTransfer);
    await testUSDC5.transfer(zothTestLPAddress, amountToTransfer);
    console.log("tUSDC transfered to ZothPool contract.");

    return {
      owner,
      hr,
      poolmanager,
      fundmanager,
      verifier,
      whitelister,
      otherAccount,
      ZothTestLP,
      whitelistManager,
      zothTestLPAddress,
      tokenAddresses,
      testUSDC1,
      testUSDC2,
      testUSDC3,
      testUSDC4,
      testUSDC5,
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

    it("[Deployment] : Should initiate the contract with provided WhitelistManager address", async () => {
      const { ZothTestLP } = await loadFixture(runEveryTime);
      expect(await ZothTestLP.whitelistManager()).to.not.null;
    });

    it("[Deployment] : Should initiate the contract with provided owner address", async () => {
      const { ZothTestLP, owner, poolmanager } = await loadFixture(
        runEveryTime
      );
      expect(await ZothTestLP.owner()).to.equal(poolmanager.address);
    });

    it("[Testing] : Should Set the contract Variables by Owner", async () => {
      const { ZothTestLP, owner, tokenAddresses, poolmanager } =
        await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      expect(await ZothTestLP.tenure()).to.equal(10);
      expect(await ZothTestLP.poolId()).to.equal(1);
      expect(await ZothTestLP.tokenAddresses(0)).to.be.equal(tokenAddresses[0]);
    });

    it("[Testing] : Should not Set the contract Variables by other than Pool Manager", async () => {
      const { ZothTestLP, otherAccount, tokenAddresses, owner, hr } =
        await loadFixture(runEveryTime);

      await expect(
        ZothTestLP.connect(hr).setContractVariables(
          10,
          1,
          30,
          40,
          tokenAddresses
        )
      ).to.be.revertedWith("USER_IS_NOT_POOL_MANAGER");
    });

    it("[Deposit Function Testing] : Should not deposit if not whitelisted", async () => {
      const { ZothTestLP, otherAccount, tokenAddresses } = await loadFixture(
        runEveryTime
      );

      await expect(
        ZothTestLP.connect(otherAccount).depositByLockingPeriod(200, 0, 0) // locking 200 by default tenure
      ).to.be.revertedWith("USER_IS_NOT_WHITELISTED");
    });

    it("[Testing WhitlistManager] : Should add Whitelist", async () => {
      const { ZothTestLP, whitelistManager, otherAccount, owner, verifier } =
        await loadFixture(runEveryTime);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);
      expect(
        await whitelistManager.isWhitelisted(otherAccount.address)
      ).to.equal(true);
    });

    it("[Deposit Function Testing] : Should deposit if whitelisted", async () => {
      const {
        ZothTestLP,
        zothTestLPAddress,
        otherAccount,
        whitelistManager,
        owner,
        tokenAddresses,
        testUSDC1,
        testUSDC2,
        testUSDC3,
        verifier,
        poolmanager,
      } = await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      const spender_amount = ethers.parseUnits("1000000000", 6);
      await testUSDC1
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await testUSDC2
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        0,
        0 // 1st token address
      );
      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("600", 6),
        0,
        1 // 2st token address
      );

      expect(await testUSDC1.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("600", 6)
      );
      expect(await testUSDC2.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("400", 6)
      );
    });

    it("[Deposit Function Testing] : Should deposit with locking duration", async () => {
      const {
        ZothTestLP,
        zothTestLPAddress,
        otherAccount,
        whitelistManager,
        owner,
        tokenAddresses,
        testUSDC1,
        testUSDC3,
        verifier,
        poolmanager,
      } = await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      const spender_amount = ethers.parseUnits("1000000000", 6);

      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      const lockingDuration = 10;
      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        lockingDuration,
        2
      );

      expect(await testUSDC3.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("600", 6)
      );
    });

    it("[Get Function] : Should check Base APR", async () => {
      const { ZothTestLP, owner } = await loadFixture(runEveryTime);
      await ZothTestLP.connect(owner).changeBaseRates(10);
      expect(await ZothTestLP.getBaseApr()).to.equal(10);
    });

    it("[Active Deposits] : Should check Active Deposits", async () => {
      const {
        ZothTestLP,
        zothTestLPAddress,
        otherAccount,
        whitelistManager,
        owner,
        tokenAddresses,
        testUSDC3,
        verifier,
        poolmanager,
      } = await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      const spender_amount = ethers.parseUnits("1000000000", 6);
      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        0,
        2
      );
      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        10,
        2
      );
      // it will return an array with ids of deposits [0,1]
      expect(
        (await ZothTestLP.getActiveDeposits(otherAccount.address))[0]
      ).to.equal(0);
      expect(
        (await ZothTestLP.getActiveDeposits(otherAccount.address))[1]
      ).to.equal(1);
    });

    it("[Emergency Withdraw] : Should withdraw the funds related to deposit ID EMERGENCY", async () => {
      const {
        ZothTestLP,
        zothTestLPAddress,
        otherAccount,
        testUSDC3,
        whitelistManager,
        owner,
        tokenAddresses,
        verifier,
        poolmanager,
      } = await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      const spender_amount = ethers.parseUnits("1000000000", 6);
      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await ZothTestLP.connect(owner).setWithdrawRate(10);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        1,
        2
      );
      // here amount 600
      await ZothTestLP.connect(otherAccount).emergencyWithdraw(0);

      expect(await testUSDC3.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("960", 6)
      );
    });

    it("[Withdraw Testing] : Should withdraw by ID but Restriction of Time", async () => {
      const {
        ZothTestLP,
        zothTestLPAddress,
        otherAccount,
        testUSDC3,
        whitelistManager,
        owner,
        tokenAddresses,
        verifier,
        poolmanager,
      } = await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      const spender_amount = ethers.parseUnits("1000000000", 6);
      await ZothTestLP.connect(owner).changeBaseRates(12);

      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);
      console.log(
        "Balance Before: ",
        await testUSDC3.balanceOf(otherAccount.address)
      );
      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("200", 6),
        90,
        2
      );

      console.log(
        "Balance After: ",
        await testUSDC3.balanceOf(otherAccount.address)
      );

      const ONE_MONTH_IN_SECS = 4 * 30 * 24 * 60 * 60;
      const unlockTime = (await time.latest()) + ONE_MONTH_IN_SECS;

      await time.increaseTo(unlockTime);

      await ZothTestLP.connect(otherAccount).withdrawUsingDepositId(0);

      console.log(
        "Balance After Withdraw: ",
        await testUSDC3.balanceOf(otherAccount.address)
      );

      // 1000 USDC + Reward : 3287671/1e6 = 3.287USDC + 1000USDC = 1003.287USDC
      expect(await testUSDC3.balanceOf(otherAccount.address)).to.equal(
        "1005917808"
      );
    });

    it("[Withdraw All Funds] : Should withdraw all funds", async () => {
      const {
        ZothTestLP,
        zothTestLPAddress,
        otherAccount,
        testUSDC2,
        testUSDC3,
        whitelistManager,
        owner,
        tokenAddresses,
        verifier,
        poolmanager,
      } = await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      const spender_amount = ethers.parseUnits("1000000000", 6);
      await testUSDC2
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);
      await ZothTestLP.connect(owner).changeBaseRates(10);
      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        30,
        1
      );

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("800", 6),
        0,
        2
      );

      const ONE_MONTH_IN_SECS = 30 * 24 * 60 * 60;
      const unlockTime = (await time.latest()) + ONE_MONTH_IN_SECS;

      await time.increaseTo(unlockTime);

      await ZothTestLP.connect(otherAccount).withdrawUsingDepositId(0);
      await ZothTestLP.connect(otherAccount).withdrawUsingDepositId(1);

      console.log(
        "Balance After Withdraw: ",
        await testUSDC2.balanceOf(otherAccount.address)
      );
      console.log(
        "Balance After Withdraw: ",
        await testUSDC3.balanceOf(otherAccount.address)
      );
      expect(await testUSDC2.balanceOf(otherAccount.address)).to.equal(
        "1003287671"
      );

      expect(await testUSDC3.balanceOf(otherAccount.address)).to.equal(
        "1002191780"
      );
    });

    it("[Testing Transfer Funds]: Should transfer funds to another account", async () => {
      const {
        ZothTestLP,
        zothTestLPAddress,
        otherAccount,
        testUSDC1,
        whitelistManager,
        owner,
        tokenAddresses,
        verifier,
        poolmanager,
        fundmanager,
      } = await loadFixture(runEveryTime);

      await ZothTestLP.connect(poolmanager).setContractVariables(
        10,
        1,
        30,
        40,
        tokenAddresses
      );
      const spender_amount = ethers.parseUnits("1000000000", 6);
      await testUSDC1
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        30,
        0
      );

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        0,
        0
      );

      await ZothTestLP.connect(fundmanager)._transfer(200, owner.address, 0);

      expect(await testUSDC1.balanceOf(zothTestLPAddress)).to.equal(
        ethers.parseUnits("1600", 6)
      );
    });
  });
});
