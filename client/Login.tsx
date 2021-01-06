import React, { Component, useState } from 'react';
import styled from 'styled-components';
import { Button } from './shared/components/Button';
import TextInput from './shared/components/TextInput';
import { post } from './requestFunctions';

const LoginWrapper = styled.div`
  align-items: center;
  padding-left: 25%;
  padding-right: 25%;
  margin-top: 40%;
  display: flex;
  flex-direction: column;

  & :nth-child(1) {
    margin-bottom: 10px;
  }
  & :nth-child(2) {
    margin-bottom: 20px;
  }
`;

type Props = {
  user: any,
  history: any,
};

function Login(props: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onChangeEmail = (value: string) => {
    setEmail(value);
  };

  const onChangePassword = (value: string) => {
    setPassword(value);
  };

  const login = () => {
    post('/auth/login', { email, password })
    .then(data => {
      if (data.success) {
        props.history.push('/dashboard');
      } else {
        window.alert('Error');
      }
    });
  };
  
  return (
    <LoginWrapper>
      <TextInput
        onChange={onChangeEmail}
        placeholder='Email'
        value={email}
      />
      <TextInput
        onChange={onChangePassword}
        placeholder='Password'
        value={password}
      />
      <Button onClick={login}>Login</Button>
    </LoginWrapper>
  );
}

export default Login;
