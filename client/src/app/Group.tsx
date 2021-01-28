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
  const id = props.match.params.id;
  const [group, setGroup] = useState(null);
  const [password, setPassword] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    loadGroup();
  }, []);

  useEffect(() => {
    loadKey();
  }, [group]);

  const loadGroup = () => {
    get(`/api/groups/${id}`, {})
    .then(data => {
      if (data.success) {
        setGroup(data.group);
      } else {
        window.alert('Error');
      }
    });
  };

  const loadKey = async () => {
    const publicKeyMaybe = localStorage.getItem(`${id}_pubkey`);
    const privateKeyMaybe = localStorage.getItem(`${id}_prvkey`);
    if (publicKeyMaybe !== null && privateKeyMaybe !== null) {
      if (true) {
        setPublicKey(publicKeyMaybe.split(',').map(v => BigInt(v)));
        setPrivateKey(privateKeyMaybe);
      } else {
        console.log('Key is not valid');
      }
    }
  };

  const register = async () => {
    const passwordHash = mimc(password).toString();
    if (passwordHash === group.passwordHash) {
      const proof = await proveHash(password, group.passwordHash);

      const { publicKey, privateKey } = generateKey();
      const pubKeyHash = mimc(publicKey[0]).toString();
      post('/api/groups/register', { id, proof, keyHash: pubKeyHash })
      .then(data => {
        if (data.success) {
          localStorage.setItem(`publicKey`, publicKey);
          localStorage.setItem(`privateKey`, privateKey.toString());
          localStorage.setItem(`groupId`, group.id);
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
            <p>{group.name}</p>
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
