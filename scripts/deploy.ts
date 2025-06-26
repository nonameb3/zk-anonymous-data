import { ethers } from "hardhat";

async function main() {
  // Deploy the Verifier contract
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  console.log("Verifier deployed to:", await verifier.getAddress());

  // Deploy the AnonymousData contract with the Verifier address
  const AnonymousData = await ethers.getContractFactory("AnonymousData");
  const anonymousData = await AnonymousData.deploy(await verifier.getAddress());
  await anonymousData.waitForDeployment();
  console.log("AnonymousData deployed to:", await anonymousData.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  