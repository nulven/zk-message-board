import { task } from 'hardhat/config';
import { getAddress, parseCalldata } from './utils';

let NETWORK: string;

task('call:l1', 'Call an L1 contract')
  .addParam('contract', 'Contract to call')
  .addParam('func', 'Function to call')
  .addOptionalParam('calldata', 'Inputs to the function')
  .setAction(async ({ contract, func, calldata }, hre) => {
    const [signer] = await hre.ethers.getSigners();
    if (signer.provider) {
      const network = await signer.provider.getNetwork();
      NETWORK = network.name;
    }
    console.log(`Calling on ${NETWORK}`);

    const address = getAddress(contract, NETWORK);
    const contractFactory = await hre.ethers.getContractFactory(contract);
    const contractInstance = await contractFactory.attach(address);

    const _calldata = parseCalldata(calldata, 1, NETWORK);
    const res = await contractInstance[func](..._calldata);
    console.log('Response:', res);
});
