import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import { generateKey, signVote } from '../utils/utils';
import { proveSignature, verifyHash, verifySignature } from '../utils/prover';
import { post } from '../utils/api';


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
  height: 200px;
`;


const NewConfession = (props) => {
  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    const groupMaybe = localStorage.getItem(`groupId`);
    const publicKeyMaybe = localStorage.getItem(`publicKey`);
    const privateKeyMaybe = localStorage.getItem(`privateKey`);
    if (publicKeyMaybe !== null && privateKeyMaybe !== null) {
      if (true) {
        setPublicKey(publicKeyMaybe.split(',').map(v => BigInt(v)));
        setPrivateKey(privateKeyMaybe);
      } else {
        console.log('Key is not valid');
      }
    }
  };

  const create = () => {
    const signature = signVote(privateKey, message);
    const proof = proveSignature(message, group, signature);
    post('/api/confession/new', { proof })
    .then(data => {
      if (data.success) {
        props.history.push('/confessions');
      } else {
        console.log(data.error);
      }
    });
  };

  const onChange = (stateSetter) => (value) => {
    stateSetter(value);
  };

  return (
    <>
      <Large>Post confession</Large>
      <Wrapper>
        <Header>Group</Header>
        <TextInput
          placeholder={null}
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
  );
}

export default NewConfession;
