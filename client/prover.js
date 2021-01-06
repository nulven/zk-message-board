export async function calculateProof(preImage, hash) {
  const { proof, publicSignals } =
    await snarkjs.groth16.fullProve({ x: preImage, hash: hash.toString() }, "/circuits/circuits-compiled/hash/circuit.wasm", "/circuits/keys/hash/circuit_final.zkey");

    const vKey = await fetch("/circuits/keys/hash/verification_key.json").then(function(res) {
      return res.json();
    });

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}
