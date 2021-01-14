# ZK MiMC Hash Verifier

## Setup and Run
Use Node v14
```
npm install
```

Run the local server
```
npm run server
```


## Add a circuit
Make a new directory in `/circuits/` with the name of the circuit.

Copy the `pot15_final.ptau` file from `/circuits/hash` into the new directory.

In the new directory, create `circuit.circom` and `input.json` with the test inputs.

Run `npm run compile CIRCUIT_NAME`.
If the circuit and input produce a valid proof you should see `OK`.

The compiled `circuit.wasm` file will be in `/circuits/circuits-compiled/CIRCUIT_NAME`.
The proof key `circuit_final.zkey` and the verification key `verification_key.json` will be found in `/circuits/keys/CIRCUIT_NAME`.

An example of creating and verifying a new proof in Node can be found in `/client/prover.js`.


## How it works
1. User generates EdDSA key pair `(pk, sk)` and sends the MiMC hash to the server `H(pk)`.
2. To vote, the user first proves they're registered to the poll by sending a snark proving that they have the public key `pk` to one of the recorded MiMC hashes.
3. Then, the user sends an EdDSA signature of the vote and a snark proving that the signature was produced by the private key associated with the public key they just verified.

## Poll Database
All of the poll information is stored locally in `.txt` files.

`/server/polls` stores the data in separate files named `POLL_ID.txt`, where the first line is as follows
```
POLL_ID,TITLE,MAX_USERS
```

Each line after this is a MiMC hash of a user who registered with the poll.

`/server/votes` stores the vote in separate files named `POLL_ID.txt`, where each line represents one vote
```
VOTE,SIGNATURE
```
