// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Verifier.sol";

contract AnonymousData {
    // The stored hash of the anonymous data (Poseidon hash)
    uint256 public storedHash;

    // Reference to the deployed Verifier contract
    Verifier public verifier;

    // Constructor to set the Verifier contract address
    constructor(address _verifier) {
        verifier = Verifier(_verifier);
    }

    // Function to store the hash of the anonymous data
    function setHash(uint256 _hash) public {
        storedHash = _hash;
    }

    // Function to verify a zk-SNARK proof without revealing the data
    function verifyKnowledge(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c
    ) public view returns (bool) {
        // The public input to the verifier is the stored hash
        uint256[1] memory input = [storedHash];
        return verifier.verifyProof(a, b, c, input);
    }
}
