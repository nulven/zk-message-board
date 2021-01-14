include "../../node_modules/circomlib/circuits/bitify.circom"
include "../../node_modules/circomlib/circuits/mimcsponge.circom"
include "../../node_modules/circomlib/circuits/compconstant.circom";
include "../../node_modules/circomlib/circuits/pointbits.circom";
include "../../node_modules/circomlib/circuits/pedersen.circom";
include "../../node_modules/circomlib/circuits/escalarmulany.circom";
include "../../node_modules/circomlib/circuits/escalarmulfix.circom";

template Bits2Point_Stric() {
    signal input in[256];
    signal output out[2];

    var i;

    // Check aliasing
    /*
    component aliasCheckY = AliasCheck();
    for (i=0; i<254; i++) {
        aliasCheckY.in[i] <== in[i];
    }
    in[254] === 0;
    */

    component b2nY = Bits2Num(254);
    for (i=0; i<254; i++) {
        b2nY.in[i] <== in[i];
    }

    out[1] <== b2nY.out;

    var a = 168700;
    var d = 168696;

    var y2 = out[1] * out[1];

    var x = sqrt(   (1-y2)/(a - d*y2)  );

    if (in[255] == 1) x = -x;

    out[0] <-- x;
  
    /*
    component babyCheck = BabyCheck();
    babyCheck.x <== out[0];
    babyCheck.y <== out[1];
    */

    /*
    component n2bX = Num2Bits(254);
    n2bX.in <== out[0];
    component aliasCheckX = AliasCheck();
    for (i=0; i<254; i++) {
        aliasCheckX.in[i] <== n2bX.out[i];
    }

    component signCalc = CompConstant(10944121435919637611123202872628637544274182200208017171849102093287904247808);
    for (i=0; i<254; i++) {
        signCalc.in[i] <== n2bX.out[i];
    }

    signCalc.out === in[255];
    */
}

template EdDSAVerifier(n) {
    signal input msg[n];

    signal input A[256];
    signal input R8[256];
    signal input S[256];

    signal Ax;
    signal Ay;

    signal R8x;
    signal R8y;

    var i;

    1 === 1;
// Ensure S<Subgroup Order
    component  compConstant = CompConstant(2736030358979909402780800718157159386076813972158567259200215660948447373040);

    for (i=0; i<254; i++) {
        S[i] ==> compConstant.in[i];
    }
    compConstant.out === 0;
    S[254] === 0;
    S[255] === 0;

// Convert A to Field elements (And verify A)
    component bits2pointA = Bits2Point_Stric();

    for (i=0; i<256; i++) {
        bits2pointA.in[i] <-- A[i];
    }
    Ax <-- bits2pointA.out[0];
    Ay <-- bits2pointA.out[1];

// Convert R8 to Field elements (And verify R8)
    component bits2pointR8 = Bits2Point_Stric();

    for (i=0; i<256; i++) {
        bits2pointR8.in[i] <-- R8[i];
    }
    R8x <-- bits2pointR8.out[0];
    R8y <-- bits2pointR8.out[1];

// Calculate the h = H(R,A, msg)
    component hash = Pedersen(512+n);

    for (i=0; i<256; i++) {
        hash.in[i] <== R8[i];
        hash.in[256+i] <== A[i];
    }
    for (i=0; i<n; i++) {
        hash.in[512+i] <== msg[i];
    }

    component point2bitsH = Point2Bits_Strict();
    point2bitsH.in[0] <== hash.out[0];
    point2bitsH.in[1] <== hash.out[1];

// Calculate second part of the right side:  right2 = h*8*A
    // Multiply by 8 by adding it 3 times.  This also ensure that the result is in
    // the subgroup.
    component dbl1 = BabyDbl();
    dbl1.x <== Ax;
    dbl1.y <== Ay;
    component dbl2 = BabyDbl();
    dbl2.x <== dbl1.xout;
    dbl2.y <== dbl1.yout;
    component dbl3 = BabyDbl();
    dbl3.x <== dbl2.xout;
    dbl3.y <== dbl2.yout;

    // We check that A is not zero.
    component isZero = IsZero();
    isZero.in <== dbl3.x;
    isZero.out === 0;

    component mulAny = EscalarMulAny(256);
    for (i=0; i<256; i++) {
        mulAny.e[i] <== point2bitsH.out[i];
    }
    mulAny.p[0] <== dbl3.xout;
    mulAny.p[1] <== dbl3.yout;

// Compute the right side: right =  R8 + right2
    component addRight = BabyAdd();
    addRight.x1 <== R8x;
    addRight.y1 <== R8y;
    addRight.x2 <== mulAny.out[0];
    addRight.y2 <== mulAny.out[1];

// Calculate left side of equation left = S*B8
    var BASE8[2] = [
        5299619240641551281634865583518297030282874472190772894086521144482721001553,
        16950150798460657717958625567821834550301663161624707787222815936182638968203
    ];
    component mulFix = EscalarMulFix(256, BASE8);
    for (i=0; i<256; i++) {
        mulFix.e[i] <== S[i];
    }

// Do the comparation left == right

    // mulFix.out[0] === addRight.xout;
    // mulFix.out[1] === addRight.yout;
}

template Main(n) {
  signal private input publicKey[256];
  signal private input publicKey2;
  signal input hashes[n];
  signal input sigR8[256];
  signal input sig;
  signal input message;

  component mimc = MiMCSponge(1, 220, 1);
  mimc.ins[0] <== publicKey2;
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

  component bin1 = Num2Bits(256);
  //component bin2 = Num2Bits(256);
  component bin3 = Num2Bits(256);
  //component bin4 = Num2Bits(256);

  bin1.in <== message;
  //bin2.in <== sigR8;
  bin3.in <== sig;
  //bin4.in <== publicKey;

  component eddsa = EdDSAVerifier(256);

  var i;
  for (i=0; i<256; i++) {
    bin1.out[i] ==> eddsa.msg[i];
  }
  for (i=0; i<256; i++) {
    sigR8[i] ==> eddsa.R8[i];
  }
  for (i=0; i<256; i++) {
    bin3.out[i] ==> eddsa.S[i];
  }
  for (i=0; i<256; i++) {
    publicKey[i] ==> eddsa.A[i];
  }
}

component main = Main(1);
