import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import { generateKey, signVote } from '../utils/utils';
import { proveSignature, verifyHash, verifySignature } from '../utils/prover';
import { post } from '../utils/api';


const ConfessionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px black solid;
`;

const Group = styled.div`
  width: 100px;
  padding-left: 5px;
`;

const Message = styled.div`
  width: 100px;
  height: 300px;
`;


type ConfessionProps = {
  group: string,
  message: string,
  data: string
};

const Confession = (props: ConfessionProps) => {
  return (
    <ConfessionWrapper>
      <Group>Post by someone in {props.group}</Group>
      <Message>{props.message}</Message>
    </ConfessionWrapper>
  );
}

export default Confession;
