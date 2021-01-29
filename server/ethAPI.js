const { Contract, ContractFactory, providers } = require("ethers");
const fetch = require("node-fetch");
const fs = require("fs");
const provider = new providers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();
const { mimcHash } = require('./mimc.js');
//const contract = await connect('CoreValidator');

async function connect(contractName) {
  const location = __dirname + "/../contracts/json/CoreValidator.json";
  const contractJSON = JSON.parse(fs.readFileSync(location)); // .json
  const contractABI = contractJSON.abi;
  const contractAddress = contractJSON.address;

  return new Contract(contractAddress, contractABI, signer);
}

async function runTests() {
  await this.coreValidator.createGroup("asdf", 1);
  console.log(await this.coreValidator.getConfessions());
  console.log(await this.coreValidator.getGroups());
  console.error("65");
  const sig_check_proof_json = JSON.parse(
    fs.readFileSync("json/sigCheckProof.json")
  );
  const sig_check_public_json = JSON.parse(
    fs.readFileSync("json/sigCheckPublic.json")
  );
  const hash_proof_json = JSON.parse(
    fs.readFileSync("json/sigCheckProof.json")
  );
  const hash_public_json = JSON.parse(
    fs.readFileSync("json/sigCheckPublic.json")
  );
  console.error("78");
  const pollName = "myPoll";
  const answerValid = await this.coreValidator.verifyAndStoreRegistration(
    ...callArgsFromProofAndSignals(hash_proof_json, hash_public_json),
    ...callArgsFromProofAndSignals(sig_check_proof_json, sig_check_public_json),
    pollName
  );
  console.error("88");

  const addedMessage = await this.coreValidator.verifyAndAddMessage(
    ...callArgsFromProofAndSignals(hash_proof_json, hash_public_json),
    "message"
  );
  const isRegistered = await this.coreValidator.checkIfHashRegisteredForPoll(
    pollName,
    hash_public_json[0]
  );
  assert(isRegistered == 1); // Pass
  console.error("99");
  console.log(answerValid);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function randpassword() {
  return Math.floor(Math.random() * 100000000000);
}

const processProof = (snarkProof, publicSignals) => {
 // the object returned by genZKSnarkProof needs to be massaged into a set of parameters the verifying contract
  // will accept
  return [
    snarkProof.pi_a.slice(0, 2), // pi_a
    // genZKSnarkProof reverses values in the inner arrays of pi_b
    [
      snarkProof.pi_b[0].slice(0).reverse(),
      snarkProof.pi_b[1].slice(0).reverse(),
    ], // pi_b
    snarkProof.pi_c.slice(0, 2), // pi_c
    publicSignals.map((signal) => signal.toString(10)), // input
  ];
};

function randpassword() {
  return Math.floor(Math.random() * 100000000000);
}

// needs done
async function createGroup(name) {
  // returns {id, password}
  const contract = await connect('CoreValidator');
  const password = randpassword();
  const passwordHash = mimcHash(password);
  const group = await contract.createGroup(name, BigInt(passwordHash));
  return { password };
}

async function addGroupMember(name, keyHash, passwordHash, keyProof, passwordProof) {
  // returns bool
  const contract = await connect('CoreValidator');
  const keyOutput = processProof(keyProof, [keyHash]);
  const passwordOutput = processProof(passwordProof, [passwordHash]);
  const registration = await contract.verifyAndStoreRegistration(keyOutput, BigInt(keyHash), passwordOutput, BigInt(passwordHash), name);
  return !!registration; // check
}

async function recordConfession(message, proof, publicSignals, name) {
  // returns null
  const contract = await connect('CoreValidator');
  const output = processProof(proof, publicSignals);
  const confession = await contract.verifyAndAddMessage(publicSignals.map(x => BigInt(x)), message, name); // make sure solidity includes name
  console.log('CNFESSION', confession);
  return !!confession; // check
}

// needs done
async function getGroups() {
  const contract = await connect('CoreValidator');
  const groups = await contract.getGroups();
  const parsedGroups = groups.map(group => {
    return { name: group.name, passwordHash: group.passwordHash.toString(), users: group.users };
  });
  return parsedGroups;
}

// needs done
async function getConfessions() {
  const contract = await connect('CoreValidator');
  const confessions = await contract.getConfessions(); // update
  const parsedConfessions = confessions.map(confession => {
    return { id: confession.id.toString(), message: confession.text, group: confession.group };
  });
  return parsedConfessions;
}

module.exports = {
  createGroup,
  addGroupMember,
  getGroups,
  getConfessions,
  recordConfession
};
