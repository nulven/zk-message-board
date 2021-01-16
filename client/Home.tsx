import React, { useState } from 'react';
import styled from 'styled-components';

import { Button } from './shared/components/Button';
import { Large } from './shared/components/text';


const Spacer = styled.div`
  height: 30px;
`;

const Home = (props) => {

  const sendToNewPoll = () => {
    props.history.push('/polls/new');
  };

  const sendToPolls = () => {
    props.history.push('/polls');
  };

  return (
    <>
      <>
        <Large>Start a New Poll</Large>
        <Button onClick={sendToNewPoll}>
          New Poll
        </Button>
      </>
      <Spacer />
      <>
        <Large>Join an Existing Poll</Large>
        <Button onClick={sendToPolls}>
          Get Polls
        </Button>
      </>
    </>
  );
}

export default Home;
