import { utils } from 'ffjavascript';
import mimc from '../utils/mimc';
import { babyJub, eddsa } from 'circomlib';
const { unpackPoint, packPoint } = babyJub;
const { verify, packSignature, sign, prv2pub } = eddsa;

function buffer2bits(buff) {
  const res = [];
  for (let i = 0; i < buff.length; i++) {
    for (let j = 0; j < 8; j++) {
      if ((buff[i] >> j) & 1) {
        res.push('1');
      } else {
        res.push('0');
      }
    }
  }
  return res;
}

export function signMessage(message: string, privateKey: BigInt, publicKey: BigInt[]) {
  const msgBuff = Buffer.from(message);
  const messageBits = buffer2bits(msgBuff);
  var messageHash = BigInt(mimc(...messageBits)).toString(16);
  if (messageHash.length % 2) {
    messageHash = '0' + messageHash;
  }
  const msg = Buffer.from(messageHash, 'hex');

  const pPublicKey = packPoint(publicKey);

  const signature = sign(privateKey, msg);
  const pSignature = packSignature(signature);

  const aBits = buffer2bits(pPublicKey);
  const rBits = buffer2bits(pSignature.slice(0, 32));
  const rBits1 = buffer2bits(pSignature.slice(0,16));
  const rBits2 = buffer2bits(pSignature.slice(16));
  const sBits = buffer2bits(pSignature.slice(32, 64));
  const msgBits = buffer2bits(msg);
  //const a = utils.leBuff2int(pPublicKey);
  const r = utils.leBuff2int(pSignature.slice(0,32));
  const r1 = utils.leBuff2int(pSignature.slice(0,16));
  const r2 = utils.leBuff2int(pSignature.slice(16));
  const s = utils.leBuff2int(pSignature.slice(32,64));
  const m = utils.leBuff2int(msg);
  const r8half1 = utils.leBuff2int(pSignature.slice(0, 16));
  const r8half2 = utils.leBuff2int(pSignature.slice(16, 32));
  const r8halves = [r8half1, r8half2];

  return {
    pubKey: aBits,
    sigR8: rBits,
    sigR8Halves: r8halves,
    sigS: s,
    m,
  };
}

export function hash(...preimage: any[]) {
  return mimc(...preimage);
}

export function prepareHashBitsInput(publicKey) {
  const pPubKey = packPoint(publicKey);
  const aBits = buffer2bits(pPubKey);
  return aBits;
}
