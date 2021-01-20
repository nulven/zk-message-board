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
import { generateKey, signVote } from '../utils/utils';
import { get, post } from '../utils/api';
import { proveSignature, verifyHash, verifySignature } from '../utils/prover';


const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Group = (props) => {
  const id = props.match.params.id;
  const [group, setGroup] = useState(null);
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

  const register = () => {
    const { publicKey, privateKey } = generateKey();
    const pubKeyHash = mimc(publicKey[0]).toString();
    post('/api/groups/register', { id, keyHash: pubKeyHash })
    .then(data => {
      if (data.success) {
        localStorage.setItem(`${id}_pubkey`, publicKey);
        localStorage.setItem(`${id}_prvkey`, privateKey.toString());
        setPublicKey(publicKey);
        setPrivateKey(privateKey.toString());
      }
    });
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
          </>
      ) :
        <p>Group not ready</p>
      }
    </>
  );
}

export default Group;
