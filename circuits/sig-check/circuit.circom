include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../../node_modules/circomlib/circuits/eddsa.circom"
include "../../node_modules/circomlib/circuits/bitify.circom"


template Main(n) {
  signal private input publicKey[256];
  signal input hashes[n];
  signal private input sigR8[256];
  signal input sigS;
  signal input message;

  component mimc = MiMCSponge(256, 220, 1);
  for (var i=0; i<256; i++) {
    mimc.ins[i] <== publicKey[i];
  }
  mimc.k <== 0;

  signal poly[n+1];
  var check[n];
  poly[0] <== 1;
  for (var i=0; i<n; i++) {
    check[i] = mimc.outs[0] - hashes[i];
    poly[i+1] <== poly[i] * check[i];
  }
  poly[n] === 0;

  component eddsa = EdDSAVerifier(256);

  component bits1 = Num2Bits(256);
  component bits2 = Num2Bits(256);

  bits1.in <== sigS;
  bits2.in <== message;
  for (var i=0; i<256; i++) {
    publicKey[i] ==> eddsa.A[i];
    sigR8[i] ==> eddsa.R8[i];
    bits1.out[i] ==> eddsa.S[i];
    bits2.out[i] ==> eddsa.msg[i];
  }
}

component main = Main(1);
