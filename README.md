# zk-anonymous-data

This project demonstrates a zero-knowledge proof (zk-SNARK) system using circom and snarkjs to anonymously prove knowledge of a secret preimage (e.g., "my data") that hashes to a public value via Poseidon. The proof is verified both off-chain and on-chain using Hardhat and Solidity contracts on the hardhat local network.

## Overview

- **Circuit**: `preimage.circom` proves that a secret data hashes to a public hash using Poseidon.
- **Contracts**:
  - `Verifier.sol`: Verifies the zk-SNARK proof.
  - `AnonymousData.sol`: Stores the public hash and calls the verifier.
- **Scripts**:
  - `genHash.ts`: Generates Poseidon hashes from strings.
  - `zk-proof.ts`: Deploys and verifies proofs on-chain.
- **Tools**: circom, snarkjs, hardhat, ethers.js.

## Prerequisites

- **Node.js**: v22.14.0 or compatible.
- **pnpm**: Package manager.
- **circom**: 2.1.9 (`pnpm install -g circom@latest`).
- **snarkjs**: `pnpm install -g snarkjs`.
- **Hardhat**: `pnpm install --save-dev hardhat`.
- **circomlibjs**: `pnpm install circomlibjs`.
- **ethers**: `pnpm install ethers`.

## Project Structure

```
zk-age-proof/
├── circuits/
│   ├── preimage.circom        # Circuit definition
│   ├── preimage.r1cs          # Compiled R1CS
│   ├── preimage_0001.zkey     # Proving key
│   ├── preimage_js/           # WASM and witness calculator
│   ├── proof.json             # Generated proof
│   ├── public.json            # Public signals
│   └── witness.wtns           # Witness file
├── contracts/
│   ├── Groth16Verifier.sol    # Verifier contract
│   └── AnonymousData.sol      # Main contract
├── scripts/
│   ├── deploy.ts              # Deployment script
│   └── zk-proof.ts            # Proof verification script
├── src/
│   └── genHash.ts             # Hash generation script
├── input.json                 # Circuit input
├── package.json               # Dependencies and scripts
└── hardhat.config.ts          # Hardhat configuration
```

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### Setup ZK Circuit

Run the automated setup script:

```bash
./circuits/setup-zkp.sh
```

This handles steps 1: circuit compilation, trusted setup, and verifier contract export.

## Usage

### 1. Generate a Poseidon Hash

Convert a string (e.g., "my data") to a numeric input and hash it:

```bash
ts-node src/genHash.ts
```

Example output:

```
Poseidon hash of 'my data': 18109157522940068184081813510637317864605593149208014046583719981753370927176
{
  numericInput: 64250124162981311433942342436924436508529928367968110735116535229007559044401,
  hash: '18109157522940068184081813510637317864605593149208014046583719981753370927176'
}
```

### 2. Create Circuit Input

Update `input.json`:

```json
{
  "data": "64250124162981311433942342436924436508529928367968110735116535229007559044401",
  "hash": "18109157522940068184081813510637317864605593149208014046583719981753370927176"
}
```

### 3. Generate Witness and Proof from input.json

```bash
cd circuits
node preimage_js/generate_witness.js preimage_js/preimage.wasm ../input.json witness.wtns
snarkjs groth16 prove preimage_0001.zkey witness.wtns proof.json public.json
```

Outputs: `witness.wtns`, `proof.json`, `public.json`.

### 4. Verify Off-Chain

```bash
cd circuits
snarkjs groth16 verify vkey.json public.json proof.json
```

Expected: `[INFO] snarkJS: OK!`.

### 5. Run hardhat node
```bash
pnpm run node
```
Start hardhat node

### 5. Deploy Contracts

```bash
pnpm run deploy
```

Outputs contract addresses (e.g., Verifier: 0xd8E4Af..., AnonymousData: 0xE634d8...).
Update `zk-proof.ts` with the AnonymousData address.

### 6. Verify On-Chain

```bash
pnpm run proof
```

Expected output:
```
Verifier address: 0xd8E4Af...
Stored hash: 181091575...
Public signal: 181091575...
Proof valid: true
```

### 7. (Optional) Direct Verification Using the Verifier Contract

You can also interact directly with the Verifier contract to validate proofs:

```bash
# Generate the calldata for the verifyProof function
snarkjs generatecall
```

This command will output parameters that can be directly copy-pasted into the `verifyProof` method when interacting with the contract through tools like Remix or Etherscan.

Example output:
```
["0x2c5e...","0x1a52..."],
[["0x29e3...","0x1f49..."],["0x0d1d...","0x1a72..."]],
["0x0cd5...","0x1c42..."],
["0x1810..."]
```

Using these parameters with the `verifyProof` function should return `true` if the proof is valid. Changing even a single bit in these parameters will result in `false`.

## Files

### preimage.circom:

```circom
pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Preimage() {
    signal input data;
    signal input hash;
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== data;
    hash === poseidon.out;
}

component main {public [hash]} = Preimage();
```

### genHash.ts:

```typescript
import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";

async function generateHash() {
    const poseidon = await buildPoseidon();
    const message = "my data";
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
    const numericInput = BigInt(messageHash);
    const hash = poseidon([numericInput]);
    console.log("Poseidon hash of 'my data':", poseidon.F.toString(hash));
    return { numericInput, hash: poseidon.F.toString(hash) };
}

generateHash().then(console.log);
```

### zk-proof.ts:

```typescript
import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
    const contractAddress = "0xE634d83f8E016B04e51F2516e6086b5f238675C7";
    const anonymousData = await ethers.getContractAt("AnonymousData", contractAddress);

    const proof = JSON.parse(fs.readFileSync("circuits/proof.json", "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync("circuits/public.json", "utf8"));

    const pi_a: any = [proof.pi_a[0], proof.pi_a[1]];
    const pi_b: any = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
    ];
    const pi_c: any = [proof.pi_c[0], proof.pi_c[1]];

    await anonymousData.setHash(publicSignals[0]);
    const storedHash = await anonymousData.storedHash();
    console.log("Stored hash:", storedHash.toString());
    console.log("Public signal:", publicSignals[0]);

    const tx = await anonymousData.verifyKnowledge(pi_a, pi_b, pi_c);
    console.log("Proof valid:", tx);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
```

## Notes

- **Anonymity**: The data (e.g., "my data") is hidden; only its Poseidon hash is public.
- **Troubleshooting**:
  - Ensure `input.json` uses strings without `n` suffix.
  - Match `pi_b` order (`[y, x]`) with `Verifier.sol` expectations.
  - Network: Replace `local` with your network in `hardhat.config.ts`.

## License

MIT
# zk-anonymous-data
