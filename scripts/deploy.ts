/**
 * Full goerli deploy including any permissions that need to be set.
 */
import { task } from 'hardhat/config';
import fs from 'fs';
import { save } from './utils';

let NETWORK: string;

task('deploy', 'Full deployment', async (_taskArgs, hre) => {
  NETWORK = hre.network.name;
  console.log(`Deploying on ${NETWORK}`);

  if (!fs.existsSync(`./deployments/${NETWORK}`)) {
    fs.mkdirSync(`./deployments/${NETWORK}`, { recursive: true });
  }

  console.log('Deploying Libraries');
  const verifierFactory = await hre.ethers.getContractFactory('Verifier');
  const verifier = await verifierFactory.deploy();
  const pairingFactory = await hre.ethers.getContractFactory('Pairing');
  const pairing = await pairingFactory.deploy();
  await verifier.deployed();
  await pairing.deployed();

  console.log('Deploying Core');
  const coreFactory = await hre.ethers.getContractFactory('CoreValidator', {
    libraries: {
      Verifier: verifier.address,
    },
  });
  const core = await coreFactory.deploy();
  await core.deployed();
  save('CoreValidator', core, NETWORK);

  /*
  console.log('Deploying Getters');
  const gettersFactory = await hre.ethers.getContractFactory('Getters');
  const getters = await gettersFactory.deploy([core.address]);
  await getters.deployed();
  save('Getters', getters, NETWORK);
  */
});
