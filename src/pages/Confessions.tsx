import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';

import { Button } from '../components/Button';
import { Large } from '../components/text';

import eth from '../utils/ethAPI';

import Confession from './Confession';


const ConfessionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ConfessionsList = styled.div`
  padding-top: 5%;
  height: 100%;
  background-color: ${props => props.theme.color.grey70};
`;

const Confessions = (props) => {
  const [confessions, setConfessions] = useState([]);

  useEffect(() => {
    eth.api.getConfessions().then(setConfessions);
  }, []);

  const sendToPoll = (id) => () => {
    props.history.push(`/polls/${id}`);
  };

  const sendToNewConfession = () => {
    props.history.push(`/confessions/new`);
  };

  return (
    <ConfessionsWrapper>
      <Button
        onClick={sendToNewConfession}>
        Post confession
      </Button>
      <ConfessionsList>
        {confessions.map((confession) => {
          return (
              <Confession {...confession} key={confession.id} />
          );
        })}
      </ConfessionsList>
    </ConfessionsWrapper>
  );
}

export default Confessions;
