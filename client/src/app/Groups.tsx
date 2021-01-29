import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import { Large } from '../components/text';

import { get } from '../utils/api';


const GroupsWrapper = styled.div`
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

type GroupProps = {
  name: string;
  passwordHash: string;
  users: Array<string>;
  onClick: any;
}

const Group = (props: GroupProps) => {
  return (
    <Wrapper onClick={props.onClick}>
      <Large>{props.name}</Large>
    </Wrapper>
  );
}

const Groups = (props) => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    get('/api/groups', {})
    .then(data => {
      if (data.success) {
        setGroups(data.groups);
      } else {
        window.alert('Error');
      }
    });
  };

  const sendToGroup = (group) => () => {
    props.history.push({
      pathname: `/groups/${group.name}`,
      state: { group }
    });
  };

  const sendToNewGroup = () => {
    props.history.push(`/groups/new`);
  };

  return (
    <>
      <Large>Choose a Group</Large>
      <Button onClick={sendToNewGroup} >
        New Group
      </Button>
      <GroupsWrapper>
        {groups.map((group) => {
          return <Group
            {...group}
            onClick={sendToGroup(group)}
          />;
        })}
      </GroupsWrapper>
    </>
  );
}

export default Groups;
