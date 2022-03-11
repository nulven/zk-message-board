import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import styled from 'styled-components';

import NavigationBar from './NavigationBar';
import OurThemeProvider from './OurThemeProvider';


interface Props {
  path: string;
  Subpage: any;
  navbar: boolean;
  signer: any;
  web3: any;
};

export default function Page(props: Props) {
  const { path, Subpage } = props;

  useEffect(() => {
    if (document) {
      const title = 'Message Board';
      const titleType = typeof title;
      document.title = title;
    }
  }, [path]);

  return (
    <Route
      path={path}
      render={(props: any) => (
        <OurThemeProvider>
          <NavigationBar activeTab={path} />
          <Subpage {...props} />
        </OurThemeProvider>
      )}
    />
  );
};
