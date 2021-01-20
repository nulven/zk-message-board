import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';

import NavigationBar from './NavigationBar';
import OurThemeProvider from './OurThemeProvider';

const defaultTitle = '';

interface Props {
  path: string;
  Subpage: any;
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
          <Subpage {...props} />
        </OurThemeProvider>
      )}
    />
  );
};
