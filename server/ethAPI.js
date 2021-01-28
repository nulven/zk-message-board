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

// needs done
function createGroup(name) {
  // returns {id, password}
  contract.SET_GROUP(name);
}

function addGroupMember(name, keyHash, passwordHash, keyProof, passwordProof) {
  // returns bool
  const registration = await contract.verifyAndStoreRegistration(keyProof, passwordProof, keyHash, passwordHash, name);
  return !!registration; // check
}

async function recordConfession(message, proof, publicSignals, name) {
  // returns null
  const confession = await contract.verifyAndAddMessage(proof, publicSignals, message, name); // make sure solidity includes name
  return !!confession; // check
}

// needs done
async function getGroups() {
  const groups = await contract.groupsGetter();
  return groups;
}

// needs done
async function getConfessions() {
  const confessions = await contract.confessionsGetter(); // update
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
