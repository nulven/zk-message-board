import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Element } from 'react-scroll';

import { Button } from '../components/Button';
import { Large } from '../components/text';

import { get } from '../utils/api';

import Confession from './Confession';


const ConfessionsWrapper = styled.div`
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

const Confessions = (props) => {
  const [confessions, setConfessions] = useState([]);

  useEffect(() => {
    loadConfessions();
  }, []);

  const loadConfessions = () => {
    get('/api/confessions', {})
    .then(data => {
      if (data.success) {
        setConfessions(data.confessions);
      } else {
        window.alert('Error');
      }
    });
  };

  const sendToPoll = (id) => () => {
    props.history.push(`/polls/${id}`);
  };

  return (
    <ConfessionsWrapper>
      <Element className="element" id="confessions" style={{
        position: 'relative',
          height: '200px',
          overflow: 'scroll',
          marginBottom: '100px'
      }}>
        {confessions.map((confession) => {
          return (
            <Element name={confession.id} className="element">
              <Confession {...confession} />
            </Element>
          );
        })}
      </Element>
    </ConfessionsWrapper>
  );
}

export default Confessions;
