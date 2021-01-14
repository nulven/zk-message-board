import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextInput from './shared/components/TextInput';
import { Button } from './shared/components/Button';

import { get } from './api';

const PollsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 90%;
  height: 40px;
  padding: 10px;
  border: 2px solid black;
  margin-bottom: 4px;
  margin-left: 5%;
  margin-right: 5%;
  justify-content: space-between;
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



type PollProps = {
  id: string;
  title: string;
  users: Array<string>;
  maxUsers: number;
  onClick: any;
}

const Poll = (props: PollProps) => {
  return (
    <Wrapper onClick={props.onClick}>
      <Title>{props.title}</Title>
      <p>{props.users.length}/{props.maxUsers}</p>
    </Wrapper>
  );
}

const Polls = (props) => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = () => {
    get('/api/polls', {})
    .then(data => {
      if (data.success) {
        setPolls(data.polls);
      } else {
        window.alert('Error');
      }
    });
  };

  const sendToPoll = (id) => () => {
    props.history.push(`/poll/${id}`);
  };

  return (
    <>
      <Title>Choose a Poll</Title>
      <PollsWrapper>
        {polls.map((poll) => {
          return <Poll
            {...poll}
            onClick={sendToPoll(poll.id)}
          />;
        })}
      </PollsWrapper>
    </>
  );
}

export default Polls;
