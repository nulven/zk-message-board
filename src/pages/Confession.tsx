import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';


const ConfessionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px black solid;
  width: 70%;
  margin-left: 15%;
  margin-right: 15%;
  padding: 5px;
  height: 100px;
  background-color: ${props => props.theme.color.white};
  margin-bottom: 10px;
`;

const Group = styled.div`
  margin-left: 5px;
  color: ${props => props.theme.color.grey70};
  font-weight: bold;
`;

const GroupHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 15px;
  margin-bottom: 10px;
  color: ${props => props.theme.color.grey70};
`;

const Message = styled.div`
  width: 100%;
  padding-left: 5px;
`;

type ConfessionProps = {
  id: string,
  message: string,
  data: string,
  group: string,
};

const Confession = (props: ConfessionProps) => {
  return (
    <>
      <ConfessionWrapper>
        <GroupHeader>
          {'Posted by someone in'}
          <Group>{props.group}</Group>
        </GroupHeader>
        <Message>{props.message}</Message>
      </ConfessionWrapper>
    </>
  );
}

export default Confession;
