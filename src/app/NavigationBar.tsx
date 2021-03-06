import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Medium } from '../components/text';

interface NavBarElementProps {
  active: boolean;
};

const NavBarElementWrapper = styled.div<NavBarElementProps>`
  border-bottom: ${props => (props.active ? `3px solid ${props.theme.color.blue}` : 'none')};
  padding-top: ${props => (props.theme.spacing(2))};
  padding-bottom: ${props => (props.theme.spacing(2))};
  div {
    color: ${props => (props.active ? props.theme.color.blue : 'default')};
    :hover {
      color: ${props => (props.theme.color.blue)};
    }
  }
`;

type NavigationBarElementProps = {
  path: string;
  title: string;
  icon?: string;
  activeTab: string;
};

const NavigationBarElement = (props: NavigationBarElementProps) => {
  return (
    <NavBarElementWrapper active={props.activeTab === props.path}>
      <Link to={props.path}>
        <Medium>{props.title}</Medium>
      </Link>
    </NavBarElementWrapper>
  );
}

const NavigationBarWrapper = styled.div`
  width: 100%;
  height: ${props => props.theme.spacing(7)};
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  border-bottom: ${props => (props.theme.border)};

  a {
    text-decoration: none;
  }
`;

type NavigationBarProps = {
  activeTab: string;
}

const NavigationBar = (props: NavigationBarProps) => {
  return (
    <NavigationBarWrapper>
      <NavigationBarElement
        path='/groups'
        title='Groups'
        activeTab={props.activeTab}
      />
      <NavigationBarElement
        path='/confessions'
        title='Confessions'
        activeTab={props.activeTab}
      />
    </NavigationBarWrapper>
  );
}

export default NavigationBar;
