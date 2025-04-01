import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";

async function generateHash() {
  const poseidon = await buildPoseidon();
  const message = "my data";
  // Convert string to a numeric input (e.g., keccak256 hash)
  const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
  const numericInput = BigInt(messageHash); // Convert hex to BigInt
  const hash = poseidon([numericInput]); // Convert to Poseidon hash, zk-SNARKs
  console.log("Poseidon hash of 'my data':", poseidon.F.toString(hash));
  return { numericInput, hash: poseidon.F.toString(hash) };
}

generateHash().then(console.log);
