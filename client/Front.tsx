import React, { useState } from 'react';
import styled from 'styled-components';

import TextInput from './shared/components/TextInput';
import { Button } from './shared/components/Button';


const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Title = styled.div`
  height: 30px;
  font-size: 25px;
  padding: 5px;
`;

const Spacer = styled.div`
  height: 30px;
`;

const Header = styled.p`
  width: 100px;
  padding-left: 5px;
`;

const Output = styled.p`
  width: 100%;
`;

const Front = (props) => {

  const sendToNewPoll = () => {
    props.history.push('/new-poll');
  };

  const sendToPolls = () => {
    props.history.push('/polls');
  };

  return (
    <>
      <>
        <Title>Start a New Poll</Title>
        <Button onClick={sendToNewPoll}>
          New Poll
        </Button>
      </>
      <Spacer />
      <>
        <Title>Join an Existing Poll</Title>
        <Button onClick={sendToPolls}>
          Get Polls
        </Button>
      </>
    </>
  );
}

export default Front;
