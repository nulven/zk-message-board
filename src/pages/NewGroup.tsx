import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import eth from '../utils/ethAPI';


const NewGroupWrapper = styled.div`
  margin-top: 10%;
  padding-left: 5%;
  padding-right: 5%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
`;

const Title = styled(Large)`
  font-size: 30px;
  margin-bottom: 10px;
`;

const Header = styled.p`
  width: 100px;
  padding-left: 5px;
`;


const NewGroup = (props) => {
  const [name, setName] = useState(null);
  const [groupCreated, setGroupCreated] = useState(false);
  const [password, setPassword] = useState(null);

  const create = () => {
    eth.api.createGroup(name)
    .then(password => {
      setGroupCreated(true);
      setPassword(password);
    });
  };

  const onChange = (stateSetter) => (value) => {
    stateSetter(value);
  };

  const sendToGroups = () => {
    props.history.push('/groups');
  };

  return (
    <NewGroupWrapper>
      {groupCreated ?
        <>
          <p>Group successfully created</p>
          <p>{`Group password is: ${password}`}</p>
        </>
       : 
        <>
          <Title>Create Group</Title>
          <Wrapper>
            <TextInput
              placeholder={null}
              onChange={onChange(setName)}
              value={name}
              header={'Group Name'}
            />
          </Wrapper>
          <Button onClick={create}>
            Create
          </Button>
          <Button onClick={sendToGroups}>
            Cancel
          </Button>
        </>
      }
    </NewGroupWrapper>
  );
}

export default NewGroup;
