const fs = require('fs');
const snarkjs = require('snarkjs');


const circuitPath = '/circuits/circuits-compiled/';
const keyPath = '/circuits/keys/';

// HELPERS
async function verify(circuit, proof, publicSignals) {
  const vKey = await new Promise((resolve, reject) => {
    fs.readFile(
      __dirname + '/../' + keyPath + circuit + '/verification_key.json',
      (err, data) => {
        resolve(JSON.parse(data.toString()));
      });
    });

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

// VERIFIERS
async function verifyKey(proof, publicSignals) {
  return verify('hash-check', proof, publicSignals);
}

async function verifySignature(proof, publicSignals) {
  return verify('sig-check', proof, publicSignals);
}

module.exports = {
  verifyKey,
  verifySignature
};
