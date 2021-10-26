import {
  signMessage,
  hash,
  prepareHashBitsInput,
} from './crypto';
import {
  proveHash,
  proveHashBits,
  proveSignature,
  verifyHash,
  verifyHashBits,
  verifySignature,
} from './prover';
import { generateKey } from './utils';
import { saveGroup } from './storage';
import eth from './ethAPI';

export async function createMessage(
  message: string,
  privateKey: BigInt,
  publicKey: BigInt[],
  group: string,
) {
  const {
    pubKey,
    sigR8,
    sigR8Halves,
    sigS,
    m,
  } = signMessage(message, privateKey, publicKey);

  return new Promise(resolve => {
    eth.api.getGroupHashes(group).then(async (hashes) => {
      const proof = await proveSignature(
        pubKey,
        hashes,
        sigR8,
        sigR8Halves,
        sigS,
        m,
      );
      const verified = await verifySignature(proof);
      if (verified) {
        console.log('Valid Proof');
      } else {
        console.log('Invalid Proof');
      }

      eth.api.recordConfession(
        message,
        proof.proof,
        proof.publicSignals,
        group,
      ).then(resolve);
    });
  });
}

export async function registerUser(password: BigInt, group: any): Promise<any> {
  const passwordHash = hash(password.toString()).toString();
  return new Promise(async (resolve, reject) => {
    if (passwordHash === group.passwordHash) {
      const passwordProof = await proveHash(password, passwordHash);

      const { publicKey, privateKey } = generateKey();
      const aBits = prepareHashBitsInput(publicKey);
      const keyProof = await proveHashBits(aBits);
      const verify = await verifyHashBits(keyProof);

      eth.api.addGroupMember(
        group.name,
        keyProof.proof,
        keyProof.publicSignals,
        passwordProof.proof,
        passwordProof.publicSignals,
      )
      .then(() => {
        saveGroup(group, publicKey, BigInt(privateKey));
        resolve({
          publicKey,
          privateKey,
        });
      });
    } else {
      reject('Incorrect password');
    }
  });
}
