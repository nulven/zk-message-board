require("dotenv").config();
const { Contract, ContractFactory, providers, Wallet } = require("ethers");
const fetch = require("node-fetch");
const fs = require("fs");
const { mimcHash, modPBigIntNative } = require("./mimc.js");

const projectId = process.env.PROJECT_ID;
const network_url = process.env.NODE_ENV === "production" ? `https://ropsten.infura.io/v3/${projectId}` : 'http://localhost:8545';
const provider = new providers.JsonRpcProvider(network_url);

const mnemonic = process.env.MNEMONIC;
const path = process.env.WALLET_PATH;
const folder = process.env.NODE_ENV === "production" ? 'deploy' : 'json';
const walletMnemonic = Wallet.fromMnemonic(mnemonic, path).connect(provider);
var signer;
if (process.env.NODE_ENV === 'production') {
  signer = walletMnemonic;
} else {
  signer = provider.getSigner();
}

const options = { gasPrice: 1000000000, gasLimit: 85000000 };


async function connect(contractName) {
  const location = __dirname + `/../contracts/${folder}/` + contractName + ".json";
  const contractJSON = JSON.parse(fs.readFileSync(location)); // .json
  const contractABI = contractJSON.abi;
  const contractAddress = contractJSON.address;

  return new Contract(contractAddress, contractABI, signer);
}

async function runTests() {
  await this.coreValidator.createGroup("asdf", 1);
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
  const pollName = "myPoll";
  const answerValid = await this.coreValidator.verifyAndStoreRegistration(
    ...callArgsFromProofAndSignals(hash_proof_json, hash_public_json),
    ...callArgsFromProofAndSignals(sig_check_proof_json, sig_check_public_json),
    pollName
  );

  const addedMessage = await this.coreValidator.verifyAndAddMessage(
    ...callArgsFromProofAndSignals(hash_proof_json, hash_public_json),
    "message"
  );
  const isRegistered = await this.coreValidator.checkIfHashRegisteredForPoll(
    pollName,
    hash_public_json[0]
  );
  assert(isRegistered == 1); // Pass
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

async function createGroup(name) {
  try {
    const contract = await connect("CoreValidator");
    const password = randpassword();
    const passwordHash = mimcHash(password).toString();
    const group = await contract.createGroup(name, passwordHash);
    return { password };
  } catch (error) {
    console.log(`createGroup Failed: ${error}`);
  }
}

async function addGroupMember(
  name,
  keyProof,
  keyPublicSignals,
  passwordProof,
  passwordPublicSignals
) {
  try {
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
    return !!registration;
  } catch (error) {
    console.log(`addGroup Failed: ${error}`);
  }
}

async function recordConfession(message, proof, publicSignals, name) {
  console.log('recordConfession');
  try {
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
    console.log(confession);
    return !!confession;
  } catch (error) {
    console.log(`recordConfession Failed: ${error}`);
  }
}

async function getGroupHashes(name) {
  try {
    const contract = await connect("CoreValidator");
    const groups = await contract.getAllHashedUsersByGroupName(name);
    const parsedGroups = groups.map((group) => {
      return group.toString();
    });
    return parsedGroups;
  } catch (error) {
    console.log(`getGroupHashes Failed: ${error}`);
  }
}

async function getGroups() {
  try {
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
  } catch (error) {
    console.log(`getGroups Failed: ${error}`);
  }
}

async function getConfessions() {
  try {
    const contract = await connect("CoreValidator");
    const confessions = await contract.getConfessions({ from: '0xB793e17E53e21e8eE6f191E6f48bbbd09DD6B574' });
    const parsedConfessions = confessions.map((confession) => {
      return {
        id: confession.id.toString(),
        message: confession.text,
        group: confession.group,
      };
    });
    const filteredConfessions = parsedConfessions.filter(confession => confession.group !== '');
    const sortedConfessions = filteredConfessions.sort((a, b) => b.id - a.id);
    return sortedConfessions;
  } catch (error) {
    console.log(`getConfessions Failed: ${error}`);
  }
}


module.exports = {
  createGroup,
  addGroupMember,
  getGroups,
  getGroupHashes,
  getConfessions,
  recordConfession
};
