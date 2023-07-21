import { ethers } from "hardhat";

const main = async () => {
  const signer = await ethers.getSigners();
  console.log("OWNER ADDRESS : ", signer[0].address);
  const contract = await ethers.getContractAt(
    "ZothTestLP",
    "0xf5377a689b7abb6a31212cc02094a24a686da033"
  );

  const tx = await contract.addWhitelistAddress(
    "0xD6Ae0DC9AdC701b66eD922072B4c08Ea5E7cBCf2"
  );
  await tx.wait();
  console.log(tx);
};

main();
