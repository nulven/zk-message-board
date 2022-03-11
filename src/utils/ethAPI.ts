import { Contract, providers } from 'ethers';

import contractJSON from '../../public/contracts/CoreValidator.json';

import { OurErrors, SolidityErrors } from './errors';
import { generateKey, randpassword } from './utils';
import mimcHash, { modPBigIntNative } from './mimc';

class EthConnection {
  provider: providers.Web3Provider | providers.JsonRpcProvider;
  signer;
  contract: Contract;
  gasPrice: number;
  gasLimit: number;
  api: any;
  address: string;
  signerHook: any;
  privateKey: BigInt;
  publicKey: BigInt[];

  constructor() {
    this.api = new EthAPI();
  }

  getCachedSettings() {
    const _address = localStorage.getItem('address');
    const address = _address !== 'null' ? _address : '';
    return address;
  }

  setCachedSettings() {
    localStorage.setItem('address', this.address);
  }

  public async setProvider(provider, setSigner) {
    this.provider = provider;
    this.signerHook = setSigner;
    const [address] = await provider.listAccounts();
    await this.setSigner(address);
  }

  public async setSigner(_address?: string) {
    const address = _address ? _address : this.getCachedSettings();
    if (this.provider) {
      if (address) {
        this.signer = this.provider.getSigner(address);
      } else {
        this.signer = this.provider.getSigner();
      }
      await this.setAddress();
      this.connect();
      this.api.init(
        this.contract,
        this.address,
      );
      this.download();
      this.signerHook(this.signer);
    }
  }

  public download() {
    if (this.api.contract) {
      // if constants are needed from contract
    }
  }

  public async setAddress() {
    if (this.signer) {
      this.address = await this.signer.getAddress();
      await this.loadKeys();
      this.setCachedSettings();
    }
  }

  public async loadKeys() {
    let _privateKey;
    let _publicKey;
    const privateKeyMaybe = localStorage.getItem(
      `${this.address}_private_key`);
    const publicKeyMaybe = localStorage.getItem(
      `${this.address}_public_key`);
    if (privateKeyMaybe && publicKeyMaybe) {
      _privateKey = privateKeyMaybe;
      _publicKey = publicKeyMaybe.split(',');
    } else {
      const keys = await generateKey();
      _privateKey = keys.privateKey;
      _publicKey = keys.publicKey;
      localStorage.setItem(`${this.address}_private_key`, _privateKey);
      localStorage.setItem(`${this.address}_public_key`, _publicKey);
    }

    this.privateKey = BigInt(_privateKey);
    this.publicKey = _publicKey.map(BigInt);
  }

  public connect() {
    const contractABI = contractJSON.abi;
    const contractAddress = contractJSON.address;
    this.contract = new Contract(contractAddress, contractABI, this.signer);
  }
}

class EthAPI {

  contract: Contract;
  gettersContract: Contract;
  address: string;
  publicKey: BigInt[];

  constructor() {
    this.createAPI();
  }

  init(
    contract: Contract,
    gettersContract: Contract,
    address: string,
    publicKey: BigInt[],
  ) {
    this.contract = contract;
    this.gettersContract = gettersContract;
    this.address = address;
    this.publicKey = publicKey;
    this.createAPI();
  }

  public createAPI() {
    const functions = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(_ => _[0] === '_');
    functions.forEach(key => {
      const prop = this[key];
      if (typeof prop === 'function') {
        const func = (...args) => {
          if (this.contract) {
            return this.wrapper(this[key].bind(this))(...args);
          } else {
            return new Promise(resolve => {
              const x = setTimeout(() => {
                const res = func(...args);
                resolve(res);
              }, 50);
            });
          }
        };
        this[key.slice(1)] = func;
      }
    });
  }

  wrapper(apiCall) {
    const fn = async (...args) => {
      try {
        const res = await apiCall(...args);
        return res;
      } catch (error) {
        console.log(error);
        const errorMessage = error.message.replace(/\\"/g, '"');
        const strList = errorMessage.match('(?<=error\\":).*(?=}", error)');
        if (!strList) {
          throw error;
        }
        const str = strList[0];
        const json = JSON.parse(str);
        const err = json.message;
        const message = err.split(': ')[1];
        const solidityError = SolidityErrors[message];
        const ourError = OurErrors[solidityError];
        if (ourError) {
          throw ourError();
        } else {
          throw OurErrors['SolidityError'](message);
        }
      }
    };
    return fn;
  }

  public async _createGroup(name: string) {
    const password = randpassword();
    const passwordHash = mimcHash(password).toString();
    const group = await this.contract.createGroup(name, passwordHash);
    return password;
  }

  public async _addGroupMember(
    name,
    keyProof,
    keyPublicSignals,
    passwordProof,
    passwordPublicSignals,
  ) {
    const keyOutput = processProof(
      keyProof,
      keyPublicSignals.map((x) => modPBigIntNative(x))
    );
    const passwordOutput = processProof(
      passwordProof,
      passwordPublicSignals.map((x) => modPBigIntNative(x))
    );
    const registration = await this.contract.verifyAndStoreRegistration(
      ...keyOutput,
      ...passwordOutput,
      name
    )
    return !!registration;
  }

  public async _recordConfession(
    message,
    proof,
    publicSignals,
    name,
  ) {
    const output = processProof(
      proof,
      publicSignals.map((x) => modPBigIntNative(x))
    );
    const confession = await this.contract.verifyAndAddMessage(
      ...output,
      message,
      name
    ,{ gasLimit: 600000 })
    return !!confession;
  }

  public async _getGroupHashes(name: string) {
    const groups = await this.contract.getAllHashedUsersByGroupName(name);
    const parsedGroups = groups.map((group) => {
      return group.toString();
    });
    return parsedGroups;
  }

  public async _getGroups() {
    const groups = await this.contract.getGroups();
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

  public async _getConfessions() {
    const confessions = await this.contract.getConfessions();
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
  }
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


const eth = new EthConnection();
export default eth;
