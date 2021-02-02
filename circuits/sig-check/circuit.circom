include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../../node_modules/circomlib/circuits/eddsa.circom"
include "../../node_modules/circomlib/circuits/bitify.circom"


template Main(n) {
  signal input publicKey;
  signal input hashes[n];
  signal input sig[2];
  signal input message;

  signal output messageOut[256];

  /*
  component mimc = MiMCSponge(1, 220, 1);
  mimc.ins[0] <== publicKey;
  mimc.k <== 0;

  signal poly[n+1];
  var check[n];
  poly[0] <== 1;
  for (i=0; i<n; i++) {
    check[i] = mimc.outs[0] - hashes[i];
    poly[i+1] <== poly[i] * check[i];
  }
  poly[n] === 0;
  */

  component eddsa = EdDSAVerifier(312);

  component bits1 = Num2Bits(256);
  component bits2 = Num2Bits(256);
  component bits3 = Num2Bits(256);
  component bits4 = Num2Bits(312);

  bits1.in <== publicKey;
  bits2.in <== sig[0];
  bits3.in <== sig[1];
  bits4.in <== message;
  for (var i=0; i<256; i++) {
    bits1.out[i] ==> eddsa.A[i];
    bits1.out[i] ==> messageOut[i];
    bits2.out[i] ==> eddsa.R8[i];
    bits3.out[i] ==> eddsa.S[i];
  }
  for (var i=0; i<312; i++) {
    bits4.out[i] ==> eddsa.msg[i];
  }
}

component main = Main(1);
