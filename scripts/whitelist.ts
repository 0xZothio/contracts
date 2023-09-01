import { ethers } from "hardhat";

const main = async () => {
  const signer = await ethers.getSigners();
  console.log("OWNER ADDRESS : ", signer[0].address);
  const contract = await ethers.getContractAt(
    "ZothTestLPMultiFreq",
    "0xeA4b8600F138De3F5765623eb1c21B13A5c034aA"
  );

  const tx = await contract.addWhitelistAddress(
    "0xD6Ae0DC9AdC701b66eD922072B4c08Ea5E7cBCf2"
  );
  await tx.wait();
  console.log(tx);
};

main();
