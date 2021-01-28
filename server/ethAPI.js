const { Contract, ContractFactory, providers } = require("ethers");

const provider = new providers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();
const contract = connect();

async function connect() {
  const contractJSON = await fetch(
    "../Contracts/CoreValidator.json"
  ).then((x) => x.json());
  const contractABI = contractJSON.abi;
  const contractAddress = contractJSON.address;

  return new Contract(contractAddress, contractABI, signer);
}
