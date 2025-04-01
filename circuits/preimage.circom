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