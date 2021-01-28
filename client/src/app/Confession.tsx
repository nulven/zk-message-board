import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import { proveSignature, verifyHash, verifySignature } from '../utils/prover';
import { post } from '../utils/api';


const ConfessionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px black solid;
  width: 70%;
  margin-left: 15%;
  margin-right: 15%;
  height: 100px;
`;

const Group = styled.div`
  width: 100%;
  height: 15px;
  padding-left: 5px;
  margin-bottom: 10px;
  margin-top: 5px
`;

const Message = styled.div`
  width: 100%;
  padding-left: 5px;
`;

const Spacer = styled.div`
  width: calc(70% + 2px);
  margin-left: 15%;
  margin-right: 15%;
  height: 10px;
  background-color: gray;
`;

type ConfessionProps = {
  id: string,
  message: string,
  data: string,
  groupId: string,
  proof: Object,
  publicSignals: Array<string>
};

const Confession = (props: ConfessionProps) => {
  return (
    <>
      <ConfessionWrapper>
        <Group>Post by someone in {props.groupId}</Group>
        <Message>{props.message}</Message>
      </ConfessionWrapper>
      <Spacer />
    </>
  );
}

export default Confession;
