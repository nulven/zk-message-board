import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import { Large } from '../components/text';

import { get } from '../utils/api';


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
      <Large>{props.title}</Large>
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
    props.history.push(`/polls/${id}`);
  };

  return (
    <>
      <Large>Choose a Poll</Large>
      <PollsWrapper>
        {polls.map((poll) => {
          return <Poll
            {...poll}
            key={poll.id}
            onClick={sendToPoll(poll.id)}
          />;
        })}
      </PollsWrapper>
    </>
  );
}

export default Polls;
