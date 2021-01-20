import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

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


const NewGroup = (props) => {
  const [name, setName] = useState(null);
  const [groupCreated, setGroupCreated] = useState(false);
  const [password, setPassword] = useState(null);

  const create = () => {
    post('/api/groups/create', { name })
    .then(data => {
      if (data.success) {
        setGroupCreated(true);
        setPassword(data.password);
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
      {groupCreated ?
        <>
          <p>Group successfully created</p>
          <p>Group password is: {password}</p>
        </>
       : 
        <>
          <Large>Create Group</Large>
          <Wrapper>
            <Header>Name</Header>
            <TextInput
              placeholder={null}
              onChange={onChange(setName)}
              value={name}
            />
          </Wrapper>
          <Button onClick={create}>
            Create
          </Button>
        </>
      }
    </>
  );
}

export default NewGroup;
