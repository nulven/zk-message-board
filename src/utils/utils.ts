import { eddsa, babyJub } from 'circomlib';
const { prv2pub, sign } = eddsa;
import bigInt from 'big-integer';
import { BigInteger} from 'big-integer';


export function generateKey() {
  const privateKey = Math.floor(Math.random()*1000000);
  const publicKey = prv2pub(privateKey.toString());
  return { publicKey, privateKey };
}

export function randpassword() {
  return Math.floor(Math.random() * 100000000000).toString();
}
