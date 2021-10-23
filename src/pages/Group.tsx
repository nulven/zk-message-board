import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
const utils = require("ffjavascript").utils;
import { babyJub, eddsa } from 'circomlib';
const { packPoint } = babyJub;
const { verify } = eddsa;

import TextInput from '../components/TextInput';
import Spinner from '../components/Spinner';
import { Button } from '../components/Button';
import { Large, Medium } from '../components/text';

import { saveGroup, loadGroup } from '../utils/storage';
import { registerUser } from '../utils/api';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Error = styled(Medium)`
  color: ${props => props.theme.color.red};
`;

const Group = (props) => {
  const name = props.match.params.name;
  const group = props.location.state.group;
  const [password, setPassword] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = () => {
    const keys = loadGroup(name);
    setPublicKey(keys.publicKey);
    setPrivateKey(keys.privateKey);
  };

  const register = async () => {
    setLoading(true);
    registerUser(password, group).then(keys => {
      setPublicKey(keys.publicKey);
      setPrivateKey(keys.privateKey.toString());
      setLoading(false);
    });
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
              {!!error ? <Error>{error}</Error> : null}
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
