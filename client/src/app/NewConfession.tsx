import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Loader from 'react-loader-spinner';

import TextInput from '../components/TextInput';
import Spinner from '../components/Spinner';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import { generateKey } from '../utils/utils';
import { proveSignature, verifyHash, verifySignature } from '../utils/prover';
import { get, post } from '../utils/api';
import { babyJub, eddsa } from 'circomlib';
import mimc from '../utils/mimc';
const { packPoint } = babyJub;
const { verify, packSignature, sign } = eddsa;


const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Spacer = styled.div`
  height: 30px;
`;

const Header = styled.p`
  width: 100px;
  padding-left: 5px;
`;

const MessageInput = styled(TextInput)`
  display: flex;
  width: 10%;
  height: 10%;
  margin-left: 45%;
  margin-right: 45%;
  margin-top: 20%;
  margin-bottom: 70%;
`;


const NewConfession = (props) => {
  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const [passwordHash, setPasswordHash] = useState(null);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    const publicKeyMaybe = localStorage.getItem(`publicKey`);
    const privateKeyMaybe = localStorage.getItem(`privateKey`);
    const groupMaybe = localStorage.getItem(`groupId`);
    if (publicKeyMaybe !== null && privateKeyMaybe !== null && groupMaybe !== null) {
      if (true) {
        setPublicKey(publicKeyMaybe.split(',').map(v => BigInt(v)));
        setPrivateKey(privateKeyMaybe);
        setGroup(groupMaybe);

        // Remove once password hash is preset in contract
        get(`/api/groups/${groupMaybe}`, {})
        .then(data => {
          if (data.success) {
            setPasswordHash(data.group.passwordHash);
          } else {
            window.alert('Error');
          }
        });
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

  const create = async () => {
    setLoading(true);

    const messageBuffer = Buffer.from(message);
    const messageBits = buffer2bits(messageBuffer);
    const messageHash = mimc(...messageBits).toString().padStart(78, '0');
    const msg = Buffer.from(messageHash, 'hex');
    const pPubKey = packPoint(publicKey);
    const signature = sign(privateKey, msg);
    const pSignature = packSignature(signature);

    const aBits = buffer2bits(pPubKey);
    const rBits = buffer2bits(pSignature.slice(0, 32));
    const sBits = buffer2bits(pSignature.slice(32, 64));
    const msgBits = buffer2bits(msg);

    const hash = mimc(...aBits).toString();
  
    const input = { publicKey: aBits, hashes: [hash], sig: [rBits, sBits], message: msgBits };
    console.log(JSON.stringify(input));
    const proof = await proveSignature(aBits, [hash], [rBits, sBits], msgBits);
    console.log(proof.publicSignals);
 
    post('/api/confessions/post', { message, proof, group })
    .then(data => {
      if (data.success) {
        props.history.push('/confessions');
      } else {
        console.log(data.error);
      }
      setLoading(false);
    });
  };

  const onChange = (stateSetter) => (value) => {
    stateSetter(value);
  };

  return (
    <>
      {!loading ?
        <>
          <Large>Post confession</Large>
          <Wrapper>
            <Header>Group</Header>
            <TextInput
              placeholder={group}
              onChange={onChange(setGroup)}
              value={group}
            />
          </Wrapper>
          <Wrapper>
            <Header>Confession</Header>
            <MessageInput
              placeholder={null}
              onChange={onChange(setMessage)}
              value={message}
            />
          </Wrapper>
          <Button onClick={create}>
            Post
          </Button>
        </>
      :
        <Spinner />
      }
    </>
  );
}

export default NewConfession;
