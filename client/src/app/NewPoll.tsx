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


type PollProps = {
  title: string;
  users: number;
  maxUsers: number;
}

const NewPoll = (props) => {
  const [title, setTitle] = useState(null);
  const [maxUsers, setMaxUsers] = useState(null);

  const create = () => {
    post('/api/polls/new', { title, maxUsers })
    .then(data => {
      if (data.success) {
        props.history.push('/polls');
      }
    });
  };

  const onChange = (stateSetter) => (value) => {
    stateSetter(value);
  };

  return (
    <>
      <Large>Create Poll</Large>
      <Wrapper>
        <Header>Title</Header>
        <TextInput
          placeholder={null}
          onChange={onChange(setTitle)}
          value={title}
        />
      </Wrapper>
      <Wrapper>
        <Header>Max Users</Header>
        <TextInput
          placeholder={null}
          onChange={onChange(setMaxUsers)}
          value={maxUsers}
        />
      </Wrapper>
      <Button onClick={create}>
        Create
      </Button>
    </>
  );
}

export default NewPoll;
