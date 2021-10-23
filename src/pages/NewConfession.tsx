import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Loader from 'react-loader-spinner';

import TextInput from '../components/TextInput';
import Select from 'react-select';
import Spinner from '../components/Spinner';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import { loadGroup, loadGroups } from '../utils/storage';
import { createMessage } from '../utils/api';

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

const SelectGroup = styled(Select)`
  width: 100%;
  height: 10%;
`;

const MessageInput = styled(TextInput)`
  display: flex;
  width: 100%;
  height: 10%;
  margin-left: 45%;
  margin-right: 45%;
  margin-top: 20%;
  margin-bottom: 70%;
`;

const NewConfession = (props) => {
  const [group, setGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const [passwordHash, setPasswordHash] = useState(null);

  useEffect(() => {
    setGroups(loadGroups());
  }, []);
  useEffect(() => {
    loadKeys();
  }, [group]);

  const loadKeys = async () => {
    const keys = loadGroup(group);
    setPublicKey(keys.publicKey);
    setPrivateKey(keys.privateKey);
  };

  const post = async () => {
    setLoading(true);
    createMessage(message, privateKey, publicKey, group).then(() => {
      props.history.push('/confessions');
      setLoading(false);
    });
  };

  const onChange = (stateSetter) => (value) => {
    stateSetter(value);
  };

  const onChangeGroup = ({ value, label }) => {
    setGroup(value);
  };

  return (
    <>
      {!loading ? (
        <>
          <Large>Post confession</Large>
          <Wrapper>
            <Header>Group</Header>
            <SelectGroup
              options={groups.map((group) => {
                return { value: group, label: group };
              })}
              onChange={onChangeGroup}
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
          <Button onClick={post}>Post</Button>
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default NewConfession;
