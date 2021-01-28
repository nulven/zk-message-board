include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../../node_modules/circomlib/circuits/eddsa.circom"


template Main(n) {
  signal private input publicKey[256];
  signal input hashes[n];
  signal input sig[2][256];
  signal input message[312];

  var i;
  component mimc = MiMCSponge(256, 220, 1);
  for (i=0; i<256; i++) {
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

  component eddsa = EdDSAVerifier(312);

  for (i=0; i<312; i++) {
    message[i] ==> eddsa.msg[i];
  }
  for (i=0; i<256; i++) {
    sig[0][i] ==> eddsa.R8[i];
    sig[1][i] ==> eddsa.S[i];
    publicKey[i] ==> eddsa.A[i];
  }
}

component main = Main(1);
