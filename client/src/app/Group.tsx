import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
const utils = require("ffjavascript").utils;
import { babyJub, eddsa } from 'circomlib';
const { packPoint } = babyJub;
const { verify } = eddsa;

import TextInput from '../components/TextInput';
import Spinner from '../components/Spinner';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import bigInt from 'big-integer';
import mimc from '../utils/mimc';
import { generateKey } from '../utils/utils';
import { get, post } from '../utils/api';
import { proveHash, proveHashBits, verifyHash } from '../utils/prover';


const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Group = (props) => {
  const name = props.match.params.name;
  const group = props.location.state.group;
  const [password, setPassword] = useState(null);
  const [groups, setGroups] = useState([]);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = () => {
    const publicKeyMaybe = localStorage.getItem(`${name}_publicKey`);
    const privateKeyMaybe = localStorage.getItem(`${name}_privateKey`);
    const groupsMaybe = localStorage.getItem(`groups`);
    if (publicKeyMaybe !== null && privateKeyMaybe !== null) {
      if (true) {
        setPublicKey(publicKeyMaybe.split(',').map(v => BigInt(v)));
        setPrivateKey(privateKeyMaybe);
      } else {
        console.log('Key is not valid');
      }
    }
    if (groupsMaybe !== null) {
      setGroups(groupsMaybe.split(','));
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
    //if (passwordHash === group.passwordHash) {
    setLoading(true);
    if (true) {
      const passwordHash = mimc(password).toString();
      const passwordProof = await proveHash(password, passwordHash);

      const { publicKey, privateKey } = generateKey();
      const pPubKey = packPoint(publicKey);
      const aBits = buffer2bits(pPubKey);
      const hash = mimc(...aBits).toString();
      const keyProof = await proveHashBits(aBits, hash);

      post('/api/groups/register', {
        name,
        keyHash: hash,
        passwordHash: group.passwordHash,
        keyProof: keyProof,
        passwordProof: passwordProof
      })
      .then(data => {
        if (data.success) {
          const newGroups = groups;
          newGroups.push(name);
          setGroups(newGroups);
          setLoading(false);
          localStorage.setItem(`${name}_publicKey`, publicKey);
          localStorage.setItem(`${name}_privateKey`, privateKey.toString());
          localStorage.setItem(`groups`, newGroups.toString());
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
      {!!loading ?
        <Spinner />
      : (
        !!group ? (
          !!publicKey ?
            <p>You are a part of this group</p>
          :
            <>
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
        )
      }
    </>
  );
}

export default Group;
