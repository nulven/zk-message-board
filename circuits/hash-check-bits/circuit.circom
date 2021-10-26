include "../../node_modules/circomlib/circuits/mimcsponge.circom"

template Main() {
  signal private input x[256];

  signal output out;

  component mimc = MiMCSponge(256, 220, 1);
  for (var i=0; i<256; i++) {
    x[i] ==> mimc.ins[i];
  }
  mimc.k <== 0;

  out <== mimc.outs[0];
}

component main = Main();
