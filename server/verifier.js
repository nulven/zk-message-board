const fs = require('fs');
const snarkjs = require('snarkjs');

async function verifyKey(proof, publicSignals) {
  const vKey = await new Promise((resolve, reject) => {
    fs.readFile("/circuits/keys/hash-check/verification_key.json", (err, data) => {
      resolve(data.json());
    });
  });

  console.log(vKey);

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

async function verifySignature(proof, publicSignals) {
  const vKey = await new Promise((resolve, reject) => {
    fs.readFile(__dirname + "/../circuits/keys/sig-check/verification_key.json", (err, data) => {
      resolve(JSON.parse(data.toString()));
    });
  });

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

module.exports = {
  verifyKey,
  verifySignature
};
