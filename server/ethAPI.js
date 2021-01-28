const { Contract, ContractFactory, providers } = require("ethers");
const fetch = require("node-fetch");

const provider = new providers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();
const contract = connect();

const contractDir = "/home/cyril/aayush/ethereum/zk-polling/";

async function connect(contractName) {
  console.log(__dirname + "/../contracts/json/CoreValidator.json");
  const contractJSON = await fetch(
    contractDir + "/contracts/json/CoreValidator.json"
  ).then((x) => x.json());
  const contractABI = contractJSON.abi;
  const contractAddress = contractJSON.address;

  return new Contract(contractAddress, contractABI, signer);
}
