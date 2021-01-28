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
