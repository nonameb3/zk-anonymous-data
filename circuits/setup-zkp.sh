#!/bin/bash

# ZK Anonymous Data Circuit Setup Script
# This script runs steps 2-4 from the README.md

set -e  # Exit on any error

echo "Starting ZK circuit setup..."

# Step 2: Compile the Circuit
echo "Step 2: Compiling the circuit..."
circom ./preimage.circom --r1cs --wasm --sym -o .
echo "✓ Circuit compiled successfully"

# Step 3: Generate Trusted Setup
echo "Step 3: Generating trusted setup..."

# Download powersOfTau28_hez_final_10.ptau if it doesn't exist
if [ ! -f "powersOfTau28_hez_final_10.ptau" ]; then
    echo "Downloading powersOfTau28_hez_final_10.ptau..."
    curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau -o powersOfTau28_hez_final_10.ptau
fi

# Generate proving and verification keys
echo "Generating proving and verification keys..."
snarkjs groth16 setup preimage.r1cs powersOfTau28_hez_final_10.ptau preimage_0000.zkey
snarkjs zkey contribute preimage_0000.zkey preimage_0001.zkey --name="Second contribution" -v
snarkjs zkey export verificationkey preimage_0001.zkey vkey.json
echo "✓ Trusted setup completed"

# Step 4: Export Verifier Contract
echo "Step 4: Exporting verifier contract..."
snarkjs zkey export solidityverifier preimage_0001.zkey ../contracts/Groth16Verifier.sol
echo "✓ Verifier contract exported"

echo "ZK circuit setup completed successfully!"
echo "Generated files:"
echo "  - preimage.r1cs"
echo "  - preimage_js/preimage.wasm"
echo "  - preimage_js/witness_calculator.js"
echo "  - preimage_0001.zkey"
echo "  - vkey.json"
echo "  - ../contracts/Verifier.sol"