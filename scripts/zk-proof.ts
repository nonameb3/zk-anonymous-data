import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const contractAddress = "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D"; // Update with new anonymous data contract address
  const anonymousData = await ethers.getContractAt("AnonymousData", contractAddress);

  console.log("Verifier address:", await anonymousData.verifier());

  const proof = JSON.parse(fs.readFileSync("circuits/proof.json", "utf8"));
  const publicSignals = JSON.parse(fs.readFileSync("circuits/public.json", "utf8"));

  const pi_a: any = [proof.pi_a[0], proof.pi_a[1]];
  const pi_b: any = [
    [proof.pi_b[0][1], proof.pi_b[0][0]], // Swap to match generatecall
    [proof.pi_b[1][1], proof.pi_b[1][0]],
  ];
  const pi_c: any = [proof.pi_c[0], proof.pi_c[1]];

  console.log("Transformed pi_a:", pi_a);
  console.log("Transformed pi_b:", pi_b);
  console.log("Transformed pi_c:", pi_c);

  const txSetHash = await anonymousData.setHash(publicSignals[0]);
  await txSetHash.wait();
  console.log("setHash tx hash:", txSetHash.hash);

  const storedHash = await anonymousData.storedHash();
  console.log("Stored hash:", storedHash.toString());
  console.log("Public signal:", publicSignals[0]);

  const staticResult = await anonymousData.verifyKnowledge.staticCall(pi_a, pi_b, pi_c);
  console.log("Static call result:", staticResult);

  const tx = await anonymousData.verifyKnowledge(pi_a, pi_b, pi_c);
  console.log("Proof valid:", tx);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
