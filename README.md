# Zero Knowledge Message Board

A public message board, hosted on a solidity contract, that uses ZK-SNARKS to allow a user to register their identity as a member of a group and post messages on behalf of the group without revealing their identity. Currently, this implementation is only semi-decentralized as it uses a central server to send the transactions on behalf of the user, but there are ways to change this with a little more effort.

## Setup

Circom 2.0 is a Rust program that has to be built from source:

* `git clone https://github.com/iden3/circom.git`
* `cd circom`
* `cargo build --release`
* `cargo install --path circom  # installs to ~/.cargo/bin/`

Use Node v14. If you don't have it, do:

* `nvm install lts/fermium`
* `node -v # 14.x.x`

Install dependencies:

* `yarn`

## Run

### Compile Circuits and Contracts

Compile the circuits to create the witness and keys:

* `yarn compile:circuits -c hash-check -p 15`
* `yarn compile:circuits -c hash-check-bits -p 20`
* `yarn compile:circuits -c sig-check -p 20`

Create the `Verifier` library with the SNARK verification keys:

* `yarn compile:verifier`

Generate the solidity contracts:

* `yarn compile:solidity`

### Deploy Contracts and Run the Client

#### Local

Start a local ethereum node:

* `echo "MNEMONIC=$(bip39)" >> .env`
* `yarn chain`

Deploy the contracts:

* `yarn deploy:local`

Run the client watcher and http server:

* `yarn dev`

#### (Ropsten | Rinkeby)

Deploy the contracts to the Ropsten or Rinkeby testnet:

* `yarn deploy:ropsten` or `yarn deploy:rinkeby`

Run the client watcher and http server:

* `yarn prod`

Browse [localhost:8080](http://localhost:8080).

## Circuits

| Circuit Name | Private Inputs | Public Inputs | Outputs | Description |
| ------------ | -------------- | ------------- | ------- | ----------- |
| `hash-check` | `x`            | `hash`        | `out`   | Checks if `MiMC(x) = hash`; outputs `MiMC(x)` |
| `hash-check-bits` | `x` (256-bit list) | `hash` | `out` | Checks if `MiMC(x) = hash`; outputs `MiMC(x)` |
| `sig-check`  | `publicKey`    | `hashes`, `sig`, `message` | None | Checks `eddsa_verify(publicKey, sig, message) == true`; checks `MiMIC(publicKey)` is in list `hashes` |

### 'hash-check'

| Inputs  | Private | Type            | Description         |
| ------- | ------- | --------------- | ------------------- |
| 'x'     | Yes     | 256-bit integer | MiMC hash pre-image |
| 'hash'  | No      | 256-bit integer | MiMC hash           |

### 'hash-check-bits'

| Inputs | Private | Type            | Description         |
| ------ | ------- | --------------- | ------------------- |
| 'x'    | Yes     | 256-bit array   | MiMC hash pre-image |
| 'hash' | No      | 256-bit integer | MiMC hash           |

### 'sig-check'

| Inputs      | Private | Type               | Description |
| ----------- | ------- | ------------------ | ----------- |
| 'publicKey' | Yes     | 256-bit            | EdDSA public key |
| 'hashes'    | No      | `[]`               | Registered public key hashes |
| 'sig'       | No      | 2-by-256-bit array | EdDSA signature |
| 'message'   | No      | 312-bit array      | binary representation of the MiMC hash of the message |

## Example Use

```javascript
import { babyJub, eddsa } from 'circomlib';
import mimc from 'client/utils/mimc';

function buffer2bits(buff) {
    const res = [];
    for (let i=0; i<buff.length; i++) {
        for (let j=0; j<8; j++) {
            if ((buff[i]>>j)&1) {
                res.push('1');
            } else {
                res.push('0');
            }
        }
    }
    return res;
}

const message = mimc(1234).toString().padStart(78, '0');
const msg = Buffer.from(message, "hex");

const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");

const pubKey = eddsa.prv2pub(prvKey);

const pPubKey = babyJub.packPoint(pubKey);

const signature = eddsa.sign(prvKey, msg);

const pSignature = eddsa.packSignature(signature);

const aBits = buffer2bits(pPubKey);
const rBits = buffer2bits(pSignature.slice(0, 32));
const sBits = buffer2bits(pSignature.slice(32, 64));
const msgBits = buffer2bits(msg);

const sig = [rBits, sBits];

const hash = mimc(...aBits).toString();

const inputs = { publicKey: aBits, hashes: [hash], signature: sig, message: msgBits };
```

## Add A Circuit

Make a new directory `circuits/${CIRCUIT_NAME}/` where `CIRCUIT_NAME` is the name of the circuit.

In the new directory, create `circuit.circom` with the circuit & `input.json` with the test inputs.

Run `yarn compile:circuits -c ${CIRCUIT_NAME} -d`, if that doesn't work `yarn compile:circuits -c ${CIRCUIT_NAME} -p 20 -d`. In development, if it complains about `$beacon` being undefined, omit `-d`.

If the circuit and input produce a valid proof, you should see `OK`.

The compiled `circuit.wasm` file will be in `build/circuits/${CIRCUIT_NAME}/circuit_js/`.
The proof key, `circuit_final.zkey`, and verification key, `verification_key.json`, will be found in `build/keys/${CIRCUIT_NAME}/`.

An example of creating and verifying a new proof in Node can be found in `client/prover.js`.

## How It Works

1. User generates EdDSA key pair `(pk, sk)` and sends the MiMC hash to the server `H(pk)`.
2. To vote, the user first proves they're registered to the poll by sending a snark proving that they have a public key `pk` to one of the recorded MiMC hashes.
3. Then, the user sends an EdDSA signature of the vote and a snark proving that the signature was produced by the private key associated with the public key they just verified.

Valid `sig = EdDSA(sk, msg)`
where `pk = private2public(sk)`
and `H(pk)` is a recorded hash.
