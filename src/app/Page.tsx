import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import styled from 'styled-components';

import NavigationBar from './NavigationBar';
import OurThemeProvider from './OurThemeProvider';

const defaultTitle = '';

const SubpageWrapper = styled.div`
  height: calc(100% - 56px - 1px);
`;

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
      const title = path;
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
          <SubpageWrapper>
            <Subpage {...props} />
          </SubpageWrapper>
        </OurThemeProvider>
      )}
    />
  );
};
