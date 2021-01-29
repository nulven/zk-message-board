const { Contract, ContractFactory, providers } = require("ethers");
const fetch = require("node-fetch");
const fs = require("fs");
const provider = new providers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();
const contract = connect();

async function connect(contractName) {
  const location = __dirname + "/../contracts/json/CoreValidator.json";
  const contractJSON = JSON.parse(fs.readFileSync(location)); // .json
  const contractABI = contractJSON.abi;
  const contractAddress = contractJSON.address;

  return new Contract(contractAddress, contractABI, signer);
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

// needs done
function createGroup(name) {
  // returns {id, password}
  contract.createGroup(name);
}

function addGroupMember(name, keyHash, passwordHash, keyProof, passwordProof) {
  // returns bool
  const keyOutput = processProof(keyProof, [keyHash]);
  const passwordOutput = processProof(passwordProof, [passwordHash]);
  const registration = await contract.verifyAndStoreRegistration(keyOutput.slice(0, 3), passwordOutput.slice(0, 3), keyOutput[3][0], passwordOutput[3][0], name);
  return !!registration; // check
}

async function recordConfession(message, proof, publicSignals, name) {
  // returns null
  const output = processProof(proof, publicSignals);
  const confession = await contract.verifyAndAddMessage(output.slice(0, 3), output[3], message, name); // make sure solidity includes name
  return !!confession; // check
}

// needs done
async function getGroups() {
  const groups = await contract.getGroups();
  return groups;
}

// needs done
async function getConfessions() {
  const confessions = await contract.getConfessions(); // update
  return confessions;
}

module.exports = {
  createGroup,
  addGroupMember,
  getGroups,
  getConfessions,
  recordConfession,
  verifyKey,
  verifySignature
};
