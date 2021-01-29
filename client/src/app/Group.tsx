import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
const utils = require("ffjavascript").utils;
import { babyJub, eddsa } from 'circomlib';
const { packPoint } = babyJub;
const { verify } = eddsa;

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import bigInt from 'big-integer';
import mimc from '../utils/mimc';
import { generateKey } from '../utils/utils';
import { get, post } from '../utils/api';
import { proveHash } from '../utils/prover';


const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Group = (props) => {
  const name = props.match.params.name;
  const group = props.location.state.group;
  const [password, setPassword] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    const publicKeyMaybe = localStorage.getItem(`${name}_pubkey`);
    const privateKeyMaybe = localStorage.getItem(`${name}_prvkey`);
    if (publicKeyMaybe !== null && privateKeyMaybe !== null) {
      if (true) {
        setPublicKey(publicKeyMaybe.split(',').map(v => BigInt(v)));
        setPrivateKey(privateKeyMaybe);
      } else {
        console.log('Key is not valid');
      }
    }
  };

  function buffer2bits(buff) {
    const res = [];
    for (let i = 0; i < buff.length; i++) {
      for (let j = 0; j < 8; j++) {
        if ((buff[i] >> j) & 1) {
          res.push('1');
        } else {
          res.push('0');
        }
      }
    }
    return res;
  }

  const register = async () => {
    const passwordHash = BigInt(mimc(password)).toString();
    if (passwordHash === group.passwordHash) {
      const keyProof = await proveHash(password, group.passwordHash);

      const { publicKey, privateKey } = generateKey();
      const pPubKey = packPoint(publicKey);
      const aBits = buffer2bits(pPubKey);
      const hash = mimc(...aBits).toString();
      //const pubKeyHash = mimc(publicKey[0]).toString(); // fix
      const a = BigInt(parseInt(aBits.join(''), 2));
      const passwordProof = await proveHash(a, hash);

      //post('/api/groups/register', { id, proof, keyHash: pubKeyHash })
      post('/api/groups/register', {
        name,
        keyHash: hash,
        passwordHash: group.passwordHash,
        keyProof: keyProof.proof,
        passwordProof: passwordProof.proof
      })
      .then(data => {
        if (data.success) {
          localStorage.setItem(`publicKey`, publicKey);
          localStorage.setItem(`privateKey`, privateKey.toString());
          localStorage.setItem(`group`, name); // check
          setPublicKey(publicKey);
          setPrivateKey(privateKey.toString());
        }
      });
    } else {
      console.log('Incorrect password');
    }
  };

  const onChange = (stateSetter) => (value) => {
    stateSetter(value);
  };

  return (
    <>
      {!!group ? (
        !!publicKey ?
          <p>You are a part of this group</p>
        :
          <>
            <p>'hello'</p>
            <p>Password hash is: {group.passwordHash}</p>
            <TextInput
              placeholder={null}
              onChange={onChange(setPassword)}
              value={password}
            />
            <Button onClick={register}>
              Generate key
            </Button>
          </>
      ) :
        <p>Group not ready</p>
      }
    </>
  );
}

export default Group;
