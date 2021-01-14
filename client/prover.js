export async function calculateProof(preImage, hash) {
  const { proof, publicSignals } =
    await snarkjs.groth16.fullProve({ x: preImage, hash: hash.toString() }, "/circuits/circuits-compiled/hash/circuit.wasm", "/circuits/keys/hash/circuit_final.zkey");

    const vKey = await fetch("/circuits/keys/hash/verification_key.json").then(function(res) {
      return res.json();
    });

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

export async function verifyKey(key, poll) {
  const { proof, publicSignals } = 
    await snarkjs.groth16.fullProve({ x: key, hash: poll.users }, "/circuits/circuits-compiled/hash-check/circuit.wasm", "/circuits/keys/hash-check/circuit_final.zkey");

  const vKey = await fetch("/circuits/keys/hash-check/verification_key.json").then(function(res) {
    return res.json();
  });

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

export async function proveKey(publicKey, poll) {
  // prove that you have a public key registered for the poll
  const { proof, publicSignals } = 
    await snarkjs.groth16.fullProve({ x: publicKey, hash: poll.users }, "/circuits/circuits-compiled/hash-check/circuit.wasm", "/circuits/keys/hash-check/circuit_final.zkey");

  return { proof, publicSignals };
}

export async function proveSignature(publicKey, publicKey2, hashes, sigR8, sig, message) {
  // prove that the signature is produced by the private key of the given public key
  const { proof, publicSignals } = 
    await snarkjs.groth16.fullProve({ publicKey, publicKey2, hashes, sigR8, sig, message }, "/circuits/circuits-compiled/sig-check/circuit.wasm", "/circuits/keys/sig-check/circuit_final.zkey");

  return { proof, publicSignals };
}

export async function verifySignature(publicKey, publicKey2, hashes, sigR8, sig, message) {
  const { proof, publicSignals } = 
    await snarkjs.groth16.fullProve({ publicKey, publicKey2, hashes, sigR8, sig, message }, "/circuits/circuits-compiled/sig-check/circuit.wasm", "/circuits/keys/sig-check/circuit_final.zkey");

  const vKey = await fetch("/circuits/keys/sig-check/verification_key.json").then(function(res) {
    return res.json();
  });

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}
