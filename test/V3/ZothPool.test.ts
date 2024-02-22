import { expect, assert } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
function getSecondsOfDays(day: number) {
  return day * 24 * 60 * 60;
}
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

    const baseUri = "https://resources.zoth.io/metadata/6";
    const withdrawPenaltyPercent = 30;
    const hotPeriod = 5;
    const poolName = "Zoth Pool #2";
    const poolSymbol = "ZP2";
    const minLockingPeriod = getSecondsOfDays(30);
    const maxLockingPeriod = getSecondsOfDays(365);
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
    const ZothTestLP = await zothTestLPContract
      .connect(poolmanager)
      .deploy(
        whitelistManagerAddress,
        withdrawPenaltyPercent,
        poolName,
        poolSymbol,
        baseUri,
        hotPeriod,
        tokenAddresses,
        minLockingPeriod,
        maxLockingPeriod
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
      expect(await ZothTestLP.tokenAddresses(0)).to.be.equal(tokenAddresses[0]);
    });

    it("[Deposit Function Testing] : Should not deposit if not whitelisted", async () => {
      const { ZothTestLP, otherAccount, tokenAddresses } = await loadFixture(
        runEveryTime
      );

      await expect(
        ZothTestLP.connect(otherAccount).depositByLockingPeriod(200, 0, 0)
      ).revertedWithCustomError(ZothTestLP, "Unauthorized");
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

      const spender_amount = ethers.parseUnits("1000", 18);
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
        ethers.parseUnits("400", 18),
        getSecondsOfDays(30),
        0 // 1st token address
      );
      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("600", 18),
        getSecondsOfDays(50),
        1 // 2st token address
      );

      expect(await testUSDC1.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("600", 18)
      );
      expect(await testUSDC2.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("400", 18)
      );
    });

    it("[Deposit Function Testing] : Should not deposit with below or above limit of locking Duration", async () => {
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

      const spender_amount = ethers.parseUnits("1000000000", 6);

      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await expect(
        ZothTestLP.connect(otherAccount).depositByLockingPeriod(
          ethers.parseUnits("400", 6),
          getSecondsOfDays(20),
          2
        )
      ).revertedWith("Locking period below minimum allowed");

      await expect(
        ZothTestLP.connect(otherAccount).depositByLockingPeriod(
          ethers.parseUnits("400", 6),
          getSecondsOfDays(366),
          2
        )
      ).revertedWith("Locking period exceeds maximum allowed");
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

      const spender_amount = ethers.parseUnits("1000", 6);
      console.log(spender_amount);
      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        getSecondsOfDays(40),
        2
      );
      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 6),
        getSecondsOfDays(50),
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

      const spender_amount = ethers.parseUnits("1000", 18);
      await testUSDC3
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

      await ZothTestLP.connect(owner).setWithdrawRate(10);

      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 18),
        getSecondsOfDays(40),
        2
      );
      console.log(
        "After Deposit Balance",
        await testUSDC3.balanceOf(zothTestLPAddress)
      );

      // here amount 1600
      const unlockTime = (await time.latest()) + getSecondsOfDays(30);

      await time.increaseTo(unlockTime);

      await ZothTestLP.connect(otherAccount).emergencyWithdraw(0);

      expect(await testUSDC3.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits("960", 18)
      );
    });

    it("[Withdraw Testing] : Should withdraw by ID", async () => {
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

      const spender_amount = ethers.parseUnits("1000", 18);
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
        ethers.parseUnits("200", 18),
        getSecondsOfDays(90),
        2
      );

      console.log(
        "Balance After: ",
        await testUSDC3.balanceOf(otherAccount.address)
      );

      const unlockTime = (await time.latest()) + getSecondsOfDays(100);

      await time.increaseTo(unlockTime);

      await ZothTestLP.connect(otherAccount).withdrawUsingDepositId(0);

      console.log(
        "Balance After Withdraw: ",
        await testUSDC3.balanceOf(otherAccount.address)
      );

      console.log(await testUSDC3.balanceOf(zothTestLPAddress));
      // 1000 USDC + Reward : 3287671/1e6 = 3.287USDC + 1000USDC = 1003.287USDC
      expect(await testUSDC3.balanceOf(otherAccount.address)).to.equal(
        "1005917808219178082191"
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

      const spender_amount = ethers.parseUnits("1000", 18);
      await testUSDC1
        .connect(otherAccount)
        .approve(zothTestLPAddress, spender_amount);

        
      await whitelistManager
        .connect(verifier)
        .addWhitelist(otherAccount.address);

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 18),
        getSecondsOfDays(40),
        0
      );

      await ZothTestLP.connect(otherAccount).depositByLockingPeriod(
        ethers.parseUnits("400", 18),
        getSecondsOfDays(50),
        0
      );

      await ZothTestLP.connect(fundmanager)._transfer(
        ethers.parseUnits("200", 18),
        owner.address,
        0
      );

      expect(await testUSDC1.balanceOf(zothTestLPAddress)).to.equal(
        ethers.parseUnits("1600", 18)
      );
    });

    it("[Testing] : Reinvest function Testing ", async () => {
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
        fundmanager,
      } = await loadFixture(runEveryTime);

      const spender_amount = ethers.parseUnits("1000", 18);
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
        ethers.parseUnits("400", 18),
        getSecondsOfDays(90),
        2
      );

      let unlockTime = (await time.latest()) + getSecondsOfDays(100);

      await time.increaseTo(unlockTime);

      //two months passed and reinvesting

      await ZothTestLP.connect(fundmanager).reInvest(
        otherAccount.address,
        0,
        ethers.parseUnits("200", 18)
      );
    });




  });
});
