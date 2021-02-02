const { Contract, ContractFactory, providers } = require("ethers");
const fetch = require("node-fetch");
const fs = require("fs");
const provider = new providers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();
const { mimcHash, modPBigIntNative } = require("./mimc.js");
//const contract = await connect('CoreValidator');

async function connect(contractName) {
  const location = __dirname + "/../contracts/json/" + contractName + ".json";
  const contractJSON = JSON.parse(fs.readFileSync(location)); // .json
  const contractABI = contractJSON.abi;
  const contractAddress = contractJSON.address;

  return new Contract(contractAddress, contractABI, signer);
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function randpassword() {
  return Math.floor(Math.random() * 100000000000);
}

const processProof = (snarkProof, publicSignals) => {
  return [
    snarkProof.pi_a.slice(0, 2), // pi_a
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
  const contract = await connect("CoreValidator");
  const password = randpassword();
  const passwordHash = mimcHash(password);
  const group = await contract.createGroup(name, BigInt(passwordHash));
  return { password };
}

async function addGroupMember(
  name,
  keyProof,
  keyPublicSignals,
  passwordProof,
  passwordPublicSignals
) {
  const contract = await connect("CoreValidator");
  const keyOutput = processProof(
    keyProof,
    keyPublicSignals.map((x) => modPBigIntNative(x))
  );
  const passwordOutput = processProof(
    passwordProof,
    passwordPublicSignals.map((x) => modPBigIntNative(x))
  );
  const registration = await contract.verifyAndStoreRegistration(
    ...keyOutput,
    ...passwordOutput,
    name
  )
  .catch(err => {
    console.log(err);
  });
  return !!registration;
}

async function recordConfession(message, proof, publicSignals, name) {
  // returns null
  const contract = await connect("CoreValidator");
  const output = processProof(
    proof,
    publicSignals.map((x) => modPBigIntNative(x))
  );
  const confession = await contract.verifyAndAddMessage(
    ...output,
    message,
    name
  )
  .catch(err => {
    console.log(err);
  }); // make sure solidity includes name
  return !!confession;
}

// needs done
async function getGroups() {
  const contract = await connect("CoreValidator");
  const groups = await contract.getGroups();
  const parsedGroups = groups.map((group) => {
    return {
      name: group.name,
      passwordHash: group.passwordHash.toString(),
      users: group.users,
    };
  });
  const filteredGroups = parsedGroups.filter((group) => group.passwordHash !== '0');
  return filteredGroups;
}

// needs done
async function getConfessions() {
  const contract = await connect("CoreValidator");
  const confessions = await contract.getConfessions(); // update
  const parsedConfessions = confessions.map((confession) => {
    return {
      id: confession.id.toString(),
      message: confession.text,
      group: confession.group,
    };
  });
  const filteredConfessions = parsedConfessions.filter(confession => confession.group !== '');
  return filteredConfessions;
}

module.exports = {
  createGroup,
  addGroupMember,
  getGroups,
  getConfessions,
  recordConfession,
};
