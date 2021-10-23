import React, { Component } from 'react';
import styled from 'styled-components';

type Props = {
  placeholder: string,
  handleEnter?: (string) => void,
  onChange: (value: string) => void,
  value: string,
  header?: string,
  style?: Object,
};

const Header = styled.div`
  width: auto;
  height: 40px;
  padding-left: 5px;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.color.grey20};
  border-radius: 5px 0px 0px 5px;
  border-width: 1px;
  border-right: 0px;
  border-style: solid;
  font-variation-settings: 'wght' 500;
`;

const TextInputWrapper = styled.input`
  font-family: 'Roboto Variable';
  padding: 0 8px;
  height: 40px;
  width: auto;
  flex-grow: 6;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  font-variation-settings: 'wght' 500;
`;

function TextInput (props: Props) {
  const detectEnter = (e: any) => {
    if (e.key === 'Enter' && props.handleEnter) {
      props.handleEnter(e.target.value);
    }
  }

  const style = !!props.header ? { ...props.style, borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' } : props.style;

  return (
    <>
      {!!props.header ? <Header>{props.header}</Header> : null}
      <TextInputWrapper
        style={style}
        onChange={e => props.onChange(e.target.value)}
        onKeyPress={detectEnter}
        placeholder={props.placeholder}
        ref={element => (element = element)}
      />
    </>
  );
}

export default TextInput;
