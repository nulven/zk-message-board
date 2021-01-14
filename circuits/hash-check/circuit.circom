include "../../node_modules/circomlib/circuits/mimcsponge.circom"


template HashCheck(n) {
  signal input key;
  signal input hashes[n];

  component mimc = MiMCSponge(1, 220, 1);
  mimc.ins[0] <== key;
  mimc.k <== 0;
  var out = mimc.outs[0];

  signal poly[n+1];
  var check[n];
  poly[0] <== 1;
  for (var i=0; i<n; i++) {
    check[i] = out - hashes[i];
    poly[i+1] <== poly[i] * check[i];
  }

  poly[n] === 0;
}

component main = HashCheck(1);
